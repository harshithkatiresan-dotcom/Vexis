from typing import Literal
from pydantic import BaseModel, Field

# Order of every C and V vector. Both sides must use this exact order.
# theory    -> quiz conceptual questions
# practice  -> quiz coding/scenario questions, GitHub activity
# projects  -> resume project/experience evidence, GitHub repos
EVIDENCE_DIMS = ["theory", "practice", "projects"]

# ---------- POST /analyze ----------
# multipart/form-data fields (not a JSON body, so no model for the request):
#   pdf: file (required), discipline: str (required), stack: str (required, comma-separated)
#   linkedin_text: str?, github_url: str?, figma_url: str?

class Skill(BaseModel):
    name: str
    w: float = Field(ge=0, le=1)          # importance weight from discipline_profiles.json
    C: list[float]                         # claimed vector, len == len(EVIDENCE_DIMS), values 0..1
    R: float = Field(ge=0, le=1)          # resume-evidence factor

class AnalyzeResponse(BaseModel):
    session_id: str
    skills: list[Skill]
    T: float = Field(ge=0, le=1)          # global resume-quality multiplier
    resume_issues: list[str] = []          # quick wins shown on the report

# ---------- GET /quiz?session_id= ----------
class QuizQuestion(BaseModel):
    id: str
    skill: str
    dim: Literal["theory", "practice"]
    prompt: str
    options: list[str]                     # correct answer is NOT sent to the client

class QuizResponse(BaseModel):
    questions: list[QuizQuestion]

# ---------- POST /grade ----------
class Answer(BaseModel):
    id: str
    choice: int                            # index into options

class GradeRequest(BaseModel):
    session_id: str
    answers: list[Answer]

class GradeResponse(BaseModel):
    ok: bool

# ---------- GET /report?session_id= ----------
class SkillResult(BaseModel):
    skill: str
    w: float
    S: float                               # validity score
    R: float
    C: list[float]
    V: list[float]
    contribution: float                    # w * S * R
    overclaimed: bool                      # true when penalty term is meaningful

class Resource(BaseModel):
    skill: str
    title: str
    url: str
    kind: Literal["video", "course"]
    reason: str = ""

class Roadmap(BaseModel):
    add: list[str] = []
    remove: list[str] = []
    change: list[str] = []
    focus_areas: list[str] = []            # ranked by w * (1 - S*R)
    resources: list[Resource] = []         # learning links for the biggest gaps

class ReportResponse(BaseModel):
    jrs: float                             # 0..100
    T: float
    breakdown: list[SkillResult]
    roadmap: Roadmap
    resources: list[Resource] = []         # learning links for the biggest gaps