"use client";

import { useState } from "react";
import Link from "next/link";
import UploadForm from "@/components/UploadForm";
import type { AnalyzeResponse } from "@/types";

export default function HomePage() {
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
            Vexis
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Are you actually job-ready?
          </h1>
          <p className="mt-3 text-slate-400">
            Upload your resume, prove your skills with a short quiz, and get a
            score backed by evidence, not just claims.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl sm:p-8">
          {result ? (
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Resume analyzed</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Resume quality:{" "}
                    <span className="font-medium text-violet-300">
                      {Math.round(result.T * 100)}%
                    </span>{" "}
                    · {result.skills.length} skills detected
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="shrink-0 text-xs text-slate-400 underline-offset-2 hover:text-slate-200 hover:underline"
                >
                  Use a different resume
                </button>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                  Quick wins
                </h3>
                {result.resume_issues.length > 0 ? (
                  <ul className="mt-3 space-y-2.5">
                    {result.resume_issues.map((issue, i) => (
                      <li
                        key={i}
                        className="flex gap-3 rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-200"
                      >
                        <span
                          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-xs font-semibold text-violet-300"
                          aria-hidden
                        >
                          {i + 1}
                        </span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-slate-400">
                    No obvious resume issues found. Nice.
                  </p>
                )}
              </div>

              <Link
                href={`/quiz?session_id=${encodeURIComponent(result.session_id)}`}
                className="mt-8 block w-full rounded-lg bg-violet-500 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-violet-400"
              >
                Start skill check →
              </Link>
            </div>
          ) : (
            <UploadForm onComplete={setResult} />
          )}
        </section>
      </div>
    </main>
  );
}