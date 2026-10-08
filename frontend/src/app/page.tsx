"use client";

import { useState } from "react";
import Link from "next/link";
import PageBackground from "@/components/PageBackground";
import UploadForm from "@/components/UploadForm";
import type { AnalyzeResponse } from "@/types";

export default function HomePage() {
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  return (
    <PageBackground>
      <header className="mb-8 text-center">
        <span className="inline-block rounded-full border border-amber-300 bg-white/80 px-3.5 py-1 text-xs font-semibold text-amber-800 shadow-sm">
          Step 1 of 3 · Vexis
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
          Are you actually job-ready?
        </h1>
        <p className="mx-auto mt-3 max-w-md font-medium text-stone-800">
          Upload your resume, prove your skills with a short quiz, and get a
          score backed by evidence, not just claims.
        </p>
      </header>

      <section className="rounded-3xl border border-white bg-white/75 p-6 shadow-xl shadow-amber-900/5 backdrop-blur-md sm:p-9">
        {result ? (
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-stone-900">
                  Resume analyzed
                </h2>
                <p className="mt-1 text-sm text-stone-800">
                  Resume quality:{" "}
                  <span className="font-bold text-amber-800">
                    {Math.round(result.T * 100)}%
                  </span>{" "}
                  · {result.skills.length} skills detected
                </p>
              </div>
              <button
                type="button"
                onClick={() => setResult(null)}
                className="shrink-0 text-xs font-medium text-stone-700 underline underline-offset-2 hover:text-stone-900"
              >
                Use a different resume
              </button>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-bold uppercase tracking-wide text-stone-900">
                Quick wins
              </h3>
              {result.resume_issues.length > 0 ? (
                <ul className="mt-3 space-y-2.5">
                  {result.resume_issues.map((issue, i) => (
                    <li
                      key={i}
                      className="flex gap-3 rounded-2xl border border-amber-300 bg-amber-50/80 px-4 py-3.5 text-sm font-medium text-stone-900"
                    >
                      <span
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-stone-900"
                        aria-hidden
                      >
                        {i + 1}
                      </span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-stone-700">
                  No obvious resume issues found. Nice.
                </p>
              )}
            </div>

            <Link
              href={`/quiz?session_id=${encodeURIComponent(result.session_id)}`}
              className="mt-8 block w-full rounded-full bg-gradient-to-r from-amber-300 to-orange-300 px-6 py-3.5 text-center text-sm font-semibold text-stone-900 shadow-lg shadow-orange-200/70 transition hover:from-amber-200 hover:to-orange-200"
            >
              Start skill check →
            </Link>
          </div>
        ) : (
          <UploadForm onComplete={setResult} />
        )}
      </section>
    </PageBackground>
  );
}