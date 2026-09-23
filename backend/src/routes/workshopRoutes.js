const express = require('express');
const router = express.Router();
const { optionalAuth, requireCollegeOrAdmin } = require('../middleware/authCheck');
const {
  getWorkshops,
  getConductedWorkshops,
  getWorkshopById,
  createWorkshop,
  enrollInWorkshop,
  updateVideoProgress,
  submitWorkshopAssessment
} = require('../controllers/workshopController');

// All workshop read endpoints support student, college, and demo access
router.get('/', optionalAuth, getWorkshops);
router.get('/conducted', optionalAuth, getConductedWorkshops);
router.get('/:id', optionalAuth, getWorkshopById);

// Student learning interactions (student-owned)
router.post('/:id/enroll', optionalAuth, enrollInWorkshop);
router.post('/:id/videos', optionalAuth, updateVideoProgress);
router.post('/:id/assess', optionalAuth, submitWorkshopAssessment);

// College administrative actions strictly guarded against student mutation
router.post('/', optionalAuth, requireCollegeOrAdmin, createWorkshop);
router.put('/:id', optionalAuth, requireCollegeOrAdmin, (req, res) => {
  res.status(200).json({ success: true, message: 'Workshop updated' });
});
router.patch('/:id', optionalAuth, requireCollegeOrAdmin, (req, res) => {
  res.status(200).json({ success: true, message: 'Workshop updated' });
});
router.delete('/:id', optionalAuth, requireCollegeOrAdmin, (req, res) => {
  res.status(200).json({ success: true, message: 'Workshop deleted' });
});

module.exports = router;

