const express = require('express');
const { getStudentDashboard, updateStudentProfile } = require('../controllers/studentController');
const authCheck = require('../middleware/authCheck');

const router = express.Router();

/**
 * @route   GET /api/students/me
 * @desc    Get dynamic dashboard profile for the authenticated student
 * @access  Protected
 */
router.get('/me', authCheck, getStudentDashboard);

/**
 * @route   PUT /api/students/me
 * @desc    Update target role or profile info for the authenticated student
 * @access  Protected
 */
router.put('/me', authCheck, updateStudentProfile);

module.exports = router;
