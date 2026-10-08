"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import PageBackground from "@/components/PageBackground";
import Quiz from "@/components/Quiz";
import { getQuiz, grade } from "@/lib/api";
import type { Answer, QuizQuestion } from "@/types";

function Spinner({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-stone-300">
      <span
        className="h-9 w-9 animate-spin rounded-full border-[3px] border-white/10 border-t-amber-300"
        aria-hidden
      />
      <p className="text-sm">{label}</p>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-rose-300/30 bg-rose-400/10 px-5 py-4 text-sm text-rose-200"
    >
      {message}
    </div>
  );
}

function QuizContent() {
  const router = useRouter();
  const params = useSearchParams();
  const sessionId = params.get("session_id");

  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!sessionId) return;
    setLoadError(null);
    setQuestions(null);
    try {
      const res = await getQuiz(sessionId);
      setQuestions(res.questions);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Couldn't load your quiz."
      );
    }
  }, [sessionId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSubmit(answers: Answer[]) {
    if (!sessionId) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await grade({ session_id: sessionId, answers });
      if (!res.ok) {
        setSubmitError("We couldn't grade your answers. Please try again.");
        setSubmitting(false);
        return;
      }
      router.push(`/report?session_id=${encodeURIComponent(sessionId)}`);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Couldn't submit your answers."
      );
      setSubmitting(false);
    }
  }

  if (!sessionId) {
    return (
      <div className="py-10 text-center">
        <p className="text-lg text-stone-100">
          We couldn&apos;t find your session.
        </p>
        <p className="mt-1 text-sm text-stone-400">
          Upload your resume first so we can build your quiz.
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

  if (loadError) {
    return (
      <div className="space-y-4 py-4">
        <ErrorBox message={loadError} />
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-full bg-white/10 px-5 py-2.5 text-sm font-medium text-stone-100 transition hover:bg-white/15"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!questions) return <Spinner label="Putting your questions together…" />;

  if (questions.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-stone-400">
        No questions were generated for this session.
      </p>
    );
  }

  return (
    <Quiz
      questions={questions}
      submitting={submitting}
      error={submitError}
      onSubmit={handleSubmit}
    />
  );
}

export default function QuizPage() {
  return (
    <PageBackground>
      <header className="mb-8 text-center">
        <span className="inline-block rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-medium text-amber-200">
          Step 2 of 3 · Vexis
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-stone-50 sm:text-4xl">
          Let&apos;s check your skills
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-stone-400">
          No tricks and no timer. Answer honestly, because this is how we turn
          what your resume says into what you can show.
        </p>
      </header>

      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 backdrop-blur-md sm:p-9">
        <Suspense fallback={<Spinner label="Loading…" />}>
          <QuizContent />
        </Suspense>
      </section>

      <p className="mt-6 text-center text-xs text-stone-500">
        Your answers are only used to verify your skills.
      </p>
    </PageBackground>
  );
}