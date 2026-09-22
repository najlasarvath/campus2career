const { z } = require('zod');
const { generateJSON } = require('./client');
const {
  buildGenerateQuestionsPrompt,
  buildEvaluateResponsePrompt
} = require('./prompts/interview.prompt');

const QuestionsSchema = z.object({
  questions: z.array(z.string())
});

const EvaluationSchema = z.object({
  technical: z.number().min(0).max(100),
  problemSolving: z.number().min(0).max(100),
  application: z.number().min(0).max(100),
  communication: z.number().min(0).max(100),
  remainingWeakness: z.string()
});

/**
 * Generates technical interview questions targeted at a specific gap skill.
 *
 * @param {string} gapSkill - Target skill to test
 * @param {number} [count=3] - Number of questions to generate
 * @returns {Promise<{ success: boolean, questions: string[] }>}
 */
async function generateQuestions(gapSkill, count = 3) {
  const prompt = buildGenerateQuestionsPrompt(gapSkill, count);
  const result = await generateJSON(prompt, QuestionsSchema);
  return {
    success: true,
    questions: result.questions || []
  };
}

/**
 * Evaluates candidate response to an interview question across technical, problem-solving, application, and communication dimensions.
 *
 * @param {Object} params
 * @param {string} params.question - The interview question asked
 * @param {string} params.answer - The candidate's response
 * @returns {Promise<{
 *   success: boolean,
 *   technical: number,
 *   problemSolving: number,
 *   application: number,
 *   communication: number,
 *   remainingWeakness: string
 * }>}
 */
async function evaluateResponse({ question, answer }) {
  const prompt = buildEvaluateResponsePrompt({ question, answer });
  const result = await generateJSON(prompt, EvaluationSchema);
  return {
    success: true,
    ...result
  };
}

module.exports = {
  generateQuestions,
  evaluateResponse,
  QuestionsSchema,
  EvaluationSchema
};
