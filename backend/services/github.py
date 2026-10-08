"""
GitHub evidence (no LLM).
Looks at a student's public, non-fork repos and checks which skills show up in
repo names, descriptions, topics and primary languages. Each skill with matches
gets a small boost to its "projects" score (see verify.build_V).
Never raises: if anything goes wrong, the result is simply no boost.
"""
import re

import httpx

from config import GITHUB_TOKEN, get_profile, list_disciplines

API = "https://api.github.com"
PER_REPO = 0.15    # boost for each repo that shows a skill
MAX_BOOST = 0.4    # cap per skill


def _username(url: str):
    m = re.search(r"github\.com/([A-Za-z0-9][A-Za-z0-9-]{0,38})", url or "", re.I)
    if m:
        return m.group(1)
    bare = (url or "").strip().strip("/")
    return bare if re.fullmatch(r"[A-Za-z0-9-]{1,39}", bare) else None


def _aliases() -> dict:
    out = {}
    for d in list_disciplines():
        for s in get_profile(d):
            out.setdefault(s["name"], set()).update([s["name"], *s["aliases"]])
    return out


def _pattern(terms):
    parts = [re.escape(t) for t in sorted(set(terms), key=len, reverse=True)]
    return re.compile(
        r"(?<![A-Za-z0-9+#])(?:" + "|".join(parts) + r")(?![A-Za-z0-9+#])", re.I
    )


def _repos(user: str) -> list:
    headers = {"Accept": "application/vnd.github+json", "User-Agent": "vexis"}
    if GITHUB_TOKEN:
        headers["Authorization"] = "Bearer " + GITHUB_TOKEN
    r = httpx.get(
        API + "/users/" + user + "/repos",
        params={"per_page": 100, "sort": "pushed"},
        headers=headers,
        timeout=8,
    )
    r.raise_for_status()
    return [x for x in r.json() if not x.get("fork")]


def compute_boost(url: str, skills: list) -> dict:
    """Returns {skill name: boost} for skills that show up in the user's public repos."""
    try:
        user = _username(url)
        if not user:
            return {}
        texts = []
        for r in _repos(user):
            texts.append(" ".join(filter(None, [
                (r.get("name") or "").replace("-", " ").replace("_", " "),
                r.get("description") or "",
                " ".join(r.get("topics") or []),
                r.get("language") or "",
            ])))
        alias_map = _aliases()
        boost = {}
        for sk in skills:
            name = sk["name"]
            pat = _pattern(alias_map.get(name, {name}))
            hits = sum(1 for t in texts if pat.search(t))
            if hits:
                boost[name] = round(min(MAX_BOOST, hits * PER_REPO), 3)
        return boost
    except Exception:
        return {}