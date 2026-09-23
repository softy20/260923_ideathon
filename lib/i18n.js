// 화면에 쓰이는 고정 문구 + 데이터 안의 한글 요일 표기를 영문으로 바꿔주는 헬퍼.
// 공연 이름/장소/도시는 데이터에 이미 en/ko 필드가 따로 있어서 여기서 다루지 않는다.

// /about 과 / (메인)이 언어 선택을 공유하도록 localStorage에 저장한다.
// (첫 렌더는 서버/클라이언트가 같아야 하므로 항상 "en"으로 시작하고,
//  마운트된 뒤에만 저장된 값으로 바꾼다 — 각 페이지의 useEffect에서 readSavedLang 호출)
export const LANG_KEY = "stagepass_lang";

export function readSavedLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    return saved === "ko" || saved === "en" ? saved : null;
  } catch {
    return null;
  }
}

export function saveLang(lang) {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    // 무시 — 저장 안 되면 그냥 이번 페이지에서만 적용됨
  }
}

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
    filters: "Filters",
    noKoreanNeeded: "No Korean needed",
    resultFiltered: " — filtered to shows you can enjoy without understanding Korean",
    resetFilters: "Reset filters",
    emptyTitle: "No performances match these dates.",
    emptyBody: "Try widening your date range — most shows here run for one week or more.",
    bookTickets: "Book tickets",
    noBookingLink: "No booking link",
    from: "from",
    footer: "Data via KOPIS (Korea Arts Management Service, Performing Arts Integrated Computer Network) —",
    prevPage: "‹ Prev",
    nextPage: "Next ›",
  },
  ko: {
    tagline: "전국 각지의 알짜 공연 정보 — 대형 뮤지컬 말고, 5만원 이하로 즐기는 진짜 로컬 공연.",
    fieldFrom: "시작일",
    fieldTo: "종료일",
    fieldCity: "도시",
    allCities: "전체 도시",
    fieldGenre: "장르",
    allGenres: "전체 장르",
    filters: "필터",
    noKoreanNeeded: "한국어 몰라도 OK",
    resultFiltered: " — 한국어를 몰라도 즐길 수 있는 공연만 표시",
    resetFilters: "필터 초기화",
    emptyTitle: "이 조건에 맞는 공연이 없습니다.",
    emptyBody: "날짜 범위를 넓혀 보세요 — 대부분 공연은 1주일 이상 진행됩니다.",
    bookTickets: "예매하기",
    noBookingLink: "예매 링크 없음",
    from: "최저",
    footer: "공연 정보 제공: KOPIS(예술경영지원센터 공연예술통합전산망) —",
    prevPage: "‹ 이전",
    nextPage: "다음 ›",
  },
};

// /about (서비스 소개 페이지) 전용 문구
export const ABOUT = {
  en: {
    heroTitle: "Real local shows in Korea, under ₩50,000.",
    heroSubtitle:
      "Concerts, dance, traditional music and more — straight from Korea's official performance database.",
    startTour: "Start the tour",
    browseShows: "Browse shows",
    whyTitle: "Why this site",
    why1Title: "Under ₩50,000",
    why1Body: "Not big musicals — real, affordable local shows.",
    why2Title: "Official data",
    why2Body: "Listings come from KOPIS, Korea's national performance database.",
    why3Title: "No Korean needed",
    why3Body: "We flag shows you can enjoy without understanding the language.",
    howTitle: "How it works",
    step1Title: "Pick your dates",
    step1Body: "Choose the days you'll be in Korea.",
    step2Title: "Filter by city, genre, language",
    step2Body: "Narrow it down to what fits your trip.",
    step3Title: "Go to the booking site",
    step3Body: "Tap a show to book on its official site.",
    noteTitle: "Good to know",
    note1: "Booking happens on an external site (Naver Reservation, Interpark, etc.) — some may be Korean-only.",
    note2: '"No Korean needed" is decided by genre: music, dance and circus are OK; theatre needs Korean.',
    note3: "Prices and schedules can change — double-check before you book.",
    ctaTitle: "Ready to enjoy a show?",
    ctaButton: "Browse shows",
    reopenHint: "About this site",
  },
  ko: {
    heroTitle: "5만원 이하로 즐기는, 진짜 한국 로컬 공연.",
    heroSubtitle:
      "콘서트, 무용, 국악까지 — 한국 공연예술통합전산망(KOPIS) 데이터를 바로 보여드려요.",
    startTour: "둘러보기 시작",
    browseShows: "공연 보러 가기",
    whyTitle: "이런 게 달라요",
    why1Title: "5만원 이하",
    why1Body: "대형 뮤지컬 말고, 부담 없는 가격의 진짜 공연이에요.",
    why2Title: "공식 데이터",
    why2Body: "KOPIS(공연예술통합전산망) 데이터를 그대로 보여드려요.",
    why3Title: "한국어 몰라도 OK",
    why3Body: "언어 몰라도 즐길 수 있는 공연에 표시를 해뒀어요.",
    howTitle: "이렇게 써요",
    step1Title: "여행 날짜 선택",
    step1Body: "한국에 머무는 기간을 골라주세요.",
    step2Title: "도시·장르·언어로 좁히기",
    step2Body: "여행 일정에 맞게 필터를 걸어보세요.",
    step3Title: "예매 사이트로 이동",
    step3Body: "공연을 누르면 공식 예매 사이트로 연결돼요.",
    noteTitle: "알아두세요",
    note1: "예매는 외부 사이트(네이버 예약, 인터파크 등)에서 진행돼요. 일부는 한국어로만 돼 있을 수 있어요.",
    note2: '"한국어 몰라도 OK"는 장르 기준으로 판단해요: 음악·무용·서커스는 OK, 연극은 한국어가 필요해요.',
    note3: "가격과 일정은 바뀔 수 있으니, 예매 전에 한 번 더 확인해주세요.",
    ctaTitle: "공연을 즐길 준비 되셨나요?",
    ctaButton: "공연 보러 가기",
    reopenHint: "서비스 소개",
  },
};

// 메인 페이지 포커스 튜토리얼(건너뛰기/이전·다음) 문구
export const TUTORIAL = {
  en: {
    skip: "Skip",
    prev: "‹ Prev",
    next: "Next ›",
    done: "Done",
    stepOf: (i, n) => `Step ${i} of ${n}`,
    steps: [
      {
        title: "Pick your travel dates",
        body: "Choose when you'll be in Korea — the list updates to shows happening then.",
      },
      {
        title: "No Korean needed",
        body: "Turn this on to see only shows you can enjoy without understanding the language.",
      },
      {
        title: "Book on the official site",
        body: "Tap a show's price to book — this always links to the real, official ticketing site.",
      },
    ],
  },
  ko: {
    skip: "건너뛰기",
    prev: "‹ 이전",
    next: "다음 ›",
    done: "완료",
    stepOf: (i, n) => `${i} / ${n}`,
    steps: [
      {
        title: "여행 날짜를 골라보세요",
        body: "한국에 머무는 기간을 고르면, 그 기간에 하는 공연으로 목록이 바뀌어요.",
      },
      {
        title: "한국어 몰라도 OK",
        body: "켜면 언어를 몰라도 즐길 수 있는 공연만 남아요.",
      },
      {
        title: "공식 사이트에서 예매",
        body: "가격을 누르면 예매돼요 — 항상 실제 공식 예매 사이트로 연결돼요.",
      },
    ],
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
