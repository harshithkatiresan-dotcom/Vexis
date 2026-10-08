"""
Core scoring math for Vexis.

  S_v,i = cos(C_i, V_i) * exp(-LAMBDA * overclaim_i)
  overclaim_i = sum_d max(0, C_i[d] - V_i[d])      (positive parts only)
  JRS = (sum_i w_i * S_i * R_i) * T * 100

Pure functions: no LLM, no I/O. Imported by main.py and the tests.
"""
import numpy as np

from config import EPSILON, LAMBDA, OVERCLAIM_FLAG


def _clamp01(x: float) -> float:
    return float(min(1.0, max(0.0, x)))


def overclaim_amount(C, V) -> float:
    """How much the student claims beyond what was verified, summed over dimensions."""
    C, V = np.asarray(C, dtype=float), np.asarray(V, dtype=float)
    return float(np.maximum(0.0, C - V).sum())


def validity_score(C, V) -> float:
    """S_v,i: cosine similarity of claimed vs verified, damped by the over-claim penalty."""
    C, V = np.asarray(C, dtype=float), np.asarray(V, dtype=float)
    cos = float(C @ V / (np.linalg.norm(C) * np.linalg.norm(V) + EPSILON))
    cos = _clamp01(cos)
    return _clamp01(cos * float(np.exp(-LAMBDA * overclaim_amount(C, V))))


def compute_jrs(skills: list[dict], T: float) -> dict:
    """
    skills: [{"name": str, "w": float, "C": [..], "V": [..], "R": float}]
    Returns {"jrs": float 0..100, "T": float, "breakdown": [SkillResult-shaped dicts]}
    The breakdown matches SkillResult in schemas.py, so it can be returned as-is.
    """
    T = _clamp01(T)
    breakdown, total = [], 0.0

    for s in skills:
        R = _clamp01(s["R"])
        S = validity_score(s["C"], s["V"])
        contribution = s["w"] * S * R
        total += contribution
        breakdown.append({
            "skill": s["name"],
            "w": round(s["w"], 4),
            "S": round(S, 4),
            "R": round(R, 4),
            "C": [round(float(x), 3) for x in s["C"]],
            "V": [round(float(x), 3) for x in s["V"]],
            "contribution": round(contribution, 4),
            "overclaimed": overclaim_amount(s["C"], s["V"]) > OVERCLAIM_FLAG,
        })

    return {
        "jrs": round(_clamp01(total * T) * 100, 1),
        "T": round(T, 4),
        "breakdown": breakdown,
    }


def rank_focus_areas(breakdown: list[dict], top_n: int = 5) -> list[str]:
    """Skills ranked by w * (1 - S*R): high importance and a big gap come first."""
    ranked = sorted(breakdown, key=lambda r: r["w"] * (1 - r["S"] * r["R"]), reverse=True)
    return [r["skill"] for r in ranked[:top_n]]