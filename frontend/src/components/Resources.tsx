import type { Resource } from "@/types";

interface ResourcesProps {
  items: Resource[];
}

const KIND_STYLE: Record<Resource["kind"], string> = {
  video: "bg-rose-300/15 text-rose-200",
  course: "bg-teal-300/15 text-teal-200",
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

export default function Resources({ items }: ResourcesProps) {
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
      className="w-full rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 backdrop-blur-md sm:p-8"
    >
      <h2 className="text-xl font-bold text-stone-50">Where to learn</h2>
      <p className="mt-1.5 mb-7 max-w-xl text-sm leading-relaxed text-stone-400">
        Handpicked videos and courses for the skills where improving would
        lift your score the most.
      </p>

      <div className="space-y-7">
        {Array.from(groups.entries()).map(([skill, rows]) => (
          <div key={skill}>
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-amber-300" aria-hidden />
              <h3 className="font-semibold text-stone-50">{skill}</h3>
            </div>
            {rows[0]?.reason && (
              <p className="mt-1 ml-[18px] text-xs leading-relaxed text-stone-400">
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
                    className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm text-stone-200 transition hover:border-amber-300/40 hover:bg-white/[0.07]"
                  >
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${KIND_STYLE[r.kind]}`}
                    >
                      {KIND_LABEL[r.kind]}
                    </span>
                    <span className="min-w-0 flex-1 leading-snug">{r.title}</span>
                    <span
                      className="shrink-0 text-stone-500 transition group-hover:translate-x-0.5 group-hover:text-amber-200"
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