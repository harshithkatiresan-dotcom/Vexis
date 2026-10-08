import type { Roadmap as RoadmapData } from "@/types";

interface RoadmapProps {
  roadmap: RoadmapData;
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
    card: "border-teal-300/20 bg-teal-300/[0.06]",
    badge: "bg-teal-300/20 text-teal-200",
    dot: "bg-teal-300",
  },
  {
    key: "remove",
    title: "Remove",
    hint: "Claims you can't back up yet",
    icon: "−",
    empty: "Nothing to remove. Your claims hold up.",
    card: "border-rose-300/20 bg-rose-300/[0.06]",
    badge: "bg-rose-300/20 text-rose-200",
    dot: "bg-rose-300",
  },
  {
    key: "change",
    title: "Change",
    hint: "Rewrite these to land better",
    icon: "↻",
    empty: "Nothing to change right now.",
    card: "border-amber-300/20 bg-amber-300/[0.06]",
    badge: "bg-amber-300/20 text-amber-200",
    dot: "bg-amber-300",
  },
];

export default function Roadmap({ roadmap }: RoadmapProps) {
  return (
    <div className="space-y-10">
      {/* Add / Remove / Change */}
      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map((col) => {
          const items = roadmap[col.key];
          return (
            <section
              key={col.key}
              className={`rounded-3xl border p-6 backdrop-blur-sm ${col.card}`}
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
                  <h3 className="text-base font-semibold text-stone-50">
                    {col.title}
                    <span className="ml-2 text-xs font-normal text-stone-400">
                      {items.length}
                    </span>
                  </h3>
                  <p className="text-xs text-stone-400">{col.hint}</p>
                </div>
              </div>

              {items.length > 0 ? (
                <ul className="mt-5 space-y-3.5">
                  {items.map((item, i) => (
                    <li
                      key={`${col.key}-${i}`}
                      className="flex gap-3 text-sm leading-relaxed text-stone-200"
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
                <p className="mt-5 text-sm text-stone-500">{col.empty}</p>
              )}
            </section>
          );
        })}
      </div>

      {/* Focus areas */}
      <section
        aria-label="Technical focus areas"
        className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 backdrop-blur-md sm:p-8"
      >
        <div className="mb-6">
          <h3 className="text-xl font-bold text-stone-50">
            Where to focus next
          </h3>
          <p className="mt-1.5 text-sm text-stone-400">
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
                    ? "border-amber-300/40 bg-amber-300/10"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    i === 0
                      ? "bg-amber-300 text-stone-900"
                      : "bg-white/10 text-stone-300"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="text-sm text-stone-100 sm:text-base">
                  {area}
                </span>
                {i === 0 && (
                  <span className="ml-auto hidden shrink-0 rounded-full bg-amber-300/20 px-2.5 py-0.5 text-xs font-medium text-amber-200 sm:inline">
                    Start here
                  </span>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-stone-500">
            No focus areas were suggested for this session.
          </p>
        )}
      </section>
    </div>
  );
}