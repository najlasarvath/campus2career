# System Invariants & Business Rules — Campus2Career

This document defines the authoritative **business rules, architectural invariants, and governance policies** of the Campus2Career platform. Every component in the frontend, backend, and database layers must adhere strictly to these rules.

---

## 1. Core Architectural Invariants

### Invariant 1: The Hybrid Intelligence Separation
Campus2Career enforces a strict separation between **generative reasoning** and **deterministic computation**:
- **Generative AI (Google Gemini 3.5 Flash Lite)** is reserved exclusively for:
  - Unstructured resume text interpretation and entity extraction.
  - Personalized 7-day adaptive learning curriculum generation.
  - Qualitative natural-language evaluation of open-ended technical interview answers.
  - Contextual natural-language explanations of role scores and "What-If" simulations.
  - Interactive career coaching dialogue.
- **Deterministic Software Engineering (JavaScript / PostgreSQL)** is strictly required for:
  - Mathematical role match scoring.
  - Institutional cohort skill deficit calculations.
  - Alert threshold evaluation (40% rule).
  - Role-Based Access Control (RBAC) and authorization checks.
  - Workshop video tracking and assessment pass/fail grading.
  - Authentic vector PDF certificate rendering.
*Rule: Under no circumstances should an LLM be used to calculate mathematical scores, evaluate institutional deficit percentages, or enforce access control.*

### Invariant 2: Zero-Client Credential Isolation
- `GEMINI_API_KEY` and privileged database keys (`SUPABASE_SERVICE_ROLE_KEY`) must exist solely within `backend/.env`.
- The frontend client must never import, transmit, or expose AI credentials.
- All client interactions with AI features must be routed through backend Express API endpoints (`/api/ai/*`).
- All server error handlers must sanitize error strings, replacing detected API keys with `[REDACTED_API_KEY]`.

---

## 2. Scoring & Qualification Invariants

### Invariant 3: Deterministic 70/30 Role Match Scoring
Every candidate's qualification against a target role is calculated mathematically in `matchingEngine.js` using the following formula:

$$\text{Core Score} = \left( \frac{\text{Matched Core Skills}}{\text{Total Required Core Skills}} \right) \times 70$$

$$\text{Secondary Score} = \left( \frac{\text{Matched Secondary Skills}}{\text{Total Required Secondary Skills}} \right) \times 30$$

$$\text{Total Match Percentage} = \text{Round}(\text{Core Score} + \text{Secondary Score})$$

- **Core Skills (70%)**: Mandatory competencies defining the baseline job requisition (e.g., SQL and Python for a Data Analyst).
- **Secondary Skills (30%)**: Supplementary tools providing candidate distinction (e.g., Tableau or Docker).
- **Boundaries**: The final score must strictly clamp between `0` and `100`.
- Missing core competencies are classified as **Critical Gaps**; missing secondary competencies are classified as **Secondary Gaps**.

### Invariant 4: Canonical Skill Normalization
Prior to matching or deficit calculations, all skill strings must pass through `normalizeSkill()`:
- Case-insensitivity is enforced (`trim().toLowerCase()`).
- Standard aliases must resolve to their canonical representation (e.g., `reactjs` $\to$ `react`, `nodejs` $\to$ `node.js`, `postgres` $\to$ `postgresql`, `rest api` $\to$ `rest apis`).

---

## 3. Institutional Analytics & Alert Invariants

### Invariant 5: Accurate Cohort Denominator
In `analyticsController.js` and `collegeService.js`, the cohort size (`totalStudents`) must be derived dynamically from the actual number of registered students retrieved from the Supabase `students` table:
$$\text{Deficit Percentage} = \left( \frac{\text{totalStudents} - \text{studentsWithSkill}}{\text{totalStudents}} \right) \times 100$$
*Rule: The denominator must never be hardcoded, faked, or inconsistent across analytics endpoints.*

### Invariant 6: Canonical Skill Catalog Consistency
To prevent naming discrepancies across screens:
- The 12 benchmark skills in `CANONICAL_SKILL_CATALOG` (`Power BI`, `SQL`, `Python`, `Docker`, `Excel`, `React`, `Node.js`, `JavaScript`, `PostgreSQL`, `Git`, `Tableau`, `Data Visualization`) serve as the single source of truth.
- The Campus Overview, Skill Heatmap, and Skill Deficit Alerts must derive their data from this identical catalog.

### Invariant 7: The 40% Deficit Alert Threshold
- **Threshold**: Configured via `process.env.COLLEGE_ALERT_THRESHOLD || '40'`.
- **Classification**:
  - `deficitPercentage >= 40%`: Flagged as `isCritical = true` (**Critical Deficit**).
  - `deficitPercentage < 40%`: Flagged as `isCritical = false` (**Competency Healthy**).
- **Two-Card Render Constraint**:
  - To prevent dashboard clutter, the UI must render strictly **two representative alert cards**:
    1. **Card 1 (Critical)**: The highest-priority skill exceeding 40% deficit, prioritizing actionable conducted workshops.
    2. **Card 2 (Healthy)**: The representative competency performing safely below the 40% threshold.

---

## 4. Workshop & Certification Invariants

### Invariant 8: Video Prerequisite & Completion Tracking
- Each industry readiness workshop contains 2 structured masterclass videos.
- Video progress is tracked via boolean flags (`video1_watched`, `video2_watched`).
- The post-workshop verification assessment unlocks **only** when both videos are completed (`videosCompleted = true`).

### Invariant 9: 70% Assessment Passing Benchmark
- Configured via `process.env.WORKSHOP_PASSING_SCORE || '70'`.
- A student submitting an assessment must achieve a evaluated score $\ge 70\%$ to verify the competency.
- Upon passing:
  1. The skill is marked as `acquired` in Supabase `skill_progress`.
  2. A verified certificate record is created in Supabase `certificates`.
  3. An authentic vector PDF certificate is immediately available for download.
- If the student scores $< 70\%$, the skill status transitions to `Remediation_Needed`, and concrete practice challenges are assigned.

### Invariant 10: Zero-Dependency Vector PDF Generation
- Certificates must be rendered as authentic vector PDF-1.4 documents directly in memory using `backend/src/utils/pdfGenerator.js`.
- The generator must not depend on headless browsers (Puppeteer), canvas libraries, or external printing services.
- Dimensions must strictly adhere to Landscape A4 (842 $\times$ 595 points) with dual navy/gold vector borders and dynamic text centering.

---

## 5. Security & Access Control Invariants

### Invariant 11: Student Read-Only College Data Access
- **Permitted Student Reads**: Students have full authorization to view the College Dashboard, Campus Skill Heatmap, Skill Deficit Alerts, and Workshop Catalogs in read-only mode to understand institutional trends.
- **Strict Mutation Barrier**: Any HTTP mutation (`POST`, `PUT`, `PATCH`, `DELETE`) directed at college-owned administrative endpoints by a user with the `student` role is blocked at the Express middleware layer (`requireCollegeOrAdmin`) with an immediate **HTTP 403 Forbidden**:
  ```json
  {
    "success": false,
    "message": "Forbidden: Students have read-only access to college data and cannot create, modify, or delete college-owned resources."
  }
  ```

### Invariant 12: Memory-Safe File Processing
- All resume uploads must use Multer in-memory storage (`multer.memoryStorage()`).
- File uploads are validated to enforce `application/pdf` MIME types.
- Uploaded binary data resides only as transient RAM buffers during text extraction. No unencrypted student resumes are persisted to local server disk storage.

---

## 6. AI Output & Chatbot Invariants

### Invariant 13: Strict Zod Schema Validation with Retry
- Every generative AI response must request structured JSON mode (`responseMimeType: 'application/json'`).
- Raw outputs must pass through `cleanJSON()` and be validated against a strict Zod schema before consumption.
- If parsing fails, the system executes an automatic **1-retry backoff loop** (1000ms delay).
- In the event of persistent model exhaustion, deterministic fallback curricula and evaluations are returned to ensure 100% application uptime.

### Invariant 14: Stateless Chatbot Architecture
- The AI Placement Coach on the backend is **stateless**: conversation transcripts are not stored in Supabase or any database.
- Chat history is maintained strictly within active client React component memory (`useState`).
- Every query is made context-aware by injecting live student metrics (`studentName`, `target_role`, `match_score`, `critical_gaps`, `acquired_skills`, `target_company`) into the system prompt.
- The platform does not use, and does not claim to use, vector embeddings or RAG databases.

---

## Summary Matrix

| Invariant Area | Key Metric / Rule | Enforced In |
| :--- | :--- | :--- |
| **Role Scoring** | 70% Core / 30% Secondary (0–100%) | `matchingEngine.js` |
| **Deficit Formula** | `((total - withSkill) / total) * 100` | `analyticsController.js` |
| **Alert Threshold** | 40% Deficit $\to$ 2 Representative Cards | `analyticsController.js` |
| **Passing Score** | $\ge 70\%$ score for skill verification | `workshopController.js` |
| **RBAC Security** | HTTP 403 on student college mutations | `authCheck.js` |
| **AI Reliability** | Native JSON + Zod Schema + 1-Retry | `client.js` |
| **Chat Memory** | Stateless backend + React local state | `ai.routes.js`, `AssistantChat.jsx` |
