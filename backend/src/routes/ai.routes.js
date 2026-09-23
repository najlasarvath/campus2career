const express = require('express');
const { z } = require('zod');
const router = express.Router();

const { extractSkills } = require('../services/ai/resumeSkillAI');
const { explainMatch } = require('../services/ai/roleMatchAI');
const { generateRoadmap, regenerateRoadmap } = require('../services/ai/roadmapAI');
const { generateQuestions, evaluateResponse } = require('../services/ai/interviewAI');
const { explainHighestImpact } = require('../services/ai/whatIfAI');

// Request Validation Schemas
const ExtractSkillsRequestSchema = z.object({
  resumeText: z.string({ required_error: 'resumeText is required' }).min(1, 'resumeText cannot be empty'),
  targetRole: z.string().optional()
});

const ExplainMatchRequestSchema = z.object({
  candidateSkills: z.array(z.string()).optional(),
  targetRole: z.string().optional(),
  matchedSkills: z.array(z.string()).optional().default([]),
  missingSkills: z.array(z.string()).optional().default([]),
  matchScorePercent: z.number().optional()
}).refine(data => (data.candidateSkills && data.targetRole) || typeof data.matchScorePercent === 'number', {
  message: 'Must provide either (candidateSkills and targetRole) or matchScorePercent'
});

const RoadmapRequestSchema = z.object({
  targetRole: z.string({ required_error: 'targetRole is required' }).min(1, 'targetRole cannot be empty'),
  currentSkills: z.array(z.string()).optional().default([]),
  missingSkills: z.array(z.string()).optional().default([]),
  criticalGaps: z.array(z.string()).optional().default([]),
  secondaryGaps: z.array(z.string()).optional().default([]),
  weeksAvailable: z.number().int().positive().optional().default(8)
});

const RoadmapRegenerateRequestSchema = z.object({
  existingRoadmap: z.union([
    z.object({ title: z.string().optional(), targetRole: z.string().optional(), milestones: z.array(z.any()) }),
    z.object({ weeks: z.array(z.any()) }),
    z.array(z.any())
  ], { required_error: 'existingRoadmap is required' }),
  newWeakness: z.string({ required_error: 'newWeakness is required' }).min(1, 'newWeakness cannot be empty')
});

const InterviewQuestionsRequestSchema = z.object({
  gapSkill: z.string().optional(),
  skill: z.string().optional(),
  targetRole: z.string().optional(),
  currentSkills: z.array(z.string()).optional(),
  weakSkills: z.array(z.string()).optional(),
  company: z.string().optional(),
  count: z.number().int().positive().optional().default(2)
}).refine(data => data.gapSkill || data.skill || data.targetRole, {
  message: 'gapSkill or targetRole is required'
});

const InterviewEvaluateRequestSchema = z.object({
  question: z.string({ required_error: 'question is required' }).min(1, 'question cannot be empty'),
  answer: z.string({ required_error: 'answer is required' }).min(1, 'answer cannot be empty'),
  targetRole: z.string().optional(),
  gapSkill: z.string().optional()
});

const WhatIfExplainRequestSchema = z.object({
  hypotheticalSkill: z.string({ required_error: 'hypotheticalSkill is required' }).min(1, 'hypotheticalSkill cannot be empty'),
  currentSkills: z.array(z.string()).optional(),
  roleImpacts: z.array(z.object({
    role: z.string(),
    roleId: z.string().optional(),
    beforePercent: z.number(),
    afterPercent: z.number(),
    delta: z.number().optional()
  })).optional()
}).refine(data => data.currentSkills || (data.roleImpacts && data.roleImpacts.length > 0), {
  message: 'Must provide either currentSkills or roleImpacts'
});

/**
 * Standardized error handler ensuring { success: false, message: string } JSON response.
 * Compatible with Zod v4 (err.issues) and standard Error objects.
 *
 * @param {import('express').Response} res
 * @param {Error|z.ZodError} err
 */
function handleRouteError(res, err) {
  if (err instanceof z.ZodError) {
    const issues = err.issues || err.errors || [];
    const message = issues.map(e => `${(e.path && e.path.join('.')) || 'body'}: ${e.message}`).join(', ');
    return res.status(400).json({ success: false, message: message || 'Validation failed' });
  }
  return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
}

// 1. Skill Extraction (API_SPEC.md: POST /api/skills/extract)
router.post(['/skills/extract', '/ai/extract-skills'], async (req, res) => {
  try {
    const validated = ExtractSkillsRequestSchema.parse(req.body);
    const result = await extractSkills(validated.resumeText, validated.targetRole);
    return res.json(result);
  } catch (err) {
    return handleRouteError(res, err);
  }
});

// 2. Role Match & Explanation (POST /api/roles/match or /api/ai/explain-match)
router.post(['/roles/match', '/ai/explain-match'], async (req, res) => {
  try {
    const validated = ExplainMatchRequestSchema.parse(req.body);
    const result = await explainMatch(validated);
    return res.json({ success: true, ...result });
  } catch (err) {
    return handleRouteError(res, err);
  }
});

// 3. Career Roadmap Generation (API_SPEC.md: POST /api/roadmaps/generate)
router.post(['/roadmaps/generate', '/ai/roadmap'], async (req, res) => {
  try {
    const validated = RoadmapRequestSchema.parse(req.body);
    const result = await generateRoadmap(validated);
    return res.json(result);
  } catch (err) {
    return handleRouteError(res, err);
  }
});

// 4. Career Roadmap Regeneration (POST /api/roadmaps/regenerate)
router.post(['/roadmaps/regenerate', '/ai/roadmap/regenerate'], async (req, res) => {
  try {
    const validated = RoadmapRegenerateRequestSchema.parse(req.body);
    const result = await regenerateRoadmap(validated);
    return res.json(result);
  } catch (err) {
    return handleRouteError(res, err);
  }
});

// 5. Mock Interview Questions (POST /api/interview/questions)
router.post(['/interview/questions', '/ai/interview/questions'], async (req, res) => {
  try {
    const validated = InterviewQuestionsRequestSchema.parse(req.body);
    const result = await generateQuestions({
      targetRole: validated.targetRole || 'Software Engineer',
      gapSkill: validated.gapSkill || validated.skill || 'Core Engineering',
      currentSkills: validated.currentSkills || [],
      weakSkills: validated.weakSkills || [],
      company: validated.company || null,
      count: validated.count || 2
    }, validated.count || 2);
    return res.json(result);
  } catch (err) {
    return handleRouteError(res, err);
  }
});

// 6. Mock Interview Evaluation (POST /api/interview/evaluate)
router.post(['/interview/evaluate', '/ai/interview/evaluate'], async (req, res) => {
  try {
    const validated = InterviewEvaluateRequestSchema.parse(req.body);
    const result = await evaluateResponse(validated);
    return res.json(result);
  } catch (err) {
    return handleRouteError(res, err);
  }
});

// 7. What-If Simulator (POST /api/whatif/simulate)
router.post(['/whatif/simulate', '/ai/whatif/explain'], async (req, res) => {
  try {
    const validated = WhatIfExplainRequestSchema.parse(req.body);
    const result = await explainHighestImpact(validated);
    return res.json(result);
  } catch (err) {
    return handleRouteError(res, err);
  }
});

// 8. AI Career Coach Assistant (POST /api/ai/chat)
const ChatRequestSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  context: z.object({
    studentName: z.string().optional(),
    target_role: z.string().optional(),
    match_score: z.number().optional(),
    target_score: z.number().optional(),
    acquired_skills: z.array(z.any()).optional(),
    critical_gaps: z.array(z.any()).optional(),
    highest_impact_skill: z.any().optional()
  }).optional().default({})
});

// Helper to ensure chatbot response is pure human-readable text, never raw JSON
function sanitizeCoachReply(raw) {
  if (typeof raw !== 'string') return '';
  let text = raw.trim();

  // Strip code blocks if wrapped
  if (text.startsWith('```json')) {
    text = text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
  } else if (text.startsWith('```markdown')) {
    text = text.replace(/^```markdown\s*/i, '').replace(/```\s*$/, '').trim();
  } else if (text.startsWith('```')) {
    text = text.replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
  }

  // Check if string contains JSON array or object
  if (text.startsWith('[') || text.startsWith('{')) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const first = parsed[0];
        if (typeof first === 'string') return first.trim();
        if (first && typeof first === 'object') {
          const val = first.coach_response || first.response || first.reply || first.message || Object.values(first)[0];
          if (typeof val === 'string') return val.trim();
        }
      } else if (parsed && typeof parsed === 'object') {
        const val = parsed.coach_response || parsed.response || parsed.reply || parsed.message || Object.values(parsed)[0];
        if (typeof val === 'string') return val.trim();
      }
    } catch {
      // not valid JSON, continue with text
    }
  }

  return text.replace(/\\n/g, '\n').replace(/\\"/g, '"').trim();
}

router.post(['/ai/chat', '/chat'], async (req, res) => {
  try {
    const validated = ChatRequestSchema.parse(req.body);
    const { message, context } = validated;
    const { callGemini } = require('../services/ai/client');

    const criticalGapsStr = (context.critical_gaps || [])
      .map(g => (typeof g === 'string' ? g : g?.name || g?.skill))
      .filter(Boolean)
      .join(', ') || 'None identified';

    const acquiredSkillsStr = (context.acquired_skills || [])
      .map(s => (typeof s === 'string' ? s : s?.name || s?.skill))
      .filter(Boolean)
      .join(', ') || 'None yet';

    const companyContext = context.company ? `- Target Company: ${context.company}\n` : '';

    const prompt = `You are the Campus2Career AI Placement Coach, an expert, encouraging career advisor for university students.
Candidate Context:
- Name: ${context.studentName || 'Student'}
- Target Role: ${context.target_role || 'Software Engineer'}
${companyContext}- Current Readiness Score: ${context.match_score ?? 0}% (Target Benchmark: ${context.target_score ?? 85}%)
- Critical Skill Gaps: ${criticalGapsStr}
- Acquired / Demonstrated Skills: ${acquiredSkillsStr}
- Top Priority Skill to Close: ${context.highest_impact_skill?.skill || (context.critical_gaps?.[0]?.name || 'Core Skills')}

Candidate Query: "${message}"

Instructions:
- Provide a concise, practical, highly motivating, and human-readable answer (2-3 short paragraphs max with bullet points).
- NEVER format your reply as a JSON string, array, or object.
- NEVER include keys like coach_response or internal keys.
- Respond directly in plain natural conversational text using Markdown for emphasis (**bold**, bullet points).`;

    let reply;
    let source = 'gemini';
    try {
      const rawReply = await callGemini(prompt, null, { responseMimeType: 'text/plain' });
      reply = sanitizeCoachReply(rawReply);
    } catch (aiErr) {
      source = 'fallback';
      console.warn('[AIChat] Gemini returned transient error, providing candidate career coaching guidance:', aiErr.message);
      reply = `Hi ${context.studentName || 'there'}! To maximize your match score for ${context.target_role || 'your target role'}, focus directly on closing your primary skill gap in ${criticalGapsStr}. Completing daily hands-on practice challenges and participating in targeted industry bootcamps will produce the fastest benchmark qualification lift.`;
    }

    return res.json({
      success: true,
      reply,
      source,
      model: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite'
    });
  } catch (err) {
    return handleRouteError(res, err);
  }
});

module.exports = router;
