const { supabase } = require('../config/supabaseClient');
const { calculateMatchScore } = require('../services/matchScoreService');
const fallbackRoles = require('../data/roleRequirements.json').roles;

/**
 * Helper to fetch role requirements from Supabase or fallback json
 */
async function fetchRoleRequirements(targetRole) {
  if (!targetRole) return null;

  try {
    const slug = targetRole.toLowerCase().trim().replace(/\s+/g, '-');
    const { data: dbRole } = await supabase
      .from('role_requirements')
      .select('*')
      .or(`role_id.eq.${slug},title.ilike.%${targetRole.trim()}%`)
      .limit(1)
      .maybeSingle();

    if (dbRole) {
      return {
        roleId: dbRole.role_id,
        title: dbRole.title,
        coreSkills: dbRole.core_skills || [],
        secondarySkills: dbRole.secondary_skills || []
      };
    }
  } catch (err) {
    console.warn('[studentController] DB role lookup warning:', err.message);
  }

  // Fallback to local roleRequirements.json
  const match = fallbackRoles.find(r => 
    r.id.toLowerCase() === targetRole.toLowerCase().trim().replace(/\s+/g, '-') ||
    r.title.toLowerCase() === targetRole.toLowerCase().trim()
  );

  if (match) {
    return {
      roleId: match.id,
      title: match.title,
      coreSkills: match.coreSkills || [],
      secondarySkills: match.secondarySkills || []
    };
  }

  return null;
}

/**
 * GET /api/students/me
 * Retrieves dynamic real-time dashboard data for the authenticated student.
 */
async function getStudentDashboard(req, res, next) {
  try {
    const authUser = req.user;
    if (!authUser) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    // 1. Fetch student record
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*, colleges(name)')
      .or(`auth_user_id.eq.${authUser.id},email.eq.${authUser.email}`)
      .maybeSingle();

    if (studentError) {
      console.error('[studentController] Error fetching student:', studentError.message);
    }

    const name = student?.full_name || authUser.user_metadata?.full_name || 'Student';
    const email = student?.email || authUser.email;
    const targetRole = student?.target_role || authUser.user_metadata?.target_role || 'Full Stack Developer';
    const college = student?.colleges?.name || authUser.user_metadata?.college || 'University';
    const branch = authUser.user_metadata?.branch || null;
    const year = authUser.user_metadata?.year || null;
    const extractedSkills = Array.isArray(student?.extracted_skills) ? student.extracted_skills : [];

    // 2. Fetch role requirements & compute match metrics
    const roleReqs = await fetchRoleRequirements(targetRole);

    let matchScore = 0;
    let acquiredSkills = [];
    let criticalGaps = [];
    let secondarySkills = [];
    let totalSkills = 0;
    let skillsDemonstrated = 0;
    let topSkill = '';
    let upcomingMilestone = '';

    if (roleReqs) {
      const matchResult = calculateMatchScore(extractedSkills, roleReqs);
      matchScore = matchResult.matchScore;
      acquiredSkills = matchResult.acquired || [];
      criticalGaps = matchResult.criticalGaps || [];
      secondarySkills = matchResult.secondaryGaps || [];
      totalSkills = (roleReqs.coreSkills?.length || 0) + (roleReqs.secondarySkills?.length || 0);
      skillsDemonstrated = acquiredSkills.length;
      topSkill = criticalGaps[0] || (acquiredSkills[0] || targetRole);
      upcomingMilestone = criticalGaps.length > 0 ? `Learn ${criticalGaps[0]}` : 'Ready for Interviews';
    } else {
      acquiredSkills = extractedSkills;
      skillsDemonstrated = extractedSkills.length;
      totalSkills = Math.max(extractedSkills.length, 5);
      topSkill = extractedSkills[0] || 'Technical Skills';
      upcomingMilestone = 'Define your career milestone';
    }

    return res.status(200).json({
      success: true,
      student: {
        id: student?.id || authUser.id,
        authUserId: authUser.id,
        name,
        email,
        college,
        branch,
        year,
        role: targetRole,
        targetRole,
        matchScore,
        acquiredSkills,
        criticalGaps,
        secondarySkills,
        topSkill,
        upcomingMilestone,
        skillsDemonstrated,
        totalSkills,
        mockInterviewsCompleted: 0,
        progressScore: matchScore,
        extractedSkills
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/students/me
 * Update student target role, personal details, or skills.
 */
async function updateStudentProfile(req, res, next) {
  try {
    const authUser = req.user;
    if (!authUser) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    const { targetRole, fullName, extractedSkills, skills } = req.body;
    const updates = {};
    if (targetRole) updates.target_role = targetRole;
    if (fullName) updates.full_name = fullName;
    const skillsList = extractedSkills || skills;
    if (Array.isArray(skillsList)) {
      updates.extracted_skills = skillsList.map(s => typeof s === 'string' ? s : s?.name).filter(Boolean);
    }
    updates.updated_at = new Date().toISOString();

    const { data: updated, error } = await supabase
      .from('students')
      .update(updates)
      .eq('auth_user_id', authUser.id)
      .select()
      .maybeSingle();

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(200).json({
      success: true,
      student: updated
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStudentDashboard,
  updateStudentProfile
};
