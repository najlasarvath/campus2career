/**
 * Prompt template for extracting technical and soft skills from resume text.
 * @param {string} resumeText - Raw text extracted from a resume
 * @returns {string} - Formatted prompt for AI
 */
function buildResumeSkillPrompt(resumeText) {
  return `You are an expert technical talent scout and career intelligence engine.
Analyze the following resume text bounded by """ and extract all verified technical skills, programming languages, frameworks, libraries, tools, databases, and domain proficiencies mentioned or demonstrated.

Rules:
1. Extract distinct, standardized skill names (e.g., "React", "Node.js", "PostgreSQL", "Docker", "Python", "Git", "TypeScript").
2. Normalize naming (avoid duplicate terms like "ReactJS" and "React").
3. Only include skills that are explicitly mentioned or clearly evident from project/experience descriptions.
4. Output must strictly be a JSON object with a single "skills" array of strings.

Resume Text:
"""
${resumeText}
"""

Respond ONLY with valid JSON matching this schema:
{
  "skills": ["Skill1", "Skill2"]
}`;
}

/**
 * Prompt template for explaining a pre-computed role match score.
 * @param {Object} params
 * @param {string[]} params.matchedSkills
 * @param {string[]} params.missingSkills
 * @param {number} params.matchScorePercent
 * @returns {string} - Formatted prompt for AI
 */
function buildRoleMatchExplanationPrompt({ matchedSkills, missingSkills, matchScorePercent }) {
  return `You are a career advisor and technical coach.
A student was evaluated against a target role and received a pre-computed match score of ${matchScorePercent}%.

Analysis Details:
- Matched / Acquired Skills: ${matchedSkills && matchedSkills.length > 0 ? matchedSkills.join(', ') : 'None identified'}
- Missing / Gap Skills: ${missingSkills && missingSkills.length > 0 ? missingSkills.join(', ') : 'None'}
- Pre-computed Match Score: ${matchScorePercent}%

Instructions:
1. Provide a clear, natural-language evaluation explaining what this score means for the student.
2. Highlight their key strengths based on matched skills.
3. Constructively explain how the missing skills create a gap and what impact addressing them will have.
4. Do NOT re-calculate or alter the ${matchScorePercent}% match score. It is fixed and deterministic.
5. Return your response as a JSON object containing an "explanation" string.

Respond ONLY with valid JSON matching this schema:
{
  "explanation": "Natural language explanation paragraph..."
}`;
}

module.exports = {
  buildResumeSkillPrompt,
  buildRoleMatchExplanationPrompt
};
