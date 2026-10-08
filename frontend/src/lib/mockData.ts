import type {
    AnalyzeResponse,
    QuizResponse,
    ReportResponse,
    SkillResult,
  } from "@/types";
  
  // Vectors are [theory, practice, projects] on a 0-1 scale (see EVIDENCE_DIMS).
  // contribution = w * S * R * T * 100, so the rows sum to the JRS.
  const T = 0.87;
  
  const breakdown: SkillResult[] = [
    {
      skill: "React",
      w: 0.25, S: 0.92, R: 0.95,
      C: [0.8, 0.8, 0.9],
      V: [0.75, 0.72, 0.85],
      contribution: 19.0,
      overclaimed: false,
    },
    {
      skill: "TypeScript",
      w: 0.2, S: 0.55, R: 0.9,
      C: [0.9, 0.9, 0.8],
      V: [0.5, 0.4, 0.3],
      contribution: 8.6,
      overclaimed: true,
    },
    {
      skill: "Node.js",
      w: 0.2, S: 0.8, R: 0.85,
      C: [0.7, 0.7, 0.6],
      V: [0.5, 0.55, 0.45],
      contribution: 11.8,
      overclaimed: false,
    },
    {
      skill: "SQL",
      w: 0.15, S: 0.85, R: 0.8,
      C: [0.6, 0.7, 0.5],
      V: [0.5, 0.55, 0.4],
      contribution: 8.9,
      overclaimed: false,
    },
    {
      skill: "Git",
      w: 0.1, S: 0.95, R: 0.9,
      C: [0.7, 0.8, 0.8],
      V: [0.7, 0.7, 0.8],
      contribution: 7.4,
      overclaimed: false,
    },
    {
      skill: "Docker",
      w: 0.1, S: 0.35, R: 0.7,
      C: [0.8, 0.7, 0.6],
      V: [0.3, 0.1, 0.0],
      contribution: 2.1,
      overclaimed: true,
    },
  ];
  
  export const mockAnalyze: AnalyzeResponse = {
    session_id: "mock-session-001",
    skills: breakdown.map((b) => ({ name: b.skill, w: b.w, C: b.C, R: b.R })),
    T,
    resume_issues: [
      "No quantified impact: add numbers to your bullets (e.g. \"cut page load time by 40%\").",
      "Your skills section lists 14 technologies, but only 6 appear in projects or experience.",
      "Project descriptions don't link to a repo or a live demo.",
      "Resume runs to 3 pages. Trim to 1 page for entry-level roles.",
    ],
  };
  
  export const mockQuiz: QuizResponse = {
    questions: [
      {
        id: "q1",
        skill: "React",
        dim: "theory",
        prompt: "What happens when you call a state setter returned by useState?",
        options: [
          "The state is mutated immediately and the DOM updates synchronously",
          "React schedules a re-render with the new state value",
          "The component unmounts and remounts",
          "Only child components re-render, never the component itself",
        ],
      },
      {
        id: "q2",
        skill: "React",
        dim: "practice",
        prompt:
          "A list uses key={index} and users can reorder items. What is the most likely bug?",
        options: [
          "An infinite render loop",
          "A syntax error from duplicate keys",
          "Item state (e.g. input values) sticks to the wrong rows after reordering",
          "Nothing, index keys are always safe",
        ],
      },
      {
        id: "q3",
        skill: "TypeScript",
        dim: "theory",
        prompt: "How do interface and type differ for describing object shapes?",
        options: [
          "Type aliases can only describe primitives",
          "Interfaces exist at runtime; types are erased",
          "There is no difference at all, including declaration merging",
          "Interfaces can be merged by declaring them twice; type aliases cannot",
        ],
      },
      {
        id: "q4",
        skill: "TypeScript",
        dim: "practice",
        prompt:
          "Which signature types a function that returns the first element of any array, or undefined if it's empty?",
        options: [
          "function first(xs: any[]): any",
          "function first<T>(xs: T[]): T | undefined",
          "function first<T>(xs: T): T",
          "function first(xs: Array): undefined",
        ],
      },
      {
        id: "q5",
        skill: "Node.js",
        dim: "theory",
        prompt:
          "Why does a CPU-heavy synchronous loop in a request handler hurt other users?",
        options: [
          "It blocks the single-threaded event loop, so other requests wait",
          "Node kills the thread after 30 seconds",
          "The garbage collector locks the database",
          "The HTTP module rate-limits long handlers",
        ],
      },
      {
        id: "q6",
        skill: "SQL",
        dim: "practice",
        prompt:
          "You need every user, including users with no orders. Which query shape works?",
        options: [
          "FROM users INNER JOIN orders",
          "FROM orders LEFT JOIN users",
          "FROM users CROSS JOIN orders",
          "FROM users LEFT JOIN orders",
        ],
      },
      {
        id: "q7",
        skill: "Git",
        dim: "practice",
        prompt:
          "You committed to main by mistake and haven't pushed. Which command undoes the commit but keeps your changes staged?",
        options: [
          "git reset --hard HEAD~1",
          "git clean -fd",
          "git reset --soft HEAD~1",
          "git revert --no-commit main",
        ],
      },
      {
        id: "q8",
        skill: "Docker",
        dim: "theory",
        prompt: "What is the relationship between a Docker image and a container?",
        options: [
          "A container is a build recipe for an image",
          "A container is a running instance of an image",
          "An image is a running instance of a container",
          "They are the same thing with different names",
        ],
      },
    ],
  };
  
  export const mockReport: ReportResponse = {
    jrs: 57.8,
    T,
    breakdown,
    roadmap: {
      add: [
        "A deployed link (Vercel/Render) next to your best project",
        "Measurable results on at least 3 bullets (users, speed, % improvement)",
        "A line on testing (Jest / React Testing Library) if you've used it",
      ],
      remove: [
        "Docker from your skills list until a public repo has a working Dockerfile",
        "Buzzwords with no project behind them (Kubernetes, GraphQL, AWS)",
        "The objective statement; replace it with a 2-line summary",
      ],
      change: [
        "Rewrite \"Familiar with TypeScript\" to name what you built with it",
        "Order skills by strength: React, Git, SQL, Node.js first",
        "Cut the resume to one page",
      ],
      focus_areas: [
        "TypeScript generics and utility types",
        "Containerizing a Node.js app (Dockerfile + docker-compose)",
        "Node.js event loop, async patterns and error handling",
        "SQL joins, indexes and reading query plans",
        "Add tests to one full-stack project",
      ],
    },
  };