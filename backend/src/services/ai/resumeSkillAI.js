const { z } = require('zod');
const { generateJSON } = require('./client');
const { buildResumeSkillPrompt } = require('./prompts/resumeSkill.prompt');
const { calculateMatch } = require('./matchingEngine');

const ResumeSkillsSchema = z.object({
  skills: z.array(z.string()).default([])
});

/**
 * Extracts skills from raw resume text and calculates role match if targetRole is supplied.
 * Pure service: DB persistence owned by controller/caller.
 *
 * @param {string} resumeText - Raw text extracted from candidate's resume
 * @param {string} [targetRole] - Optional target role name/id from request
 * @returns {Promise<{
 *   success: boolean,
 *   extractedSkills: string[],
 *   missingSkills?: string[],
 *   matchPercentage?: number
 * }>}
 */
async function extractSkills(resumeText, targetRole) {
  if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length === 0) {
    return {
      success: true,
      extractedSkills: [],
      skills: [],
      ...(targetRole ? { missingSkills: [], matchPercentage: 0 } : {})
    };
  }

  const prompt = buildResumeSkillPrompt(resumeText);
  const result = await generateJSON(prompt, ResumeSkillsSchema);
  const extractedSkills = Array.isArray(result.skills) ? result.skills : [];

  if (targetRole) {
    const match = calculateMatch(extractedSkills, targetRole);
    return {
      success: true,
      extractedSkills,
      missingSkills: match.missingSkills,
      matchPercentage: match.matchPercentage
    };
  }

  return {
    success: true,
    extractedSkills,
    skills: extractedSkills
  };
}

module.exports = {
  extractSkills,
  ResumeSkillsSchema
};
