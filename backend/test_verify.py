from services.resume import SESSIONS
from services import verify
from services.scoring import compute_jrs

def make(sid):
    SESSIONS[sid] = {"T": 0.8, "skills": [
        {"name": "React", "w": 0.5, "C": [0.9, 0.9, 0.8], "R": 1.0},
        {"name": "SQL",   "w": 0.5, "C": [0.9, 0.9, 0.2], "R": 0.4},
    ]}
    return SESSIONS[sid]

for label, shift in (("ALL CORRECT", 0), ("ALL WRONG", 1)):
    s = make(label)
    quiz = verify.build_quiz(label)
    verify.grade(label, [{"id": q, "choice": (m["correct"] + shift) % 4} for q, m in s["quiz"].items()])
    V = verify.build_V(s)
    skills = [{"name": k["name"], "w": k["w"], "C": k["C"], "V": V[k["name"]], "R": k["R"]} for k in s["skills"]]
    out = compute_jrs(skills, s["T"])
    print(label, "| questions:", len(quiz["questions"]), "| JRS:", out["jrs"])
    for r in out["breakdown"]:
        print("   ", r["skill"], "V=", r["V"], "S=", r["S"], "overclaimed=", r["overclaimed"])
