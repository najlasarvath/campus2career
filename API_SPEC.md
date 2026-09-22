# Campus2Career — API Specification

Shared contract between `/frontend` and `/backend`. Any modifications to requests or responses must be updated here first before implementation.

---

## 1. Authentication

### Student Signup
- **Endpoint**: `POST /api/auth/signup`
- **Description**: Registers a new student profile in the system and creates Supabase auth credentials.
- **Request Body**:
  ```json
  {
    "email": "student@college.edu",
    "password": "securePassword123",
    "fullName": "Jane Doe",
    "targetRole": "Full Stack Developer"
  }
  ```
- **Response**:
  - `201 Created`:
    ```json
    {
      "success": true,
      "user": {
        "id": "uuid-here",
        "email": "student@college.edu",
        "fullName": "Jane Doe",
        "targetRole": "Full Stack Developer"
      },
      "token": "jwt-token-string"
    }
    ```
  - `400 Bad Request`:
    ```json
    {
      "success": false,
      "message": "Invalid input data or email already in use"
    }
    ```

---

## 2. Resume & Skills

### Resume Upload
- **Endpoint**: `POST /api/resumes/upload`
- **Description**: Uploads a student's resume PDF via `multipart/form-data` and parses raw text content via `pdf-parse`.
- **Request**:
  - `Content-Type`: `multipart/form-data`
  - `file`: Resume file (`.pdf`)
- **Response**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "resumeId": "uuid-or-string",
      "textLength": 1500,
      "extractedText": "Parsed resume text preview..."
    }
    ```
  - `400 Bad Request`:
    ```json
    {
      "success": false,
      "message": "Only PDF files are supported or file missing"
    }
    ```

### Skill Extraction
- **Endpoint**: `POST /api/skills/extract`
- **Description**: Uses Gemini API to extract technical skills, soft skills, and experience indicators from parsed resume text against role requirements.
- **Request Body**:
  ```json
  {
    "resumeText": "Parsed resume text...",
    "targetRole": "Full Stack Developer"
  }
  ```
- **Response**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "extractedSkills": ["React", "Node.js", "PostgreSQL", "Git"],
      "missingSkills": ["Docker", "Redis", "TypeScript"],
      "matchPercentage": 65
    }
    ```
  - `500 Internal Server Error`:
    ```json
    {
      "success": false,
      "message": "Failed to extract skills with AI provider"
    }
    ```

---

## 3. Career Roadmap

### Roadmap Generation
- **Endpoint**: `POST /api/roadmaps/generate`
- **Description**: Uses Gemini API to generate a personalized week-by-week skill development roadmap based on skill gaps.
- **Request Body**:
  ```json
  {
    "targetRole": "Full Stack Developer",
    "currentSkills": ["React", "Node.js", "PostgreSQL"],
    "missingSkills": ["Docker", "Redis", "TypeScript"],
    "weeksAvailable": 8
  }
  ```
- **Response**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "roadmap": {
        "title": "8-Week Full Stack Mastery Roadmap",
        "targetRole": "Full Stack Developer",
        "milestones": [
          {
            "week": 1,
            "topic": "TypeScript Fundamentals & Migration",
            "resources": ["TypeScript Handbook"],
            "actionItem": "Convert a React component to TypeScript"
          }
        ]
      }
    }
    ```

---

## 4. Analytics & Heatmap

### Heatmap Data
- **Endpoint**: `GET /api/analytics/heatmap`
- **Description**: Fetches aggregate campus skill distribution and role readiness metrics for visual rendering via Recharts.
- **Query Parameters**:
  - `role` *(optional)*: Filter by target role
- **Response**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "skills": [
        { "skill": "React", "studentCount": 120, "demandScore": 90 },
        { "skill": "Node.js", "studentCount": 85, "demandScore": 85 },
        { "skill": "Docker", "studentCount": 25, "demandScore": 80 }
      ],
      "roleReadiness": [
        { "role": "Frontend Developer", "averageReadiness": 72 },
        { "role": "Backend Developer", "averageReadiness": 58 }
      ]
    }
    ```
