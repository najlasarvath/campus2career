const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/authCheck');
const {
  generateCertificate,
  getCertificates,
  getCertificateById
} = require('../controllers/certificateController');

// All certificate endpoints support authenticated and demo sessions
router.get('/', optionalAuth, getCertificates);
router.post('/generate', optionalAuth, generateCertificate);
router.get('/:id', optionalAuth, getCertificateById);

module.exports = router;
