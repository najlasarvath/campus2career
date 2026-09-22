/**
 * Prompt template for What-If simulator impact explanation.
 * @param {Object} params
 * @param {string} params.hypotheticalSkill - The hypothetical skill candidate might learn
 * @param {Array<{role: string, beforePercent: number, afterPercent: number, delta?: number}>} params.roleImpacts - Pre-computed before/after percentages
 * @returns {string}
 */
function buildWhatIfPrompt({ hypotheticalSkill, roleImpacts = [] }) {
  const impactsText = roleImpacts
    .map(r => {
      const delta = r.afterPercent - r.beforePercent;
      const sign = delta >= 0 ? '+' : '';
      return `- Role: "${r.role}" | Current Match: ${r.beforePercent}% -> Projected Match: ${r.afterPercent}% (Impact: ${sign}${delta}%)`;
    })
    .join('\n');

  return `You are a strategic career intelligence advisor analyzing a "What-If" career scenario.
The candidate is considering learning the hypothetical skill: "${hypotheticalSkill}".
The system has pre-calculated the following deterministic match impacts across potential target roles:

Pre-computed Role Impacts:
${impactsText}

Instructions:
1. Rank the roles from highest career impact / percentage boost to lowest.
2. Write a clear, encouraging, and strategic explanation of why acquiring "${hypotheticalSkill}" produces these specific boosts.
3. Highlight which target role gains the highest strategic leverage and how this skill unlocks new capabilities.
4. Do NOT re-calculate or alter the percentages — rely exclusively on the provided pre-computed values.
5. Return your output strictly as a JSON object containing an "explanation" string.

Respond ONLY with valid JSON matching this schema:
{
  "explanation": "Detailed strategic ranking and narrative explaining the highest impact..."
}`;
}

module.exports = {
  buildWhatIfPrompt
};
