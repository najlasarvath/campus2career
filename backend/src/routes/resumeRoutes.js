const express = require('express');
const upload = require('../middleware/upload');
const { uploadResume } = require('../controllers/resumeController');

const router = express.Router();

/**
 * @route   POST /api/resumes/upload
 * @desc    Upload resume PDF, parse text, extract skills, and persist to Supabase
 * @access  Public (or authenticated via Bearer token)
 */
router.post('/upload', upload.single('file'), uploadResume);

module.exports = router;
