// scripts/output/extended-range-trimmed.json(44건) + 수동 번역을 data/performances.json에 합친다.
// (8~31일째 구간 추가분 — 날짜 피커가 이 구간을 벗어나도 결과가 비지 않게 하기 위함)
// 실행: node scripts/finalize-extended.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const extended = JSON.parse(
  fs.readFileSync(path.join(ROOT, "scripts/output/extended-range-trimmed.json"), "utf8")
);
const existing = JSON.parse(
  fs.readFileSync(path.join(ROOT, "data/performances.json"), "utf8")
);

const CITY_KO = {
  Seoul: "서울",
  Busan: "부산",
  Daegu: "대구",
  Incheon: "인천",
  Gwangju: "광주",
  Daejeon: "대전",
  Ulsan: "울산",
};
const GENRE_EN = {
  CCCA: "Classical Music",
  CCCC: "Korean Traditional Music",
  CCCD: "Popular Music",
  BBBC: "Dance",
  BBBE: "Popular Dance",
  EEEB: "Circus / Magic",
  AAAA: "Theatre (Korean required)",
};

const TRANSLATIONS = {
  PF301461: { nameEn: "Lim Ho-yeol Piano Recital", venueEn: "Dream Forest Art Center" },
  PF301462: { nameEn: "idol wave — THE Starlight Orbit: UNIFORM", venueEn: "Prism Hall (Prism Plus)" },
  PF300391: { nameEn: "Park Seong-mi & Lee Mi-jin Piano Duo Recital: Classics from the Textbook", venueEn: "Seoul Arts Center" },
  PF300158: { nameEn: "Lee Su-yeon & Kim Jeong-min Piano Duo Recital", venueEn: "Mozart Hall" },
  PF298409: { nameEn: "Minor Beings", venueEn: "Arko Arts Theater" },
  PF301154: { nameEn: "Gayageum Sanjo Festival: Three Days, Three Colors", venueEn: "National Gugak Center" },
  PF298687: { nameEn: "Gongmyoung Concert: Resonance", venueEn: "LG Arts Center Seoul" },
  PF301237: { nameEn: "2nd Meiyer Recital: Melodies Across Time", venueEn: "Concert Hall Nanu" },
  PF301157: { nameEn: "Supsegwon Live: Yang Jeong-hoon's First Fan Concert 'Freesia'", venueEn: "Supsegwon Live Branch 2 [Dongnimmun]" },
  PF297677: { nameEn: "4th Korea Gugak Orchestra Festival: Gangwon Provincial Gugak Orchestra", venueEn: "Sejong Center for the Performing Arts" },
  PF300747: { nameEn: "Korea National Ballet: Giselle", venueEn: "Seoul Arts Center" },
  PF297671: { nameEn: "4th Korea Gugak Orchestra Festival: Busan Metropolitan Gugak Orchestra", venueEn: "Sejong Center for the Performing Arts" },
  PF301172: { nameEn: "Grato Ensemble Regular Concert: JOURNEY", venueEn: "Sejong Center for the Performing Arts" },
  PF298019: { nameEn: "Science Magic Show with an AI Robot [Seodaemun, Seoul]", venueEn: "Seodaemun Culture & Sports Center" },
  PF301513: { nameEn: "Kim Ye-jin's Dongchoje Pansori 'Simcheongga': Gyeongsim Suye", venueEn: "National Gugak Center" },
  PF300054: { nameEn: "Envy Market", venueEn: "Bogwang Theater" },
  PF299992: { nameEn: "Ohamma Mr. Baek's Life Story: Complete Edition [Daehangno]", venueEn: "Arts Space Hyehwa" },
  PF296762: { nameEn: "Glimmer of the Sea [Daehangno]", venueEn: "Cordell Art Hall" },
  PF300889: { nameEn: "6th Heroine Festival: Huijae", venueEn: "Mimazi Art Center" },

  PF300928: { nameEn: "Dongnae K-POP Random Play Dance Day [Busan] (Oct)", venueEn: "Lotte Department Store Dongnae Branch [Busan]" },
  PF300430: { nameEn: "[Package] Busan Performing Arts Market (BPAM) Official Choice: Dance Package", venueEn: "Sohyang Theater" },
  PF300884: { nameEn: "BPAM: Dangkeul Maeda — Where the Gods Stayed", venueEn: "Haeundae Culture Center" },
  PF301454: { nameEn: "Classic Pop Songs, Reheard in Jazz [Busan]", venueEn: "Baekyang Culture & Arts Center" },
  PF300207: { nameEn: "Magic Bubble Show [Sasang, Busan]", venueEn: "Danurim Center" },

  PF300296: { nameEn: "Classical Nights, Songs for You: Music That Comforts Life in Autumn [Gunwi]", venueEn: "Gunwi Samguk Yusa Culture & Education Center" },
  PF299566: { nameEn: "Bongsan Culture Center Featured Series II — Gugak Concert: A Family of Refined Taste [Daegu]", venueEn: "Bongsan Culture Center" },
  PF301564: { nameEn: "Lalaraon [Rockwang, Daegu]", venueEn: "Rockwang" },
  PF301260: { nameEn: "DSAC Art Festival — Dalseo Dance Feast: Mu, Connecting Life and Coloring Autumn", venueEn: "Dalseo Art Center" },
  PF301497: { nameEn: "Tuesday Gugak Stage: Autumn Refinement [Daegu]", venueEn: "Daegu Culture & Arts Center" },

  PF281688: { nameEn: "447th Incheon Philharmonic Regular Concert: Incheon Phil Plays Bartók", venueEn: "Incheon Art Center" },
  PF301047: { nameEn: "Bupyeong Culture Foundation Gala Night x Incheon Art Show: Chopin Omakase [Bupyeong]", venueEn: "Bupyeong Art Center" },
  PF292010: { nameEn: "Your Name. Film Concert [Incheon]", venueEn: "Incheon Art Center" },
  PF290745: { nameEn: "Cheongna Brunch Concert with Lee Geum-hee: Late-Autumn Film OSTs [Incheon]", venueEn: "Cheongna Culture Center Blue Nova Hall" },
  PF299909: { nameEn: "Subong Presents: A Lively Pan of Yeonhui Performance! [Incheon]", venueEn: "Incheon Subong Culture Center" },

  PF299259: { nameEn: "6th The Eclat Quartet Regular Concert [Daejeon]", venueEn: "Daejeon Municipal Yeonjeong Gugak Center" },
  PF296664: { nameEn: "Han-Na Chang's Daejeon Grand Festival: Julius Asal Piano Recital — Joy of Discovery", venueEn: "Daejeon Arts Center" },
  PF301188: { nameEn: "Daejeon Municipal Yeonjeong Gugak Orchestra: Saturday Gugak (Oct 10)", venueEn: "Daejeon Municipal Yeonjeong Gugak Center" },
  PF300548: { nameEn: "3rd Elecsu Regular Concert: Korean Sounds on the Electone [Daejeon]", venueEn: "Daejeon Artists' House" },
  PF299284: { nameEn: "Daejeon Municipal Yeonjeong Gugak Orchestra — Pungnyu Madang: Land of Gayageum Sounds", venueEn: "Daejeon Municipal Yeonjeong Gugak Center" },

  PF300983: { nameEn: "Kids' Balloon Show: Sangsang Balloon Magic Troupe [Ulsan]", venueEn: "Ulsan Jung-gu Culture & Arts Center" },
  PF300686: { nameEn: "23rd Muryong Arts Festival: Songs Spreading Through Autumn Night — Kim Gi-tae [Ulsan]", venueEn: "Ulsan Buk-gu Culture & Arts Center" },
  PF299941: { nameEn: "Ulsan Young Soloists' Concerto Night: Buk-gu Concerto Series I", venueEn: "Ulsan Buk-gu Culture & Arts Center" },
  PF293829: { nameEn: "Ghibli & Disney Film Music Orchestra Concert [Ulsan]", venueEn: "Ulsan Culture & Arts Center" },
  PF301037: { nameEn: "The Farting Daughter-in-Law [Ulsan]", venueEn: "Ulsan Culture & Arts Center" },
};

function parseDate(s) {
  const [y, m, d] = s.split(".").map(Number);
  return new Date(y, m - 1, d);
}
const RECURRING_THRESHOLD_DAYS = 45;
function buildDateDisplay(item) {
  const from = parseDate(item.from);
  const to = parseDate(item.to);
  const spanDays = (to - from) / 86400000;
  const isRecurring = spanDays > RECURRING_THRESHOLD_DAYS;
  if (isRecurring) {
    return { isRecurring: true, dateDisplay: item.showTime || `${item.from} ~ ${item.to}` };
  }
  return {
    isRecurring: false,
    dateDisplay: item.from === item.to ? item.from : `${item.from} ~ ${item.to}`,
  };
}

let missing = 0;
const newItems = extended.map((item) => {
  const tr = TRANSLATIONS[item.id];
  if (!tr) {
    missing++;
    console.warn(`⚠ 번역 누락: ${item.id} ${item.name}`);
  }
  const { isRecurring, dateDisplay } = buildDateDisplay(item);
  const cityKo = CITY_KO[item.city] || item.city;
  return {
    id: item.id,
    nameKo: item.name,
    nameEn: tr?.nameEn || item.name,
    venueKo: item.venue,
    venueEn: tr?.venueEn || item.venue,
    mapsQuery: `${item.venue} ${cityKo}`,
    dateDisplay,
    isRecurring,
    from: item.from,
    to: item.to,
    showTime: item.showTime,
    poster: item.poster,
    price: item.minPrice,
    priceText: item.priceText,
    genreCode: item.genreCode,
    genreEn: GENRE_EN[item.genreCode] || item.genre,
    noKoreanNeeded: item.noKoreanNeeded,
    bookingUrl: item.bookingLinks?.[0]?.url || null,
    bookingLinks: item.bookingLinks,
    runtime: item.runtime,
    age: item.age,
    city: item.city,
    cityKo,
  };
});

const existingIds = new Set(existing.map((p) => p.id));
const deduped = newItems.filter((p) => !existingIds.has(p.id));
const final = [...existing, ...deduped];

fs.writeFileSync(
  path.join(ROOT, "data/performances.json"),
  JSON.stringify(final, null, 2),
  "utf8"
);

console.log(`저장 완료: data/performances.json (총 ${final.length}건, 신규 ${deduped.length}건, 번역 누락 ${missing}건)`);
