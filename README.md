<<<<<<< HEAD
# Vexis — AI-Powered Job Readiness Verifier

Vexis is a real-time web application designed for computer science and engineering students to measure, verify, and improve their job readiness. Unlike traditional resume scanners that rely purely on keyword matching, Vexis dynamically tests claimed technical skills, penalizes over-claimed expertise, and provides an actionable, data-driven roadmap to help students cross the hiring bar.

---

## Key Features

- **Multi-Source Portfolio Analysis**: Parses uploaded resume PDFs alongside optional LinkedIn profiles, GitHub accounts, and Figma portfolios to establish a holistic baseline of claimed skills.
- **Dynamic Skill-Verification Quiz**: Generates tailored, targeted questions based on the candidate's chosen discipline and tech stack to test both theoretical knowledge and practical application.
- **Over-Claim Penalty System**: Evaluates the mathematical variance between claimed expertise and verified test performance ($C_i$ vs. $V_i$), applying a calibrated decay factor ($\lambda$) to penalize inflated resumes.
- **Job Readiness Score (JRS)**: Calculates a normalized 0–100 readiness index driven by skill weights ($w_i$), validity scores ($S_i$), resume evidence ($R_i$), and global resume quality ($T$).
- **Granular Skill Breakdown**: Displays an interactive, sortable breakdown highlighting per-skill contributions and visual alerts for over-claimed skills.
- **Targeted Action Roadmap**: Generates itemized, actionable feedback across three core execution categories (**Add**, **Remove**, **Change**) paired with top-ranked technical focus areas.

---

## Scoring Architecture

Vexis computes the overall Job Readiness Score using the following formulation:

$$\text{JRS} = \left( \sum_{i} w_i \cdot S_i \cdot R_i \right) \times T \times 100$$

Where:
- $w_i$: Skill importance weight based on selected target role.
- $S_i$: Skill-validity factor calculated via directional cosine similarity corrected by over-claiming penalty:
  $$S_i = \cos(C_i, V_i) \cdot e^{-\lambda \cdot \max(0, C_i - V_i)}$$
- $R_i$: Resume and repository evidence strength multiplier for skill $i$.
- $T$: Global resume quality multiplier penalizing formatting issues, missing links, or unquantified bullet points.

---

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, Inline SVG Data Viz
- **Backend**: FastAPI (Python), PyPDF2 / PDF parsing, LangChain / OpenAI
- **Deployment**: Vercel (Frontend) / Render (Backend)
=======
# Vexis
Deterministic code verification eliminating inflated resume claims
>>>>>>> f83fa55dda33ba14bfae01a88691b5fd71aeb3a4
