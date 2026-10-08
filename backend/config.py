import json
import os
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR.parent / ".env")  # the .env in the project root (Vexis/.env)

# ---------- secrets / env ----------
LLM_API_KEY = os.getenv("LLM_API_KEY", "")
LLM_MODEL = os.getenv("LLM_MODEL", "claude-sonnet-5-5")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")

CORS_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]

# ---------- scoring knobs (tune these in the demo) ----------
LAMBDA = 0.8            # penalty strength for over-claiming
EPSILON = 1e-8          # avoids divide-by-zero in cosine
OVERCLAIM_FLAG = 0.15   # penalty-term size above which a skill is flagged overclaimed
STACK_BOOST = 1.5       # skills in the student's own stack get w * 1.5, then weights are renormalized
QUIZ_PER_SKILL = 2      # questions generated per skill
MAX_QUIZ_SKILLS = 5     # only quiz the top-N skills by weight

# ---------- discipline profiles ----------
@lru_cache(maxsize=1)
def _load_profiles() -> dict:
    path = BASE_DIR / "data" / "discipline_profiles.json"
    with open(path, encoding="utf-8") as f:
        return json.load(f)

def list_disciplines() -> list[str]:
    return list(_load_profiles().keys())

def get_profile(discipline: str, stack: str = "") -> list[dict]:
    """
    Returns [{name, w, aliases}] for the discipline.
    Skills in the student's stack are boosted, then weights are renormalized to sum to 1.
    """
    profiles = _load_profiles()
    key = next((k for k in profiles if k.lower() == discipline.strip().lower()), None)
    if key is None:
        key = next(iter(profiles))

    stack_terms = {t.strip().lower() for t in stack.split(",") if t.strip()}
    skills = []
    for s in profiles[key]["skills"]:
        names = {s["name"].lower(), *[a.lower() for a in s["aliases"]]}
        boost = STACK_BOOST if names & stack_terms else 1.0
        skills.append({"name": s["name"], "w": s["w"] * boost, "aliases": s["aliases"]})

    total = sum(s["w"] for s in skills)
    for s in skills:
        s["w"] = round(s["w"] / total, 4)
    return skills

LLM_BASE_URL = os.getenv('LLM_BASE_URL', '')
