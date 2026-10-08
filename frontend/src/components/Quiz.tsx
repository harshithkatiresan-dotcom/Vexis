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
  theory: "bg-teal-100 text-teal-900",
  practice: "bg-rose-100 text-rose-900",
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
        <div className="mb-2.5 flex items-center justify-between text-xs text-stone-700">
          <span className="font-bold text-stone-900">
            Question {index + 1} of {total}
          </span>
          <span className="font-medium">
            {isLast ? "Last one!" : `${total - index - 1} to go`}
          </span>
        </div>
        <div
          className="h-2.5 w-full overflow-hidden rounded-full bg-stone-300/80"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Tags */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
          {question.skill}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${DIM_STYLE[question.dim]}`}
        >
          {DIM_LABEL[question.dim]}
        </span>
      </div>

      {/* Prompt */}
      <h2 className="text-xl font-bold leading-snug text-stone-900 sm:text-2xl">
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
              className={`flex w-full items-start gap-3.5 rounded-2xl border px-4 py-4 text-left text-sm font-medium leading-relaxed transition duration-150 sm:text-base ${
                active
                  ? "border-amber-500 bg-amber-50 text-stone-900 shadow-md shadow-amber-200/60"
                  : "border-stone-300 bg-white/90 text-stone-900 hover:border-amber-400 hover:bg-amber-50/60"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <span
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                  active
                    ? "bg-amber-400 text-stone-900"
                    : "bg-stone-200 text-stone-800"
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
          className="mt-6 rounded-2xl border border-rose-400 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-800"
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
          className="rounded-full px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:text-stone-900 disabled:invisible"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={next}
          disabled={selected === undefined || submitting}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-300 to-orange-300 px-7 py-3 text-sm font-semibold text-stone-900 shadow-lg shadow-orange-200/70 transition hover:from-amber-200 hover:to-orange-200 disabled:cursor-not-allowed disabled:from-stone-200 disabled:to-stone-200 disabled:text-stone-500 disabled:shadow-none"
        >
          {submitting && (
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-stone-900/20 border-t-stone-900"
              aria-hidden
            />
          )}
          {submitting ? "Scoring…" : isLast ? "See my results" : "Next →"}
        </button>
      </div>
    </div>
  );
}