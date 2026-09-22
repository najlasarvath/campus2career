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
  gapSkill: z.string({ required_error: 'gapSkill is required' }).min(1, 'gapSkill cannot be empty'),
  count: z.number().int().positive().optional().default(3)
});

const InterviewEvaluateRequestSchema = z.object({
  question: z.string({ required_error: 'question is required' }).min(1, 'question cannot be empty'),
  answer: z.string({ required_error: 'answer is required' }).min(1, 'answer cannot be empty')
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
    const result = await generateQuestions(validated.gapSkill, validated.count);
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

module.exports = router;
