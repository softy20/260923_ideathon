"use client";

import { useMemo, useState } from "react";
import PerformanceCard from "../components/PerformanceCard";
import { filterPerformances, getAllPerformances } from "../lib/performances";

function toInputDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function HomePage() {
  const today = useMemo(() => new Date(), []);
  const weekLater = useMemo(() => new Date(Date.now() + 7 * 86400000), []);

  const [startDate, setStartDate] = useState(toInputDate(today));
  const [endDate, setEndDate] = useState(toInputDate(weekLater));
  const [noKoreanNeeded, setNoKoreanNeeded] = useState(false);

  const total = getAllPerformances().length;
  const results = filterPerformances({ startDate, endDate, noKoreanNeeded });

  return (
    <div className="page">
      <header className="header">
        <h1>Stage Pass Korea</h1>
        <p className="tagline">
          Affordable, official performances in Seoul — no big musicals, just real local
          shows under ₩50,000.
        </p>
      </header>

      <section className="search-bar">
        <div className="field">
          <label htmlFor="start">From</label>
          <input
            id="start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="end">To</label>
          <input
            id="end"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="city">City</label>
          <select id="city" disabled value="seoul">
            <option value="seoul">Seoul</option>
          </select>
        </div>

        <label className="toggle">
          <input
            type="checkbox"
            checked={noKoreanNeeded}
            onChange={(e) => setNoKoreanNeeded(e.target.checked)}
          />
          <span>No Korean needed</span>
        </label>
      </section>

      <p className="result-count">
        Showing {results.length} of {total} performances
        {noKoreanNeeded && " — filtered to shows you can enjoy without understanding Korean"}
      </p>

      {results.length === 0 ? (
        <div className="empty-state">
          <p>No performances match these dates.</p>
          <p>Try widening your date range — most shows here run for one week or more.</p>
        </div>
      ) : (
        <div className="card-grid">
          {results.map((p) => (
            <PerformanceCard key={p.id} performance={p} />
          ))}
        </div>
      )}

      <footer className="footer">
        <p>
          Data via KOPIS (Korea Arts Management Service, Performing Arts Integrated
          Computer Network) —{" "}
          <a href="https://www.kopis.or.kr" target="_blank" rel="noreferrer">
            www.kopis.or.kr
          </a>
        </p>
      </footer>
    </div>
  );
}
