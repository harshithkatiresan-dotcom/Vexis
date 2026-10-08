"""
Quiz generation, grading, and the verified vector V.
  V_i = [theory, practice, projects]
  theory / practice = fraction of that skill's quiz questions answered correctly
  projects          = resume project evidence (+ optional GitHub boost)
Questions come from the LLM (cached per skill); if that fails, the hand-written
bank in data/question_bank.py is used. Skills with no questions at all get an
unverified discount instead of a free pass.
"""
import json
import os
import random
import re

from config import MAX_QUIZ_SKILLS
from services.resume import get_session

try:
    from data.question_bank import BANK
except ImportError:
    BANK = {}

UNVERIFIED = 0.7          # unquizzed skills: V = C * 0.7 for theory/practice
QUESTIONS_PER_DIM = 2     # theory questions and practice questions per skill

_llm_cache = {}           # skill -> list of valid questions
_llm_failed = set()       # skills the LLM already failed on (so we don't retry slowly)


def _llm_pool(skill: str, n: int = 8) -> list:
    if skill in _llm_cache:
        return _llm_cache[skill]
    if skill in _llm_failed:
        raise RuntimeError("LLM already failed for this skill")

    try:
        from openai import OpenAI

        api_key = os.environ.get("LLM_API_KEY")
        if not api_key:
            raise RuntimeError("LLM_API_KEY not set")
        client = OpenAI(
            api_key=api_key,
            base_url=os.environ.get("LLM_BASE_URL"),
            timeout=15,
        )
        resp = client.chat.completions.create(
            model=os.environ["LLM_MODEL"],
            messages=[{
                "role": "user",
                "content": (
                    "Write " + str(n) + " multiple-choice questions testing real working "
                    "knowledge of " + skill + ". Half must have dim 'theory' (concepts) and "
                    "half dim 'practice' (applied: what would you do, or what does this "
                    "output). Return ONLY a JSON list, no other text: "
                    '[{"dim": "theory", "prompt": "...", '
                    '"options": ["a", "b", "c", "d"], "answer": 0}]'
                ),
            }],
        )
        text = resp.choices[0].message.content.strip()
        text = re.sub(r"^```(?:json)?|```$", "", text, flags=re.M).strip()
        good = [
            q for q in json.loads(text)
            if q.get("dim") in ("theory", "practice")
            and q.get("prompt")
            and isinstance(q.get("options"), list) and len(q["options"]) == 4
            and isinstance(q.get("answer"), int) and 0 <= q["answer"] < 4
        ]
        if not good:
            raise ValueError("no valid questions returned")
    except Exception:
        _llm_failed.add(skill)
        raise

    _llm_cache[skill] = good
    return good


def question_pool(skill: str) -> list:
    try:
        return _llm_pool(skill)
    except Exception:
        return BANK.get(skill, [])        # fall back to the hand-written bank


def build_quiz(session_id: str) -> dict:
    s = get_session(session_id)
    if "quiz_public" in s:                      # same quiz on reload
        return s["quiz_public"]

    candidates = [k for k in s["skills"] if max(k["C"]) > 0]
    candidates.sort(key=lambda k: k["w"], reverse=True)

    rng = random.Random(session_id)
    key, public = {}, []
    for k in candidates[:MAX_QUIZ_SKILLS]:
        pool = question_pool(k["name"])
        chosen = []
        for dim in ("theory", "practice"):
            same = [q for q in pool if q["dim"] == dim]
            chosen += rng.sample(same, k=min(QUESTIONS_PER_DIM, len(same)))

        for q in chosen:
            order = list(range(len(q["options"])))
            rng.shuffle(order)
            qid = "q" + str(len(public) + 1)
            key[qid] = {"skill": k["name"], "dim": q["dim"], "correct": order.index(q["answer"])}
            public.append({
                "id": qid, "skill": k["name"], "dim": q["dim"], "prompt": q["prompt"],
                "options": [q["options"][j] for j in order],
            })

    s["quiz"] = key                              # correct answers stay on the server
    s["quiz_public"] = {"questions": public}
    return s["quiz_public"]


def grade(session_id: str, answers: list) -> dict:
    s = get_session(session_id)
    key = s.get("quiz")
    if key is None:
        raise ValueError("Quiz has not been generated for this session.")
    given = {a["id"]: a["choice"] for a in answers}

    tally = {}
    for qid, meta in key.items():
        t = tally.setdefault(meta["skill"], {"theory": [0, 0], "practice": [0, 0]})
        t[meta["dim"]][1] += 1
        if given.get(qid) == meta["correct"]:
            t[meta["dim"]][0] += 1
    s["quiz_scores"] = tally
    return {"ok": True}


def build_V(s: dict) -> dict:
    """Returns {skill name: [theory, practice, projects]} for a session."""
    scores = s.get("quiz_scores", {})
    boost = s.get("github_boost", {})
    out = {}
    for k in s["skills"]:
        C, t = k["C"], scores.get(k["name"])
        if t:
            theory = t["theory"][0] / t["theory"][1] if t["theory"][1] else C[0] * UNVERIFIED
            practice = t["practice"][0] / t["practice"][1] if t["practice"][1] else C[1] * UNVERIFIED
        else:
            theory, practice = C[0] * UNVERIFIED, C[1] * UNVERIFIED
        projects = min(1.0, C[2] + boost.get(k["name"], 0.0))
        out[k["name"]] = [round(theory, 3), round(practice, 3), round(projects, 3)]
    return out