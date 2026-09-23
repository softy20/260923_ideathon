"use client";

import { useState } from "react";
import Link from "next/link";
import { ABOUT, UI } from "../../lib/i18n";

const VISITED_KEY = "stagepass_visited";

function markVisited() {
  try {
    localStorage.setItem(VISITED_KEY, "1");
  } catch {
    // 프라이빗 브라우징 등으로 localStorage를 못 쓰는 경우 — 무시하고 넘어감
  }
}

export default function AboutPage() {
  const [lang, setLang] = useState("en");
  const a = ABOUT[lang];
  const t = UI[lang];

  return (
    <div className="page about-page">
      <header className="header">
        <div className="header-top">
          <h1>Stage Pass Korea</h1>
          <div role="group" aria-label="Language" className="lang-switch">
            <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")}>
              English
            </button>
            <button type="button" aria-pressed={lang === "ko"} onClick={() => setLang("ko")}>
              한국어
            </button>
          </div>
        </div>
      </header>

      <section className="hero">
        <h2 className="hero-title">{a.heroTitle}</h2>
        <p className="hero-subtitle">{a.heroSubtitle}</p>
        <div className="hero-actions">
          {/* tour=1 은 앞으로 붙을 튜토리얼(건너뛰기/이전·다음)이 읽을 자리표시자.
              지금은 튜토리얼이 없어서 그냥 메인으로 이동만 함 */}
          <Link href="/?tour=1" className="card-cta hero-cta-primary" onClick={markVisited}>
            {a.startTour}
          </Link>
          <Link href="/" className="btn-tertiary" onClick={markVisited}>
            {a.browseShows}
          </Link>
        </div>
      </section>

      <section className="intro-section">
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
  );
}
