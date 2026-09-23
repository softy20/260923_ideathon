// data/performances.json 을 읽고 날짜/필터 조건으로 걸러내는 순수 함수들.
// 데이터가 40건뿐이라 서버 호출 없이 클라이언트에서 바로 필터링한다.

import data from "../data/performances.json";

export function getAllPerformances() {
  return data;
}

function parseDate(s) {
  // "2026.09.23" -> Date (로컬 자정)
  const [y, m, d] = s.split(".").map(Number);
  return new Date(y, m - 1, d);
}

function parseInputDate(s) {
  // <input type="date"> 값 "2026-09-23" -> Date (로컬 자정)
  // new Date("2026-09-23")로 바로 파싱하면 UTC 자정이 되어 KST(UTC+9)에서
  // parseDate()와 9시간 어긋남 → 당일 공연이 날짜 비교에서 통째로 빠지는 버그가 있었음
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * @param {object} opts
 * @param {string} [opts.startDate] "YYYY-MM-DD"
 * @param {string} [opts.endDate] "YYYY-MM-DD"
 * @param {boolean} [opts.noKoreanNeeded]
 */
export function filterPerformances({ startDate, endDate, noKoreanNeeded } = {}) {
  const start = startDate ? parseInputDate(startDate) : null;
  const end = endDate ? parseInputDate(endDate) : null;

  return data.filter((p) => {
    if (noKoreanNeeded && !p.noKoreanNeeded) return false;

    if (start && end) {
      const pFrom = parseDate(p.from);
      const pTo = parseDate(p.to);
      // 여행 기간과 공연 기간이 겹치는지만 확인 (상시공연은 기간이 길어서 거의 항상 겹침)
      if (pTo < start || pFrom > end) return false;
    }

    return true;
  });
}
