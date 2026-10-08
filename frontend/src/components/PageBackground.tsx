import type { ReactNode } from "react";

interface PageBackgroundProps {
  children: ReactNode;
  /** Tailwind max-width class for the content column. */
  widthClass?: string;
  theme?: "dark" | "light";
}

export default function PageBackground({
  children,
  widthClass = "max-w-2xl",
  theme = "light",
}: PageBackgroundProps) {
  if (theme === "dark") {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#1a1524] px-4 py-12 text-stone-100 sm:py-16">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-amber-300/10 blur-3xl" />
          <div className="absolute -bottom-40 -right-32 h-[32rem] w-[32rem] rounded-full bg-teal-300/10 blur-3xl" />
          <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-rose-300/5 blur-3xl" />
        </div>
        <div className={`relative mx-auto w-full ${widthClass}`}>{children}</div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-amber-50 via-rose-50 to-sky-100 px-4 py-12 text-stone-900 sm:py-16">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-amber-200/60 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 h-[32rem] w-[32rem] rounded-full bg-sky-200/70 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-rose-200/50 blur-3xl" />
      </div>
      <div className={`relative mx-auto w-full ${widthClass}`}>{children}</div>
    </main>
  );
}