/**
 * Prompt template for initial weekly career roadmap generation matching API_SPEC.md contract.
 *
 * @param {Object} params
 * @param {string} params.targetRole - Target career role
 * @param {string[]} params.currentSkills - Verified candidate skills
 * @param {string[]} params.missingSkills - Gap skills to address
 * @param {number} [params.weeksAvailable=8] - Target timeline in weeks
 * @returns {string}
 */
function buildGenerateRoadmapPrompt({ targetRole, currentSkills = [], missingSkills = [], weeksAvailable = 8 }) {
  const weeks = weeksAvailable || 8;
  return `You are a curriculum architect and technical career mentor.
Create a structured, personalized week-by-week skill roadmap for a candidate aiming to become a "${targetRole}".
The roadmap must cover exactly ${weeks} weeks (1 milestone per week).

Candidate Profile:
- Target Role: "${targetRole}"
- Current Skills: ${currentSkills.length > 0 ? currentSkills.join(', ') : 'None specified'}
- Missing Skills to Master: ${missingSkills.length > 0 ? missingSkills.join(', ') : 'Foundational industry skills'}
- Total Weeks Available: ${weeks}

Roadmap Guidelines:
1. Build systematically on the candidate's current skills to conquer the missing skills.
2. Provide exactly ${weeks} milestones (week 1 to ${weeks}).
3. For each milestone:
   - "week": sequential integer (1 to ${weeks})
   - "topic": concise, actionable weekly focus
   - "resources": array of strings (e.g. ["Official Documentation", "Tutorial Link", "GitHub Repo"])
   - "actionItem": concrete project or exercise the student should build this week
4. Provide a compelling "title" and specify the "targetRole".

Respond ONLY with valid JSON matching this schema:
{
  "title": "${weeks}-Week ${targetRole} Mastery Roadmap",
  "targetRole": "${targetRole}",
  "milestones": [
    {
      "week": 1,
      "topic": "TypeScript Fundamentals & Migration",
      "resources": ["TypeScript Handbook", "Official Docs"],
      "actionItem": "Convert a React component to TypeScript"
    }
  ]
}`;
}

/**
 * Prompt template for regenerating a roadmap to incorporate a newly detected weakness.
 *
 * @param {Object} params
 * @param {Object} params.existingRoadmap
 * @param {string} params.newWeakness
 * @returns {string}
 */
function buildRegenerateRoadmapPrompt({ existingRoadmap, newWeakness }) {
  const roadmapJson = typeof existingRoadmap === 'string'
    ? existingRoadmap
    : JSON.stringify(existingRoadmap, null, 2);

  return `You are a curriculum architect and technical career mentor.
A student is currently following this career roadmap, but a mock interview or assessment revealed a specific weakness:
Weakness to Address: "${newWeakness}"

Existing Roadmap:
"""
${roadmapJson}
"""

Instructions:
1. Smoothly insert a corrective milestone or adapt the upcoming milestones to specifically remedy "${newWeakness}".
2. Do NOT discard prior completed progress.
3. Re-index week numbers sequentially so the timeline remains consistent.
4. Each milestone must include "week" (number), "topic" (string), "resources" (array of strings), and "actionItem" (string).

Respond ONLY with valid JSON matching this schema:
{
  "title": "Updated Roadmap incorporating ${newWeakness}",
  "targetRole": "Candidate Role",
  "milestones": [
    {
      "week": 1,
      "topic": "Remediation Topic & Objective",
      "resources": ["Recommended Resource"],
      "actionItem": "Hands-on corrective build"
    }
  ]
}`;
}

module.exports = {
  buildGenerateRoadmapPrompt,
  buildRegenerateRoadmapPrompt
};
