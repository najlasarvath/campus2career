const express = require('express');
const { optionalAuth } = require('../middleware/authCheck');
const { getHeatmapAnalytics, getCollegeAlerts } = require('../controllers/analyticsController');

const router = express.Router();

/**
 * @route   GET /api/analytics/heatmap
 * @desc    Get aggregated campus skill distribution and role readiness metrics
 */
router.get('/heatmap', optionalAuth, getHeatmapAnalytics);

/**
 * @route   GET /api/analytics/alerts
 * @desc    Get 40% college skill-gap alerts and workshop recommendations
 */
router.get('/alerts', optionalAuth, getCollegeAlerts);

// Block any mutation attempts on analytics endpoints
router.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Analytics data is read-only and cannot be mutated directly.'
    });
  }
  next();
});

module.exports = router;


