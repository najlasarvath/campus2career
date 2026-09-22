const { z } = require('zod');
const { generateJSON } = require('./client');
const {
  buildGenerateRoadmapPrompt,
  buildRegenerateRoadmapPrompt
} = require('./prompts/roadmap.prompt');

const MilestoneItemSchema = z.object({
  week: z.number(),
  topic: z.string(),
  resources: z.array(z.string()).default([]),
  actionItem: z.string()
});

const RoadmapOutputSchema = z.object({
  title: z.string(),
  targetRole: z.string(),
  milestones: z.array(MilestoneItemSchema)
});

/**
 * Generates a weekly career roadmap based on target role, current skills, and skill gaps.
 * Aligned with API_SPEC.md.
 *
 * @param {Object} params
 * @param {string} params.targetRole - Job profile
 * @param {string[]} [params.currentSkills=[]] - Verified current skills
 * @param {string[]} [params.missingSkills=[]] - Gap skills
 * @param {number} [params.weeksAvailable=8] - Total duration
 * @returns {Promise<{
 *   success: boolean,
 *   roadmap: {
 *     title: string,
 *     targetRole: string,
 *     milestones: Array<{ week: number, topic: string, resources: string[], actionItem: string }>
 *   }
 * }>}
 */
async function generateRoadmap({
  targetRole,
  currentSkills = [],
  missingSkills = [],
  criticalGaps = [],
  secondaryGaps = [],
  weeksAvailable = 8
}) {
  const combinedMissing = missingSkills.length > 0
    ? missingSkills
    : [...criticalGaps, ...secondaryGaps];

  const prompt = buildGenerateRoadmapPrompt({
    targetRole,
    currentSkills,
    missingSkills: combinedMissing,
    weeksAvailable: weeksAvailable || 8
  });

  const roadmap = await generateJSON(prompt, RoadmapOutputSchema);

  return {
    success: true,
    roadmap
  };
}

/**
 * Regenerates an existing roadmap incorporating a newly detected weakness.
 *
 * @param {Object} params
 * @param {Object|Array} params.existingRoadmap
 * @param {string} params.newWeakness
 * @returns {Promise<{
 *   success: boolean,
 *   roadmap: {
 *     title: string,
 *     targetRole: string,
 *     milestones: Array<{ week: number, topic: string, resources: string[], actionItem: string }>
 *   }
 * }>}
 */
async function regenerateRoadmap({ existingRoadmap, newWeakness }) {
  const prompt = buildRegenerateRoadmapPrompt({
    existingRoadmap,
    newWeakness
  });

  const roadmap = await generateJSON(prompt, RoadmapOutputSchema);

  return {
    success: true,
    roadmap
  };
}

module.exports = {
  generateRoadmap,
  regenerateRoadmap,
  MilestoneItemSchema,
  RoadmapOutputSchema
};
