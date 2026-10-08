from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from config import CORS_ORIGINS
from schemas import AnalyzeResponse, GradeRequest, GradeResponse, QuizResponse, ReportResponse
from services import github, verify
from services.resume import analyze_resume, get_session
from services.roadmap import build_roadmap
from services.scoring import compute_jrs
from services.resources import build_resources

app = FastAPI(title="Vexis API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_PDF_BYTES = 5 * 1024 * 1024


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(
    pdf: UploadFile = File(...),
    discipline: str = Form(...),
    stack: str = Form(...),
    linkedin_text: str = Form(""),
    github_url: str = Form(""),
    figma_url: str = Form(""),
):
    data = await pdf.read()
    if not data.startswith(b"%PDF"):
        raise HTTPException(400, "Please upload a PDF file.")
    if len(data) > MAX_PDF_BYTES:
        raise HTTPException(400, "PDF is larger than 5 MB.")
    if not stack.strip():
        raise HTTPException(400, "Tech stack is required.")
    try:
        result = analyze_resume(data, discipline, stack, linkedin_text, github_url, figma_url)
    except ValueError as e:
        raise HTTPException(422, str(e))

    # GitHub is a bonus: look at public repos and boost matching skills' project score.
    if github_url.strip():
        try:
            sid = result["session_id"] if isinstance(result, dict) else getattr(result, "session_id", None)
            if sid:
                s = get_session(sid)
                s["github_boost"] = github.compute_boost(github_url, s["skills"])
                print("GITHUB BOOST:", s["github_boost"])
        except Exception:
            pass   # never break the upload because of GitHub
    return result


@app.get("/quiz", response_model=QuizResponse)
def quiz(session_id: str):
    try:
        return verify.build_quiz(session_id)
    except KeyError:
        raise HTTPException(404, "Unknown or expired session. Upload the resume again.")


@app.post("/grade", response_model=GradeResponse)
def grade(req: GradeRequest):
    try:
        return verify.grade(req.session_id, [a.model_dump() for a in req.answers])
    except KeyError:
        raise HTTPException(404, "Unknown or expired session. Upload the resume again.")
    except ValueError as e:
        raise HTTPException(400, str(e))


@app.get("/report", response_model=ReportResponse)
def report(session_id: str):
    try:
        s = get_session(session_id)
    except KeyError:
        raise HTTPException(404, "Unknown or expired session. Upload the resume again.")
    V = verify.build_V(s)
    skills = [{"name": k["name"], "w": k["w"], "C": k["C"], "V": V[k["name"]], "R": k["R"]} for k in s["skills"]]
    out = compute_jrs(skills, s["T"])
    return {
        "jrs": out["jrs"],
        "T": out["T"],
        "breakdown": out["breakdown"],
        "roadmap": build_roadmap(s, out["breakdown"]),
        "resources": build_resources(out["breakdown"]),
    }