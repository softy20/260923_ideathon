// scripts/output/other-cities.json(34건) + 수동 번역을 기존 data/performances.json(서울 40건)에 합친다.
// 실행: node scripts/finalize-region.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const otherCities = JSON.parse(
  fs.readFileSync(path.join(ROOT, "scripts/output/other-cities.json"), "utf8")
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
  PF277103: { nameEn: "Toddler Concert [House of Verre]", venueEn: "House of Verre" },
  PF293251: { nameEn: "Rion's Mysterious Candy Shop [Busan]", venueEn: "Gaon Art Hall [Busan]" },
  PF295487: { nameEn: "Green Magician's Aqua Bubble Show [Busan]", venueEn: "Green Magic Theater" },
  PF299229: { nameEn: "ONE HOUR [Busan] (September)", venueEn: "KT&G Sangsangmadang Live Hall [Busan]" },
  PF299446: { nameEn: "Baroque Ensemble Dongbaek 'Garden of Music' Series VII — Violet: Miserere [Busan]", venueEn: "Busan Concert Hall" },
  PF286294: { nameEn: "Busan Cinema Center BCC Cine-Live: 11am Film Music Concert [Busan] (Sep)", venueEn: "Busan Cinema Center" },
  PF299672: { nameEn: "Ghibli House Concert: The Day Autumn Begins [Busan]", venueEn: "The Cellist's Study" },
  PF299851: { nameEn: "94th Art Empathy: Classic Playlist [Busan]", venueEn: "Eulsukdo Culture Center" },
  PF299719: { nameEn: "Lee Myeong-jin Cello Recital [Busan]", venueEn: "Busan Culture Center" },
  PF299325: { nameEn: "Yeongdo Arts Center Wednesday Series: Breath — To Sing [Busan]", venueEn: "Yeongdo Arts Center" },

  PF248820: { nameEn: "Korean Film OSTs We Loved: A Concert [Daegu]", venueEn: "STAGE M (formerly Franz Hall)" },
  PF256370: { nameEn: "STAGE M New Year Concert: Candle Day [Daegu]", venueEn: "STAGE M (formerly Franz Hall)" },
  PF274143: { nameEn: "STAGE M Christmas Film Music & Carol Concert [Daegu]", venueEn: "STAGE M (formerly Franz Hall)" },
  PF295351: { nameEn: "Ghibli House Concert: The Valley of That Summer Day [Daegu]", venueEn: "Eoyeonhi House" },
  PF295594: { nameEn: "Ghibli House Concert: A Summer with the Sea [Daegu]", venueEn: "Eoyeonhi House" },
  PF300042: { nameEn: "Daegu Clarinet Ensemble Regular Concert (3rd Anniversary)", venueEn: "Daegu Concert House" },
  PF295324: { nameEn: "Park Seong-geun Cello Recital [Daegu]", venueEn: "Daegu Concert House" },
  PF299991: { nameEn: "Salon de Gateum Season 2: Cellist Kim Hye-jun [Daegu]", venueEn: "The Gateum" },
  PF291937: { nameEn: "Suseong Renaissance Project — Young Artist Recital V: Park Yeon-woo Piano Recital", venueEn: "Suseong Artpia" },

  PF282994: { nameEn: "Han Sang-min's Magic Show [Incheon]", venueEn: "Lucid Art Hall" },
  PF286856: { nameEn: "The Magic House [Incheon]", venueEn: "Cafe Wa-an" },
  PF297251: { nameEn: "Holic [Incheon]", venueEn: "Incheon Children's Science Museum" },
  PF300274: { nameEn: "Bubble J's Magic Cabaret with Sergio [Incheon]", venueEn: "Songdo Geonwon Technocube" },
  PF299911: { nameEn: "Bubble J's Unbelievable Show with Sergio [Incheon]", venueEn: "Songdo Geonwon Technocube" },
  PF299811: { nameEn: "Pinocchio [Incheon]", venueEn: "Unyulbook Classic" },
  PF297585: { nameEn: "Coffee Concert VII — Creative Pansori: 'Moo, Rise Up!' [Incheon]", venueEn: "Incheon Culture & Arts Center" },
  PF301000: { nameEn: "The Elegance of Jeongga — Drunk on Refined Taste [Incheon]", venueEn: "Janchimadang Gugak Theater" },
  PF300202: { nameEn: "New Pan-ulim [Incheon]", venueEn: "Bupyeong Art Center" },

  PF287889: { nameEn: "Sesim-gut: The Story of Eunggong-i [Daejeon]", venueEn: "Byeolbyeolmadang Ugeumchi" },
  PF300239: { nameEn: "7th Brass BOB Regular Concert — From Tradition to Color [Daejeon]", venueEn: "Daejeon Arts Center" },
  PF300956: { nameEn: "Soprano Park Ji-young & Pianist Yang Ki-hoon Duo Recital [Daejeon]", venueEn: "Plan A Culture Space" },
  PF294541: { nameEn: "Daejeon Arts Center Members' Concert: Mao Fujita Piano Recital", venueEn: "Daejeon Arts Center" },

  PF299507: { nameEn: "Eschenbach & KBS Symphony: Mahler Symphony No.2 'Resurrection' (screening) [Ulsan]", venueEn: "Ulsan Jung-gu Culture & Arts Center" },
  PF300024: { nameEn: "8 O'Clock Classics Ulju: Yoon Yeo-min & Friends — The Song of Ulju", venueEn: "Ulju Culture & Arts Center" },
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

const newItems = otherCities.map((item) => {
  const tr = TRANSLATIONS[item.id];
  if (!tr) console.warn(`⚠ 번역 누락: ${item.id} ${item.name}`);
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
    noKoreanNeeded: true,
    bookingUrl: item.bookingLinks?.[0]?.url || null,
    bookingLinks: item.bookingLinks,
    runtime: item.runtime,
    age: item.age,
    city: item.city,
    cityKo,
  };
});

// 기존 서울 데이터에도 city/cityKo 필드 채워주기 (없으면 서울로 간주)
const existingWithCity = existing.map((item) => ({
  ...item,
  city: item.city || "Seoul",
  cityKo: item.cityKo || "서울",
}));

const final = [...existingWithCity, ...newItems];
fs.writeFileSync(
  path.join(ROOT, "data/performances.json"),
  JSON.stringify(final, null, 2),
  "utf8"
);

console.log(`저장 완료: data/performances.json (총 ${final.length}건)`);
for (const c of ["Seoul", "Busan", "Daegu", "Incheon", "Gwangju", "Daejeon", "Ulsan"]) {
  const n = final.filter((x) => x.city === c).length;
  if (n) console.log(`  ${c}: ${n}건`);
}
