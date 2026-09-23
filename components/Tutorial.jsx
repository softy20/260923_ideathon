"use client";

import { useEffect, useState } from "react";
import { TUTORIAL } from "../lib/i18n";

// 타겟 DOM을 CSS 셀렉터로 지정 — page.jsx의 실제 UI 요소를 그대로 가리킨다.
const TARGET_SELECTORS = ["#start", ".toggle", ".card-grid .card:first-child .card-cta"];

const PAD = 8; // 스포트라이트가 타겟보다 살짝 더 크게 보이도록 여유 폭

export default function Tutorial({ lang, onClose }) {
  const t = TUTORIAL[lang];
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState(null);

  useEffect(() => {
    function measure() {
      const el = document.querySelector(TARGET_SELECTORS[step]);
      if (!el) {
        setRect(null);
        return;
      }
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      // 스크롤 애니메이션이 끝난 뒤 위치를 다시 재는 게 정확해서 약간 지연
      requestAnimationFrame(() => {
        setTimeout(() => {
          const r = el.getBoundingClientRect();
          setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
        }, 260);
      });
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [step]);

  const total = TARGET_SELECTORS.length;
  const isLast = step === total - 1;
  const current = t.steps[step];

  function next() {
    if (isLast) {
      onClose();
    } else {
      setStep((s) => s + 1);
    }
  }
  function prev() {
    setStep((s) => Math.max(0, s - 1));
  }

  // 툴팁을 스포트라이트 아래쪽에 둘지 위쪽에 둘지: 화면 아래쪽 공간이 부족하면 위로
  const tooltipBelow = rect ? rect.top < window.innerHeight * 0.55 : true;

  return (
    <div className="tutorial-layer" role="dialog" aria-modal="true">
      {rect ? (
        <div
          className="tutorial-spotlight"
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
          }}
        />
      ) : (
        <div className="tutorial-backdrop" />
      )}

      {rect && (
        <div
          className={`tutorial-tooltip${tooltipBelow ? " is-below" : " is-above"}`}
          style={{
            top: tooltipBelow ? rect.top + rect.height + PAD + 12 : undefined,
            bottom: tooltipBelow ? undefined : window.innerHeight - (rect.top - PAD) + 12,
            left: Math.min(Math.max(rect.left, 16), window.innerWidth - 320),
          }}
        >
          <TooltipBody
            t={t}
            current={current}
            step={step}
            total={total}
            isLast={isLast}
            onNext={next}
            onPrev={prev}
            onSkip={onClose}
          />
        </div>
      )}

      {!rect && (
        <div className="tutorial-tooltip tutorial-tooltip-center">
          <TooltipBody
            t={t}
            current={current}
            step={step}
            total={total}
            isLast={isLast}
            onNext={next}
            onPrev={prev}
            onSkip={onClose}
          />
        </div>
      )}
    </div>
  );
}

function TooltipBody({ t, current, step, total, isLast, onNext, onPrev, onSkip }) {
  return (
    <>
      <p className="tutorial-step-count">{t.stepOf(step + 1, total)}</p>
      <h4 className="tutorial-title">{current.title}</h4>
      <p className="tutorial-body">{current.body}</p>
      <div className="tutorial-actions">
        <button type="button" className="tutorial-skip" onClick={onSkip}>
          {t.skip}
        </button>
        <div className="tutorial-nav">
          {step > 0 && (
            <button type="button" className="btn-tertiary" onClick={onPrev}>
              {t.prev}
            </button>
          )}
          <button type="button" className="card-cta" onClick={onNext}>
            {isLast ? t.done : t.next}
          </button>
        </div>
      </div>
    </>
  );
}
