"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ABOUT, UI } from "../../lib/i18n";
import performances from "../../data/performances.json";

const VISITED_KEY = "stagepass_visited";
const POSTER_COUNT = 24;

function parseDate(s) {
  const [y, m, d] = s.split(".").map(Number);
  return new Date(y, m - 1, d);
}

// 넷플릭스 히어로처럼 배경에 깔 포스터 후보.
// 공연 기간이 끝난(to < 오늘) 건 자동으로 빠짐 → data/performances.json을 새로
// 수집할 때마다(공연이 바뀔 때마다) 배경도 같이 바뀜, 코드 수정 불필요.
// (서버/클라이언트 첫 렌더가 같아야 해서 여기서는 무작위 없이 후보만 고른다)
const HERO_POSTER_CANDIDATES = (() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const candidates = [
    ...new Set(
      performances
        .filter((p) => parseDate(p.to) >= today)
        .map((p) => p.poster)
        .filter(Boolean)
    ),
  ];
  return candidates.length ? candidates : performances.map((p) => p.poster).filter(Boolean);
})();

function evenSample(pool, n) {
  if (pool.length <= n) return pool;
  const step = pool.length / n;
  const out = [];
  for (let i = 0; i < n; i++) out.push(pool[Math.min(pool.length - 1, Math.floor(i * step))]);
  return out;
}

function shuffle(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// 세로로 이어붙여 위로 계속 스크롤해도 이음새 없이 반복되도록 목록을 통째로 두 번 반복
function doubleUp(list) {
  return [...list, ...list];
}

function markVisited() {
  try {
    localStorage.setItem(VISITED_KEY, "1");
  } catch {
    // 프라이빗 브라우징 등으로 localStorage를 못 쓰는 경우 — 무시하고 넘어감
  }
}

export default function AboutPage() {
  const [lang, setLang] = useState("en");
  // 첫 렌더(서버/클라이언트 hydration)는 항상 같은 결과가 나와야 하므로 고르게 뽑은
  // 목록으로 시작하고, 마운트된 뒤에만 무작위로 다시 섞는다(방문할 때마다 살짝 다르게).
  const [heroPosters, setHeroPosters] = useState(() =>
    doubleUp(evenSample(HERO_POSTER_CANDIDATES, POSTER_COUNT))
  );
  useEffect(() => {
    setHeroPosters(doubleUp(shuffle(HERO_POSTER_CANDIDATES).slice(0, POSTER_COUNT)));
  }, []);
  const a = ABOUT[lang];
  const t = UI[lang];

  return (
    <div className="about-page">
      <section className="hero">
        <div className="hero-bg" aria-hidden="true">
          <div className="hero-poster-track">
            <div className="hero-poster-grid">
              {heroPosters.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={url} alt="" loading="eager" />
              ))}
            </div>
          </div>
          <div className="hero-overlay" />
        </div>

        <div className="hero-inner">
          <header className="header">
            <div className="header-top">
              <h1>Stage Pass Korea</h1>
              <div role="group" aria-label="Language" className="lang-switch lang-switch-on-dark">
                <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")}>
                  English
                </button>
                <button type="button" aria-pressed={lang === "ko"} onClick={() => setLang("ko")}>
                  한국어
                </button>
              </div>
            </div>
          </header>

          <div className="hero-content">
            <h2 className="hero-title">{a.heroTitle}</h2>
            <p className="hero-subtitle">{a.heroSubtitle}</p>
            <div className="hero-actions">
              {/* tour=1 은 앞으로 붙을 튜토리얼(건너뛰기/이전·다음)이 읽을 자리표시자.
                  지금은 튜토리얼이 없어서 그냥 메인으로 이동만 함 */}
              <Link href="/?tour=1" className="card-cta hero-cta-primary" onClick={markVisited}>
                {a.startTour}
              </Link>
              <Link href="/" className="btn-tertiary btn-tertiary-on-dark" onClick={markVisited}>
                {a.browseShows}
              </Link>
            </div>
          </div>

          {/* 포스터 배경이 여기까지 이어지도록 Why 카드도 히어로 안에 둔다 */}
          <section className="intro-section intro-section-on-hero">
            <h3 className="intro-section-title">{a.whyTitle}</h3>
            <div className="intro-cards">
              <div className="intro-card">
                <span className="intro-card-icon" aria-hidden="true">
                  ₩
                </span>
                <h4>{a.why1Title}</h4>
                <p>{a.why1Body}</p>
              </div>
              <div className="intro-card">
                <span className="intro-card-icon" aria-hidden="true">
                  ✓
                </span>
                <h4>{a.why2Title}</h4>
                <p>{a.why2Body}</p>
              </div>
              <div className="intro-card">
                <span className="intro-card-icon" aria-hidden="true">
                  🌐
                </span>
                <h4>{a.why3Title}</h4>
                <p>{a.why3Body}</p>
              </div>
            </div>
          </section>
        </div>
      </section>

      <div className="page">
      <section className="intro-section">
        <h3 className="intro-section-title">{a.howTitle}</h3>
        <ol className="intro-steps">
          <li>
            <span className="intro-step-num">1</span>
            <div>
              <h4>{a.step1Title}</h4>
              <p>{a.step1Body}</p>
            </div>
          </li>
          <li>
            <span className="intro-step-num">2</span>
            <div>
              <h4>{a.step2Title}</h4>
              <p>{a.step2Body}</p>
            </div>
          </li>
          <li>
            <span className="intro-step-num">3</span>
            <div>
              <h4>{a.step3Title}</h4>
              <p>{a.step3Body}</p>
            </div>
          </li>
        </ol>
      </section>

      <section className="note-box">
        <h3 className="note-box-title">{a.noteTitle}</h3>
        <ul>
          <li>{a.note1}</li>
          <li>{a.note2}</li>
          <li>{a.note3}</li>
        </ul>
      </section>

      <section className="intro-cta">
        <h3>{a.ctaTitle}</h3>
        <Link href="/" className="card-cta hero-cta-primary" onClick={markVisited}>
          {a.ctaButton}
        </Link>
      </section>

      <footer className="footer">
        <p>
          {t.footer}{" "}
          <a href="https://www.kopis.or.kr" target="_blank" rel="noreferrer">
            www.kopis.or.kr
          </a>
        </p>
      </footer>
      </div>
    </div>
  );
}
