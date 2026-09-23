"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

const PAGE_SIZE = 12;

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
  const t = UI[lang];
  const resultsTopRef = useRef(null);

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

  function goToPage(n) {
    setPage(n);
    resultsTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

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
        </div>
        <p className="tagline">{t.tagline}</p>
      </header>

      <section className="search-bar">
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
