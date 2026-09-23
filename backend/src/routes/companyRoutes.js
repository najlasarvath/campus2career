const express = require('express');
const { optionalAuth, requireCompanyOrAdmin } = require('../middleware/authCheck');
const { getCompanyRequirements, createCompanyRequirement } = require('../controllers/companyController');

const router = express.Router();

/**
 * @route   GET /api/companies/requirements
 * @desc    Get all published job requirements from database (read-only for all)
 */
router.get('/requirements', optionalAuth, getCompanyRequirements);

/**
 * @route   POST /api/companies/requirements
 * @desc    Publish and persist a new job requirement into role_requirements (company/recruiter action)
 */
router.post('/requirements', optionalAuth, requireCompanyOrAdmin, createCompanyRequirement);

module.exports = router;

