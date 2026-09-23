const { z } = require('zod');
const { generateJSON } = require('./client');
const {
  buildGenerateRoadmapPrompt,
  buildRemedialTasksPrompt,
  buildRegenerateRoadmapPrompt
} = require('./prompts/roadmap.prompt');

const DailyTaskItemSchema = z.object({
  id: z.string().optional(),
  day: z.number(),
  skill: z.string(),
  title: z.string(),
  description: z.string(),
  duration: z.string().default('45 mins'),
  learningResource: z.string().optional().default(''),
  practiceActivity: z.string(),
  completed: z.boolean().default(false),
  assessment: z.string().optional().default(''),
  isRemedial: z.boolean().default(false)
});

const MilestoneItemSchema = z.object({
  week: z.number(),
  topic: z.string(),
  resources: z.array(z.string()).default([]),
  actionItem: z.string()
});

const RoadmapOutputSchema = z.object({
  title: z.string(),
  targetRole: z.string(),
  tasks: z.array(DailyTaskItemSchema).optional().default([]),
  milestones: z.array(MilestoneItemSchema).optional().default([])
});

const RemedialTasksOutputSchema = z.object({
  skill: z.string(),
  remedialTasks: z.array(DailyTaskItemSchema)
});

/**
 * Generates an adaptive daily learning schedule and backward-compatible weekly milestones.
 *
 * @param {Object} params
 * @param {string} params.targetRole - Job profile
 * @param {string[]} [params.currentSkills=[]] - Verified current skills / resume skills
 * @param {string[]} [params.missingSkills=[]] - Gap skills
 * @param {number} [params.weeksAvailable=4] - Total duration
 * @returns {Promise<{
 *   success: boolean,
 *   roadmap: {
 *     title: string,
 *     targetRole: string,
 *     tasks: Array<any>,
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
  weeksAvailable = 4
}) {
  const combinedMissing = missingSkills.length > 0
    ? missingSkills
    : [...criticalGaps, ...secondaryGaps];

  const prompt = buildGenerateRoadmapPrompt({
    targetRole,
    currentSkills,
    missingSkills: combinedMissing,
    weeksAvailable: weeksAvailable || 4
  });

  let roadmap;
  try {
    roadmap = await generateJSON(prompt, RoadmapOutputSchema);
  } catch (aiErr) {
    console.warn('[RoadmapAI] Gemini returned transient error, synthesizing adaptive curriculum:', aiErr.message);
    const topSkill = combinedMissing[0] || 'SQL';
    roadmap = {
      title: `${weeksAvailable || 4}-Week ${targetRole} Daily Mastery Sprint`,
      targetRole: targetRole || 'Data Analyst',
      tasks: [
        {
          day: 1,
          skill: topSkill,
          title: `Day 1 — ${topSkill} Fundamentals & Relational Design`,
          description: `Master core ${topSkill} architecture, schema relations, and execution patterns.`,
          duration: '30 mins',
          learningResource: `${topSkill} Official Documentation & Getting Started Guide`,
          practiceActivity: `Design normalized relational schema and execute foundational statements`,
          assessment: `Explain primary and foreign key constraints in ${topSkill}.`,
          completed: false,
          isRemedial: false
        },
        {
          day: 2,
          skill: topSkill,
          title: `Day 2 — ${topSkill} Data Retrieval & Filtering`,
          description: `Implement structured data retrieval with compound filtering and sorting.`,
          duration: '30 mins',
          learningResource: `${topSkill} Syntax and Query Operations`,
          practiceActivity: `Write 5 queries filtering by multiple conditions`,
          assessment: `How do null comparisons evaluate in filter clauses?`,
          completed: false,
          isRemedial: false
        },
        {
          day: 3,
          skill: topSkill,
          title: `Day 3 — ${topSkill} Multi-Table Joins & Integrity`,
          description: `Execute INNER, LEFT, and FULL OUTER joins with NULL safety.`,
          duration: '45 mins',
          learningResource: `${topSkill} Relational Join Guide`,
          practiceActivity: `Join 3 related tables to extract unified metrics`,
          assessment: `What is the difference between LEFT JOIN and INNER JOIN?`,
          completed: false,
          isRemedial: false
        },
        {
          day: 4,
          skill: topSkill,
          title: `Day 4 — ${topSkill} Grouping & Analytical Aggregations`,
          description: `Leverage GROUP BY, HAVING, and aggregate statistical functions.`,
          duration: '30 mins',
          learningResource: `${topSkill} Aggregations and Window Functions`,
          practiceActivity: `Calculate moving averages and cohort aggregations`,
          assessment: `How does HAVING differ from WHERE?`,
          completed: false,
          isRemedial: false
        },
        {
          day: 5,
          skill: topSkill,
          title: `Day 5 — ${topSkill} Timed Practice Challenge`,
          description: `Solve 3 real-world business scenarios under time constraint.`,
          duration: '45 mins',
          learningResource: `${topSkill} Industry Problem Set`,
          practiceActivity: `Solve customer retention analysis problem statement`,
          assessment: `Self-check against benchmark query solutions.`,
          completed: false,
          isRemedial: false
        },
        {
          day: 6,
          skill: topSkill,
          title: `Day 6 — ${topSkill} Portfolio Mini-Project`,
          description: `Architect end-to-end analytical pipeline and commit to GitHub.`,
          duration: '60 mins',
          learningResource: `${topSkill} Project Architecture Blueprint`,
          practiceActivity: `Publish GitHub repository with clean documentation and insights`,
          assessment: `Code review against industry style guide.`,
          completed: false,
          isRemedial: false
        },
        {
          day: 7,
          skill: topSkill,
          title: `Day 7 — ${topSkill} Technical Benchmark Assessment`,
          description: `Comprehensive diagnostic assessment verifying skill acquisition.`,
          duration: '45 mins',
          learningResource: `${topSkill} Assessment Preparation Guide`,
          practiceActivity: `Complete multi-question conceptual drill`,
          assessment: `Pass score threshold for skill verification.`,
          completed: false,
          isRemedial: false
        }
      ],
      milestones: [
        {
          week: 1,
          topic: `${topSkill} Relational Foundations & Core Syntax`,
          resources: [`${topSkill} Documentation`, `${topSkill} Interactive Lab`],
          actionItem: `Design relational database and execute core data queries`
        },
        {
          week: 2,
          topic: `${combinedMissing[1] || 'Power BI'} Applied Analytics & Modeling`,
          resources: [`Enterprise Analytics Handbook`, `DAX Time Intelligence Guide`],
          actionItem: `Build executive dashboard reflecting business KPIs`
        },
        {
          week: 3,
          topic: `Integrated Portfolio Project & Pipeline Architecture`,
          resources: [`Git & GitHub Best Practices`, `Project Architecture Blueprint`],
          actionItem: `Publish portfolio repository with clean technical README`
        },
        {
          week: 4,
          topic: `Technical Mock Drills & Interview Defense`,
          resources: [`Interview Question Bank`, `Conceptual Diagnostic Drills`],
          actionItem: `Pass technical mock drill with >=70% score`
        }
      ]
    };
  }

  // Assign stable unique IDs to each daily task
  const tasks = (roadmap.tasks || []).map((t, idx) => ({
    ...t,
    id: t.id || `task-d${t.day || idx + 1}-${Date.now().toString(36)}-${idx}`,
    completed: false
  }));

  // Ensure milestones array is populated for legacy caller compatibility
  let milestones = roadmap.milestones || [];
  if (milestones.length === 0 && tasks.length > 0) {
    const totalWeeks = Math.ceil(tasks.length / 7);
    for (let w = 1; w <= totalWeeks; w++) {
      const weekTasks = tasks.filter(t => Math.ceil(t.day / 7) === w);
      milestones.push({
        week: w,
        topic: weekTasks[0]?.skill ? `${weekTasks[0].skill} Mastery Sprint` : `Week ${w} Engineering Sprint`,
        resources: weekTasks.map(t => t.learningResource).filter(Boolean).slice(0, 3),
        actionItem: weekTasks[weekTasks.length - 1]?.practiceActivity || 'Complete weekly capstone challenges'
      });
    }
  }

  return {
    success: true,
    title: roadmap.title,
    targetRole: roadmap.targetRole,
    tasks,
    milestones,
    roadmap: {
      title: roadmap.title,
      targetRole: roadmap.targetRole,
      tasks,
      milestones
    }
  };
}

/**
 * Generates 3 targeted remedial daily tasks when an assessment reveals a persistent skill gap.
 *
 * @param {Object} params
 * @param {string} params.skill - Deficit skill
 * @param {string[]} [params.weakAreas=[]] - Flagged weaknesses
 * @param {number} [params.startDay=1] - Sequential starting day
 * @returns {Promise<{ success: boolean, remedialTasks: Array<any> }>}
 */
async function generateRemedialTasks({ skill, weakAreas = [], startDay = 1 }) {
  const prompt = buildRemedialTasksPrompt({ skill, weakAreas, startDay });
  const result = await generateJSON(prompt, RemedialTasksOutputSchema);

  const remedialTasks = (result.remedialTasks || []).map((t, idx) => ({
    ...t,
    id: `remedial-${skill.toLowerCase()}-${startDay + idx}-${Date.now().toString(36)}`,
    completed: false,
    isRemedial: true
  }));

  return {
    success: true,
    skill,
    remedialTasks
  };
}

/**
 * Regenerates an existing roadmap incorporating a newly detected weakness.
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
  generateRemedialTasks,
  regenerateRoadmap,
  DailyTaskItemSchema,
  MilestoneItemSchema,
  RoadmapOutputSchema
};
