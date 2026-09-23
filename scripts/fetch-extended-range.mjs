// 이미 수집한 1~7일(오늘~+7일) 구간은 그대로 두고, 8~31일째 구간만 추가로 수집한다.
// (KOPIS API 한 번 호출 최대 31일 제한 → 전체를 8~31일로 나눠서 부름)
// 번역 부담을 줄이기 위해 장르/도시별로 소량만 샘플링한다.
// 실행: node scripts/fetch-extended-range.mjs
// 출력: scripts/output/extended-range.json

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const NO_KOREAN_GENRES = ["CCCA", "CCCC", "CCCD", "BBBC", "BBBE", "EEEB"];
const KOREAN_NEEDED_GENRES = ["AAAA"];

const SEOUL = { code: "11", name: "Seoul", genreSample: 10, koreanNeededSample: 5 };
const OTHER_CITIES = [
  { code: "26", name: "Busan", genreSample: 5 },
  { code: "27", name: "Daegu", genreSample: 5 },
  { code: "28", name: "Incheon", genreSample: 5 },
  { code: "29", name: "Gwangju", genreSample: 5 },
  { code: "30", name: "Daejeon", genreSample: 5 },
  { code: "31", name: "Ulsan", genreSample: 5 },
];

const RANGE_START_DAYS = 8; // 이미 수집한 구간(오늘~+7) 다음날부터
const RANGE_END_DAYS = 31; // KOPIS 한 번 호출 최대 31일
const MAX_PRICE = 50000;
const LIST_DELAY_MS = 1200;
const DETAIL_DELAY_MS = 300;

function loadEnv() {
  const text = fs.readFileSync(path.join(ROOT, ".env"), "utf8");
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}
const SERVICE_KEY = loadEnv().KOPIS_API_KEY;
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
function parseMinPrice(text) {
  if (!text) return null;
  if (/무료/.test(text)) return 0;
  const nums = [...text.matchAll(/([\d,]+)\s*원/g)].map((m) =>
    parseInt(m[1].replace(/,/g, ""), 10)
  );
  if (nums.length === 0) return null;
  return Math.min(...nums);
}

// 정렬된 배열에서 n개를 날짜 전체 구간에 고르게 퍼뜨려서 뽑는다 (앞쪽 날짜에만 몰리지 않게)
function sampleEvenly(sortedArr, n) {
  if (sortedArr.length <= n) return sortedArr;
  const step = sortedArr.length / n;
  const picked = [];
  const usedIdx = new Set();
  for (let i = 0; i < n; i++) {
    const idx = Math.min(sortedArr.length - 1, Math.floor(i * step));
    if (!usedIdx.has(idx)) {
      usedIdx.add(idx);
      picked.push(sortedArr[idx]);
    }
  }
  return picked;
}

async function fetchList(genre, region, stdate, eddate) {
  const url = `${BASE}?service=${SERVICE_KEY}&stdate=${stdate}&eddate=${eddate}&cpage=1&rows=100&signgucode=${region}&shcate=${genre}`;
  const res = await fetch(url);
  const xml = await res.text();
  if (tag(xml, "returncode")) return [];
  return tagAll(xml, "db").map((block) => ({
    id: tag(block, "mt20id"),
    name: tag(block, "prfnm"),
    from: tag(block, "prfpdfrom"),
    to: tag(block, "prfpdto"),
    venue: tag(block, "fcltynm"),
    poster: toHttps(tag(block, "poster")),
    genre: tag(block, "genrenm"),
    genreCode: genre,
  }));
}

async function fetchDetailWithRetry(id, maxRetries = 1) {
  let last;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    last = await fetchDetail(id);
    if (last.error) return last;
    const looksEmpty =
      !last.priceText && !last.showTime && !last.cast && last.bookingLinks.length === 0;
    if (!looksEmpty) return last;
    if (attempt < maxRetries) await sleep(1000 * (attempt + 1));
  }
  return { ...last, incomplete: true };
}

async function fetchDetail(id) {
  const url = `${BASE}/${id}?service=${SERVICE_KEY}`;
  const res = await fetch(url);
  const xml = await res.text();
  if (tag(xml, "returncode")) return { id, error: tag(xml, "errmsg") || "error" };
  const relatesBlock = xml.match(/<relates>([\s\S]*?)<\/relates>/);
  const bookingLinks = [];
  if (relatesBlock) {
    for (const rel of tagAll(relatesBlock[1], "relate")) {
      const relateurl = tag(rel, "relateurl");
      if (relateurl) bookingLinks.push({ name: tag(rel, "relatenm"), url: relateurl });
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
    cast: tag(xml, "prfcast"),
  };
}

async function main() {
  const existing = JSON.parse(
    fs.readFileSync(path.join(ROOT, "data/performances.json"), "utf8")
  );
  const existingIds = new Set(existing.map((p) => p.id));

  const stdate = fmtDate(new Date(Date.now() + RANGE_START_DAYS * 86400000));
  const eddate = fmtDate(new Date(Date.now() + RANGE_END_DAYS * 86400000));
  console.log(`추가 수집 구간: ${stdate} ~ ${eddate}`);

  const results = [];

  async function collectForCity(cityCode, cityName, genres, sampleSize, noKoreanNeeded) {
    const cityAll = [];
    for (const genre of genres) {
      const items = await fetchList(genre, cityCode, stdate, eddate);
      const fresh = items.filter((it) => !existingIds.has(it.id));
      const sorted = fresh.sort((a, b) => a.from.localeCompare(b.from));
      const sample = sampleEvenly(sorted, sampleSize);
      cityAll.push(...sample.map((it) => ({ ...it, noKoreanNeeded })));
      await sleep(LIST_DELAY_MS);
    }
    return cityAll;
  }

  // 서울: No Korean needed 장르 + 대비용 연극
  const seoulNoKorean = await collectForCity(
    SEOUL.code,
    SEOUL.name,
    NO_KOREAN_GENRES,
    SEOUL.genreSample,
    true
  );
  const seoulKoreanNeeded = await collectForCity(
    SEOUL.code,
    SEOUL.name,
    KOREAN_NEEDED_GENRES,
    SEOUL.koreanNeededSample,
    false
  );
  console.log(`Seoul: no-korean ${seoulNoKorean.length}건 + 연극 ${seoulKoreanNeeded.length}건 (상세조회 대상)`);
  for (const it of [...seoulNoKorean, ...seoulKoreanNeeded]) {
    const detail = await fetchDetailWithRetry(it.id);
    if (!detail.error && detail.minPrice !== null && detail.minPrice <= MAX_PRICE) {
      results.push({ ...it, ...detail, city: "Seoul" });
    }
    await sleep(DETAIL_DELAY_MS);
  }

  // 나머지 도시: No Korean needed 장르만
  for (const city of OTHER_CITIES) {
    const items = await collectForCity(
      city.code,
      city.name,
      NO_KOREAN_GENRES,
      city.genreSample,
      true
    );
    console.log(`${city.name}: ${items.length}건 (상세조회 대상)`);
    for (const it of items) {
      const detail = await fetchDetailWithRetry(it.id);
      if (!detail.error && detail.minPrice !== null && detail.minPrice <= MAX_PRICE) {
        results.push({ ...it, ...detail, city: city.name });
      }
      await sleep(DETAIL_DELAY_MS);
    }
  }

  console.log(`\n5만원 이하 신규 확보: ${results.length}건`);
  const outDir = path.join(ROOT, "scripts/output");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "extended-range.json"), JSON.stringify(results, null, 2));
  console.log("저장: scripts/output/extended-range.json");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
