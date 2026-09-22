const express = require('express');
const { extractSkillsHandler, calculateMatchHandler } = require('../controllers/skillController');

const router = express.Router();

/**
 * @route   POST /api/skills/extract
 * @desc    Extract skills from resume text and calculate initial match against target role
 */
router.post('/extract', express.json(), extractSkillsHandler);

/**
 * @route   POST /api/skills/match
 * @desc    Calculate match score and skill gaps for provided skills against role requirements
 */
router.post('/match', express.json(), calculateMatchHandler);

module.exports = router;
