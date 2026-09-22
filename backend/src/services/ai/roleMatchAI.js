const { z } = require('zod');
const { generateJSON } = require('./client');
const { buildRoleMatchExplanationPrompt } = require('./prompts/resumeSkill.prompt');
const { calculateMatch } = require('./matchingEngine');

const RoleMatchExplanationSchema = z.object({
  explanation: z.string()
});

/**
 * Generates an explanation for a role match.
 * If matchScorePercent is provided, explains that score.
 * Otherwise, calculates match deterministically from candidateSkills and targetRole.
 *
 * @param {Object} params
 * @param {string[]} [params.candidateSkills]
 * @param {string} [params.targetRole]
 * @param {string[]} [params.matchedSkills]
 * @param {string[]} [params.missingSkills]
 * @param {number} [params.matchScorePercent]
 * @returns {Promise<{
 *   matchPercentage: number,
 *   matchedSkills: string[],
 *   missingSkills: string[],
 *   criticalGaps: string[],
 *   secondaryGaps: string[],
 *   explanation: string
 * }>}
 */
async function explainMatch({
  candidateSkills,
  targetRole,
  matchedSkills,
  missingSkills,
  matchScorePercent
}) {
  let score = matchScorePercent;
  let matched = matchedSkills || [];
  let missing = missingSkills || [];
  let critical = [];
  let secondary = [];

  // Deterministically compute match if candidateSkills and targetRole are supplied
  if (candidateSkills && targetRole) {
    const calc = calculateMatch(candidateSkills, targetRole);
    score = calc.matchPercentage;
    matched = calc.matchedSkills;
    missing = calc.missingSkills;
    critical = calc.criticalGaps;
    secondary = calc.secondaryGaps;
  }

  const prompt = buildRoleMatchExplanationPrompt({
    matchedSkills: matched,
    missingSkills: missing,
    matchScorePercent: typeof score === 'number' ? score : 0
  });

  const result = await generateJSON(prompt, RoleMatchExplanationSchema);

  return {
    matchPercentage: typeof score === 'number' ? score : 0,
    matchedSkills: matched,
    missingSkills: missing,
    criticalGaps: critical,
    secondaryGaps: secondary,
    explanation: result.explanation
  };
}

module.exports = {
  explainMatch,
  RoleMatchExplanationSchema
};
