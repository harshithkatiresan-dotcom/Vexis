import type { Roadmap as RoadmapData } from "@/types";

interface RoadmapProps {
  roadmap: RoadmapData;
  /** Colour classes for the "Where to focus next" card. */
  focusCardClass?: string;
}

type ListKey = "add" | "remove" | "change";

interface ColumnConfig {
  key: ListKey;
  title: string;
  hint: string;
  icon: string;
  empty: string;
  card: string;
  badge: string;
  dot: string;
}

// Full class strings are written out so Tailwind can detect them.
const COLUMNS: ColumnConfig[] = [
  {
    key: "add",
    title: "Add",
    hint: "Proof recruiters look for",
    icon: "+",
    empty: "Nothing to add. Your resume covers the basics.",
    card: "border-teal-300 bg-teal-50/80 shadow-teal-900/5",
    badge: "bg-teal-200 text-teal-900",
    dot: "bg-teal-600",
  },
  {
    key: "remove",
    title: "Remove",
    hint: "Claims you can't back up yet",
    icon: "−",
    empty: "Nothing to remove. Your claims hold up.",
    card: "border-rose-300 bg-rose-50/80 shadow-rose-900/5",
    badge: "bg-rose-200 text-rose-900",
    dot: "bg-rose-500",
  },
  {
    key: "change",
    title: "Change",
    hint: "Rewrite these to land better",
    icon: "↻",
    empty: "Nothing to change right now.",
    card: "border-amber-300 bg-amber-50/80 shadow-amber-900/5",
    badge: "bg-amber-200 text-amber-900",
    dot: "bg-amber-600",
  },
];

export default function Roadmap({
  roadmap,
  focusCardClass = "border-white bg-white/75 shadow-xl shadow-amber-900/5",
}: RoadmapProps) {
  return (
    <div className="space-y-8">
      {/* Add / Remove / Change */}
      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map((col) => {
          const items = roadmap[col.key];
          return (
            <section
              key={col.key}
              className={`rounded-3xl border p-6 shadow-lg ${col.card}`}
              aria-label={col.title}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg font-bold ${col.badge}`}
                  aria-hidden
                >
                  {col.icon}
                </span>
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    {col.title}
                    <span className="ml-2 text-xs font-semibold text-stone-700">
                      {items.length}
                    </span>
                  </h3>
                  <p className="text-xs font-medium text-stone-700">{col.hint}</p>
                </div>
              </div>

              {items.length > 0 ? (
                <ul className="mt-5 space-y-3.5">
                  {items.map((item, i) => (
                    <li
                      key={`${col.key}-${i}`}
                      className="flex gap-3 text-sm font-medium leading-relaxed text-stone-900"
                    >
                      <span
                        className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${col.dot}`}
                        aria-hidden
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-5 text-sm text-stone-700">{col.empty}</p>
              )}
            </section>
          );
        })}
      </div>

      {/* Focus areas */}
      <section
        aria-label="Technical focus areas"
        className={`rounded-3xl border p-6 backdrop-blur-md sm:p-8 ${focusCardClass}`}
      >
        <div className="mb-6">
          <h3 className="text-xl font-bold text-stone-900">
            Where to focus next
          </h3>
          <p className="mt-1.5 text-sm font-medium text-stone-800">
            Ranked by how much each one can lift your score. Start at the top.
          </p>
        </div>

        {roadmap.focus_areas.length > 0 ? (
          <ol className="space-y-3">
            {roadmap.focus_areas.map((area, i) => (
              <li
                key={`focus-${i}`}
                className={`flex items-center gap-4 rounded-2xl border px-4 py-3.5 ${
                  i === 0
                    ? "border-amber-400 bg-amber-50 shadow-md shadow-amber-200/50"
                    : "border-stone-300 bg-white/90"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    i === 0
                      ? "bg-amber-400 text-stone-900"
                      : "bg-stone-200 text-stone-800"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="text-sm font-semibold text-stone-900 sm:text-base">
                  {area}
                </span>
                {i === 0 && (
                  <span className="ml-auto hidden shrink-0 rounded-full bg-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-900 sm:inline">
                    Start here
                  </span>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-stone-700">
            No focus areas were suggested for this session.
          </p>
        )}
      </section>
    </div>
  );
}