# AI Usage in Campus2Career

---

## 1. AI Overview

**Campus2Career** is an intelligent career transition and institutional placement platform designed to bridge the gap between academic preparation and enterprise hiring requirements. The platform serves two primary stakeholders: university students seeking placement qualification, and college placement cells monitoring cohort-wide employability. While traditional web applications rely exclusively on static relational databases and fixed CRUD operations, Campus2Career handles complex, unstructured career data that requires contextual reasoning.

AI is incorporated specifically where rigid, rule-based programming falls short. Unstructured resumes vary infinitely in phrasing, formatting, and layout; career roadmaps must dynamically adapt to unique combinations of diagnosed skill gaps; and open-ended technical answers require qualitative conceptual evaluation rather than simple keyword matching. Conversely, where deterministic accuracy is essential—such as computing role match percentages, aggregating cohort deficits, and enforcing access control—conventional software logic is deliberately used.

### High-Level Architecture Flow

```
User (Student / College Admin)
       │
       ▼
React 19 Frontend (Vite Client)
       │  (Authenticated REST API calls via Axios)
       ▼
Express 5 Backend Server
       │  (Input validation via Zod, Session & Role verification)
       ▼
AI Service Layer
       │  (Context injection, Prompt formatting, Response sanitization)
       ▼
Google Gemini API (gemini-3.5-flash-lite)
       │  (Low-latency token generation with native JSON mode)
       ▼
Validated Structured Output
       │  (cleanJSON() parser + Zod schema validation with retry backoff)
       ▼
Application Logic & Supabase PostgreSQL
       │  (Deterministic scoring, Relational persistence, Analytics aggregation)
       ▼
React Frontend (Dynamic UI rendering, Heatmaps, Roadmaps, Vector PDF downloads)
```

> **Security Note:** All AI API interactions occur strictly on the Express backend server. The Gemini API key is isolated in backend environment variables and is never exposed to the client browser or bundled in frontend assets.

---

## 2. AI Technology Stack

The platform uses a focused, production-grade technology stack for its AI and data pipeline:

| Technology | Purpose in Project | Where Used |
| :--- | :--- | :--- |
| **Google Gemini 3.5 Flash Lite** (`gemini-3.5-flash-lite`) | Primary Large Language Model providing semantic resume skill extraction, personalized curriculum planning, technical interview evaluation, and conversational placement coaching. | Configured via `process.env.GEMINI_MODEL` in `backend/src/services/ai/client.js`. |
| **@google/genai** (`v2.24.0`) | Official next-generation Google GenAI SDK used to initialize the client singleton and manage JSON-mode model communication. | `backend/package.json`, instantiated in `backend/src/services/ai/client.js`. |
| **Zod** (`v4.6.5`) | TypeScript-first schema declaration and runtime validation library used to enforce strict JSON schemas on AI outputs and API payloads. | `backend/src/services/ai/*` and `backend/src/routes/ai.routes.js`. |
| **pdf-parse** (`v2.4.5`) | Buffer-based document utility used to extract raw ASCII/UTF-8 plaintext from uploaded PDF resumes in memory. | `backend/src/services/resumeService.js`. |
| **Express.js** (`v5.2.1`) | Backend application runtime orchestrating API routing, authentication, Multer memory buffering, and AI service execution. | `backend/src/server.js`. |
| **Supabase PostgreSQL** (`v2.116.0`) | Relational cloud database storing student profiles, verified skills, institutional benchmarks, workshops, and completion certificates. | `backend/src/config/supabaseClient.js`. |

---

## 3. Where AI Is Used

The following table documents all AI-powered features genuinely implemented in the active codebase:

| AI Feature | What AI Does | Input | Output | Implementation File |
| :--- | :--- | :--- | :--- | :--- |
| **Resume Skill Extraction** | Parses unstructured resume plaintext, identifies verified technical competencies and tools, and standardizes naming while filtering out filler text. | Raw plaintext extracted from PDF resume. | Validated JSON object with standardized skill strings: `{ skills: string[] }`. | `backend/src/services/ai/resumeSkillAI.js` |
| **Role Match Explanation** | Transforms pre-computed mathematical qualification scores into a constructive, natural-language career assessment. | Pre-computed match score (%), matched skills list, missing skills list. | Structured JSON object: `{ explanation: string }`. | `backend/src/services/ai/roleMatchAI.js` |
| **Adaptive Learning Roadmap** | Synthesizes diagnosed skill gaps into a structured, day-by-day 7-day learning sprint with exercises, durations, and milestones. | Target role, verified current skills, critical gap skills, available weeks. | Validated JSON matching `RoadmapOutputSchema` (daily tasks and weekly milestones). | `backend/src/services/ai/roadmapAI.js` |
| **Interview Question Generator** | Generates deep, role-specific technical questions testing mechanics, edge cases, and troubleshooting (avoiding generic career queries). | Target role, critical gap skill, verified competencies, optional company context. | Structured JSON matching `QuestionsSchema` with category, question type, and hints. | `backend/src/services/ai/interviewAI.js` |
| **Interview Answer Evaluation** | Evaluates open-ended technical answers across four qualitative dimensions (0–100) and diagnoses missing concepts and misconceptions. | Technical interview question, candidate written response text. | Structured JSON matching `EvaluationSchema` with numerical scores and concept diagnostic arrays. | `backend/src/services/ai/interviewAI.js` |
| **"What-If" Skill Analysis** | Explains the career leverage gained by acquiring a hypothetical skill based on pre-calculated role score increases. | Hypothetical skill name, pre-computed mathematical before/after role score deltas. | Structured JSON object: `{ explanation: string, roleImpacts: Array }`. | `backend/src/services/ai/whatIfAI.js` |
| **AI Placement Coach (Chatbot)** | Acts as an encouraging, context-aware university placement advisor answering student queries in real time. | Student question string, live profile context (score, target role, critical gaps, acquired skills). | Concise, human-readable markdown text formatted with bullet points. | `backend/src/routes/ai.routes.js` (`POST /api/ai/chat`) |

---

## 4. End-to-End AI Feature Workflows

### 4.1. Resume Ingestion & Skill Extraction Pipeline

```
[Candidate PDF Resume]
        │
        ▼ (POST /api/resumes/upload)
[Multer In-Memory Storage] ──► Verified application/pdf buffer (RAM)
        │
        ▼
[pdf-parse Engine] ──► Clean ASCII/UTF-8 string extraction
        │
        ▼
[Gemini Prompt Injection] ──► buildResumeSkillPrompt(resumeText)
        │
        ▼
[Gemini 3.5 Flash Lite] ──► Native JSON output: { "skills": [...] }
        │
        ▼
[Validation & Normalization] ──► cleanJSON() + Zod ResumeSkillsSchema + normalizeSkill()
        │
        ▼
[Supabase PostgreSQL] ──► UPDATE students SET extracted_skills = [...]
        │
        ▼
[Downstream Consumption] ──► Feeds Role Match Engine & College Cohort Analytics
```

1. **Ingestion & Buffering**: The student uploads a PDF resume. Multer buffers the file directly in memory (`req.file.buffer`) without saving temporary files to disk, avoiding file cleanup issues.
2. **Text Extraction**: `pdf-parse` extracts raw text from the document buffer.
3. **AI Processing**: The extracted text is injected into `buildResumeSkillPrompt()`, directing Gemini to return verified technical competencies as a clean JSON array.
4. **Validation & Normalization**: The raw output passes through `cleanJSON()` and `ResumeSkillsSchema.parse()`. Naming is standardized using canonical synonyms (e.g., `reactjs` $\to$ `react`, `postgres` $\to$ `postgresql`).
5. **Persistence**: Extracted skills are stored in the Supabase `students` table, automatically updating the student's qualification profile and cohort statistics.

---

### 4.2. Adaptive Learning Roadmap & Remediation

When a student selects a target role (e.g., *Data Analyst* or *Full Stack Developer*), the matching engine identifies missing core and secondary skills. 

1. Missing competencies are passed to `roadmapAI.generateRoadmap()`.
2. Gemini generates an adaptive, day-by-day learning schedule with clear daily tasks, estimated completion times (e.g., `45 mins`), and concrete practice activities.
3. The response is validated against `RoadmapOutputSchema`. If a candidate demonstrates a weak concept in subsequent assessments, the `/api/ai/roadmap/regenerate` endpoint triggers targeted remedial sprints.

---

### 4.3. Technical Mock Interview Arena

Rather than providing multiple-choice questions, the platform simulates a technical screening:

1. **Question Generation**: `interviewAI.generateQuestions()` prompts Gemini to construct practical scenario, debugging, or architectural questions tailored to the student's specific skill gaps.
2. **Qualitative Evaluation**: The candidate types an open-ended technical answer. Gemini evaluates the response against an engineering rubric:
   - **Technical Accuracy** (0–100)
   - **Problem-Solving & Edge Cases** (0–100)
   - **Real-World Application & Architecture** (0–100)
   - **Communication Clarity** (0–100)
3. **Diagnostic Breakdown**: The model returns concrete arrays: `correctConcepts`, `incorrectConcepts`, and `missingConcepts`, accompanied by an authoritative model solution (`betterApproach`).

---

### 4.4. AI Placement Coach (Chatbot)

The placement coach is accessible via a persistent floating drawer in the student portal:

1. **Context-Injected Query**: When the student asks a question (e.g., *"What project should I build to get hired by Google?"*), the frontend packages the query with the student's live state from `StudentContext`.
2. **Prompt Synthesis**: The backend constructs a system prompt injecting the candidate's name, target role, current readiness score, critical gaps, and target employer.
3. **Conversational Delivery**: Gemini generates an encouraging, concise answer in markdown. The backend runs `sanitizeCoachReply()` to ensure raw JSON brackets or internal keys are never displayed to the student.

---

## 5. AI vs. Traditional Software Engineering

A central architectural decision in Campus2Career is using a **hybrid design**: pairing generative AI with deterministic software engineering. Using AI for every task is an anti-pattern; statistical models should not handle mathematical calculations or access control.

| System Functionality | Implementation Method | Engineering Rationale |
| :--- | :--- | :--- |
| **Resume Skill Extraction** | **Generative AI** (Gemini) | Resumes contain varied layouts and non-standard phrasing that cannot be parsed reliably with static templates. |
| **Adaptive Roadmap Planning** | **Generative AI** (Gemini) | Designing balanced, multi-day learning tasks tailored to diverse gap combinations requires generative reasoning. |
| **Technical Interview Scoring** | **Generative AI** (Gemini) | Grading open-ended technical explanations requires semantic natural-language comprehension and rubric assessment. |
| **Placement Coaching Dialogue** | **Generative AI** (Gemini) | Providing contextual, conversational career advice requires natural-language synthesis. |
| **Role Match Percentage Score** | **Traditional Logic** (JavaScript) | Mathematical qualification scores (70% core + 30% secondary) must be **100% deterministic, reproducible, and verifiable**. |
| **"What-If" Score Deltas** | **Traditional Logic** (JavaScript) | Calculating qualification lifts (`afterScore - beforeScore`) is pure arithmetic. |
| **Cohort Competency Aggregation** | **Traditional Logic** (PostgreSQL / JS) | Aggregating student skill totals across an entire college cohort is executed via relational database queries. |
| **Skill Deficit Percentage** | **Traditional Logic** (Formula) | Evaluated using standard arithmetic: `((lackingStudents / totalStudents) * 100)`. |
| **40% Skill Deficit Alert Trigger** | **Traditional Logic** (Conditional) | Evaluating whether a campus deficit requires institutional intervention is a boolean comparison (`deficit >= 40`). |
| **Student Access Control (RBAC)** | **Traditional Logic** (Middleware) | Enforcing read-only access for students on college-owned resources is handled by Express middleware returning HTTP 403 Forbidden. |
| **Workshop Video Progress Tracking** | **Traditional Logic** (State Map) | Tracking whether masterclass lectures have been watched is maintained using boolean state flags. |
| **Vector PDF Certificate Generation** | **Traditional Logic** (Vector Stream) | Generating RFC-compliant landscape A4 PDF credentials with exact millimetric layout is handled by a custom vector engine. |

---

## 6. Prompt Engineering & Output Reliability

To ensure the AI produces reliable, machine-readable output rather than unpredictable free-form text, the platform implements three core safeguards:

### 1. Structured Output Enforced at the Token Level
Gemini API calls request structured data using native JSON mode:
```javascript
const response = await ai.models.generateContent({
  model: 'gemini-3.5-flash-lite',
  contents: prompt,
  config: { responseMimeType: 'application/json' }
});
```

### 2. Markdown Stripping & Zod Schema Validation
Because LLMs may occasionally wrap JSON responses in markdown fences (` ```json `), every response is sanitized using `cleanJSON()` and validated through a Zod schema before use:

```javascript
// Example: Resume Skills Validation Schema
const ResumeSkillsSchema = z.object({
  skills: z.array(z.string()).default([])
});

const cleaned = cleanJSON(rawText);
const parsed = JSON.parse(cleaned);
return ResumeSkillsSchema.parse(parsed);
```

### 3. Defensive Retries & Graceful Fallbacks
The AI service wrapper (`generateJSON` in `client.js`) implements an automatic **1-retry backoff loop** if parsing fails. If an external API outage or quota limit (HTTP 429) occurs, the system fails gracefully:
- **Resume Extraction**: Falls back to an internal regex extraction engine (`skillExtractionService.js`).
- **Roadmap Generation**: Returns a curated, role-specific 7-day engineering curriculum.
- **Interview Scoring**: Evaluates the answer using heuristic technical keyword matching.

This defensive design guarantees that a temporary AI service disruption will never break the core user experience or block a demo.

---

## 7. Chatbot Architecture & Data Flow

The AI Placement Coach is designed around a **stateless backend architecture**:

```
[Candidate Query in UI] ──► [AssistantChat.jsx reads StudentContext]
                                    │
                                    ▼ (POST /api/ai/chat)
                            [Express ai.routes.js]
                                    │
                                    ▼ (Prompt with Injected Context)
                            [Gemini 3.5 Flash Lite]
                                    │
                                    ▼ (Markdown text reply)
                            [sanitizeCoachReply()]
                                    │
                                    ▼ (JSON Response)
                            [UI Appends to React State Array]
```

### Memory & State Management Reality Check
* **Persistent Memory**: **Conversation history is not persistent.**
* **Database Storage**: Chat transcripts are **not** written to Supabase or any database.
* **Backend State**: **Stateless**. The server does not maintain session histories or multi-turn conversational chains. Each query is evaluated independently.
* **Client-Side State**: Message history exists only in React component memory (`useState`). Refreshing the browser resets the conversation.
* **Context Window**: While the backend is stateless, every request remains context-aware because the frontend injects the student's live readiness score, target role, critical skill gaps, and verified competencies directly into the prompt.
* **Embeddings & Vector Databases**: The chatbot does **not** use vector embeddings, FAISS, Pinecone, or RAG pipelines.

---

## 8. Security & Privacy Considerations

1. **Server-Side API Key Isolation**: The `GEMINI_API_KEY` is stored in the backend `.env` file and loaded into memory using `dotenv`. The frontend bundle contains zero references to the AI key.
2. **In-Memory File Processing**: Resumes uploaded via Multer are buffered in RAM (`multer.memoryStorage()`) and discarded after text extraction. No uploaded student resumes are stored unencrypted on the server's local filesystem.
3. **API Key Redaction in Error Logs**: `client.js` intercepts and redacts any error strings that could leak the API key:
   ```javascript
   const sanitizedMsg = (err.message || '').replace(apiKey, '[REDACTED_API_KEY]');
   ```
4. **Input Boundary Enforcement**: User-submitted text (such as resume text or interview answers) is delimited using triple quotes (`"""`) within prompt templates to mitigate prompt injection.
5. **Strict Student Authorization (RBAC)**: All routes modifying institutional data enforce `requireCollegeOrAdmin` middleware, preventing students from altering workshop catalogs, alert thresholds, or cohort records.

---

## 9. Limitations & Future Scope

To maintain technical credibility during academic review, the current system constraints are openly documented:

1. **Non-Deterministic Extraction**: Because LLMs are probabilistic, slight variations in resume phrasing may occasionally yield minor differences in extracted skill lists across independent runs.
2. **Text-Based PDF Dependency**: Resumes must contain selectable digital text. Image-based or scanned PDFs without an underlying OCR layer cannot be parsed by `pdf-parse`.
3. **External API Latency**: Cloud LLM inference introduces network latency (typically 800ms–2.0s). The frontend uses loading skeletons and typing indicators to keep the interface responsive.
4. **Stateless Sessions**: Because chat history is kept only in component state, conversation threads cannot be resumed across different devices or browser reloads.
5. **Static Industry Role Requirements**: Match scores are currently evaluated against curated JSON role definitions (`roleRequirements.json`) rather than dynamically scraped, real-time job listings.

### Future Architectural Enhancements
- Integrating **Tesseract.js OCR** to support scanned, image-only PDF resumes.
- Implementing **Vector Embeddings (pgvector)** to enable semantic search over live corporate job postings.
- Adding **PostgreSQL Chat Session Persistence** to allow students to review previous placement coaching conversations across sessions.

---

## 10. Summary & Evidence Index

### Quick Reference Table

| AI Subsystem | Model | Input | Output Format | Source File |
| :--- | :--- | :--- | :--- | :--- |
| **Resume Skill Extractor** | `gemini-3.5-flash-lite` | Plaintext resume | JSON `{ skills: [] }` | `backend/src/services/ai/resumeSkillAI.js` |
| **Role Match Explainer** | `gemini-3.5-flash-lite` | Score + Skill lists | JSON `{ explanation: "" }` | `backend/src/services/ai/roleMatchAI.js` |
| **What-If Explainer** | `gemini-3.5-flash-lite` | Skill + Delta array | JSON `{ explanation: "" }` | `backend/src/services/ai/whatIfAI.js` |
| **Roadmap Generator** | `gemini-3.5-flash-lite` | Role + Gap list | JSON matching Zod schema | `backend/src/services/ai/roadmapAI.js` |
| **Interview Drill Engine** | `gemini-3.5-flash-lite` | Role + Gap skill | JSON matching Zod schema | `backend/src/services/ai/interviewAI.js` |
| **Placement Coach Assistant**| `gemini-3.5-flash-lite` | Query + Student state | Conversational Markdown | `backend/src/routes/ai.routes.js` |

---

## 11. Important Verification Statement

> This document describes AI functionality based strictly on the current implementation of the Campus2Career codebase. Features that are not verified in the source code (such as persistent vector memory, RAG pipelines, or automated AI database administration) are explicitly excluded to maintain technical accuracy and integrity.
