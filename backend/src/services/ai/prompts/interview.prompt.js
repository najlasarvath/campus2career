/**
 * Prompt template for generating technical interview questions for a gap skill.
 * @param {string} gapSkill - The skill with a gap to interview on
 * @param {number} [count=3] - Number of questions to generate
 * @returns {string}
 */
function buildGenerateQuestionsPrompt(gapSkill, count = 3) {
  return `You are a senior technical interviewer conducting a mock technical interview.
Generate ${count} targeted, high-quality interview questions designed to test a candidate's understanding, problem-solving, and practical application of the following skill:
Skill to test: "${gapSkill}"

Rules:
1. Formulate exactly ${count} distinct questions.
2. Include a mix of conceptual depth, real-world application, and troubleshooting/problem-solving scenarios.
3. Avoid trivia; focus on practical engineering knowledge and architectural trade-offs.
4. Output strictly a JSON object with a "questions" array of strings.

Respond ONLY with valid JSON matching this schema:
{
  "questions": [
    "Question 1...",
    "Question 2..."
  ]
}`;
}

/**
 * Prompt template for evaluating candidate's answer to an interview question.
 * @param {Object} params
 * @param {string} params.question
 * @param {string} params.answer
 * @returns {string}
 */
function buildEvaluateResponsePrompt({ question, answer }) {
  return `You are a rigorous technical interview evaluator.
Evaluate the candidate's answer to the interview question below.

Interview Question:
"""
${question}
"""

Candidate Answer:
"""
${answer}
"""

Evaluation Rubric:
Score each of the following dimensions as an integer percentage between 0 and 100:
- "technical": Accuracy of technical concepts, syntax, patterns, and foundational mechanics (0-100).
- "problemSolving": Analytical thinking, structure of reasoning, and handling of complexity/edge cases (0-100).
- "application": Practical hands-on awareness, best practices, and real-world system trade-offs (0-100).
- "communication": Clarity, conciseness, articulation, and professional delivery (0-100).
- "remainingWeakness": A concise, actionable diagnosis of gaps, inaccuracies, or areas where the candidate needs improvement.

Respond ONLY with valid JSON matching this schema:
{
  "technical": 80,
  "problemSolving": 75,
  "application": 70,
  "communication": 85,
  "remainingWeakness": "Concise summary of specific areas needing improvement"
}`;
}

module.exports = {
  buildGenerateQuestionsPrompt,
  buildEvaluateResponsePrompt
};
