// KOPIS 공연 수집 스크립트 (TC1 목록조회 + TC2 상세조회)
// 실행: node scripts/fetch-performances.mjs
// 필요: 프로젝트 루트에 .env (KOPIS_API_KEY=...)
//
// 하는 일:
//   1. 서울 + 오늘~+7일 + No Korean needed 장르(클래식/국악/대중음악/무용/대중무용/서커스마술)로
//      공연목록(pblprfr) 조회 → 전량 상세조회 대상
//   2. 데모의 필터 on/off 대비를 보여주기 위해 연극(AAAA) 목록도 조회하되, 상위 15건만 상세조회 대상에 포함
//   3. 위 대상들의 mt20id로 공연상세(pblprfr/{id})를 하나씩 조회
//      (초당 10회 제한보다 훨씬 여유있게, 요청 사이 300ms 대기 + 빈 응답 시 자동 재시도)
//   4. 가격문구(pcseguidance)에서 숫자를 뽑아 최저가 계산, 5만원 이하만 표시
//   5. 결과를 scripts/output/performances.json 에 저장 (프로젝트 데이터 폴더 아님, 검토용)
//      각 항목에 noKoreanNeeded(true/false) 플래그 포함 → 앱에서 이 필드로 토글 필터링
//
// 출처 표기 필수: 이 프로그램은 KOPIS(공연예술통합전산망, www.kopis.or.kr) Open API로 만들었습니다.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ---- 설정 ----
// No Korean needed 대상 장르: 클래식/국악/대중음악/무용/대중무용/서커스마술 (기획 결정: 합창·성악도 포함)
const NO_KOREAN_GENRES = ["CCCA", "CCCC", "CCCD", "BBBC", "BBBE", "EEEB"];
// 대비용으로 소량만 섞는 "한국어 필요한" 장르. 전체를 다 받으면 상세조회 호출이 너무 많아지므로
// 목록에서 상위 KOREAN_NEEDED_SAMPLE_SIZE 건만 상세조회함 (데모에서 필터 on/off 차이를 보여주기 위한 용도)
const KOREAN_NEEDED_GENRES = ["AAAA"]; // 연극
const KOREAN_NEEDED_SAMPLE_SIZE = 15;
const REGION = "11"; // 서울
const DAYS_AHEAD = 7;
const MAX_PRICE = 50000;
const LIST_DELAY_MS = 1200; // 장르 호출 사이 (초당 10회 제한 여유)
const DETAIL_DELAY_MS = 300; // 상세 호출 사이 (여유있게, 초당 최대 3~4회 수준)

// ---- .env 읽기 (외부 패키지 없이 직접 파싱) ----
function loadEnv() {
  const envPath = path.join(ROOT, ".env");
  const text = fs.readFileSync(envPath, "utf8");
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = loadEnv();
const SERVICE_KEY = env.KOPIS_API_KEY;
if (!SERVICE_KEY) {
  console.error(".env 에 KOPIS_API_KEY 가 없습니다.");
  process.exit(1);
}

const BASE = "http://www.kopis.or.kr/openApi/restful/pblprfr";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

// ---- 아주 단순한 XML 텍스트 추출 (KOPIS 응답은 얕은 구조라 정규식으로 충분) ----
function tag(xml, name) {
  const m = xml.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
  return m ? decodeEntities(m[1].trim()) : "";
}

function tagAll(xml, name) {
  const re = new RegExp(`<${name}>([\\s\\S]*?)</${name}>`, "g");
  const out = [];
  let m;
  while ((m = re.exec(xml))) out.push(m[1]);
  return out;
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function toHttps(url) {
  if (!url) return url;
  return url.replace(/^http:\/\/(www\.)?kopis\.or\.kr/, "https://kopis.or.kr");
}

// "전석 20,000원" / "R석 50,000원 S석 30,000원" / "전석무료" 등에서 최저가 추출
function parseMinPrice(text) {
  if (!text) return null;
  if (/무료/.test(text)) return 0;
  const nums = [...text.matchAll(/([\d,]+)\s*원/g)].map((m) =>
    parseInt(m[1].replace(/,/g, ""), 10)
  );
  if (nums.length === 0) return null;
  return Math.min(...nums);
}

async function fetchList(genre, stdate, eddate) {
  const url = `${BASE}?service=${SERVICE_KEY}&stdate=${stdate}&eddate=${eddate}&cpage=1&rows=100&signgucode=${REGION}&shcate=${genre}`;
  const res = await fetch(url);
  const xml = await res.text();
  const rc = tag(xml, "returncode");
  if (rc && rc !== "") {
    console.warn(`  ⚠ ${genre} 목록조회 에러: ${tag(xml, "errmsg") || xml.slice(0, 200)}`);
    return [];
  }
  const items = tagAll(xml, "db").map((block) => ({
    id: tag(block, "mt20id"),
    name: tag(block, "prfnm"),
    from: tag(block, "prfpdfrom"),
    to: tag(block, "prfpdto"),
    venue: tag(block, "fcltynm"),
    poster: toHttps(tag(block, "poster")),
    area: tag(block, "area"),
    genre: tag(block, "genrenm"),
    genreCode: genre,
  }));
  return items;
}

// 가끔 응답이 성공(returncode 없음)인데도 필드가 거의 다 비어서 오는 경우가 있음
// (96건을 빠르게 돌릴 때 관찰됨, 단건 재요청하면 정상으로 옴) → 자동 재시도
async function fetchDetailWithRetry(id, maxRetries = 1) {
  let last;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    last = await fetchDetail(id);
    if (last.error) return last;
    const looksEmpty =
      !last.priceText && !last.showTime && !last.cast && last.bookingLinks.length === 0;
    if (!looksEmpty) return last;
    if (attempt < maxRetries) {
      console.warn(`  ↻ ${id} 응답이 비어있음, 재시도 ${attempt + 1}/${maxRetries}`);
      await sleep(1000 * (attempt + 1));
    }
  }
  return { ...last, incomplete: true };
}

async function fetchDetail(id) {
  const url = `${BASE}/${id}?service=${SERVICE_KEY}`;
  const res = await fetch(url);
  const xml = await res.text();
  const rc = tag(xml, "returncode");
  if (rc && rc !== "") {
    return { id, error: tag(xml, "errmsg") || "detail fetch error" };
  }
  const relatesBlock = xml.match(/<relates>([\s\S]*?)<\/relates>/);
  const bookingLinks = [];
  if (relatesBlock) {
    for (const rel of tagAll(relatesBlock[1], "relate")) {
      const relatenm = tag(rel, "relatenm");
      const relateurl = tag(rel, "relateurl");
      if (relateurl) bookingLinks.push({ name: relatenm, url: relateurl });
    }
  }
  const priceText = tag(xml, "pcseguidance");
  return {
    id,
    priceText,
    minPrice: parseMinPrice(priceText),
    bookingLinks,
    showTime: tag(xml, "dtguidance"),
    runtime: tag(xml, "prfruntime"),
    age: tag(xml, "prfage"),
    synopsis: tag(xml, "sty"),
    cast: tag(xml, "prfcast"),
  };
}

async function main() {
  const stdate = fmtDate(new Date());
  const eddate = fmtDate(new Date(Date.now() + DAYS_AHEAD * 86400000));
  console.log(
    `기간: ${stdate} ~ ${eddate} / 지역: 서울\n` +
      `No Korean needed 장르: ${NO_KOREAN_GENRES.join(", ")}\n` +
      `대비용 장르(상위 ${KOREAN_NEEDED_SAMPLE_SIZE}건만): ${KOREAN_NEEDED_GENRES.join(", ")}`
  );

  // 1) 목록 조회 - No Korean needed 대상 장르 (전량 상세조회)
  const all = [];
  for (const g of NO_KOREAN_GENRES) {
    const items = await fetchList(g, stdate, eddate);
    console.log(`  ${g}: ${items.length}건`);
    all.push(...items);
    await sleep(LIST_DELAY_MS);
  }

  // 2) 목록 조회 - 대비용 장르 (상위 N건만 상세조회 대상에 포함, 호출량 제한)
  for (const g of KOREAN_NEEDED_GENRES) {
    const items = await fetchList(g, stdate, eddate);
    const sample = items.slice(0, KOREAN_NEEDED_SAMPLE_SIZE);
    console.log(`  ${g}: ${items.length}건 중 ${sample.length}건만 상세조회`);
    all.push(...sample);
    await sleep(LIST_DELAY_MS);
  }

  // id 중복 제거 (같은 공연이 여러 장르 코드에 걸릴 일은 없지만 안전하게)
  const byId = new Map();
  for (const item of all) byId.set(item.id, item);
  const uniqueList = [...byId.values()];
  console.log(`상세조회 대상 합계(중복제거): ${uniqueList.length}건`);

  // 2) 상세 조회 (가격/예매처/시간)
  const results = [];
  let incompleteCount = 0;
  for (const [i, item] of uniqueList.entries()) {
    const detail = await fetchDetailWithRetry(item.id);
    if (detail.error) {
      console.warn(`  [${i + 1}/${uniqueList.length}] ${item.id} 상세조회 실패: ${detail.error}`);
    } else {
      if (detail.incomplete) incompleteCount++;
      results.push({
        ...item,
        ...detail,
        noKoreanNeeded: NO_KOREAN_GENRES.includes(item.genreCode),
      });
    }
    await sleep(DETAIL_DELAY_MS);
  }
  if (incompleteCount > 0) {
    console.warn(`\n⚠ 재시도해도 응답이 비어있던 공연: ${incompleteCount}건 (output json에서 "incomplete": true 로 표시)`);
  }

  // 3) 5만원 이하 필터
  const affordable = results.filter((r) => r.minPrice !== null && r.minPrice <= MAX_PRICE);
  const noPriceParsed = results.filter((r) => r.minPrice === null);

  const affordableNoKorean = affordable.filter((r) => r.noKoreanNeeded);
  const affordableKoreanNeeded = affordable.filter((r) => !r.noKoreanNeeded);

  console.log(`\n상세조회 성공: ${results.length}건`);
  console.log(`5만원 이하: ${affordable.length}건`);
  console.log(`  ㄴ No Korean needed: ${affordableNoKorean.length}건`);
  console.log(`  ㄴ 한국어 필요(대비용, 연극): ${affordableKoreanNeeded.length}건`);
  console.log(`가격 파싱 실패(수동 확인 필요): ${noPriceParsed.length}건`);

  const outDir = path.join(__dirname, "output");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, "performances.json"),
    JSON.stringify(results, null, 2),
    "utf8"
  );
  fs.writeFileSync(
    path.join(outDir, "performances-affordable.json"),
    JSON.stringify(affordable, null, 2),
    "utf8"
  );
  if (noPriceParsed.length) {
    fs.writeFileSync(
      path.join(outDir, "price-parse-failed.json"),
      JSON.stringify(
        noPriceParsed.map((r) => ({ id: r.id, name: r.name, priceText: r.priceText })),
        null,
        2
      ),
      "utf8"
    );
  }
  console.log(`\n저장 위치: scripts/output/performances.json (전체), performances-affordable.json (5만원 이하)`);
}

main().catch((err) => {
  console.error("실행 중 에러:", err);
  process.exit(1);
});
