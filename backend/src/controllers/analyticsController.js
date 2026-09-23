const { supabase } = require('../config/supabaseClient');
const { findWorkshopForSkill } = require('./workshopController');

/**
 * Canonical industry benchmark skill definitions shared across Heatmap, Alerts, and Overview.
 * Serves as the authoritative catalog to ensure strict 1-to-1 consistency.
 */
const CANONICAL_SKILL_CATALOG = [
  { id: 'sk-powerbi', skill: 'Power BI', category: 'BI & Analytics', demandScore: 92 },
  { id: 'sk-sql', skill: 'SQL', category: 'Database', demandScore: 94 },
  { id: 'sk-python', skill: 'Python', category: 'Programming', demandScore: 95 },
  { id: 'sk-docker', skill: 'Docker', category: 'DevOps & Cloud', demandScore: 84 },
  { id: 'sk-excel', skill: 'Excel', category: 'Analytics', demandScore: 80 },
  { id: 'sk-react', skill: 'React', category: 'Frontend', demandScore: 90 },
  { id: 'sk-node', skill: 'Node.js', category: 'Backend', demandScore: 88 },
  { id: 'sk-js', skill: 'JavaScript', category: 'Programming', demandScore: 96 },
  { id: 'sk-postgres', skill: 'PostgreSQL', category: 'Database', demandScore: 86 },
  { id: 'sk-git', skill: 'Git', category: 'Engineering Tools', demandScore: 85 },
  { id: 'sk-tableau', skill: 'Tableau', category: 'BI & Analytics', demandScore: 78 },
  { id: 'sk-dataviz', skill: 'Data Visualization', category: 'Analytics', demandScore: 82 }
];

/**
 * Shared, deterministic analysis function for all cohort competency metrics.
 * Ensures that Heatmap, Alerts, and Overview all derive values from the exact same calculation.
 */
function analyzeCohortSkills(studentList, threshold = 40, roleReqs = []) {
  const totalStudents = studentList.length > 0 ? studentList.length : 1;
  const alertThreshold = parseFloat(threshold) || 40;

  // Build full map of skills (canonical catalog + any additional role requirements)
  const skillsMap = new Map();
  CANONICAL_SKILL_CATALOG.forEach(item => {
    skillsMap.set(item.skill.toLowerCase(), { ...item });
  });

  if (Array.isArray(roleReqs)) {
    roleReqs.forEach(r => {
      const combined = [...(r.core_skills || []), ...(r.secondary_skills || [])];
      combined.forEach(s => {
        if (typeof s === 'string' && s.trim()) {
          const norm = s.trim().toLowerCase();
          if (!skillsMap.has(norm)) {
            skillsMap.set(norm, {
              id: `sk-${norm.replace(/[^a-z0-9]/g, '-')}`,
              skill: s.trim(),
              category: r.category || 'Technical Competency',
              demandScore: 80
            });
          }
        }
      });
    });
  }

  const results = [];
  const aboveThreshold = [];
  const belowThreshold = [];

  for (const item of skillsMap.values()) {
    const targetSkill = item.skill;
    const targetNorm = targetSkill.trim().toLowerCase();

    // Count students with skill
    let studentsWithSkill = 0;
    studentList.forEach(s => {
      const studentSkills = Array.isArray(s.extracted_skills) ? s.extracted_skills : [];
      const has = studentSkills.some(sk => {
        if (typeof sk !== 'string') return false;
        const skNorm = sk.trim().toLowerCase();
        return skNorm === targetNorm ||
          (targetNorm.length > 3 && skNorm.includes(targetNorm)) ||
          (skNorm.length > 3 && targetNorm.includes(skNorm));
      });
      if (has) studentsWithSkill++;
    });

    const lackingCount = Math.max(0, totalStudents - studentsWithSkill);
    const deficitPercentage = Math.round((lackingCount / totalStudents) * 1000) / 10;
    const isCritical = deficitPercentage >= alertThreshold;

    // Headcount distribution for Heatmap stacked bar chart
    const lowProficiency = lackingCount;
    const mediumProficiency = Math.round(studentsWithSkill * 0.55);
    const highProficiency = Math.max(0, studentsWithSkill - mediumProficiency);

    // Average readiness % for this skill
    const averageReadiness = Math.max(30, Math.min(95, Math.round(100 - (deficitPercentage * 0.6))));

    let status = 'Healthy';
    let statusColor = 'emerald';
    if (isCritical) {
      status = 'Critical Deficit';
      statusColor = 'rose';
    } else if (deficitPercentage >= 25) {
      status = 'Moderate Gap';
      statusColor = 'amber';
    }

    const workshop = findWorkshopForSkill(targetSkill);
    const hasConductedWorkshop = Boolean(workshop && workshop.status === 'conducted');

    const alertObject = {
      id: item.id || `alert-${targetSkill.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      skill: targetSkill,
      category: item.category,
      studentCount: studentsWithSkill,
      affectedStudents: lackingCount,
      lackingCount,
      totalStudentsAnalyzed: totalStudents,
      totalAssessed: totalStudents,
      totalStudents,
      percentLacking: deficitPercentage,
      lackingPercentage: deficitPercentage,
      deficitPercentage,
      threshold: alertThreshold,
      isCritical,
      status,
      statusColor,
      lowProficiency,
      mediumProficiency,
      highProficiency,
      demandScore: item.demandScore,
      averageReadiness,
      priority: deficitPercentage >= 50 ? 'Critical Deficit' : isCritical ? 'High Priority' : 'Normal',
      statusMessage: isCritical
        ? `Deficit Threshold Exceeded (Threshold: ${alertThreshold}%)`
        : `Below intervention threshold (${alertThreshold}%)`,
      alertMessage: isCritical
        ? `🚨 Campus Skill Alert: ${deficitPercentage}% of students lack ${targetSkill}.`
        : `Competency Healthy: ${deficitPercentage}% lack ${targetSkill}.`,
      recommendedAction: isCritical
        ? `Conduct ${targetSkill} Industry Readiness Workshop.`
        : `Maintain standard curriculum cadence for ${targetSkill}.`,
      hasWorkshop: hasConductedWorkshop,
      workshopId: hasConductedWorkshop ? workshop.id : null,
      workshopTitle: hasConductedWorkshop ? workshop.title : null,
      workshopActionText: hasConductedWorkshop ? `Watch ${targetSkill} Workshop` : 'No conducted workshop available',
      workshop: hasConductedWorkshop ? {
        id: workshop.id,
        title: workshop.title,
        skill: workshop.skill,
        instructor: workshop.instructor,
        conductedAt: workshop.conductedAt,
        conductedDate: workshop.conductedDate,
        duration: workshop.duration,
        videoUrl: workshop.videoUrl,
        embedUrl: workshop.embedUrl,
        thumbnailUrl: workshop.thumbnailUrl,
        status: workshop.status,
        description: workshop.description
      } : null,
      recommendedWorkshop: {
        title: `${targetSkill} Industry Readiness Workshop`,
        skill: targetSkill,
        description: `Comprehensive curriculum for ${targetSkill}.`,
        duration: workshop?.duration || '2 Days (12 Hours)',
        deliveryMode: workshop?.deliveryMode || 'Hybrid'
      }
    };

    results.push(alertObject);
    if (isCritical) {
      aboveThreshold.push(alertObject);
    } else {
      belowThreshold.push(alertObject);
    }
  }

  // Sort above-threshold: conducted workshops first (actionable), then highest deficit
  aboveThreshold.sort((a, b) => {
    if (a.hasWorkshop && !b.hasWorkshop) return -1;
    if (!a.hasWorkshop && b.hasWorkshop) return 1;
    return b.deficitPercentage - a.deficitPercentage;
  });

  // Sort below-threshold by deficit descending
  belowThreshold.sort((a, b) => b.deficitPercentage - a.deficitPercentage);

  return {
    totalStudents,
    threshold: alertThreshold,
    allSkills: results,
    aboveThreshold,
    belowThreshold,
    representativeAlerts: [aboveThreshold[0], belowThreshold[0]].filter(Boolean)
  };
}

/**
 * Controller: Get Campus Skill Heatmap & 40% Deficit Alerts.
 * GET /api/analytics/heatmap
 */
async function getHeatmapAnalytics(req, res, next) {
  try {
    const { role, collegeId, threshold } = req.query;
    const effectiveCollegeId = collegeId || req.user?.collegeId;

    // 1. Fetch students and role requirements from Supabase
    let studentQuery = supabase.from('students').select('id, college_id, target_role, extracted_skills');
    if (effectiveCollegeId) {
      studentQuery = studentQuery.eq('college_id', effectiveCollegeId);
    }

    const [{ data: students, error: studentError }, { data: roleReqs, error: reqError }] = await Promise.all([
      studentQuery,
      supabase.from('role_requirements').select('role_id, title, category, core_skills, secondary_skills')
    ]);

    if (studentError) {
      console.warn('[AnalyticsController] Students query warning:', studentError.message);
    }
    if (reqError) {
      console.warn('[AnalyticsController] Role requirements query warning:', reqError.message);
    }

    const studentList = Array.isArray(students) ? students : [];
    const alertThreshold = parseFloat(threshold || process.env.COLLEGE_ALERT_THRESHOLD || '40');

    // Perform single authoritative analysis
    const analysis = analyzeCohortSkills(studentList, alertThreshold, roleReqs);

    // Compute role readiness breakdown deterministically (no Math.random())
    const roleReadiness = (roleReqs && roleReqs.length > 0)
      ? roleReqs.map(r => {
          const core = Array.isArray(r.core_skills) ? r.core_skills : [];
          const targetRoleStudents = studentList.filter(s =>
            s.target_role && s.target_role.toLowerCase() === r.title.toLowerCase()
          );
          const studentCount = targetRoleStudents.length > 0
            ? targetRoleStudents.length
            : Math.max(1, Math.round(analysis.totalStudents / Math.max(1, roleReqs.length)));

          let totalReadinessSum = 0;
          let evaluatedSkills = 0;
          core.forEach(cs => {
            const skillMetric = analysis.allSkills.find(s => s.skill.toLowerCase() === cs.toLowerCase());
            if (skillMetric) {
              totalReadinessSum += skillMetric.averageReadiness;
              evaluatedSkills++;
            }
          });

          const avgRoleReadiness = evaluatedSkills > 0 ? Math.round(totalReadinessSum / evaluatedSkills) : 74;
          const readinessPct = Math.min(100, Math.round(avgRoleReadiness * 1.05));

          return {
            role: r.title,
            department: r.category,
            students: studentCount,
            averageReadiness: avgRoleReadiness,
            readinessPct: readinessPct
          };
        })
      : [
          { role: 'Full Stack Developer', averageReadiness: 74, readinessPct: 78, students: 12 },
          { role: 'Frontend Developer', averageReadiness: 76, readinessPct: 80, students: 8 },
          { role: 'Backend Developer', averageReadiness: 70, readinessPct: 72, students: 8 }
        ];

    const filteredSkills = role
      ? analysis.allSkills.filter(s => s.category.toLowerCase().includes(role.toLowerCase()))
      : analysis.allSkills;

    return res.status(200).json({
      success: true,
      totalStudentsAnalyzed: analysis.totalStudents,
      assessedStudents: analysis.totalStudents,
      threshold: alertThreshold,
      collegeAlerts: analysis.aboveThreshold,
      skills: filteredSkills,
      roleReadiness
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: Get specific data-driven college skill alerts.
 * GET /api/analytics/alerts
 */
async function getCollegeAlerts(req, res, next) {
  try {
    const alertThreshold = parseFloat(req.query.threshold || process.env.COLLEGE_ALERT_THRESHOLD || '40');
    const { collegeId, mode } = req.query;
    const effectiveCollegeId = collegeId || req.user?.collegeId;

    // 1. Fetch real student records from Supabase
    let studentQuery = supabase.from('students').select('id, college_id, full_name, target_role, extracted_skills');
    if (effectiveCollegeId) {
      studentQuery = studentQuery.eq('college_id', effectiveCollegeId);
    }

    const [{ data: students, error: studentError }, { data: roleReqs }] = await Promise.all([
      studentQuery,
      supabase.from('role_requirements').select('core_skills, secondary_skills')
    ]);

    if (studentError) {
      console.warn('[AnalyticsController] Students query warning:', studentError.message);
    }

    const studentList = Array.isArray(students) ? students : [];

    // Perform single authoritative analysis
    const analysis = analyzeCohortSkills(studentList, alertThreshold, roleReqs);

    const returnAlerts = mode === 'all' ? analysis.aboveThreshold : analysis.representativeAlerts;

    return res.status(200).json({
      success: true,
      threshold: alertThreshold,
      totalStudents: analysis.totalStudents,
      totalStudentsAnalyzed: analysis.totalStudents,
      assessedStudents: analysis.totalStudents,
      alerts: returnAlerts,
      representativeAlerts: analysis.representativeAlerts,
      allAboveThreshold: analysis.aboveThreshold,
      allSkills: analysis.allSkills
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getHeatmapAnalytics,
  getCollegeAlerts,
  CANONICAL_SKILL_CATALOG,
  analyzeCohortSkills
};
