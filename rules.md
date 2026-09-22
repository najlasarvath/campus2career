# Project Rules — Campus2Career

These rules are strict for this build. Do not introduce alternate libraries, languages, or frameworks not listed here, even if they seem simpler for a specific sub-task.

## Tech Stack (Strict)

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React (Vite) | no Next.js, no CRA |
| Styling | Tailwind CSS | no separate CSS files unless unavoidable |
| Backend | Node.js + Express | single backend service, no Python, no separate microservices |
| Database | Supabase (Postgres) | use Supabase client SDK for auth + DB, not raw `pg` unless necessary |
| AI Provider | Gemini API (@google/genai) | used for: (1) resume skill extraction, (2) roadmap generation |
| Resume Parsing | `pdf-parse` (Node) | do not use Python-based parsing (PyMuPDF, etc.) |
| Charts | Recharts | for the campus skill heatmap |
| Certificate (stretch) | `html-to-image` or `jsPDF` | only if core flow is done early |
| Hosting — Frontend | Vercel | |
| Hosting — Backend | Render or Railway | pick one, do not split across both |

## Folder Structure

```
/frontend        → React + Vite + Tailwind app
/backend          → Node + Express API
  /routes
  /controllers
  /services       → AI calls, PDF parsing logic
  /data           → hardcoded role-requirements JSON
  /middleware     → error handling & auth verification
/API_SPEC.md      → shared contract between frontend and backend
```

## Hard Rules

1. **One language on backend** — JavaScript/Node only. No Python scripts, no `child_process` calls to other runtimes.
2. **One AI provider** — Gemini API (`@google/genai`). Do not use OpenAI SDK.
3. **One hosting provider per layer** — no split deployments.
4. **Required-skills-per-role data is hardcoded JSON** — no live job-scraping API for MVP.
5. **No new npm packages without checking this file first** — if a package isn't listed above and is needed, add it here before installing, so the whole team stays in sync.
   - *Approved exceptions*: `cors` (enables cross-origin API requests from Vite frontend on `localhost:5173`) and `multer` (handles multipart/form-data resume PDF file uploads).
6. **API contract lives in `API_SPEC.md`** — any change to a request/response shape must be updated there first, before either side implements it.
7. **Environment variables** — all API keys (Supabase, Gemini) go in `.env`, never hardcoded, never committed.

## Out of Scope (Do Not Build)

- Skill assessment quizzes
- QR-verified certificates
- Before/after training tracking
- LMS/ERP/GitHub integrations
- Company-facing portal
- Live job-description scraping

If any of these come up mid-build as "quick to add," check the PRD first — they are intentionally excluded to protect the 12-hour timeline.
