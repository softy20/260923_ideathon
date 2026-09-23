"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PerformanceCard from "../components/PerformanceCard";
import Pagination from "../components/Pagination";
import BackToTop from "../components/BackToTop";
import {
  filterPerformances,
  getAllPerformances,
  getAvailableCities,
  getAvailableGenres,
} from "../lib/performances";
import { UI, genreNameForCode } from "../lib/i18n";

const VISITED_KEY = "stagepass_visited";

const PAGE_SIZE = 12;
// 이 값(px)보다 더 내려가면 모바일 필터 패널을 자동으로 접고, 맨 위 근처로
// 돌아오면 다시 펼친다. (데스크톱/태블릿에서는 패널이 항상 펼쳐진 채라 영향 없음)
const AUTO_COLLAPSE_SCROLL_Y = 60;

function toInputDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function HomePage() {
  const today = useMemo(() => new Date(), []);
  const weekLater = useMemo(() => new Date(Date.now() + 7 * 86400000), []);
  // KOPIS API 한 번 호출 최대 31일 제한에 맞춰 실제로 데이터가 있는 범위만 선택 가능하게 함
  const minSelectableDate = useMemo(() => toInputDate(today), [today]);
  const maxSelectableDate = useMemo(
    () => toInputDate(new Date(Date.now() + 31 * 86400000)),
    []
  );

  const [startDate, setStartDate] = useState(toInputDate(today));
  const [endDate, setEndDate] = useState(toInputDate(weekLater));
  const [noKoreanNeeded, setNoKoreanNeeded] = useState(false);
  const [city, setCity] = useState("");
  const [genre, setGenre] = useState("");
  const [lang, setLang] = useState("en");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const t = UI[lang];
  const resultsTopRef = useRef(null);
  const router = useRouter();

  // 처음 방문한 사람은 소개 페이지(/about)를 먼저 보여준다.
  // localStorage에 방문 기록이 없을 때만, 그리고 한 번만 리다이렉트한다.
  useEffect(() => {
    let visited = true;
    try {
      visited = localStorage.getItem(VISITED_KEY) === "1";
    } catch {
      // localStorage를 못 쓰면(프라이빗 브라우징 등) 그냥 메인을 보여줌
    }
    if (!visited) {
      router.replace("/about");
    }
  }, [router]);

  const cities = useMemo(() => getAvailableCities(), []);
  const genres = useMemo(() => getAvailableGenres(), []);
  const total = getAllPerformances().length;
  const results = filterPerformances({ startDate, endDate, noKoreanNeeded, city, genre });

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageResults = results.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // 필터가 바뀌면 결과 목록이 달라지니 항상 1페이지로 되돌린다.
  useEffect(() => {
    setPage(1);
  }, [startDate, endDate, noKoreanNeeded, city, genre]);

  // 스크롤을 내리면 필터 패널을 자동으로 접고, 맨 위 근처로 오면 다시 편다.
  useEffect(() => {
    function onScroll() {
      setFiltersOpen(window.scrollY < AUTO_COLLAPSE_SCROLL_Y);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function goToPage(n) {
    setPage(n);
    resultsTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // 모바일에서 필터를 접었을 때 한 줄로 보여줄 현재 조건 요약
  const shortDate = (s) => (s ? s.slice(5).replace("-", ".") : "");
  const cityLabel = cities.find((c) => c.city === city);
  const genreInfo = genres.find((g) => g.code === genre);
  const filterSummary = [
    `${shortDate(startDate)}–${shortDate(endDate)}`,
    cityLabel && (lang === "ko" ? cityLabel.cityKo : cityLabel.city),
    genreInfo && genreNameForCode(genreInfo.code, genreInfo.genreEn, lang),
    noKoreanNeeded && t.noKoreanNeeded,
  ]
    .filter(Boolean)
    .join(" · ");

  function resetFilters() {
    setStartDate(toInputDate(today));
    setEndDate(toInputDate(weekLater));
    setNoKoreanNeeded(false);
    setCity("");
    setGenre("");
  }

  return (
    <div className="page">
      <header className="header">
        <div className="header-top">
          <h1>Stage Pass Korea</h1>
          <div className="header-actions">
            <div role="group" aria-label="Language" className="lang-switch">
              <button
                type="button"
                aria-pressed={lang === "en"}
                onClick={() => setLang("en")}
              >
                English
              </button>
              <button
                type="button"
                aria-pressed={lang === "ko"}
                onClick={() => setLang("ko")}
              >
                한국어
              </button>
            </div>
            <Link href="/about" className="reopen-about" aria-label="About this site" title="About this site">
              ?
            </Link>
          </div>
        </div>
        <p className="tagline">{t.tagline}</p>
      </header>

      <section className="search-bar">
        <button
          type="button"
          className="filter-toggle"
          aria-expanded={filtersOpen}
          aria-controls="filter-fields"
          onClick={() => setFiltersOpen((v) => !v)}
        >
          <span className="filter-toggle-label">{t.filters}</span>
          <span className="filter-toggle-summary">{filterSummary}</span>
          <span className="filter-toggle-icon" aria-hidden="true">
            ▾
          </span>
        </button>

        <div
          id="filter-fields"
          className={`filter-collapse${filtersOpen ? "" : " is-collapsed"}`}
        >
        <div className="filter-collapse-inner">
        <div className="field">
          <label htmlFor="start">{t.fieldFrom}</label>
          <input
            id="start"
            type="date"
            value={startDate}
            min={minSelectableDate}
            max={maxSelectableDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="end">{t.fieldTo}</label>
          <input
            id="end"
            type="date"
            value={endDate}
            min={minSelectableDate}
            max={maxSelectableDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="city">{t.fieldCity}</label>
          <select id="city" value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="">{t.allCities}</option>
            {cities.map((c) => (
              <option key={c.city} value={c.city}>
                {lang === "ko" ? c.cityKo : c.city}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="genre">{t.fieldGenre}</label>
          <select id="genre" value={genre} onChange={(e) => setGenre(e.target.value)}>
            <option value="">{t.allGenres}</option>
            {genres.map((g) => (
              <option key={g.code} value={g.code}>
                {genreNameForCode(g.code, g.genreEn, lang)}
              </option>
            ))}
          </select>
        </div>

        <label className="toggle">
          <span>{t.noKoreanNeeded}</span>
          <span className="toggle-control">
            <input
              type="checkbox"
              className="toggle-input"
              role="switch"
              aria-checked={noKoreanNeeded}
              checked={noKoreanNeeded}
              onChange={(e) => setNoKoreanNeeded(e.target.checked)}
            />
            <span className="toggle-track" aria-hidden="true" />
          </span>
        </label>
        </div>
        </div>
      </section>

      <p className="result-count" ref={resultsTopRef}>
        {lang === "ko" ? (
          <>
            전체 {total}건 중 <strong>{results.length}건</strong> 표시
          </>
        ) : (
          <>
            Showing <strong>{results.length}</strong> of {total} performances
          </>
        )}
        {noKoreanNeeded && t.resultFiltered}
      </p>

      {results.length === 0 ? (
        <div className="empty-state">
          <p>{t.emptyTitle}</p>
          <p>{t.emptyBody}</p>
          <button type="button" className="btn-tertiary" onClick={resetFilters}>
            {t.resetFilters}
          </button>
        </div>
      ) : (
        <>
          <div className="card-grid">
            {pageResults.map((p) => (
              <PerformanceCard key={p.id} performance={p} lang={lang} />
            ))}
          </div>
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onChange={goToPage}
            prevLabel={t.prevPage}
            nextLabel={t.nextPage}
          />
        </>
      )}

      <footer className="footer">
        <p>
          {t.footer}{" "}
          <a href="https://www.kopis.or.kr" target="_blank" rel="noreferrer">
            www.kopis.or.kr
          </a>
        </p>
      </footer>

      <BackToTop />
    </div>
  );
}
