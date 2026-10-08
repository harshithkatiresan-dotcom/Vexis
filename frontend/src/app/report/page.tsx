"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PageBackground from "@/components/PageBackground";
import ScoreGauge from "@/components/ScoreGauge";
import SkillBreakdown from "@/components/SkillBreakdown";
import Roadmap from "@/components/Roadmap";
import Resources from "@/components/Resources";
import { getReport } from "@/lib/api";
import type { ReportResponse, Resource } from "@/types";

// `resources` is optional here, so the page still works if the backend hasn't added it yet.
type ReportData = ReportResponse & { resources?: Resource[] };

// One tint per box. Full class strings are written out so Tailwind can detect them.
const TINT = {
  gauge: "border-amber-300 bg-amber-50/80 shadow-xl shadow-amber-900/5",
  skills: "border-violet-300 bg-violet-50/80 shadow-xl shadow-violet-900/5",
  focus: "border-sky-300 bg-sky-50/80 shadow-xl shadow-sky-900/5",
  resources: "border-orange-300 bg-orange-50/80 shadow-xl shadow-orange-900/5",
};

function Spinner({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-stone-800">
      <span
        className="h-10 w-10 animate-spin rounded-full border-[3px] border-stone-300 border-t-amber-500"
        aria-hidden
      />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  valueClass,
  boxClass,
}: {
  label: string;
  value: string;
  hint: string;
  valueClass: string;
  boxClass: string;
}) {
  return (
    <div className={`rounded-2xl border px-5 py-4 shadow-md ${boxClass}`}>
      <p className="text-xs font-bold uppercase tracking-wider text-stone-800">
        {label}
      </p>
      <p className={`mt-1 text-3xl font-bold tabular-nums ${valueClass}`}>
        {value}
      </p>
      <p className="mt-1 text-xs font-medium leading-relaxed text-stone-700">
        {hint}
      </p>
    </div>
  );
}

function ReportContent() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");

  const [report, setReport] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!sessionId) return;
    setError(null);
    setReport(null);
    try {
      const res: ReportData = await getReport(sessionId);
      setReport(res);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't load your report."
      );
    }
  }, [sessionId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!sessionId) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg font-semibold text-stone-900">
          We couldn&apos;t find your session.
        </p>
        <p className="mt-1 text-sm text-stone-700">
          Upload your resume first so we can build your report.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-gradient-to-r from-amber-300 to-orange-300 px-6 py-2.5 text-sm font-semibold text-stone-900 shadow-lg shadow-orange-200/70 transition hover:from-amber-200 hover:to-orange-200"
        >
          Back to upload
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md space-y-4 py-16">
        <div
          role="alert"
          className="rounded-2xl border border-rose-400 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-800"
        >
          {error}
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-900 transition hover:bg-stone-50"
          >
            Try again
          </button>
          <Link
            href={`/quiz?session_id=${encodeURIComponent(sessionId)}`}
            className="rounded-full px-5 py-2.5 text-sm font-medium text-stone-700 transition hover:text-stone-900"
          >
            Back to the quiz
          </Link>
        </div>
      </div>
    );
  }

  if (!report) return <Spinner label="Crunching your results…" />;

  const overclaimed = report.breakdown.filter((r) => r.overclaimed).length;
  const solid = report.breakdown.length - overclaimed;

  return (
    <div className="space-y-8">
      {/* Score + quick stats */}
      <div className="grid items-center gap-6 md:grid-cols-[auto_1fr]">
        <div className="mx-auto">
          <ScoreGauge score={report.jrs} cardClass={TINT.gauge} />
        </div>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat
              label="Resume quality"
              value={`${Math.round(report.T * 100)}%`}
              hint="Scales your whole score"
              valueClass="text-sky-800"
              boxClass="border-sky-300 bg-sky-50/80 shadow-sky-900/5"
            />
            <Stat
              label="Held up"
              value={String(solid)}
              hint="Skills with no penalty"
              valueClass="text-teal-800"
              boxClass="border-teal-300 bg-teal-50/80 shadow-teal-900/5"
            />
            <Stat
              label="Overclaimed"
              value={String(overclaimed)}
              hint="Claimed above what we verified"
              valueClass={overclaimed > 0 ? "text-rose-800" : "text-stone-700"}
              boxClass="border-rose-300 bg-rose-50/80 shadow-rose-900/5"
            />
          </div>
          <p className="rounded-2xl border border-indigo-300 bg-indigo-50/80 px-5 py-4 text-xs font-medium leading-relaxed text-stone-800 shadow-md shadow-indigo-900/5">
            <span className="font-bold text-indigo-900">
              How it&apos;s worked out:{" "}
            </span>
            each skill earns points from its importance, how closely your claim
            matched what we verified, and how well your resume backs it up. The
            total is then scaled by your resume quality.
          </p>
        </div>
      </div>

      {/* Per-skill table */}
      <SkillBreakdown breakdown={report.breakdown} cardClass={TINT.skills} />

      {/* Roadmap */}
      <div>
        <h2 className="mb-5 text-2xl font-bold text-stone-900">Your roadmap</h2>
        <Roadmap roadmap={report.roadmap} focusCardClass={TINT.focus} />
      </div>

      {/* Learning resources (hidden if none) */}
      {report.resources && report.resources.length > 0 && (
        <Resources items={report.resources} cardClass={TINT.resources} />
      )}

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          href="/"
          className="rounded-full bg-gradient-to-r from-amber-300 to-orange-300 px-7 py-3 text-sm font-semibold text-stone-900 shadow-lg shadow-orange-200/70 transition hover:from-amber-200 hover:to-orange-200"
        >
          Analyze another resume
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-full border border-stone-400 bg-white/90 px-6 py-3 text-sm font-semibold text-stone-900 transition hover:bg-white"
        >
          Print / save as PDF
        </button>
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <PageBackground widthClass="max-w-5xl">
      <header className="mb-10 text-center">
        <span className="inline-block rounded-full border border-amber-300 bg-white/80 px-3.5 py-1 text-xs font-semibold text-amber-800 shadow-sm">
          Step 3 of 3 · Vexis
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
          Your job readiness report
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-relaxed text-stone-800">
          Here&apos;s what your resume claims, what we could verify, and what to
          do next.
        </p>
      </header>

      <Suspense fallback={<Spinner label="Loading…" />}>
        <ReportContent />
      </Suspense>
    </PageBackground>
  );
}