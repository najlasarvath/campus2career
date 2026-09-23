const express = require('express');
const { signup, login, getMe, logout } = require('../controllers/authController');
const authCheck = require('../middleware/authCheck');

const router = express.Router();

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user and student profile
 */
router.post('/signup', signup);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and retrieve token and profile
 */
router.post('/login', login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user profile
 */
router.get('/me', authCheck, getMe);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user session
 */
router.post('/logout', logout);

module.exports = router;
