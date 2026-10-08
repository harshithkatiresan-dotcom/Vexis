"use client";

import { useRef, useState, type DragEvent, type FormEvent } from "react";
import { analyze } from "@/lib/api";
import type { AnalyzeResponse } from "@/types";

// To add a discipline, add a string here. "Other" lets users type their own.
const DISCIPLINES = ["Web Development", "Data Science / ML", "UI/UX Design"];
const OTHER = "__other__";
const MAX_PDF_MB = 10;

interface FieldErrors {
  pdf?: string;
  discipline?: string;
  stack?: string;
  github?: string;
  figma?: string;
}

interface UploadFormProps {
  onComplete: (result: AnalyzeResponse) => void;
}

// host is e.g. "github.com"; accepts the host itself or any subdomain (www.figma.com).
function checkUrl(value: string, host: string): string | undefined {
  const v = value.trim();
  if (!v) return undefined;
  try {
    const name = new URL(v).hostname;
    if (name !== host && !name.endsWith(`.${host}`)) {
      return `That doesn't look like a ${host} link.`;
    }
  } catch {
    return "Enter a full URL, starting with https://";
  }
  return undefined;
}

const inputClass =
  "w-full rounded-2xl border border-stone-300 bg-white/90 px-4 py-3 text-sm text-stone-900 placeholder:text-stone-500 transition focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-300/50 disabled:opacity-50";
const labelClass = "mb-2 block text-sm font-semibold text-stone-900";
const errorClass = "mt-2 text-xs font-medium text-rose-700";

export default function UploadForm({ onComplete }: UploadFormProps) {
  const fileInput = useRef<HTMLInputElement>(null);

  const [pdf, setPdf] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [disciplineChoice, setDisciplineChoice] = useState("");
  const [customDiscipline, setCustomDiscipline] = useState("");
  const [stack, setStack] = useState("");
  const [showOptional, setShowOptional] = useState(false);
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [figma, setFigma] = useState("");

  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const stackItems = stack
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  function acceptFile(file: File | null | undefined) {
    if (!file) return;
    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setPdf(null);
      setErrors((e) => ({ ...e, pdf: "Only PDF files are accepted." }));
      return;
    }
    if (file.size > MAX_PDF_MB * 1024 * 1024) {
      setPdf(null);
      setErrors((e) => ({ ...e, pdf: `PDF must be under ${MAX_PDF_MB} MB.` }));
      return;
    }
    setPdf(file);
    setErrors((e) => ({ ...e, pdf: undefined }));
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    if (loading) return;
    acceptFile(e.dataTransfer.files?.[0]);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);

    const discipline =
      disciplineChoice === OTHER ? customDiscipline.trim() : disciplineChoice;

    const next: FieldErrors = {
      pdf: pdf ? undefined : "Upload your resume as a PDF.",
      discipline: discipline ? undefined : "Choose or enter a discipline.",
      stack:
        stackItems.length > 0
          ? undefined
          : "Add at least one technology, separated by commas.",
      github: checkUrl(github, "github.com"),
      figma: checkUrl(figma, "figma.com"),
    };
    setErrors(next);
    if (Object.values(next).some(Boolean) || !pdf) {
      if (next.github || next.figma) setShowOptional(true);
      return;
    }

    setLoading(true);
    try {
      const result = await analyze({
        pdf,
        discipline,
        stack: stackItems.join(", "),
        linkedin_text: linkedin,
        github_url: github,
        figma_url: figma,
      });
      onComplete(result);
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-7">
      {/* PDF drop zone */}
      <div>
        <label className={labelClass} htmlFor="resume-pdf">
          Your resume (PDF) <span className="text-amber-700">*</span>
        </label>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => !loading && fileInput.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (!loading) fileInput.current?.click();
            }
          }}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-9 text-center transition ${
            dragging
              ? "border-amber-500 bg-amber-50"
              : errors.pdf
              ? "border-rose-400 bg-rose-50/60"
              : pdf
              ? "border-teal-400 bg-teal-50/70"
              : "border-stone-400 bg-white/60 hover:border-amber-400 hover:bg-amber-50/50"
          }`}
        >
          <input
            ref={fileInput}
            id="resume-pdf"
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            disabled={loading}
            onChange={(e) => acceptFile(e.target.files?.[0])}
          />
          <span
            className={`mb-3 flex h-11 w-11 items-center justify-center rounded-2xl text-xl font-bold ${
              pdf ? "bg-teal-100 text-teal-800" : "bg-amber-100 text-amber-800"
            }`}
            aria-hidden
          >
            {pdf ? "✓" : "↑"}
          </span>
          {pdf ? (
            <>
              <p className="max-w-full truncate text-sm font-semibold text-stone-900">
                {pdf.name}
              </p>
              <p className="mt-1 text-xs text-stone-700">
                {(pdf.size / 1024).toFixed(0)} KB · click or drop to replace
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-stone-900">
                Drop your resume here
              </p>
              <p className="mt-1 text-xs text-stone-700">
                or click to browse · PDF only, up to {MAX_PDF_MB} MB
              </p>
            </>
          )}
        </div>
        {errors.pdf && <p className={errorClass}>{errors.pdf}</p>}
      </div>

      {/* Discipline */}
      <div>
        <label className={labelClass} htmlFor="discipline">
          What are you aiming for? <span className="text-amber-700">*</span>
        </label>
        <select
          id="discipline"
          value={disciplineChoice}
          disabled={loading}
          onChange={(e) => setDisciplineChoice(e.target.value)}
          className={inputClass}
        >
          <option value="">Select a discipline…</option>
          {DISCIPLINES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
          <option value={OTHER}>Other (type your own)…</option>
        </select>
        {disciplineChoice === OTHER && (
          <input
            type="text"
            value={customDiscipline}
            disabled={loading}
            onChange={(e) => setCustomDiscipline(e.target.value)}
            placeholder="e.g. Cybersecurity, Mobile Development"
            className={`${inputClass} mt-3`}
          />
        )}
        {errors.discipline && <p className={errorClass}>{errors.discipline}</p>}
      </div>

      {/* Stack */}
      <div>
        <label className={labelClass} htmlFor="stack">
          Your tech stack <span className="text-amber-700">*</span>
        </label>
        <input
          id="stack"
          type="text"
          value={stack}
          disabled={loading}
          onChange={(e) => setStack(e.target.value)}
          placeholder="React, TypeScript, Node.js, SQL"
          className={inputClass}
        />
        {stackItems.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {stackItems.map((s, i) => (
              <span
                key={`${s}-${i}`}
                className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900"
              >
                {s}
              </span>
            ))}
          </div>
        )}
        {errors.stack && <p className={errorClass}>{errors.stack}</p>}
      </div>

      {/* Optional section */}
      <div className="rounded-3xl border border-sky-300 bg-sky-50/70">
        <button
          type="button"
          onClick={() => setShowOptional((v) => !v)}
          aria-expanded={showOptional}
          className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
        >
          <span>
            <span className="block text-sm font-semibold text-stone-900">
              Optional: boost your score
            </span>
            <span className="block text-xs text-stone-700">
              More sources mean more skills we can verify
            </span>
          </span>
          <span
            className={`text-stone-700 transition-transform ${
              showOptional ? "rotate-180" : ""
            }`}
            aria-hidden
          >
            ▾
          </span>
        </button>

        {showOptional && (
          <div className="space-y-5 border-t border-sky-300 px-5 py-5">
            <div>
              <label className={labelClass} htmlFor="linkedin">
                LinkedIn text
              </label>
              <textarea
                id="linkedin"
                rows={4}
                value={linkedin}
                disabled={loading}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="Paste your LinkedIn About + Experience sections"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="github">
                GitHub URL
              </label>
              <input
                id="github"
                type="url"
                value={github}
                disabled={loading}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/your-username"
                className={inputClass}
              />
              {errors.github && <p className={errorClass}>{errors.github}</p>}
            </div>
            <div>
              <label className={labelClass} htmlFor="figma">
                Figma URL
              </label>
              <input
                id="figma"
                type="url"
                value={figma}
                disabled={loading}
                onChange={(e) => setFigma(e.target.value)}
                placeholder="https://www.figma.com/file/..."
                className={inputClass}
              />
              {errors.figma && <p className={errorClass}>{errors.figma}</p>}
            </div>
          </div>
        )}
      </div>

      {serverError && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-400 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-800"
        >
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-300 to-orange-300 px-6 py-3.5 text-sm font-semibold text-stone-900 shadow-lg shadow-orange-200/70 transition hover:from-amber-200 hover:to-orange-200 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading && (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-stone-900/20 border-t-stone-900"
            aria-hidden
          />
        )}
        {loading ? "Reading your resume…" : "Analyze my resume"}
      </button>
    </form>
  );
}