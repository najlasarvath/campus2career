const express = require('express');
const upload = require('../middleware/upload');
const { uploadResume } = require('../controllers/resumeController');
const { optionalAuth } = require('../middleware/authCheck');

const router = express.Router();

const uploadMiddleware = (req, res, next) => {
  upload.fields([{ name: 'file', maxCount: 1 }, { name: 'resume', maxCount: 1 }])(req, res, (err) => {
    if (err) return next(err);
    if (req.files) {
      req.file = (req.files.file && req.files.file[0]) || (req.files.resume && req.files.resume[0]) || null;
    }
    next();
  });
};

/**
 * @route   POST /api/resumes/upload
 * @desc    Upload resume PDF, parse text, extract skills, and persist to Supabase
 * @access  Public or Authenticated
 */
router.post('/upload', optionalAuth, uploadMiddleware, uploadResume);

module.exports = router;
