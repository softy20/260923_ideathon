// scripts/output/curated.json(40건) + 수동 번역을 합쳐 앱이 쓸 최종 데이터를 만든다.
// 실행: node scripts/finalize-data.mjs
// 출력: data/performances.json (Next.js 앱이 읽는 최종 파일, git 커밋 대상)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const curated = JSON.parse(
  fs.readFileSync(path.join(ROOT, "scripts/output/curated.json"), "utf8")
);

// id → { nameEn, venueEn } 수동 번역
const TRANSLATIONS = {
  PF218049: { nameEn: "Choi Shin-hyuk: IMAGINE", venueEn: "Moon Entry" },
  PF247233: { nameEn: "The entry to Jazz [Seongsu, Seoul]", venueEn: "entry55 [Seongsu]" },
  PF247431: { nameEn: "Special GIG [Seongsu]", venueEn: "entry55 [Seongsu]" },
  PF254549: { nameEn: "Magic Science Concert [Daehangno]", venueEn: "Myeongryun Art Hall" },
  PF281481: { nameEn: "Saturday Masterpiece", venueEn: "National Gugak Center" },
  PF283834: { nameEn: "Lee Cheol-jin Dance (Han Yeong-suk Style): Seungmu Only", venueEn: "Sungkyun Theater" },
  PF281769: { nameEn: "Organ Odyssey", venueEn: "Lotte Concert Hall" },
  PF283137: { nameEn: "Dadam", venueEn: "National Gugak Center" },
  PF281822: { nameEn: "Lotte Concert Hall Matinee: Danny Koo's Playlist", venueEn: "Lotte Concert Hall" },
  PF285499: { nameEn: "Dongdaemun Culture Foundation Presents: Wine et Melody", venueEn: "Seonnongdan History & Culture Hall" },
  PF287430: { nameEn: "Saturday Gugak Fairy Tale", venueEn: "National Gugak Center" },
  PF286899: { nameEn: "Yeonhui Pan-pan", venueEn: "National Gugak Center" },
  PF291510: { nameEn: "Trans-Empire: Sean Tyas Live in Seoul", venueEn: "Simsim (XIMXIM)" },
  PF296638: { nameEn: "Sweet Land Bubble Magic Show", venueEn: "V Theater" },
  PF296289: { nameEn: "Sunday Vibe", venueEn: "Jayang Station (Paris Music Forum)" },
  PF297998: { nameEn: "Entenbach Original Band: Peach Concert", venueEn: "Studio ENTENBACH" },
  PF300258: { nameEn: "Rayul Art Hall 'A Cup of Leisure' Series: Hand Drip Coffee & Guitar Concert", venueEn: "Rayul Art Hall" },
  PF301613: { nameEn: "Lalaraon [Soundmind]", venueEn: "Soundmind" },
  PF301391: { nameEn: "Yeongsan Art Hall Professional Artist Series: Kim Gwi-im Piano Recital", venueEn: "Yeongsan Art Hall" },
  PF300629: { nameEn: "Cellist Kim Dae-yeon: Bach Complete Cello Suites Series II", venueEn: "Dream Forest Art Center" },
  PF300496: { nameEn: "Sungshin Philharmonic Concert: 90th Anniversary of Sungshin Foundation", venueEn: "Lotte Concert Hall" },
  PF300333: { nameEn: "Yoon Ho-hyun Homecoming Cello Recital", venueEn: "Kumho Art Hall Yonsei" },
  PF298803: { nameEn: "Seong Bo-gyeong Piano Recital", venueEn: "Sejong Center for the Performing Arts" },
  PF296778: { nameEn: "Korea-France 140th Anniversary Concert: Artenium Brass Band Masters Series", venueEn: "Seoul Arts Center" },
  PF301084: { nameEn: "LIVE in SETi vol.95", venueEn: "SETi Live Hall" },
  PF301472: { nameEn: "9th Seoul International Dance Festival in Tank: Closing Invitational", venueEn: "Culture Tank (Oil Tank Culture Park)" },
  PF301429: { nameEn: "Kim Yeon-jin's Dance: Re:motion — Rewinding the Body", venueEn: "Seoul Namsan Gugakdang" },
  PF300917: { nameEn: "Hwajungmu: Dance in the Painting", venueEn: "National Gugak Center" },
  PF299775: { nameEn: "9th Seoul Int'l Dance Festival in Tank: Relay Performance Part 1", venueEn: "Culture Tank (Oil Tank Culture Park)" },
  PF299368: { nameEn: "9th Seoul Int'l Dance Festival in Tank: Relay Performance Part 2", venueEn: "Culture Tank (Oil Tank Culture Park)" },
  PF300374: { nameEn: "Mosquito War", venueEn: "Dream Theater [Daehangno]" },
  PF301171: { nameEn: "Island of Eden", venueEn: "Dakei Theater" },
  PF300754: { nameEn: "Puppy Poop [Daehangno]", venueEn: "Polar Bear Theater" },
  PF300338: { nameEn: "Shall We Get Some Fresh Air?", venueEn: "Cordell Art Hall" },
  PF301046: { nameEn: "9th Theater Dongguk Directors' Festival: That Guy's Jeong", venueEn: "Theater Dongguk" },
  PF300123: { nameEn: "Dear Korea, [Daehangno]", venueEn: "Biyu Art Hall" },
  PF300090: { nameEn: "Beyond the River", venueEn: "KOCCA CKL Stage" },
  PF301072: { nameEn: "Kang Shin-il Monologue", venueEn: "Changjak Space BBB" },
  PF301368: { nameEn: "White Rabbit Red Rabbit", venueEn: "Seoul Arts Center" },
  PF300923: { nameEn: "Bedtime Story", venueEn: "Dongsung Stage Theater" },
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

function parseDate(s) {
  // "2026.09.23" -> Date
  const [y, m, d] = s.split(".").map(Number);
  return new Date(y, m - 1, d);
}

// 기간이 길게 상시 운영되는 공연은 "from~to" 그대로 보여주면 여행객이 오해함
// (예: from이 2020년인 상설공연) → 요일별 스케줄(showTime)로 표시
const RECURRING_THRESHOLD_DAYS = 45;

function buildDateDisplay(item) {
  const from = parseDate(item.from);
  const to = parseDate(item.to);
  const spanDays = (to - from) / 86400000;
  const isRecurring = spanDays > RECURRING_THRESHOLD_DAYS;
  if (isRecurring) {
    return {
      isRecurring: true,
      dateDisplay: item.showTime || `${item.from} ~ ${item.to}`,
    };
  }
  return {
    isRecurring: false,
    dateDisplay: item.from === item.to ? item.from : `${item.from} ~ ${item.to}`,
  };
}

const final = curated.map((item) => {
  const tr = TRANSLATIONS[item.id];
  if (!tr) {
    console.warn(`⚠ 번역 누락: ${item.id} ${item.name}`);
  }
  const { isRecurring, dateDisplay } = buildDateDisplay(item);
  return {
    id: item.id,
    nameKo: item.name,
    nameEn: tr?.nameEn || item.name,
    venueKo: item.venue,
    venueEn: tr?.venueEn || item.venue,
    mapsQuery: `${item.venue} 서울`, // Google Maps 검색은 한국어 원 상호명이 더 정확히 매칭됨
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
  };
});

const outDir = path.join(ROOT, "data");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "performances.json"),
  JSON.stringify(final, null, 2),
  "utf8"
);
console.log(`저장 완료: data/performances.json (${final.length}건)`);
console.log(`  No Korean needed: ${final.filter((r) => r.noKoreanNeeded).length}건`);
console.log(`  한국어 필요(대비): ${final.filter((r) => !r.noKoreanNeeded).length}건`);
console.log(`  예매처 링크 없음: ${final.filter((r) => !r.bookingUrl).length}건`);
