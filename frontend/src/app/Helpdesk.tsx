"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Topic {
  id: string;
  icon: string;
  title: string;
  blurb: string;
  intro?: string;
  items?: string[];
  ordered?: boolean;
  outro?: string;
}

// Edit this list to change what the help desk says.
const TOPICS: Topic[] = [
  {
    id: "why",
    icon: "★",
    title: "Why is Vexis worth using?",
    blurb: "What makes it different from a normal resume checker",
    intro: "Most tools just read your resume. Vexis checks it.",
    items: [
      "It tests your claimed skills with a short quiz, so the score reflects what you can show, not just what you wrote.",
      "It flags skills you claimed above what we could verify, so you hear it from us before a recruiter.",
      "Every point of your score is explained, skill by skill. Nothing is a black box.",
      "You get a clear roadmap of what to add, remove and change, plus the topics to study first.",
      "It points you to videos and courses for the skills that would lift your score the most.",
    ],
  },
  {
    id: "how",
    icon: "⚙",
    title: "How does it work?",
    blurb: "The three steps from upload to report",
    items: [
      "Upload your resume as a PDF, pick your discipline, and list your tech stack. You can also add LinkedIn text, a GitHub link or a Figma link.",
      "We read your resume, list the skills you claim, and show quick wins to fix right away. Then you take a short skill-check quiz.",
      "We compare what you claimed with what we verified and build your Job Readiness Score, a skill-by-skill breakdown and your roadmap.",
    ],
    ordered: true,
  },
  {
    id: "score",
    icon: "%",
    title: "How is my score worked out?",
    blurb: "The Job Readiness Score, in plain language",
    intro:
      "Your score is out of 100. Each skill earns points from three things:",
    items: [
      "Importance: how much that skill matters for your chosen discipline.",
      "Validity: how closely your claim matched what the quiz and your links verified.",
      "Evidence: how well your resume backs the skill up with projects or experience.",
    ],
    outro:
      "The total is then scaled by your resume quality. A messy resume lowers everything, and a clear one protects your score. Tap any skill in the report to see claimed vs verified.",
  },
  {
    id: "overclaimed",
    icon: "!",
    title: "What does “Overclaimed” mean?",
    blurb: "Why a skill gets a penalty",
    intro:
      "A skill is overclaimed when your resume says you are stronger than we could verify, for example listing Docker as an expert skill but missing the Docker questions and having no Docker project.",
    items: [
      "Claiming less than you can prove is never penalised.",
      "Overclaimed skills are marked in red in the table, with a short note.",
      "To fix one, either build proof (a project, a repo, a quiz answer) or lower the claim on your resume.",
    ],
  },
  {
    id: "improve",
    icon: "↑",
    title: "How do I raise my score?",
    blurb: "The fastest wins, in order",
    items: [
      "Fix the “Quick wins” on the first page, such as adding numbers to your bullets.",
      "Add your GitHub, Figma and LinkedIn so more skills can be verified.",
      "Remove skills you can't back up yet, or turn them into real projects.",
      "Start at the top of “Where to focus next” and work down.",
      "Use the “Where to learn” links, then run Vexis again to see your score move.",
    ],
    ordered: true,
  },
  {
    id: "sources",
    icon: "⌗",
    title: "Which sources can I add?",
    blurb: "What is required and what is optional",
    items: [
      "Resume (PDF): required. Up to 10 MB.",
      "Discipline and tech stack: required. Separate technologies with commas.",
      "LinkedIn text: optional. Paste your About and Experience sections.",
      "GitHub URL: optional. Helps verify coding and project skills.",
      "Figma URL: optional. Helps verify design skills.",
    ],
    outro: "More sources means more skills we can verify, which usually means a higher score.",
  },
];

export default function HelpDesk() {
  const [open, setOpen] = useState(false);
  const [topicId, setTopicId] = useState<string | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const topic = TOPICS.find((t) => t.id === topicId) ?? null;

  const close = useCallback(() => {
    setOpen(false);
    setTopicId(null);
    triggerRef.current?.focus();
  }, []);

  // Escape closes; focus moves into the dialog when it opens.
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <div className="print:hidden">
      {/* Floating button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-300 to-orange-300 px-5 py-3 text-sm font-bold text-stone-900 shadow-xl shadow-orange-300/60 transition hover:from-amber-200 hover:to-orange-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/60"
      >
        <span
          className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-900 text-sm font-bold text-amber-200"
          aria-hidden
        >
          ?
        </span>
        Help
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 p-4 backdrop-blur-sm sm:items-center sm:justify-end sm:p-6"
          onClick={close}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="helpdesk-title"
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-white bg-gradient-to-br from-amber-50 via-rose-50 to-sky-100 shadow-2xl shadow-stone-900/30"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-stone-300/70 bg-white/60 px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Vexis help desk
                </p>
                <h2
                  id="helpdesk-title"
                  className="mt-1 text-lg font-bold text-stone-900"
                >
                  {topic ? topic.title : "How can we help?"}
                </h2>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Close help"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-300 bg-white text-lg font-bold text-stone-800 transition hover:bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto px-6 py-5">
              {!topic ? (
                <>
                  <p className="mb-4 text-sm font-medium text-stone-800">
                    Pick a topic to learn how Vexis works.
                  </p>
                  <ul className="space-y-2.5">
                    {TOPICS.map((t) => (
                      <li key={t.id}>
                        <button
                          type="button"
                          onClick={() => setTopicId(t.id)}
                          className="group flex w-full items-center gap-3.5 rounded-2xl border border-stone-300 bg-white/90 px-4 py-3.5 text-left transition hover:border-amber-400 hover:bg-amber-50 hover:shadow-md hover:shadow-amber-200/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                        >
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-base font-bold text-amber-900"
                            aria-hidden
                          >
                            {t.icon}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-bold text-stone-900">
                              {t.title}
                            </span>
                            <span className="block text-xs font-medium text-stone-700">
                              {t.blurb}
                            </span>
                          </span>
                          <span
                            className="text-stone-600 transition group-hover:translate-x-0.5 group-hover:text-amber-700"
                            aria-hidden
                          >
                            →
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <div>
                  {topic.intro && (
                    <p className="text-sm font-medium leading-relaxed text-stone-900">
                      {topic.intro}
                    </p>
                  )}

                  {topic.items &&
                    (topic.ordered ? (
                      <ol className="mt-4 space-y-3">
                        {topic.items.map((item, i) => (
                          <li key={i} className="flex gap-3">
                            <span
                              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-stone-900"
                              aria-hidden
                            >
                              {i + 1}
                            </span>
                            <span className="text-sm font-medium leading-relaxed text-stone-900">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <ul className="mt-4 space-y-3">
                        {topic.items.map((item, i) => (
                          <li key={i} className="flex gap-3">
                            <span
                              className="mt-2 h-2 w-2 shrink-0 rounded-full bg-orange-500"
                              aria-hidden
                            />
                            <span className="text-sm font-medium leading-relaxed text-stone-900">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ))}

                  {topic.outro && (
                    <p className="mt-4 rounded-2xl border border-amber-300 bg-amber-50/80 px-4 py-3 text-sm font-medium leading-relaxed text-stone-900">
                      {topic.outro}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => setTopicId(null)}
                    className="mt-6 rounded-full border border-stone-400 bg-white/90 px-5 py-2.5 text-sm font-semibold text-stone-900 transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    ← All topics
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}