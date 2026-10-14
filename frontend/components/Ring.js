"use client";

import { useEffect, useState } from "react";

const SIZE = 132;
const R = 56;
const C = 2 * Math.PI * R;

// Spinning ring while we wait for the API.
export function Spinner() {
  return (
    <svg width={SIZE} height={SIZE} viewBox="0 0 132 132" aria-hidden="true">
      <circle cx="66" cy="66" r={R} fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="9" />
      <g className="spin-arc">
        <circle cx="66" cy="66" r={R} fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${C * 0.28} ${C}`} />
      </g>
    </svg>
  );
}

// Score ring: fills from 0 to the score and counts the number up.
export function ScoreRing({ score, className = "" }) {
  const [shown, setShown] = useState(0);
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    setFilled(true);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(score);
      return;
    }
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / 1100, 1);
      setShown(Math.round(score * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} viewBox="0 0 132 132" className="-rotate-90" aria-hidden="true">
        <circle cx="66" cy="66" r={R} fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="9" />
        <circle
          cx="66"
          cy="66"
          r={R}
          fill="none"
          stroke="currentColor"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={filled ? C * (1 - Math.max(score, 3) / 100) : C}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-4xl font-semibold leading-none tabular-nums text-ink">{shown}</span>
        <span className="mt-1 text-xs text-muted">risk / 100</span>
      </div>
    </div>
  );
}
