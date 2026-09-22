const { z } = require('zod');
const { generateJSON } = require('./client');
const { buildWhatIfPrompt } = require('./prompts/whatIf.prompt');
const { calculateWhatIf } = require('./matchingEngine');

const WhatIfExplanationSchema = z.object({
  explanation: z.string()
});

/**
 * Simulates the impact of adding a hypothetical skill across roles and generates an AI explanation.
 *
 * @param {Object} params
 * @param {string} params.hypotheticalSkill - Hypothetical skill being evaluated
 * @param {string[]} [params.currentSkills] - Candidate's current skills
 * @param {Array<{ role: string, beforePercent: number, afterPercent: number }>} [params.roleImpacts] - Pre-computed impacts if already provided
 * @returns {Promise<{
 *   success: boolean,
 *   hypotheticalSkill: string,
 *   roleImpacts: Array<{ role: string, roleId?: string, beforePercent: number, afterPercent: number, delta: number }>,
 *   explanation: string
 * }>}
 */
async function explainHighestImpact({ hypotheticalSkill, currentSkills, roleImpacts }) {
  let impacts = roleImpacts;

  // Deterministically compute role impacts if currentSkills is provided
  if (!impacts || !Array.isArray(impacts) || impacts.length === 0) {
    impacts = calculateWhatIf(currentSkills || [], hypotheticalSkill);
  }

  const prompt = buildWhatIfPrompt({
    hypotheticalSkill,
    roleImpacts: impacts
  });

  const result = await generateJSON(prompt, WhatIfExplanationSchema);

  return {
    success: true,
    hypotheticalSkill,
    roleImpacts: impacts,
    explanation: result.explanation
  };
}

module.exports = {
  explainHighestImpact,
  WhatIfExplanationSchema
};
