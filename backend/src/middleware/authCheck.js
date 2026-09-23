const { supabase } = require('../config/supabaseClient');

/**
 * Authentication middleware verifying Bearer tokens via Supabase Auth.
 * Attaches the authenticated Supabase user to req.user.
 */
const authCheck = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Placeholder token validation with Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token'
      });
    }

    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    next(error);
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        req.user = user;
        req.userId = user.id;
      }
    }
  } catch {
    // proceed unauthenticated
  }
  next();
};

/**
 * Role-based authorization middleware.
 * Strictly blocks students from college-owned mutations (POST/PUT/PATCH/DELETE)
 * while preserving legitimate read access.
 */
const requireCollegeOrAdmin = (req, res, next) => {
  const role = req.user?.user_metadata?.role || req.user?.role || req.headers['x-user-role'];
  if (role === 'student') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Students have read-only access to college data and cannot create, modify, or delete college-owned resources.'
    });
  }
  next();
};

/**
 * Blocks students from company-owned mutations.
 */
const requireCompanyOrAdmin = (req, res, next) => {
  const role = req.user?.user_metadata?.role || req.user?.role || req.headers['x-user-role'];
  if (role === 'student') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Students cannot publish or modify company job requirements.'
    });
  }
  next();
};

module.exports = authCheck;
module.exports.authCheck = authCheck;
module.exports.optionalAuth = optionalAuth;
module.exports.requireCollegeOrAdmin = requireCollegeOrAdmin;
module.exports.requireCompanyOrAdmin = requireCompanyOrAdmin;
