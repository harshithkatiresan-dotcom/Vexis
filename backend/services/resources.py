"""
Learning resources for skill gaps (no LLM, no API key).
Builds YouTube and course SEARCH links, so every link is real.
Gap = w * (1 - S*R): the skills where improving would raise the score most.
"""
from urllib.parse import quote_plus

DIMS = ["theory", "practice", "projects"]

# Better search phrases for skills that search badly under their plain name.
QUERY_OVERRIDES = {
    "Node.js": "Node.js Express",
    "REST APIs": "REST API design",
    "Pandas/NumPy": "pandas numpy",
    "Wireframing & Prototyping": "wireframing prototyping UX",
    "Machine Learning": "machine learning",
    "Testing": "software testing",
}

# weakest dimension -> (search phrase, reason shown to the user)
FOCUS = {
    "theory": ("concepts explained", "Your weakest area is the underlying concepts."),
    "practice": ("practice exercises", "Your weakest area is applying it hands-on."),
    "projects": ("project tutorial for beginners", "Your weakest area is showing it in real projects."),
}


def _yt(q: str) -> str:
    return "https://www.youtube.com/results?search_query=" + quote_plus(q)


def _coursera(q: str) -> str:
    return "https://www.coursera.org/search?query=" + quote_plus(q)


def build_resources(breakdown: list, limit: int = 4) -> list:
    try:
        ranked = sorted(
            breakdown,
            key=lambda r: r["w"] * (1 - r["S"] * r["R"]),
            reverse=True,
        )
        out = []
        for r in ranked[:limit]:
            if r["w"] * (1 - r["S"] * r["R"]) < 0.02:
                continue                                  # not a real gap
            skill = r["skill"]
            q = QUERY_OVERRIDES.get(skill, skill)
            V = r["V"]
            weakest = DIMS[min(range(len(V)), key=lambda i: V[i])]
            phrase, reason = FOCUS[weakest]
            out.append({
                "skill": skill, "kind": "video", "reason": reason,
                "title": skill + ": " + phrase,
                "url": _yt(q + " " + phrase),
            })
            out.append({
                "skill": skill, "kind": "video", "reason": reason,
                "title": skill + ": full course for beginners",
                "url": _yt(q + " full course"),
            })
            out.append({
                "skill": skill, "kind": "course", "reason": reason,
                "title": skill + ": courses on Coursera",
                "url": _coursera(q),
            })
        return out
    except Exception:
        return []        # never break the report over suggestions