// 서울 외 광역시 6곳 데이터 수집 (부산/대구/인천/광주/대전/울산)
// 실행: node scripts/fetch-other-cities.mjs
// 도시당 번역 부담을 줄이기 위해 No Korean needed 장르에서 도시당 상위 10건만 상세조회한다.
// 출력: scripts/output/other-cities.json (finalize-region.mjs 에서 사용)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const NO_KOREAN_GENRES = ["CCCA", "CCCC", "CCCD", "BBBC", "BBBE", "EEEB"];
const CITIES = [
  { code: "26", name: "Busan" },
  { code: "27", name: "Daegu" },
  { code: "28", name: "Incheon" },
  { code: "29", name: "Gwangju" },
  { code: "30", name: "Daejeon" },
  { code: "31", name: "Ulsan" },
];
const PER_CITY_SAMPLE = 10;
const DAYS_AHEAD = 7;
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
  const stdate = fmtDate(new Date());
  const eddate = fmtDate(new Date(Date.now() + DAYS_AHEAD * 86400000));
  const all = [];

  for (const city of CITIES) {
    const cityItems = [];
    for (const genre of NO_KOREAN_GENRES) {
      const items = await fetchList(genre, city.code, stdate, eddate);
      cityItems.push(...items);
      await sleep(LIST_DELAY_MS);
    }
    const byId = new Map();
    for (const it of cityItems) byId.set(it.id, it);
    const unique = [...byId.values()].sort((a, b) => a.from.localeCompare(b.from));
    const sample = unique.slice(0, PER_CITY_SAMPLE);
    console.log(`${city.name}: 목록 ${unique.length}건 중 ${sample.length}건 상세조회`);

    for (const item of sample) {
      const detail = await fetchDetailWithRetry(item.id);
      if (!detail.error && detail.minPrice !== null && detail.minPrice <= MAX_PRICE) {
        all.push({ ...item, ...detail, city: city.name, noKoreanNeeded: true });
      }
      await sleep(DETAIL_DELAY_MS);
    }
  }

  console.log(`\n도시별 5만원 이하 합계: ${all.length}건`);
  const outDir = path.join(ROOT, "scripts/output");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "other-cities.json"), JSON.stringify(all, null, 2));
  console.log("저장: scripts/output/other-cities.json");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
