// 화면에 쓰이는 고정 문구 + 데이터 안의 한글 요일 표기를 영문으로 바꿔주는 헬퍼.
// 공연 이름/장소/도시는 데이터에 이미 en/ko 필드가 따로 있어서 여기서 다루지 않는다.

export const UI = {
  en: {
    tagline:
      "Affordable, official performances across Korea — no big musicals, just real local shows under ₩50,000.",
    fieldFrom: "From",
    fieldTo: "To",
    fieldCity: "City",
    allCities: "All cities",
    fieldGenre: "Genre",
    allGenres: "All genres",
    noKoreanNeeded: "No Korean needed",
    resultFiltered: " — filtered to shows you can enjoy without understanding Korean",
    resetFilters: "Reset filters",
    emptyTitle: "No performances match these dates.",
    emptyBody: "Try widening your date range — most shows here run for one week or more.",
    bookTickets: "Book tickets",
    noBookingLink: "No booking link",
    from: "from",
    footer: "Data via KOPIS (Korea Arts Management Service, Performing Arts Integrated Computer Network) —",
  },
  ko: {
    tagline: "전국 각지의 알짜 공연 정보 — 대형 뮤지컬 말고, 5만원 이하로 즐기는 진짜 로컬 공연.",
    fieldFrom: "시작일",
    fieldTo: "종료일",
    fieldCity: "도시",
    allCities: "전체 도시",
    fieldGenre: "장르",
    allGenres: "전체 장르",
    noKoreanNeeded: "한국어 몰라도 OK",
    resultFiltered: " — 한국어를 몰라도 즐길 수 있는 공연만 표시",
    resetFilters: "필터 초기화",
    emptyTitle: "이 조건에 맞는 공연이 없습니다.",
    emptyBody: "날짜 범위를 넓혀 보세요 — 대부분 공연은 1주일 이상 진행됩니다.",
    bookTickets: "예매하기",
    noBookingLink: "예매 링크 없음",
    from: "최저",
    footer: "공연 정보 제공: KOPIS(예술경영지원센터 공연예술통합전산망) —",
  },
};

// genreCode -> 한글 장르명 (데이터에 genreEn만 있고 genreKo가 없어서 직접 매핑)
const GENRE_KO = {
  AAAA: "연극",
  BBBC: "무용",
  CCCA: "클래식",
  CCCC: "국악",
  CCCD: "대중음악",
  EEEB: "서커스/마술",
};

export function genreLabel(performance, lang) {
  return genreNameForCode(performance.genreCode, performance.genreEn, lang);
}

export function genreNameForCode(code, genreEn, lang) {
  if (lang === "ko") return GENRE_KO[code] || genreEn;
  return genreEn;
}

const WEEKDAY_EN = {
  월요일: "Mon",
  화요일: "Tue",
  수요일: "Wed",
  목요일: "Thu",
  금요일: "Fri",
  토요일: "Sat",
  일요일: "Sun",
  HOL: "Holidays",
};

// dateDisplay는 항상 한글 요일로 저장돼 있음 ("월요일(15:30), 토요일~일요일(19:00)").
// 영어 모드일 때만 요일 토큰을 치환하고, 날짜 범위("2026.09.23 ~ ...")는 그대로 둔다.
export function translateSchedule(dateDisplay, lang) {
  if (lang !== "en" || !dateDisplay) return dateDisplay;
  let out = dateDisplay;
  for (const [ko, en] of Object.entries(WEEKDAY_EN)) {
    out = out.split(ko).join(en);
  }
  return out;
}

// "Tue(18:00,20:30), Wed ~ Fri(18:00,20:30)" 같은 한 줄짜리 스케줄 문자열을
// 요일 칩 카드용 { day, times } 배열로 쪼갠다. 날짜 범위("2026.09.23 ~ ...")처럼
// 괄호가 없는 경우엔 그 문자열 그대로를 day로 두고 times는 비운다.
// 같은 공연 시간을 가진 요일(예: 일요일/HOL이 시간이 똑같은 경우)은 한 칩으로 합친다.
export function scheduleGroups(dateDisplay, lang) {
  const translated = translateSchedule(dateDisplay, lang);
  if (!translated) return [];
  const raw = translated.split(", ").map((group) => {
    const m = group.match(/^(.*?)\(([^)]*)\)$/);
    if (!m) return { day: group, times: "" };
    return { day: m[1], times: m[2].split(",").join(", ") };
  });

  const merged = [];
  const indexByTimes = new Map();
  for (const g of raw) {
    if (g.times && indexByTimes.has(g.times)) {
      merged[indexByTimes.get(g.times)].day += `, ${g.day}`;
      continue;
    }
    if (g.times) indexByTimes.set(g.times, merged.length);
    merged.push({ ...g });
  }
  return merged;
}
