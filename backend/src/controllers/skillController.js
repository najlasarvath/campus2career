const { supabase } = require('../config/supabaseClient');
const { extractSkills } = require('../services/skillExtractionService');
const { calculateMatchScore } = require('../services/matchScoreService');

/**
 * Helper to query role requirements directly from Supabase (single source of truth).
 * @param {string} roleIdentifier - role_id (e.g. 'full-stack-developer') or title
 */
async function getRoleRequirementFromDatabase(roleIdentifier) {
  if (!roleIdentifier || typeof roleIdentifier !== 'string') {
    return null;
  }

  const cleanRole = roleIdentifier.trim();
  const slug = cleanRole.toLowerCase().replace(/\s+/g, '-');

  const { data, error } = await supabase
    .from('role_requirements')
    .select('*')
    .or(`role_id.eq.${slug},role_id.eq.${cleanRole},title.ilike.%${cleanRole}%`)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(`[SkillController] Supabase query error for role "${cleanRole}":`, error.message);
    return null;
  }

  return data;
}

/**
 * Controller: Extract skills from resume text and compute initial match against target role.
 * POST /api/skills/extract
 */
async function extractSkillsHandler(req, res, next) {
  try {
    const { resumeText, targetRole } = req.body;

    if (!resumeText) {
      return res.status(400).json({
        success: false,
        message: 'resumeText is required'
      });
    }

    // 1. Run extraction stub
    const { skills: extractedSkills } = extractSkills(resumeText);

    // 2. Query Supabase for role requirements
    if (targetRole) {
      const roleData = await getRoleRequirementFromDatabase(targetRole);

      if (!roleData) {
        return res.status(404).json({
          success: false,
          message: `Role requirements for '${targetRole}' not found in database. Ensure seed.sql is applied.`
        });
      }

      const matchResult = calculateMatchScore(extractedSkills, {
        coreSkills: roleData.core_skills || [],
        secondarySkills: roleData.secondary_skills || []
      });

      return res.status(200).json({
        success: true,
        extractedSkills,
        missingSkills: [...matchResult.criticalGaps, ...matchResult.secondaryGaps],
        matchPercentage: matchResult.matchScore,
        details: {
          acquired: matchResult.acquired,
          criticalGaps: matchResult.criticalGaps,
          secondaryGaps: matchResult.secondaryGaps
        }
      });
    }

    return res.status(200).json({
      success: true,
      extractedSkills
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: Calculate match score given extracted skills and target role.
 * POST /api/skills/match
 */
async function calculateMatchHandler(req, res, next) {
  try {
    const { extractedSkills = [], targetRole, roleRequirements } = req.body;

    let targetRequirements = roleRequirements;

    // Fetch requirements from Supabase if role identifier provided
    if (!targetRequirements && targetRole) {
      const roleData = await getRoleRequirementFromDatabase(targetRole);

      if (!roleData) {
        return res.status(404).json({
          success: false,
          message: `Role requirements for '${targetRole}' not found in database. Ensure seed.sql is applied.`
        });
      }

      targetRequirements = {
        coreSkills: roleData.core_skills || [],
        secondarySkills: roleData.secondary_skills || []
      };
    }

    if (!targetRequirements) {
      return res.status(400).json({
        success: false,
        message: 'Either targetRole or roleRequirements object must be provided'
      });
    }

    const result = calculateMatchScore(extractedSkills, targetRequirements);

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  extractSkillsHandler,
  calculateMatchHandler
};
