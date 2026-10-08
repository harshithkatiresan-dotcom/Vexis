"use client";

import { Fragment, useState } from "react";
import { EVIDENCE_DIMS } from "@/types";
import type { SkillResult } from "@/types";

interface SkillBreakdownProps {
  breakdown: SkillResult[];
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
            <p className="mb-2 text-xs font-medium capitalize text-stone-300">
              {dim}
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <span className="w-14 shrink-0">Claimed</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-stone-400"
                    style={{ width: pct(claimed) }}
                  />
                </div>
                <span className="w-9 text-right tabular-nums">{pct(claimed)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <span className="w-14 shrink-0">Verified</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full ${
                      verified < claimed ? "bg-rose-300" : "bg-teal-300"
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

export default function SkillBreakdown({ breakdown }: SkillBreakdownProps) {
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
      className="w-full rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 backdrop-blur-md sm:p-8"
    >
      <h2 className="text-xl font-bold text-stone-50">Skill by skill</h2>
      <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-stone-400">
        Each skill earns points from how important it is, how well your claim
        matched what we verified, and how well your resume backs it up.
        {overclaimedCount > 0 &&
          ` ${overclaimedCount} skill${
            overclaimedCount > 1 ? "s were" : " was"
          } claimed above what we could verify.`}
      </p>

      {breakdown.length === 0 ? (
        <p className="mt-6 text-sm text-stone-500">No skills to show.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-stone-400">
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
                      className={`px-3 py-3 font-semibold ${
                        col.align === "right" ? "text-right" : "text-left"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSort(col.field)}
                        className={`inline-flex items-center gap-1 uppercase tracking-wider transition hover:text-stone-100 ${
                          active ? "text-amber-200" : ""
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
                <th scope="col" className="px-3 py-3 text-center font-semibold">
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
                      className={`cursor-pointer border-b border-white/5 transition ${
                        r.overclaimed
                          ? "bg-rose-300/[0.07] hover:bg-rose-300/[0.12]"
                          : "hover:bg-white/[0.04]"
                      }`}
                    >
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`h-8 w-1 rounded-full ${
                              r.overclaimed ? "bg-rose-300" : "bg-transparent"
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
                              className="flex items-center gap-1.5 font-medium text-stone-50"
                            >
                              {r.skill}
                              <span
                                aria-hidden
                                className={`text-[10px] text-stone-500 transition-transform ${
                                  isOpen ? "rotate-180" : ""
                                }`}
                              >
                                ▾
                              </span>
                            </button>
                            {r.overclaimed && (
                              <p className="mt-0.5 text-xs text-rose-200">
                                Claimed more than verified
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-right tabular-nums text-stone-300">
                        {pct(r.w)}
                      </td>
                      <td className="px-3 py-4 text-right tabular-nums text-stone-300">
                        {pct(r.S)}
                      </td>
                      <td className="px-3 py-4 text-right tabular-nums text-stone-300">
                        {pct(r.R)}
                      </td>
                      <td className="px-3 py-4 text-right font-semibold tabular-nums text-amber-200">
                        +{r.contribution.toFixed(1)}
                      </td>
                      <td className="px-3 py-4 text-center">
                        {r.overclaimed ? (
                          <span className="inline-block whitespace-nowrap rounded-full border border-rose-300/30 bg-rose-300/10 px-2.5 py-0.5 text-xs font-medium text-rose-200">
                            Penalty applied
                          </span>
                        ) : (
                          <span className="inline-block whitespace-nowrap rounded-full border border-teal-300/30 bg-teal-300/10 px-2.5 py-0.5 text-xs font-medium text-teal-200">
                            No penalty
                          </span>
                        )}
                      </td>
                    </tr>

                    {isOpen && (
                      <tr className="border-b border-white/5 bg-black/10">
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
                <td colSpan={4} className="px-3 py-4 text-right text-xs uppercase tracking-wider text-stone-400">
                  Total (before rounding)
                </td>
                <td className="px-3 py-4 text-right text-base font-bold tabular-nums text-stone-50">
                  {total.toFixed(1)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-stone-500">
        Tap a skill to compare what you claimed with what we verified.
      </p>
    </section>
  );
}