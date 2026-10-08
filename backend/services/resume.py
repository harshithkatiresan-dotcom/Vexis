"""
Resume analysis without an LLM.
  C  = claimed vector [theory, practice, projects], from how the resume talks about each skill
  R  = resume-evidence factor (listed only < used in a project < used with a quantified result)
  T  = resume-quality multiplier from a checklist
"""
import re
import uuid
from io import BytesIO

import pdfplumber

from config import get_profile

SESSIONS: dict[str, dict] = {}   # in-memory session store, keyed by session_id

HEADS = {
    "skills": r"(technical )?skills|tech stack|technologies|tools|core competencies",
    "projects": r"(personal |academic )?projects?",
    "experience": r"(work )?experience|internships?|employment|work history",
    "education": r"education|academics|qualifications",
    "other": r"certifications?|achievements|awards|summary|objective|profile|publications|extracurriculars?",
}
STRONG = re.compile(r"\b(expert|advanced|proficient|extensive|strong|mastery|fluent)\b", re.I)
QUANT = re.compile(r"\d|%")
EMAIL = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
PHONE = re.compile(r"(\+?\d[\d\s().-]{8,}\d)")
ACTION = re.compile(
    r"^\W*(built|developed|designed|implemented|led|created|optimi[sz]ed|deployed|automated|improved|"
    r"reduced|increased|launched|integrated|analy[sz]ed|managed|engineered|trained|collaborated|"
    r"architected|migrated|tested|researched|prototyped)\b", re.I)


def extract_text(pdf_bytes: bytes) -> str:
    with pdfplumber.open(BytesIO(pdf_bytes)) as pdf:
        return "\n".join((page.extract_text() or "") for page in pdf.pages)


def _heading(line: str):
    t = line.lower().rstrip(":").strip()
    if not t or len(t) > 30 or len(t.split()) > 4:
        return None
    for key, pat in HEADS.items():
        if re.fullmatch(pat, t):
            return key
    return None


def split_sections(text: str) -> dict:
    out = {k: [] for k in ("header", *HEADS.keys())}
    cur = "header"
    for line in text.splitlines():
        s = line.strip()
        key = _heading(s)
        if key:
            cur = key
            continue
        out[cur].append(s)
    return {k: "\n".join(v) for k, v in out.items()}


def _pattern(terms: list[str]):
    parts = [re.escape(t) for t in sorted(set(terms), key=len, reverse=True)]
    return re.compile(r"(?<![A-Za-z0-9+#])(?:" + "|".join(parts) + r")(?![A-Za-z0-9+#])", re.I)


def _quality(text: str, sections: dict, has_links: bool):
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    words = len(text.split())
    checks = [
        (bool(EMAIL.search(text)), "Add a professional email address at the top of your resume."),
        (bool(PHONE.search(text)), "Add a phone number so recruiters can reach you."),
        (bool(sections["skills"].strip()), "Add a clear 'Skills' section so ATS systems can read your stack."),
        (bool(sections["projects"].strip()), "Add a 'Projects' section: projects are your main proof of skill."),
        (bool(sections["education"].strip()), "Add an 'Education' section."),
        (250 <= words <= 900, "Aim for one page: roughly 250 to 900 words."),
        (sum(1 for l in lines if QUANT.search(l)) >= 3, "Quantify your impact: add numbers (users, % faster, size) to at least 3 bullets."),
        (sum(1 for l in lines if ACTION.match(l)) >= 5, "Start bullets with action verbs (built, designed, optimized, deployed)."),
        (has_links, "Add links to your GitHub (and LinkedIn or portfolio)."),
    ]
    passed = sum(1 for ok, _ in checks if ok)
    T = round(0.4 + 0.6 * passed / len(checks), 3)
    issues = [msg for ok, msg in checks if not ok]
    return T, issues


def analyze_resume(pdf_bytes: bytes, discipline: str, stack: str,
                   linkedin_text: str = "", github_url: str = "", figma_url: str = "") -> dict:
    text = extract_text(pdf_bytes)
    if len(text.strip()) < 100:
        raise ValueError("Could not read text from this PDF. If it is a scanned image, export a text-based PDF.")

    full = text + "\n" + (linkedin_text or "")
    sections = split_sections(full)
    full_lines = full.splitlines()
    proj_text = sections["projects"] + "\n" + sections["experience"]

    skills = []
    for s in get_profile(discipline, stack):
        pat = _pattern([s["name"], *s["aliases"]])
        if not pat.search(full):
            C, R = [0.0, 0.0, 0.0], 0.0
        else:
            in_skills = bool(pat.search(sections["skills"]))
            strong = any(STRONG.search(l) for l in full_lines if pat.search(l))
            level = min(1.0, 0.5 + (0.2 if in_skills else 0.0) + (0.2 if strong else 0.0))
            proj_lines = [l for l in proj_text.splitlines() if pat.search(l)]
            in_proj = bool(proj_lines)
            quant = any(QUANT.search(l) for l in proj_lines)
            C = [round(level, 2), round(level, 2), 0.8 if in_proj else 0.2]
            R = 1.0 if (in_proj and quant) else 0.7 if in_proj else 0.4
        skills.append({"name": s["name"], "w": s["w"], "C": C, "R": R, "aliases": s["aliases"]})

    has_links = bool(github_url) or "github.com" in full.lower() or "linkedin.com" in full.lower()
    T, issues = _quality(full, sections, has_links)

    session_id = uuid.uuid4().hex
    SESSIONS[session_id] = {
        "discipline": discipline, "stack": stack, "text": full, "skills": skills, "T": T,
        "issues": issues, "github_url": github_url, "figma_url": figma_url,
    }
    return {
        "session_id": session_id,
        "skills": [{"name": k["name"], "w": k["w"], "C": k["C"], "R": k["R"]} for k in skills],
        "T": T,
        "resume_issues": issues[:6],
    }


def get_session(session_id: str) -> dict:
    if session_id not in SESSIONS:
        raise KeyError("Unknown or expired session_id")
    return SESSIONS[session_id]
