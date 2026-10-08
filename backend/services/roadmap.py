"""
Roadmap without an LLM: turns the score breakdown and resume issues into
add / remove / change lists plus ranked focus areas.
"""
from services.scoring import rank_focus_areas


def build_roadmap(session: dict, breakdown: list[dict]) -> dict:
    add, remove, change = [], [], []

    # ADD: skills for this discipline that are missing from the resume (highest weight first)
    missing = sorted((r for r in breakdown if max(r["C"]) == 0), key=lambda r: r["w"], reverse=True)
    for r in missing[:4]:
        add.append("Add " + r["skill"] + ": it carries " + str(round(r["w"] * 100)) +
                   " percent of the weight for your discipline. Build one small project that uses it, then list it.")

    # REMOVE or tone down: claims the quiz did not support
    for r in breakdown:
        if r["overclaimed"] and r["S"] < 0.5:
            remove.append("Remove or downplay " + r["skill"] +
                          ": the quiz did not support the level you claim. Re-add it after you practice.")

    # CHANGE: resume quality issues, then per-skill evidence problems
    for issue in session.get("issues", [])[:4]:
        change.append(issue)
    for r in breakdown:
        if max(r["C"]) == 0:
            continue
        if r["overclaimed"] and r["S"] >= 0.5:
            change.append("Be more precise about your " + r["skill"] + " level: your claim is above what the quiz verified.")
        if r["C"][2] <= 0.2:
            change.append("Show " + r["skill"] + " in a project or internship bullet, not only in your skills list.")
        elif r["R"] < 1.0:
            change.append("Add a measurable result (a number or percentage) to your " + r["skill"] + " bullet.")

    # FOCUS AREAS: ranked by weight * (1 - S*R)
    by_name = {r["skill"]: r for r in breakdown}
    focus = []
    for name in rank_focus_areas(breakdown, 5):
        r = by_name[name]
        if max(r["C"]) == 0:
            why = "not on your resume yet"
        elif r["overclaimed"]:
            why = "quiz showed gaps against what you claim"
        else:
            why = "strengthen it with a real project"
        focus.append(name + ": " + why)

    return {"add": add, "remove": remove, "change": change[:8], "focus_areas": focus}
