"use client";

import { useEffect, useState } from "react";

interface ScoreGaugeProps {
  score: number; // 0-100, straight from ReportResponse.jrs
  size?: number;
  /** Colour classes for the card (border, background, shadow). */
  cardClass?: string;
}

interface Tier {
  label: string;
  stroke: string; // hex, used by the SVG
  text: string;
  pill: string;
  glow: string;
}

// UI-only thresholds. They are not part of the API contract.
function tierFor(score: number): Tier {
  if (score >= 75) {
    return {
      label: "Job ready",
      stroke: "#0d9488",
      text: "text-teal-900",
      pill: "border-teal-400 bg-teal-100",
      glow: "rgba(45, 212, 191, 0.35)",
    };
  }
  if (score >= 50) {
    return {
      label: "Getting there",
      stroke: "#d97706",
      text: "text-amber-900",
      pill: "border-amber-400 bg-amber-100",
      glow: "rgba(251, 191, 36, 0.35)",
    };
  }
  return {
    label: "Not ready",
    stroke: "#e11d48",
    text: "text-rose-900",
    pill: "border-rose-400 bg-rose-100",
    glow: "rgba(251, 113, 133, 0.3)",
  };
}

export default function ScoreGauge({
  score,
  size = 260,
  cardClass = "border-white bg-white/75 shadow-xl shadow-amber-900/5",
}: ScoreGaugeProps) {
  const target = Math.min(100, Math.max(0, Math.round(score)));
  const [value, setValue] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setValue(target);
      return;
    }

    const duration = 1400;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setValue(target * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [target]);

  // Label and colour follow the FINAL score, so they don't flicker while counting up.
  const tier = tierFor(target);

  // Geometry: a 240 degree arc, opening at the bottom.
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * (240 / 360);
  const dashOffset = arcLength - (value / 100) * arcLength;

  return (
    <div
      className={`flex flex-col items-center rounded-3xl border px-6 pb-8 pt-8 backdrop-blur-md ${cardClass}`}
    >
      <div
        className="relative"
        style={{ width: size, height: size }}
        role="img"
        aria-label={`Job readiness score: ${target} out of 100, ${tier.label}`}
      >
        <div
          className="absolute inset-4 rounded-full blur-3xl transition-colors duration-700"
          style={{ background: tier.glow }}
          aria-hidden
        />

        <svg
          width={size}
          height={size}
          className="relative z-10 rotate-[150deg]"
          aria-hidden
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(87, 83, 78, 0.22)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {value > 0.5 && (
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={tier.stroke}
              strokeWidth={strokeWidth}
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
            />
          )}
        </svg>

        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pb-3">
          <span className="text-6xl font-bold tabular-nums tracking-tight text-stone-900">
            {Math.round(value)}
          </span>
          <span className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-stone-700">
            out of 100
          </span>
        </div>
      </div>

      <div className="-mt-4 text-center">
        <span
          className={`inline-block rounded-full border px-5 py-1.5 text-sm font-bold ${tier.text} ${tier.pill}`}
        >
          {tier.label}
        </span>
        <p className="mx-auto mt-3 max-w-[16rem] text-xs font-medium leading-relaxed text-stone-700">
          Your Job Readiness Score, based on what you claimed and what we could verify.
        </p>
      </div>
    </div>
  );
}