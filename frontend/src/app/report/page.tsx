"use client";

import { Suspense, useCallback, useEffect, useState, type ReactNode } from "react";
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

type Tone = "amber" | "violet" | "orange" | "sky";

// Each tone recolours the card that the child component draws itself.
// Full class strings are written out so Tailwind can detect them.
const PANEL_TONE: Record<Tone, string> = {
  amber:
    "[&>*]:!border-amber-300/30 [&>*]:!bg-amber-300/[0.08] [&>*]:!shadow-amber-300/5",
  violet:
    "[&>*]:!border-violet-300/30 [&>*]:!bg-violet-300/[0.08] [&>*]:!shadow-violet-300/5",
  orange:
    "[&>*]:!border-orange-300/30 [&>*]:!bg-orange-300/[0.08] [&>*]:!shadow-orange-300/5",
  sky: "[&>div>section]:!border-sky-300/30 [&>div>section]:!bg-sky-300/[0.08]",
};

function Panel({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <div className={PANEL_TONE[tone]}>{children}</div>;
}

function Spinner({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-stone-300">
      <span
        className="h-10 w-10 animate-spin rounded-full border-[3px] border-white/10 border-t-amber-300"
        aria-hidden
      />
      <p className="text-sm">{label}</p>
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
    <div className={`rounded-2xl border px-5 py-4 ${boxClass}`}>
      <p className="text-xs uppercase tracking-wider text-stone-300">{label}</p>
      <p className={`mt-1 text-3xl font-bold tabular-nums ${valueClass}`}>
        {value}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-stone-400">{hint}</p>
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
        <p className="text-lg text-stone-100">
          We couldn&apos;t find your session.
        </p>
        <p className="mt-1 text-sm text-stone-400">
          Upload your resume first so we can build your report.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-amber-300 px-6 py-2.5 text-sm font-semibold text-stone-900 transition hover:bg-amber-200"
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
          className="rounded-2xl border border-rose-300/30 bg-rose-400/10 px-5 py-4 text-sm text-rose-200"
        >
          {error}
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-full bg-white/10 px-5 py-2.5 text-sm font-medium text-stone-100 transition hover:bg-white/15"
          >
            Try again
          </button>
          <Link
            href={`/quiz?session_id=${encodeURIComponent(sessionId)}`}
            className="rounded-full px-5 py-2.5 text-sm text-stone-400 transition hover:text-stone-100"
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
          <Panel tone="amber">
            <ScoreGauge score={report.jrs} />
          </Panel>
        </div>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat
              label="Resume quality"
              value={`${Math.round(report.T * 100)}%`}
              hint="Scales your whole score"
              valueClass="text-sky-200"
              boxClass="border-sky-300/30 bg-sky-300/[0.08]"
            />
            <Stat
              label="Held up"
              value={String(solid)}
              hint="Skills with no penalty"
              valueClass="text-teal-200"
              boxClass="border-teal-300/30 bg-teal-300/[0.08]"
            />
            <Stat
              label="Overclaimed"
              value={String(overclaimed)}
              hint="Claimed above what we verified"
              valueClass={overclaimed > 0 ? "text-rose-200" : "text-stone-300"}
              boxClass="border-rose-300/30 bg-rose-300/[0.08]"
            />
          </div>
          <p className="rounded-2xl border border-indigo-300/30 bg-indigo-300/[0.08] px-5 py-4 text-xs leading-relaxed text-stone-300">
            <span className="font-medium text-indigo-100">
              How it&apos;s worked out:{" "}
            </span>
            each skill earns points from its importance, how closely your claim
            matched what we verified, and how well your resume backs it up. The
            total is then scaled by your resume quality.
          </p>
        </div>
      </div>

      {/* Per-skill table */}
      <Panel tone="violet">
        <SkillBreakdown breakdown={report.breakdown} />
      </Panel>

      {/* Roadmap: the three columns keep their own teal / rose / amber, the focus card is sky */}
      <div>
        <h2 className="mb-5 text-2xl font-bold text-stone-50">Your roadmap</h2>
        <Panel tone="sky">
          <Roadmap roadmap={report.roadmap} />
        </Panel>
      </div>

      {/* Learning resources (hidden if none) */}
      {report.resources && report.resources.length > 0 && (
        <Panel tone="orange">
          <Resources items={report.resources} />
        </Panel>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          href="/"
          className="rounded-full bg-amber-300 px-7 py-3 text-sm font-semibold text-stone-900 shadow-lg shadow-amber-300/10 transition hover:bg-amber-200"
        >
          Analyze another resume
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-full bg-white/10 px-6 py-3 text-sm font-medium text-stone-100 transition hover:bg-white/15"
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
        <span className="inline-block rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-medium text-amber-200">
          Step 3 of 3 · Vexis
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-stone-50 sm:text-4xl">
          Your job readiness report
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-stone-400">
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