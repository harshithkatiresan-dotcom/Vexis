"use client";

import { useEffect, useState } from "react";

interface ScoreGaugeProps {
  score: number; // 0-100, straight from ReportResponse.jrs
  size?: number;
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
      stroke: "#5eead4",
      text: "text-teal-200",
      pill: "border-teal-300/30 bg-teal-300/10",
      glow: "rgba(94, 234, 212, 0.18)",
    };
  }
  if (score >= 50) {
    return {
      label: "Getting there",
      stroke: "#fcd34d",
      text: "text-amber-200",
      pill: "border-amber-300/30 bg-amber-300/10",
      glow: "rgba(252, 211, 77, 0.18)",
    };
  }
  return {
    label: "Not ready",
    stroke: "#fda4af",
    text: "text-rose-200",
    pill: "border-rose-300/30 bg-rose-300/10",
    glow: "rgba(253, 164, 175, 0.18)",
  };
}

export default function ScoreGauge({ score, size = 260 }: ScoreGaugeProps) {
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

  // The label and colour follow the FINAL score, so they don't flicker
  // through "Not ready" and "Getting there" while the number counts up.
  const tier = tierFor(target);

  // Geometry: a 240 degree arc, opening at the bottom.
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * (240 / 360);
  const dashOffset = arcLength - (value / 100) * arcLength;

  return (
    <div className="flex flex-col items-center rounded-3xl border border-white/10 bg-white/[0.04] px-6 pb-8 pt-8 shadow-2xl shadow-black/30 backdrop-blur-md">
      <div
        className="relative"
        style={{ width: size, height: size }}
        role="img"
        aria-label={`Job readiness score: ${target} out of 100, ${tier.label}`}
      >
        {/* Soft glow behind the dial */}
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
          {/* Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Value (hidden at 0 so the round cap doesn't show as a dot) */}
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

        {/* Centre text */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pb-3">
          <span className="text-6xl font-bold tabular-nums tracking-tight text-stone-50">
            {Math.round(value)}
          </span>
          <span className="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
            out of 100
          </span>
        </div>
      </div>

      <div className="-mt-4 text-center">
        <span
          className={`inline-block rounded-full border px-5 py-1.5 text-sm font-semibold ${tier.text} ${tier.pill}`}
        >
          {tier.label}
        </span>
        <p className="mx-auto mt-3 max-w-[16rem] text-xs leading-relaxed text-stone-500">
          Your Job Readiness Score, based on what you claimed and what we could verify.
        </p>
      </div>
    </div>
  );
}