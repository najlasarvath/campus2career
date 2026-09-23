const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/authCheck');
const {
  getDailyTasks,
  toggleDailyTask,
  injectRemedialTasks
} = require('../controllers/taskController');

// All task routes support authentication with optional fallback for robust client experience
router.get('/daily', optionalAuth, getDailyTasks);
router.put('/daily/:id/toggle', optionalAuth, toggleDailyTask);
router.post('/daily/remediate', optionalAuth, injectRemedialTasks);

module.exports = router;
