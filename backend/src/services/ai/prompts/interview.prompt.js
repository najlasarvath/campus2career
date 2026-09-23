/**
 * Prompt template for generating technical interview questions testing true role/skill knowledge.
 * Avoids generic interview questions and enforces 5 distinct question types.
 *
 * @param {Object|string} params - Parameters or gapSkill string
 * @param {string} [params.targetRole] - Target engineering role
 * @param {string} [params.gapSkill] - Target skill to test
 * @param {string[]} [params.currentSkills] - Candidate's current skills
 * @param {string[]} [params.weakSkills] - Identified weak areas
 * @param {string} [params.company] - Target employer requirements
 * @param {number} [count=2] - Number of questions to generate
 * @returns {string}
 */
function buildGenerateQuestionsPrompt(params, count = 2) {
  let targetRole = 'Software Engineer';
  let gapSkill = 'Core Engineering';
  let currentSkills = [];
  let weakSkills = [];
  let company = null;
  let qCount = count;

  if (typeof params === 'string') {
    gapSkill = params;
  } else if (params && typeof params === 'object') {
    targetRole = params.targetRole || targetRole;
    gapSkill = params.gapSkill || params.skill || gapSkill;
    currentSkills = params.currentSkills || [];
    weakSkills = params.weakSkills || [];
    company = params.company || null;
    qCount = params.count || count || 2;
  }

  const companyContext = company ? `- Target Company Context: ${company}\n` : '';
  const currentSkillsStr = currentSkills.length > 0 ? currentSkills.join(', ') : 'Foundational concepts';
  const weakSkillsStr = weakSkills.length > 0 ? weakSkills.join(', ') : gapSkill;

  return `You are a Principal Engineering Interviewer conducting a rigorous technical assessment for a candidate targeting: "${targetRole}".
Candidate Profile:
- Target Role: "${targetRole}"
${companyContext}- Focus Skill / Critical Gap: "${gapSkill}"
- Verified Current Skills: ${currentSkillsStr}
- Identified Weak Areas: ${weakSkillsStr}

Generate exactly ${qCount} technical questions testing real, practical competence in "${gapSkill}".

CRITICAL INSTRUCTIONS:
1. DO NOT generate generic career questions (e.g., "What is your favorite language?", "Why do you like coding?", "Tell me about yourself").
2. Focus on testing DEEP technical knowledge, internal mechanics, performance trade-offs, and practical troubleshooting.
3. Include question types selected from:
   - "Technical Concept" (e.g., event loop mechanics, DAX filter context transition, indexing B-Trees)
   - "Scenario-Based" (e.g., diagnosing a 4-second API response latency in production)
   - "Debugging / Problem-Solving" (e.g., analyzing a memory leak, race condition, or SQL dead-lock)
   - "Practical / Application" (e.g., architecting a resilient data ingestion pipeline)
   - "Role-Specific" (tailored to ${targetRole} workflows)
4. For each question, provide a concise concept "hint" and relevant "category".

Respond ONLY with valid JSON matching this schema:
{
  "questions": [
    {
      "question": "A production API endpoint querying a table with 2 million rows is taking 4.2 seconds to respond. Explain step-by-step how you would investigate the bottleneck using query execution plans, indexing strategies, and connection pooling.",
      "questionType": "Scenario-Based Problem Solving",
      "category": "Performance & Optimization",
      "hint": "Analyze EXPLAIN ANALYZE output, missing indexes vs sequential scans, and database connection bottlenecks."
    }
  ]
}`;
}

/**
 * Prompt template for evaluating candidate's answer across 4 dimensions and diagnostic concept breakdown.
 *
 * @param {Object} params
 * @param {string} params.question
 * @param {string} params.answer
 * @param {string} [params.targetRole]
 * @param {string} [params.gapSkill]
 * @returns {string}
 */
function buildEvaluateResponsePrompt({ question, answer, targetRole, gapSkill }) {
  return `You are a rigorous technical interview evaluator evaluating a candidate for the "${targetRole || 'Software Engineering'}" role.
Evaluate the candidate's answer to the technical question below regarding "${gapSkill || 'Core Engineering'}".

Interview Question:
"""
${question}
"""

Candidate Answer:
"""
${answer}
"""

Evaluation Rubric:
Score each dimension as an integer percentage (0-100):
- "technical": Technical accuracy, correct syntax/patterns, and foundational mechanics (0-100).
- "problemSolving": Analytical reasoning, edge case handling, and architectural trade-offs (0-100).
- "application": Production best practices, real-world constraints, and code ergonomics (0-100).
- "communication": Clarity, conciseness, articulation, and professional tone (0-100).

Diagnostic Concept Analysis:
- "correctConcepts": Array of 1-3 specific concepts, mechanics, or patterns the candidate got right.
- "incorrectConcepts": Array of specific inaccuracies, misconceptions, or false assumptions (empty array if none).
- "missingConcepts": Array of 1-3 crucial industry concepts, trade-offs, or best practices that were omitted.
- "weakAreas": Array of specific subtopics needing reinforcement.
- "remainingWeakness": A concise summary diagnosis of the candidate's primary gap.
- "betterApproach": An authoritative, production-grade model answer or recommended architectural approach.
- "recommendedPractice": Concrete next practice project, lab, or challenge to master this topic.

Respond ONLY with valid JSON matching this schema:
{
  "technical": 82,
  "problemSolving": 78,
  "application": 75,
  "communication": 85,
  "correctConcepts": ["Identified missing index on foreign key", "Used EXPLAIN to examine execution plan"],
  "incorrectConcepts": [],
  "missingConcepts": ["Did not account for connection pool exhaustion", "Omitted database memory buffer tuning"],
  "weakAreas": ["Database connection management", "I/O wait profiling"],
  "remainingWeakness": "Good query diagnostics, but lacks awareness of connection pool sizing and memory buffer tuning.",
  "betterApproach": "A comprehensive model solution begins with inspecting APM metrics to isolate DB time vs application time, followed by running EXPLAIN (ANALYZE, BUFFERS) on the query...",
  "recommendedPractice": "Practice tuning PostgreSQL slow queries using pg_stat_statements and simulating concurrent load."
}`;
}

module.exports = {
  buildGenerateQuestionsPrompt,
  buildEvaluateResponsePrompt
};
