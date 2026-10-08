import type { Resource } from "@/types";

interface ResourcesProps {
  items: Resource[];
  /** Colour classes for the card (border, background, shadow). */
  cardClass?: string;
}

const KIND_STYLE: Record<Resource["kind"], string> = {
  video: "bg-rose-100 text-rose-900",
  course: "bg-teal-100 text-teal-900",
};

const KIND_LABEL: Record<Resource["kind"], string> = {
  video: "Video",
  course: "Course",
};

// Only allow http(s) links, so a bad URL from the backend can't become a javascript: link.
function isSafeUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export default function Resources({
  items,
  cardClass = "border-white bg-white/75 shadow-xl shadow-amber-900/5",
}: ResourcesProps) {
  const safe = (items ?? []).filter((r) => isSafeUrl(r.url));
  if (safe.length === 0) return null;

  // Group by skill, keeping the order the backend sent (highest impact first).
  const groups = new Map<string, Resource[]>();
  for (const r of safe) {
    const list = groups.get(r.skill);
    if (list) list.push(r);
    else groups.set(r.skill, [r]);
  }

  return (
    <section
      aria-label="Where to learn"
      className={`w-full rounded-3xl border p-6 backdrop-blur-md sm:p-8 ${cardClass}`}
    >
      <h2 className="text-xl font-bold text-stone-900">Where to learn</h2>
      <p className="mb-7 mt-1.5 max-w-xl text-sm font-medium leading-relaxed text-stone-800">
        Handpicked videos and courses for the skills where improving would
        lift your score the most.
      </p>

      <div className="space-y-7">
        {Array.from(groups.entries()).map(([skill, rows]) => (
          <div key={skill}>
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-orange-500" aria-hidden />
              <h3 className="font-bold text-stone-900">{skill}</h3>
            </div>
            {rows[0]?.reason && (
              <p className="ml-[18px] mt-1 text-xs font-medium leading-relaxed text-stone-700">
                {rows[0].reason}
              </p>
            )}

            <ul className="mt-3 space-y-2.5">
              {rows.map((r, i) => (
                <li key={`${r.url}-${i}`}>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 rounded-2xl border border-stone-300 bg-white/90 px-4 py-3.5 text-sm font-semibold text-stone-900 transition hover:border-orange-400 hover:bg-white hover:shadow-md hover:shadow-orange-200/50"
                  >
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${KIND_STYLE[r.kind]}`}
                    >
                      {KIND_LABEL[r.kind]}
                    </span>
                    <span className="min-w-0 flex-1 leading-snug">{r.title}</span>
                    <span
                      className="shrink-0 text-stone-600 transition group-hover:translate-x-0.5 group-hover:text-orange-600"
                      aria-hidden
                    >
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}