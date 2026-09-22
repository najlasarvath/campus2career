const multer = require('multer');

/**
 * Centralized Express error handler middleware.
 * Intercepts Multer upload errors, PDF parsing failures, and general exceptions,
 * returning standardized JSON error payloads.
 */
const errorHandler = (err, req, res, next) => {
  // 1. Multer specific errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds 5MB limit'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
  }

  // 2. Custom file type validation error from upload.js
  if (err.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({
      success: false,
      message: 'Only PDF files are supported or file missing'
    });
  }

  // 3. PDF parsing failures (corrupted PDF / malformed structure)
  if (err.code === 'PDF_PARSE_ERROR' || err.message?.toLowerCase().includes('pdf') || err.message?.toLowerCase().includes('corrupt')) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Corrupted or unparseable PDF file'
    });
  }

  // 4. General application error
  const statusCode = err.statusCode || (err.status && typeof err.status === 'number' ? err.status : 500);
  const message = err.message || 'Internal Server Error';

  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message || err);

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
