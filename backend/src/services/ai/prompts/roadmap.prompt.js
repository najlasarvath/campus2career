/**
 * Prompt template for daily adaptive career tasks and roadmap generation.
 * Generates both daily tasks (Day 1..N) and backward-compatible weekly milestones.
 *
 * @param {Object} params
 * @param {string} params.targetRole - Target career role
 * @param {string[]} params.currentSkills - Verified candidate skills / resume skills
 * @param {string[]} params.missingSkills - Gap skills to address
 * @param {number} [params.weeksAvailable=4] - Target timeline
 * @returns {string}
 */
function buildGenerateRoadmapPrompt({ targetRole, currentSkills = [], missingSkills = [], weeksAvailable = 4 }) {
  const weeks = weeksAvailable || 4;
  const daysCount = 7;

  return `You are a curriculum architect and technical career mentor.
Create an adaptive, structured daily learning roadmap for a student aiming to become a "${targetRole}".
Generate a progressive sequence of 7 DAILY tasks (Day 1 to Day 7) directly targeting the student's critical skill gaps.

Candidate Profile:
- Target Role: "${targetRole}"
- Current Verified / Resume Skills: ${currentSkills.length > 0 ? currentSkills.join(', ') : 'None specified'}
- Missing Skills to Master: ${missingSkills.length > 0 ? missingSkills.join(', ') : 'Industry Core Skills'}
- Total Sprints: ${weeks} Weeks (7 Daily Learning Units + ${weeks} Weekly Milestones)

Requirements:
1. Break down learning into daily, achievable units (e.g., Day 1: Fundamentals, Day 2: Operators/Filtering, Day 3: Relations/Joins, Day 4: Aggregations, Day 5: Practice Challenge, Day 6: Mini-Project, Day 7: Assessment).
2. For each daily task provide:
   - "day": integer (1 to ${daysCount})
   - "skill": specific skill/technology name (e.g. "SQL", "TypeScript", "Power BI")
   - "title": concise, descriptive task title (e.g. "Day 1 — SQL Fundamentals & Relational Design")
   - "description": clear summary of technical concepts to master
   - "duration": estimated time (e.g. "30 mins", "45 mins", "60 mins")
   - "learningResource": documentation link or study resource (e.g. "PostgreSQL Official Documentation")
   - "practiceActivity": hands-on exercise or challenge to complete
   - "assessment": quick check question to self-assess understanding
3. For backward compatibility, also provide a "milestones" array summarizing each week (week 1 to ${weeks}) with "week", "topic", "resources" (string array), and "actionItem".

Respond ONLY with valid JSON matching this schema:
{
  "title": "${weeks}-Week ${targetRole} Daily Mastery Sprint",
  "targetRole": "${targetRole}",
  "tasks": [
    {
      "day": 1,
      "skill": "SQL",
      "title": "Day 1 — SQL Fundamentals & Relational Schema",
      "description": "Understand relational database tables, primary/foreign keys, and data types.",
      "duration": "30 mins",
      "learningResource": "PostgreSQL Documentation - Chapter 2 SQL Language",
      "practiceActivity": "Write basic CREATE TABLE statements and insert sample records",
      "assessment": "What is the difference between CHAR and VARCHAR?"
    },
    {
      "day": 2,
      "skill": "SQL",
      "title": "Day 2 — SELECT Queries, Filtering & Sorting",
      "description": "Master data retrieval using WHERE, LIKE, IN, BETWEEN, and ORDER BY.",
      "duration": "45 mins",
      "learningResource": "PostgreSQL Tutorial - Querying Data",
      "practiceActivity": "Execute 5 queries filtering by multiple conditions and sorting results",
      "assessment": "How does NULL comparison work in WHERE clauses?"
    }
  ],
  "milestones": [
    {
      "week": 1,
      "topic": "SQL & Relational Foundations",
      "resources": ["PostgreSQL Docs", "SQL Tutorial"],
      "actionItem": "Design relational schema and execute foundational queries"
    }
  ]
}`;
}

/**
 * Prompt template for generating targeted remedial daily practice tasks when an assessment reveals a persistent gap.
 *
 * @param {Object} params
 * @param {string} params.skill - The skill where gap persists
 * @param {string[]} [params.weakAreas] - Specific weak areas identified in assessment
 * @param {number} [params.startDay=8] - Starting day number for remediation
 * @returns {string}
 */
function buildRemedialTasksPrompt({ skill, weakAreas = [], startDay = 1 }) {
  const weakAreasStr = weakAreas.length > 0 ? weakAreas.join(', ') : 'Foundational application';

  return `You are a technical career mentor.
A student took a technical assessment for the skill "${skill}", but a skill gap remains in these areas:
Weak Areas: ${weakAreasStr}

Generate 3 targeted, intensive REMEDIAL daily practice tasks to close this exact deficit without moving on.

For each remedial task provide:
- "day": sequential integer starting at ${startDay}
- "skill": "${skill}"
- "title": descriptive remedial task title
- "description": focused explanation tackling the specific weakness
- "duration": "45 mins" or "60 mins"
- "learningResource": targeted technical guide
- "practiceActivity": rigorous coding/querying challenge
- "assessment": diagnostic verification prompt
- "isRemedial": true

Respond ONLY with valid JSON matching this schema:
{
  "skill": "${skill}",
  "remedialTasks": [
    {
      "day": ${startDay},
      "skill": "${skill}",
      "title": "Targeted Remediation — ${skill} Deep-Dive Lab",
      "description": "Reinforce concepts regarding ${weakAreasStr}.",
      "duration": "45 mins",
      "learningResource": "Official Guide & Pattern Reference",
      "practiceActivity": "Build hands-on scenario resolving edge cases",
      "assessment": "Explain resolution to the identified weakness",
      "isRemedial": true
    }
  ]
}`;
}

/**
 * Prompt template for regenerating a roadmap incorporating a newly detected weakness.
 */
function buildRegenerateRoadmapPrompt({ existingRoadmap, newWeakness }) {
  const roadmapJson = typeof existingRoadmap === 'string'
    ? existingRoadmap
    : JSON.stringify(existingRoadmap, null, 2);

  return `You are a curriculum architect and technical career mentor.
A student is currently following this career roadmap, but an assessment revealed a specific weakness:
Weakness to Address: "${newWeakness}"

Existing Roadmap:
"""
${roadmapJson}
"""

Instructions:
1. Insert corrective daily learning tasks specifically remedying "${newWeakness}".
2. Do NOT discard prior completed progress.
3. Keep day numbers sequential.
4. Return both "tasks" and "milestones".

Respond ONLY with valid JSON matching this schema:
{
  "title": "Updated Roadmap incorporating ${newWeakness}",
  "targetRole": "Candidate Role",
  "tasks": [
    {
      "day": 1,
      "skill": "Target Skill",
      "title": "Remediation Topic & Objective",
      "description": "Hands-on corrective overview",
      "duration": "45 mins",
      "learningResource": "Recommended Resource",
      "practiceActivity": "Hands-on corrective build",
      "assessment": "Verification prompt"
    }
  ],
  "milestones": [
    {
      "week": 1,
      "topic": "Remediation Milestone",
      "resources": ["Recommended Resource"],
      "actionItem": "Hands-on corrective build"
    }
  ]
}`;
}

module.exports = {
  buildGenerateRoadmapPrompt,
  buildRemedialTasksPrompt,
  buildRegenerateRoadmapPrompt
};
