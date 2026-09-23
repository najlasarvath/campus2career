# API Specification & Security Architecture — Campus2Career

This document is the authoritative specification for all REST API endpoints, request/response contracts, authentication mechanisms, and security controls in the Campus2Career platform.

---

## 1. Security Architecture & Access Control

### 1.1. Authentication Architecture
- **Provider**: Supabase Auth (PostgreSQL).
- **Mechanism**: Cryptographic JWT Bearer Tokens.
- **Header**: All protected endpoints require `Authorization: Bearer <jwt_token>`.
- **Validation**: [authCheck.js](file:///c:/Users/user/HS112-Femora/backend/src/middleware/authCheck.js) verifies tokens using `supabase.auth.getUser(token)`. Valid tokens attach the user record to `req.user` and `req.userId`.
- **Public & Hybrid Routes**: Routes handling unauthenticated onboarding use `optionalAuth`, resolving credentials if present without failing anonymous exploration.

### 1.2. Role-Based Access Control (RBAC)
The application enforces strict role separation between three distinct user personas:
1. **Student (`role: 'student'`)**:
   - Access to personal dashboard, resume parsing, AI roadmaps, interview drills, and certificates.
   - **Read-Only College Access**: Full permission to inspect the College Dashboard, Skill Heatmaps, Deficit Alerts, and Workshop Catalogs.
   - **Mutation Barrier**: Middleware `requireCollegeOrAdmin` strictly intercepts and blocks any student attempt to execute `POST`, `PUT`, `PATCH`, or `DELETE` requests on college-owned resources with an immediate **HTTP 403 Forbidden**.
2. **College Administrator (`role: 'college'`)**:
   - Permission to schedule workshops, update syllabus requirements, and monitor institutional analytics.
3. **Company Recruiter (`role: 'company'`)**:
   - Permission to publish and update hiring requirements (`POST /api/companies/requirements`). Students attempting this mutation are blocked by `requireCompanyOrAdmin`.

```
                    INCOMING HTTP REQUEST
                             │
                             ▼
                    [authCheck Middleware]
                 Validates Supabase Bearer JWT
                             │
            ┌────────────────┴────────────────┐
            ▼ (Public / Student Safe)         ▼ (Institutional Mutation)
     Execute Controller             [requireCollegeOrAdmin]
                                              │
                                   ┌──────────┴──────────┐
                                   ▼ (Role == 'student') ▼ (Role == 'college')
                             HTTP 403 Forbidden    Execute Controller
```

### 1.3. API Key & Credential Isolation
- `GEMINI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` reside exclusively in `backend/.env`.
- The frontend client never connects directly to Google Gemini or the Supabase Service Role; all operations proxy through the Express API.
- All backend error handlers sanitize messages via regex: `(err.message || '').replace(apiKey, '[REDACTED_API_KEY]')`.

### 1.4. In-Memory File Upload Safety
- Resume PDF uploads use Multer with in-memory storage (`multer.memoryStorage()`).
- File buffers are held temporarily in RAM during `pdf-parse` execution and immediately released. No student files are written to unencrypted local server disk storage.

---

## 2. API Conventions & Standard Envelopes

- **Base URL**: `http://localhost:5000/api`
- **Default Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>` (on protected routes)
- **Standard Success Envelope**:
  ```json
  {
    "success": true,
    "...data": "..."
  }
  ```
- **Standard Error Envelope**:
  ```json
  {
    "success": false,
    "message": "Descriptive error message or Zod validation summary"
  }
  ```

---

## 3. Complete API Endpoint Reference

### 3.1. Authentication Routes (`/api/auth`)

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/signup` | `POST` | Public | Registers a new user and creates corresponding Supabase auth credentials. |
| `/api/auth/login` | `POST` | Public | Authenticates credentials and returns a cryptographic JWT token and user profile. |
| `/api/auth/me` | `GET` | Authenticated | Retrieves the currently authenticated user's profile and metadata. |
| `/api/auth/logout` | `POST` | Public | Terminates the active session. |

#### Request / Response Example: Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "student@apex.edu",
  "password": "SecurePassword123!"
}
```
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "email": "student@apex.edu",
    "role": "student",
    "full_name": "Jane Doe",
    "college_id": "c1d2e3f4-..."
  }
}
```

---

### 3.2. Resume & Skill Ingestion (`/api/resumes`, `/api/skills`)

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/resumes/upload` | `POST` | Public / Auth | Uploads PDF resume via `multipart/form-data`, parses text via `pdf-parse`, extracts skills, and persists to database. |
| `/api/skills/extract` | `POST` | Public / Auth | Extracts verified technical skills from plaintext and computes initial role match. |
| `/api/skills/roles` | `GET` | Public | Retrieves all standard industry target roles and core/secondary skill requirements. |
| `/api/skills/match` | `POST` | Public / Auth | Deterministically calculates 70/30 match percentage and diagnoses gaps for given skills. |

#### Request / Response Example: Match Calculation
```http
POST /api/skills/match
Content-Type: application/json

{
  "candidateSkills": ["Python", "SQL", "Git"],
  "targetRole": "Data Analyst"
}
```
```json
{
  "success": true,
  "roleId": "data-analyst",
  "roleTitle": "Data Analyst",
  "matchPercentage": 53,
  "matchedSkills": ["Python", "SQL"],
  "missingSkills": ["Power BI", "Excel", "Tableau", "Statistics"],
  "criticalGaps": ["Power BI", "Excel"],
  "secondaryGaps": ["Tableau", "Statistics"]
}
```

---

### 3.3. Generative AI Endpoints (`/api/ai`)

All AI endpoints validate request bodies using Zod schemas and enforce structured JSON responses with automated retries.

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/ai/chat` | `POST` | Public / Auth | Real-time AI Placement Coach answering student queries with injected profile context. |
| `/api/ai/explain-match` | `POST` | Public / Auth | Generates qualitative, encouraging natural-language explanation of a role match score. |
| `/api/ai/what-if/explain` | `POST` | Public / Auth | Explains strategic career leverage of learning a hypothetical skill based on score deltas. |
| `/api/ai/roadmap` | `POST` | Public / Auth | Generates an adaptive 7-day learning schedule targeting diagnosed skill gaps. |
| `/api/ai/roadmap/regenerate`| `POST` | Public / Auth | Re-evaluates learning schedule after assessment, injecting targeted remediation tasks. |
| `/api/ai/interview/questions`| `POST`| Public / Auth | Generates deep technical interview questions testing mechanisms, scenarios, and debugging. |
| `/api/ai/interview/evaluate` | `POST`| Public / Auth | Evaluates open-ended candidate answers across a 4-dimensional rubric (0–100) with diagnostic concepts. |

#### Request / Response Example: AI Interview Evaluation
```http
POST /api/ai/interview/evaluate
Content-Type: application/json

{
  "question": "Explain how window functions evaluate in relation to GROUP BY, and how ROW_NUMBER differs from DENSE_RANK.",
  "answer": "Window functions execute in SELECT after GROUP BY. ROW_NUMBER gives sequential numbers while DENSE_RANK handles ties without gaps.",
  "targetRole": "Data Analyst",
  "gapSkill": "SQL"
}
```
```json
{
  "success": true,
  "evaluation": {
    "technical": 86,
    "problemSolving": 80,
    "application": 78,
    "communication": 88,
    "correctConcepts": ["Correct execution phase after GROUP BY", "Accurate distinction between ROW_NUMBER and DENSE_RANK"],
    "incorrectConcepts": [],
    "missingConcepts": ["Omitted mention of OVER (PARTITION BY ... ORDER BY ...) syntax"],
    "weakAreas": ["Partitioning mechanics"],
    "remainingWeakness": "Sound theoretical understanding; needs more attention to PARTITION BY clause mechanics.",
    "betterApproach": "A comprehensive answer notes that window functions execute after HAVING and WHERE...",
    "recommendedPractice": "Practice analytical queries using PARTITION BY and running totals in PostgreSQL."
  }
}
```

---

### 3.4. Institutional Analytics Endpoints (`/api/analytics`)

*Analytics routes are read-only; all mutation verbs (`POST`, `PUT`, `PATCH`, `DELETE`) are blocked with HTTP 403.*

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/analytics/heatmap` | `GET` | Public / Auth | Computes aggregate cohort competency distribution, average readiness, and 40% deficit alerts. |
| `/api/analytics/alerts` | `GET` | Public / Auth | Returns strictly two representative alerts (1 critical $\ge 40\%$, 1 healthy $< 40\%$) and actionable workshop links. |

#### Request / Response Example: Skill Heatmap & Alerts
```http
GET /api/analytics/heatmap?collegeId=apex-institute-id&threshold=40
```
```json
{
  "success": true,
  "totalStudents": 28,
  "threshold": 40,
  "allSkills": [
    {
      "skill": "Power BI",
      "studentCount": 9,
      "lackingCount": 19,
      "deficitPercentage": 67.9,
      "isCritical": true,
      "status": "Critical Deficit",
      "hasWorkshop": true,
      "workshopId": "ws-powerbi-mastery"
    },
    {
      "skill": "Git",
      "studentCount": 24,
      "lackingCount": 4,
      "deficitPercentage": 14.3,
      "isCritical": false,
      "status": "Healthy",
      "hasWorkshop": false
    }
  ],
  "representativeAlerts": [
    {
      "skill": "Power BI",
      "deficitPercentage": 67.9,
      "isCritical": true,
      "alertMessage": "🚨 Campus Skill Alert: 67.9% of students lack Power BI.",
      "hasWorkshop": true
    },
    {
      "skill": "Git",
      "deficitPercentage": 14.3,
      "isCritical": false,
      "alertMessage": "Competency Healthy: 14.3% lack Git."
    }
  ]
}
```

---

### 3.5. Workshop & Video Learning Routes (`/api/workshops`)

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/workshops` | `GET` | Public / Auth | Lists all scheduled and conducted industry readiness workshops. |
| `/api/workshops/conducted` | `GET` | Public / Auth | Lists workshops with available video masterclasses and assessments. |
| `/api/workshops/:id` | `GET` | Public / Auth | Retrieves specific workshop details, video links, and learning objectives. |
| `/api/workshops/:id/enroll` | `POST` | Public / Auth | Enrolls candidate in workshop and initializes progress state. |
| `/api/workshops/:id/videos` | `POST` | Public / Auth | Records student video watch progress (`video1_watched`, `video2_watched`). |
| `/api/workshops/:id/assess` | `POST` | Public / Auth | Submits 2-question quiz; passing ($\ge 70\%$) marks skill verified and auto-issues certificate. |
| `/api/workshops` | `POST` | College Admin | Schedules a new workshop. Blocked for students (HTTP 403). |
| `/api/workshops/:id` | `PUT/DELETE` | College Admin | Modifies or deletes workshop. Blocked for students (HTTP 403). |

---

### 3.6. Certificate & Vector PDF Generation (`/api/certificates`)

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/certificates` | `GET` | Public / Auth | Lists all issued completion certificates across the institution. |
| `/api/certificates/:id` | `GET` | Public / Auth | Retrieves verified certificate metadata and verification hash. |
| `/api/certificates/:id/pdf` | `GET` | Public / Auth | Streams an RFC-compliant landscape A4 vector PDF directly to the browser (`Content-Type: application/pdf`). |
| `/api/certificates/generate` | `POST` | Public / Auth | Issues certificate for passed assessment. |

---

### 3.7. Company Requisition Routes (`/api/companies`)

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/companies/requirements` | `GET` | Public / Auth | Lists published employer job requisitions and required skills. |
| `/api/companies/requirements` | `POST` | Company Recruiter | Publishes new hiring requisition. Blocked for students (HTTP 403). |

---

### 3.8. System Health Endpoint

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/health` | `GET` | Public | Returns server health, timestamp, and Supabase connection status. |

---

## 4. Standard HTTP Status Codes

| Code | Status | Meaning in Campus2Career |
| :--- | :--- | :--- |
| **200** | `OK` | Request succeeded; returned JSON payload or streamed PDF. |
| **201** | `Created` | New resource created (User registration, Certificate issuance). |
| **400** | `Bad Request` | Validation failure (Missing parameters, invalid Zod payload, non-PDF file). |
| **401** | `Unauthorized` | Missing, expired, or cryptographically invalid Bearer JWT token. |
| **403** | `Forbidden` | Access denied (Student attempting college mutation, company requirement tampering). |
| **404** | `Not Found` | Target resource does not exist (Unknown role ID, missing workshop ID). |
| **500** | `Internal Server Error` | Unhandled backend exception (sanitized to prevent API key leakage). |
