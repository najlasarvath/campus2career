const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/authCheck');
const {
  generateCertificate,
  getCertificates,
  getCertificateById,
  downloadCertificatePdf
} = require('../controllers/certificateController');

// All certificate endpoints support authenticated and demo sessions
router.get('/', optionalAuth, getCertificates);
router.post('/generate', optionalAuth, generateCertificate);
router.get('/:id', optionalAuth, getCertificateById);
router.get('/:id/pdf', optionalAuth, downloadCertificatePdf);

module.exports = router;
