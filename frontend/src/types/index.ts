// Order of every C and V vector. Must match EVIDENCE_DIMS in backend/schemas.py.
export const EVIDENCE_DIMS = ["theory", "practice", "projects"] as const;

// ---------- POST /analyze (multipart form) ----------
export interface AnalyzeInput {
  pdf: File;
  discipline: string;
  stack: string; // comma-separated
  linkedin_text?: string;
  github_url?: string;
  figma_url?: string;
}

export interface Skill {
  name: string;
  w: number;
  C: number[];
  R: number;
}

export interface AnalyzeResponse {
  session_id: string;
  skills: Skill[];
  T: number;
  resume_issues: string[];
}

// ---------- GET /quiz ----------
export interface QuizQuestion {
  id: string;
  skill: string;
  dim: "theory" | "practice";
  prompt: string;
  options: string[];
}

export interface QuizResponse {
  questions: QuizQuestion[];
}

// ---------- POST /grade ----------
export interface Answer {
  id: string;
  choice: number;
}

export interface GradeRequest {
  session_id: string;
  answers: Answer[];
}

export interface GradeResponse {
  ok: boolean;
}

// ---------- GET /report ----------
export interface SkillResult {
  skill: string;
  w: number;
  S: number;
  R: number;
  C: number[];
  V: number[];
  contribution: number;
  overclaimed: boolean;
}

export interface Resource { skill: string; title: string; url: string; kind: "video" | "course"; reason: string; }
export interface Roadmap { add: string[]; remove: string[]; change: string[]; focus_areas: string[]; resources?: Resource[]; }

export interface ReportResponse {
  jrs: number;
  T: number;
  breakdown: SkillResult[];
  roadmap: Roadmap;
}