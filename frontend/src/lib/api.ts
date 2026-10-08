import type {
    AnalyzeInput,
    AnalyzeResponse,
    GradeRequest,
    GradeResponse,
    QuizResponse,
    ReportResponse,
  } from "@/types";
  import { mockAnalyze, mockQuiz, mockReport } from "@/lib/mockData";
  
  // Flip to false when the FastAPI backend is up.
  export const USE_MOCK = false;
  
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const MOCK_DELAY_MS = 600;
  
  const sleep = (ms: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, ms));
  
  async function mock<T>(data: T): Promise<T> {
    await sleep(MOCK_DELAY_MS);
    return structuredClone(data);
  }
  
  function isRecord(v: unknown): v is Record<string, unknown> {
    return typeof v === "object" && v !== null;
  }
  
  // Turns FastAPI error bodies ({detail: string} or validation arrays) into one readable string.
  async function readError(res: Response): Promise<string> {
    const fallback = `Request failed (${res.status}${
      res.statusText ? " " + res.statusText : ""
    }).`;
    try {
      const body: unknown = await res.json();
      if (isRecord(body)) {
        const detail = body.detail;
        if (typeof detail === "string") return detail;
        if (Array.isArray(detail)) {
          const msgs = detail
            .map((d: unknown) =>
              isRecord(d) && typeof d.msg === "string" ? d.msg : ""
            )
            .filter(Boolean);
          if (msgs.length > 0) return msgs.join("; ");
        }
      }
    } catch {
      // body wasn't JSON, use the fallback
    }
    return fallback;
  }
  
  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    let res: Response;
    try {
      res = await fetch(`${BASE_URL}${path}`, init);
    } catch {
      throw new Error(
        `Can't reach the server at ${BASE_URL}. Is the backend running?`
      );
    }
    if (!res.ok) {
      throw new Error(await readError(res));
    }
    try {
      return (await res.json()) as T;
    } catch {
      throw new Error("The server sent a response we couldn't read.");
    }
  }
  
  export async function analyze(input: AnalyzeInput): Promise<AnalyzeResponse> {
    if (USE_MOCK) return mock(mockAnalyze);
  
    const form = new FormData();
    form.append("pdf", input.pdf);
    form.append("discipline", input.discipline);
    form.append("stack", input.stack.trim());
  
    const optional: Array<[string, string | undefined]> = [
      ["linkedin_text", input.linkedin_text],
      ["github_url", input.github_url],
      ["figma_url", input.figma_url],
    ];
    for (const [key, value] of optional) {
      if (value && value.trim()) form.append(key, value.trim());
    }
  
    // No Content-Type header: the browser sets the multipart boundary itself.
    return request<AnalyzeResponse>("/analyze", { method: "POST", body: form });
  }
  
  export async function getQuiz(sessionId: string): Promise<QuizResponse> {
    if (USE_MOCK) return mock(mockQuiz);
    return request<QuizResponse>(
      `/quiz?session_id=${encodeURIComponent(sessionId)}`
    );
  }
  
  export async function grade(req: GradeRequest): Promise<GradeResponse> {
    if (USE_MOCK) return mock<GradeResponse>({ ok: true });
    return request<GradeResponse>("/grade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
  }
  
  export async function getReport(sessionId: string): Promise<ReportResponse> {
    if (USE_MOCK) return mock(mockReport);
    return request<ReportResponse>(
      `/report?session_id=${encodeURIComponent(sessionId)}`
    );
  }
