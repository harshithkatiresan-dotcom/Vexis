"use client";

import { useState } from "react";
import type { Answer, QuizQuestion } from "@/types";

interface QuizProps {
  questions: QuizQuestion[];
  submitting: boolean;
  error: string | null;
  onSubmit: (answers: Answer[]) => void;
}

const LETTERS = ["A", "B", "C", "D", "E", "F"];

const DIM_STYLE: Record<QuizQuestion["dim"], string> = {
  theory: "bg-teal-300/15 text-teal-200",
  practice: "bg-rose-300/15 text-rose-200",
};

const DIM_LABEL: Record<QuizQuestion["dim"], string> = {
  theory: "Theory",
  practice: "Hands-on",
};

export default function Quiz({ questions, submitting, error, onSubmit }: QuizProps) {
  const [index, setIndex] = useState(0);
  const [choices, setChoices] = useState<Record<string, number>>({});

  const total = questions.length;
  const question = questions[index];
  const selected = choices[question.id];
  const isLast = index === total - 1;
  const progress = Math.round(((index + (selected !== undefined ? 1 : 0)) / total) * 100);

  function pick(optionIndex: number) {
    if (submitting) return;
    setChoices((c) => ({ ...c, [question.id]: optionIndex }));
  }

  function next() {
    if (selected === undefined) return;
    if (isLast) {
      const answers: Answer[] = questions.map((q) => ({
        id: q.id,
        choice: choices[q.id],
      }));
      onSubmit(answers);
    } else {
      setIndex((i) => i + 1);
    }
  }

  return (
    <div>
      {/* Progress */}
      <div className="mb-8">
        <div className="mb-2.5 flex items-center justify-between text-xs text-stone-400">
          <span className="font-medium text-stone-300">
            Question {index + 1} of {total}
          </span>
          <span>{isLast ? "Last one!" : `${total - index - 1} to go`}</span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-300 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Tags */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-amber-300/15 px-3 py-1 text-xs font-semibold text-amber-200">
          {question.skill}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${DIM_STYLE[question.dim]}`}
        >
          {DIM_LABEL[question.dim]}
        </span>
      </div>

      {/* Prompt */}
      <h2 className="text-xl font-semibold leading-snug text-stone-50 sm:text-2xl">
        {question.prompt}
      </h2>

      {/* Options */}
      <div className="mt-7 space-y-3" role="radiogroup" aria-label="Answer options">
        {question.options.map((opt, i) => {
          const active = selected === i;
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={submitting}
              onClick={() => pick(i)}
              className={`flex w-full items-start gap-3.5 rounded-2xl border px-4 py-4 text-left text-sm leading-relaxed transition duration-150 sm:text-base ${
                active
                  ? "border-amber-300/70 bg-amber-300/10 text-stone-50 shadow-lg shadow-amber-300/5"
                  : "border-white/10 bg-white/[0.03] text-stone-200 hover:border-white/25 hover:bg-white/[0.06]"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <span
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                  active
                    ? "bg-amber-300 text-stone-900"
                    : "bg-white/10 text-stone-400"
                }`}
              >
                {LETTERS[i] ?? i + 1}
              </span>
              <span className="pt-0.5">{opt}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-2xl border border-rose-300/30 bg-rose-400/10 px-5 py-4 text-sm text-rose-200"
        >
          {error}
        </div>
      )}

      {/* Nav */}
      <div className="mt-9 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0 || submitting}
          className="rounded-full px-4 py-2.5 text-sm text-stone-400 transition hover:text-stone-100 disabled:invisible"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={next}
          disabled={selected === undefined || submitting}
          className="flex items-center gap-2 rounded-full bg-amber-300 px-7 py-3 text-sm font-semibold text-stone-900 shadow-lg shadow-amber-300/10 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-stone-500 disabled:shadow-none"
        >
          {submitting && (
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-stone-900/30 border-t-stone-900"
              aria-hidden
            />
          )}
          {submitting ? "Scoring…" : isLast ? "See my results" : "Next →"}
        </button>
      </div>
    </div>
  );
}