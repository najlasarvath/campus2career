# Campus2Career AI

Project ID: HS112-Femora

Tagline: "From Skill Gaps to Industry Readiness"

Campus2Career AI is an AI-powered career-readiness and placement-intelligence platform connecting students, colleges, and industry. The platform helps students understand the gap between their current skills and the skills required for their desired career role, then guides them toward learning those missing skills through personalized roadmaps, accessible learning resources, and gap-specific mock interviews.

At the college level, aggregated skill-gap data helps identify common skill deficiencies across the campus. When 40% or more students lack a particular skill, the college dashboard marks that skill as "Workshop Required," enabling colleges to arrange focused training instead of generic workshops.

---

## Overview

Campus2Career AI is designed to close the gap between student ambition and market readiness.

The platform helps students:

- identify the skills required for a chosen career role
- compare those requirements with their current skills
- understand the most important missing skill to learn first
- access free-to-premium learning resources
- practice through AI-guided mock interviews
- demonstrate readiness and track improvement

The platform also helps colleges:

- monitor campus-wide skill trends
- identify common gaps among students
- flag skills that require targeted workshops
- issue skill-completion certificates once students demonstrate required learning

The platform supports companies by allowing them to define job requirements and receive skill-verified notifications when students demonstrate relevant skills.

---

## Problem Statement

Students often prepare for placements without knowing:

- which skills their desired role requires
- which skills they already have
- which skills they are missing
- which missing skill they should learn first
- where they can learn that skill affordably
- whether they can demonstrate that skill in practice

Colleges also lack visibility into the common skill gaps among their students.

As a result, students may prepare randomly while colleges may organize generic training.

Problem in one sentence:

"Students know the career they want but often do not know exactly which skills they lack, while colleges do not know which skills their students collectively need to improve."

---

## Solution

Campus2Career creates a continuous journey from skill identification to skill proof:

Industry Requirements
↓
Student Resume + Target Role
↓
AI Skill Analysis
↓
Role Match + Skill Gap
↓
AI Career Assistant
↓
Personalized Roadmap
↓
Free → Paid Learning Resources
↓
Learning
↓
Gap-Specific AI Mock Interview
↓
Evaluation
↓
Updated Readiness
↓
Skill Demonstrated
↓
College Skill Certificate
↓
Company Notification
↓
Campus Skill Heatmap
↓
40%+ Skill Gap
↓
Workshop Required

---

## Target Users

### 🎓 Students

Students can:

- upload their resume
- select their target career role
- see their role match score
- understand their skill gaps
- identify their highest-impact missing skill
- get a personalized learning roadmap
- find free resources before paid resources
- ask the AI Career Assistant for guidance
- take a gap-specific mock interview
- receive feedback and track readiness
- complete and demonstrate skills
- receive a college-issued skill completion certificate

### 🏫 Colleges / Placement Cells

Colleges can:

- see how many students have registered
- monitor aggregated skill gaps
- view campus skill-gap percentages
- identify skills requiring attention
- receive a "Workshop Required" alert when 40% or more students lack a skill
- organize targeted workshops
- track skill completion
- issue skill completion certificates

### 🏢 Companies

Companies can:

- define job roles
- add required skills
- specify required industry skills
- receive simulated skill-verified notifications when students demonstrate required skills

For the hackathon MVP, company notifications are implemented as a simulated notification panel.

---

## Key Features

### 1. Role Match & Delta Analysis

Students select a target role such as:

- Data Analyst
- Full Stack Developer
- AI/ML Engineer
- Backend Developer
- Cloud Engineer

The platform compares demonstrated student skills with required role skills.

Example:

Role: AI/ML Engineer

Match Score: 68%

Acquired Skills:

- Python
- SQL
- Git
- Statistics

Critical Gaps:

- Machine Learning
- Deep Learning

Secondary Skills:

- TensorFlow
- Docker

The platform clearly shows why the student has their current match score.

### 2. Highest-Impact Skill

Instead of overwhelming students with every missing skill, Campus2Career highlights the skill that should be learned first.

Example:

Highest-Impact Skill: Machine Learning

Current Match: 68%
Potential Match: 78%

The goal is to answer: "What should I learn first?"

### 3. AI Career Assistant

The Career Assistant provides personalized guidance based on:

- target role
- current skills
- critical gaps
- secondary gaps
- learning progress
- mock interview performance

Example questions:

- "What should I learn first?"
- "Why is my match score 68%?"
- "How can I improve my score?"
- "What should I practice today?"

### 4. Personalized Learning Roadmap

The platform generates a structured learning roadmap.

Example:

Week 1 — Machine Learning Fundamentals

Week 2 — Supervised Learning

Week 3 — Model Evaluation + Projects

Week 4 — Mock Interview

The roadmap can be updated based on remaining weaknesses.

### 5. Free-First Learning Resources

Resources are presented in increasing cost order:

FREE → LOW COST → MEDIUM COST → PREMIUM

Each resource can display:

- platform
- cost
- difficulty
- estimated learning time
- skill covered

The goal is to make career preparation accessible regardless of budget.

### 6. Career What-If Simulator

Students can explore how learning a skill could affect their readiness.

Example:

Current Match: 68%

If student learns Docker: 73%

This feature helps students understand the possible impact of learning different skills.

This is a frontend/demo simulation in the hackathon MVP.

### 7. Gap-Specific AI Mock Interview

Instead of generic interview questions, the platform focuses on the student's identified skill gaps.

Example:

- if the student's gap is Machine Learning, the interview asks Machine Learning-related questions
- if the gap is SQL, the interview asks SQL-related questions

The MVP demonstrates this through a simulated AI interview flow.

### 8. AI Interview Evaluation

The student receives category-based feedback such as:

- Technical Understanding: 78%
- Problem Solving: 71%
- Application: 62%
- Communication: 84%

The platform identifies the student's remaining weakness.

Example: "Main area to improve: Applying concepts to real-world problems."

The roadmap can then guide the student toward additional practice.

### 9. Dynamic Readiness

Example:

68% → Learning → Mock Interview → 78%

The hackathon MVP demonstrates this using frontend/local-state logic.

The actual production version can connect this to backend assessment data.

### 10. Skill Verification

Campus2Career distinguishes between:

- Claimed Skill: "I know Machine Learning."
- Demonstrated Skill: "I successfully demonstrated Machine Learning through learning and assessment."

Skill lifecycle:

Claimed → Learning → Practicing → Assessed → Demonstrated

### 11. College Skill Heatmap

The college dashboard displays aggregated skill gaps.

Example:

- Cloud Computing — 46%
- Docker — 42%
- Data Visualization — 35%
- DSA — 28%
- SQL — 21%
- Git — 12%

The data is aggregated rather than showing unnecessary individual student information.

### 12. 40% Workshop Trigger

Fixed rule:

If 40% or more students from a college lack a particular skill, the status becomes "Workshop Required."

Example:

Docker — 42% students lack the skill

⚠️ WORKSHOP REQUIRED

Status thresholds:

- 0–19%: Normal
- 20–39%: Monitor
- 40%+: Workshop Required

The college receives the alert and organizes the workshop.

IMPORTANT: Campus2Career does not automatically generate a workshop.

### 13. College Certificate

After a student successfully completes the required learning and assessment, the college can issue a certificate of skill completion.

The certificate contains:

- Student Name
- Completed Skill
- College Name
- Date
- Placement Officer

IMPORTANT: The company name is not displayed on the certificate.

### 14. Company Portal

Companies can create job requirements.

Example:

Role: Backend Developer

Required Skills:

- Python
- SQL
- REST API
- Docker
- Cloud

After a student demonstrates a required skill, the company portal can show a simulated notification:

🎯 SKILL VERIFIED

Student: Student ID
Role: Backend Developer
Skill: Docker ✓
Status: Successfully Demonstrated

---

## User Flow

### Student Flow

Register → College Association → Upload Resume → Select Target Role → AI Skill Analysis → Role Match → Skill Gap → Highest-Impact Skill → AI Career Assistant → Personalized Roadmap → Free Resources → Learn → Gap-Specific Mock Interview → Evaluation → Updated Readiness → Skill Demonstrated → College Certificate

### College Flow

Student Registration → College Student Count → Skill Data Aggregation → Campus Skill Heatmap → 40%+ Skill Gap? → Workshop Required Alert → College Organizes Workshop → Students Complete Training → Skill Completion → Certificate

### Company Flow

Create Company Account → Create Job Role → Add Required Skills → Students Target Role → Skill Gap Analysis → Student Learning → Skill Demonstration → Skill Verified Notification

---

## Architecture

```text
                     CAMPUS2CAREER AI
                            |
         ┌──────────────────┼──────────────────┐
         ↓                  ↓                  ↓
      STUDENT            COLLEGE             COMPANY
         |                  |                  |
         └──────────────────┼──────────────────┘
                            ↓
                       AI ENGINE
                            |
              ┌─────────────┼─────────────┐
              ↓             ↓             ↓
         Skill Analysis   Role Match    Roadmap
              |             |             |
              └─────────────┼─────────────┘
                            ↓
                     Learning Resources
                            ↓
                     Mock Interview
                            ↓
                     Skill Demonstration
                            |
              ┌─────────────┴─────────────┐
              ↓                           ↓
          COLLEGE                      COMPANY
        Certificate                  Notification
              |
              ↓
       Campus Skill Heatmap
              |
           40%+ GAP
              |
        Workshop Required
```

---

## Technology Stack

| Category | Planned for Full Platform | Currently Implemented in Hackathon MVP |
| --- | --- | --- |
| Frontend | React, Tailwind CSS, React Router | React, Tailwind CSS, React Router |
| Visualization | Recharts | Recharts |
| Icons | Lucide React | Lucide React |
| Backend | Node.js, Express, Supabase PostgreSQL | Not implemented as a live backend in the MVP |
| AI | Gemini API / OpenAI API | Simulated AI responses in frontend flow |
| Resume Processing | pdf-parse | Simulated / local UI flow |
| Certificates | jsPDF | UI-based certificate preview/simulation |
| Deployment | Vercel, Render / Railway | Frontend demo deployment only |

IMPORTANT: The table above clearly distinguishes technologies planned for the full platform from what is currently implemented in the hackathon frontend MVP.

---

## Hackathon MVP

### Implemented / Demo Scope

- Role-based Student / College / Company login UI
- Student dashboard
- Role match UI
- Skill-gap visualization
- Learning roadmap
- Free-first resource display
- AI Career Assistant UI
- Gap-specific mock interview UI
- Mock interview evaluation UI
- Dynamic readiness demonstration
- College dashboard
- Campus skill heatmap
- 40% workshop alert
- Company requirements UI
- Company notification panel
- Certificate UI

### Simulated for MVP

- AI responses
- Authentication
- Resume processing where backend is unavailable
- Company notifications
- Dynamic score calculation
- External resource integration

Do not present simulated functionality as production functionality.

---

## Demo Journey

Student logs in
↓
Selects AI/ML Engineer
↓
Receives 68% Role Match
↓
Sees critical skill gaps
↓
Identifies Machine Learning as highest-impact skill
↓
Gets personalized roadmap
↓
Sees free learning resources
↓
Uses AI Career Assistant
↓
Completes gap-specific mock interview
↓
Receives evaluation
↓
Readiness changes from 68% → 78%
↓
Skill demonstrated
↓
College can issue certificate
↓
College dashboard reflects campus skill data
↓
40%+ gap triggers Workshop Required

---

## USP

Short USP: "From Skill Gap to Skill Proof."

Full USP: "Campus2Career does not just tell students what skills they are missing. It tells them what to learn, prioritizes accessible resources, tests their understanding through gap-specific assessment, tracks their readiness, and connects demonstrated skills with colleges and industry."

---

## Why Campus2Career?

Traditional placement preparation often separates:

- resume building
- job searching
- learning
- interview preparation
- college training

Campus2Career connects these into one continuous journey:

Identify → Learn → Practice → Demonstrate → Improve → Verify

At the same time, colleges receive an aggregate view of campus-level skill gaps.

---

## Future Roadmap

1. Real AI skill extraction
2. Live job-description ingestion
3. Real company integrations
4. Real authentication
5. LMS / ERP integration
6. QR-verified certificates
7. Advanced skill assessments
8. Voice-based AI mock interviews
9. Real-time industry skill-demand analysis
10. Before/after training analytics
11. Automated recruitment workflows

---

## Setup / Local Run

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
cd frontend
npm install
```

### Run locally

```bash
npm run dev
```

### Production build

```bash
npm run build
```

This project is currently designed as a frontend demo experience for a hackathon MVP. The application uses local mock/demo data to simulate flows and role-based interactions without requiring a live backend or external authentication service.

---

## Team

This project is developed as a hackathon effort for the Campus2Career AI platform. Team member details were not provided for this repository README.

---

## Summary

Campus2Career AI addresses a widely recognized problem in placement preparation: students often do not know which skills to prioritize, while colleges cannot clearly see the most common campus-wide skill gaps. The platform creates a structured, end-to-end career-readiness journey that helps students learn, practice, demonstrate, and verify skills while giving colleges and companies actionable visibility into readiness.

The hackathon MVP successfully demonstrates the core experience through a frontend-only, simulated flow designed for presentation, validation, and concept showcasing at a national-level event.
