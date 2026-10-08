"use client";

import { Fragment, useState } from "react";
import { EVIDENCE_DIMS } from "@/types";
import type { SkillResult } from "@/types";

interface SkillBreakdownProps {
  breakdown: SkillResult[];
  /** Colour classes for the card (border, background, shadow). */
  cardClass?: string;
}

type SortField = "skill" | "w" | "S" | "R" | "contribution";
type SortOrder = "asc" | "desc";

const COLUMNS: { field: SortField; label: string; align: "left" | "right" }[] = [
  { field: "skill", label: "Skill", align: "left" },
  { field: "w", label: "Importance", align: "right" },
  { field: "S", label: "Validity", align: "right" },
  { field: "R", label: "Evidence", align: "right" },
  { field: "contribution", label: "Points", align: "right" },
];

const pct = (n: number) => `${Math.round(n * 100)}%`;

function compare(a: SkillResult, b: SkillResult, field: SortField): number {
  if (field === "skill") return a.skill.localeCompare(b.skill);
  return a[field] - b[field];
}

function DimBars({ row }: { row: SkillResult }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {EVIDENCE_DIMS.map((dim, i) => {
        const claimed = row.C[i] ?? 0;
        const verified = row.V[i] ?? 0;
        return (
          <div key={dim}>
            <p className="mb-2 text-xs font-bold capitalize text-stone-900">
              {dim}
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-medium text-stone-800">
                <span className="w-14 shrink-0">Claimed</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-300">
                  <div
                    className="h-full rounded-full bg-stone-600"
                    style={{ width: pct(claimed) }}
                  />
                </div>
                <span className="w-9 text-right tabular-nums">{pct(claimed)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-stone-800">
                <span className="w-14 shrink-0">Verified</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-300">
                  <div
                    className={`h-full rounded-full ${
                      verified < claimed ? "bg-rose-500" : "bg-teal-600"
                    }`}
                    style={{ width: pct(verified) }}
                  />
                </div>
                <span className="w-9 text-right tabular-nums">{pct(verified)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function SkillBreakdown({
  breakdown,
  cardClass = "border-white bg-white/75 shadow-xl shadow-amber-900/5",
}: SkillBreakdownProps) {
  const [sortField, setSortField] = useState<SortField>("contribution");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [open, setOpen] = useState<string | null>(null);

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder(field === "skill" ? "asc" : "desc");
    }
  }

  const rows = [...breakdown].sort((a, b) => {
    const diff = compare(a, b, sortField);
    return sortOrder === "asc" ? diff : -diff;
  });

  const total = breakdown.reduce((sum, r) => sum + r.contribution, 0);
  const overclaimedCount = breakdown.filter((r) => r.overclaimed).length;

  return (
    <section
      aria-label="Skill breakdown"
      className={`w-full rounded-3xl border p-6 backdrop-blur-md sm:p-8 ${cardClass}`}
    >
      <h2 className="text-xl font-bold text-stone-900">Skill by skill</h2>
      <p className="mt-1.5 max-w-xl text-sm font-medium leading-relaxed text-stone-800">
        Each skill earns points from how important it is, how well your claim
        matched what we verified, and how well your resume backs it up.
        {overclaimedCount > 0 &&
          ` ${overclaimedCount} skill${
            overclaimedCount > 1 ? "s were" : " was"
          } claimed above what we could verify.`}
      </p>

      {breakdown.length === 0 ? (
        <p className="mt-6 text-sm text-stone-700">No skills to show.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead>
              <tr className="border-b border-stone-400/70 text-xs uppercase tracking-wider text-stone-800">
                {COLUMNS.map((col) => {
                  const active = sortField === col.field;
                  return (
                    <th
                      key={col.field}
                      scope="col"
                      aria-sort={
                        active
                          ? sortOrder === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                      className={`px-3 py-3 font-bold ${
                        col.align === "right" ? "text-right" : "text-left"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSort(col.field)}
                        className={`inline-flex items-center gap-1 uppercase tracking-wider transition hover:text-stone-900 ${
                          active ? "text-violet-800" : ""
                        }`}
                      >
                        {col.label}
                        <span aria-hidden className="w-3 text-[10px]">
                          {active ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                        </span>
                      </button>
                    </th>
                  );
                })}
                <th scope="col" className="px-3 py-3 text-center font-bold">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => {
                const isOpen = open === r.skill;
                return (
                  <Fragment key={r.skill}>
                    <tr
                      onClick={() => setOpen(isOpen ? null : r.skill)}
                      className={`cursor-pointer border-b border-stone-300/80 transition ${
                        r.overclaimed
                          ? "bg-rose-100/70 hover:bg-rose-100"
                          : "hover:bg-white/70"
                      }`}
                    >
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`h-8 w-1 rounded-full ${
                              r.overclaimed ? "bg-rose-500" : "bg-transparent"
                            }`}
                            aria-hidden
                          />
                          <div>
                            <button
                              type="button"
                              aria-expanded={isOpen}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpen(isOpen ? null : r.skill);
                              }}
                              className="flex items-center gap-1.5 font-bold text-stone-900"
                            >
                              {r.skill}
                              <span
                                aria-hidden
                                className={`text-[10px] text-stone-600 transition-transform ${
                                  isOpen ? "rotate-180" : ""
                                }`}
                              >
                                ▾
                              </span>
                            </button>
                            {r.overclaimed && (
                              <p className="mt-0.5 text-xs font-semibold text-rose-800">
                                Claimed more than verified
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-right font-medium tabular-nums text-stone-800">
                        {pct(r.w)}
                      </td>
                      <td className="px-3 py-4 text-right font-medium tabular-nums text-stone-800">
                        {pct(r.S)}
                      </td>
                      <td className="px-3 py-4 text-right font-medium tabular-nums text-stone-800">
                        {pct(r.R)}
                      </td>
                      <td className="px-3 py-4 text-right font-bold tabular-nums text-amber-800">
                        +{r.contribution.toFixed(1)}
                      </td>
                      <td className="px-3 py-4 text-center">
                        {r.overclaimed ? (
                          <span className="inline-block whitespace-nowrap rounded-full border border-rose-400 bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-900">
                            Penalty applied
                          </span>
                        ) : (
                          <span className="inline-block whitespace-nowrap rounded-full border border-teal-400 bg-teal-100 px-2.5 py-0.5 text-xs font-semibold text-teal-900">
                            No penalty
                          </span>
                        )}
                      </td>
                    </tr>

                    {isOpen && (
                      <tr className="border-b border-stone-300/80 bg-white/70">
                        <td colSpan={6} className="px-6 py-5">
                          <DimBars row={r} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>

            <tfoot>
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-4 text-right text-xs font-semibold uppercase tracking-wider text-stone-800"
                >
                  Total (before rounding)
                </td>
                <td className="px-3 py-4 text-right text-base font-bold tabular-nums text-stone-900">
                  {total.toFixed(1)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs font-medium text-stone-700">
        Tap a skill to compare what you claimed with what we verified.
      </p>
    </section>
  );
}