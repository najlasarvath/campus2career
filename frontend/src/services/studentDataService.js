/**
 * Student Data Service
 * Single Source of Truth for Student Profiles, Skills, Readiness, and Progress.
 * Strictly isolates demo data from real registered user storage.
 */

import { INITIAL_STUDENT_STATE } from '../mock-data/studentData';
import { getRoleBenchmark } from '../data/benchmarks/roleRequirements';

const getUserStorageKey = (userId) => `campus2career_user_${userId}`;

/**
 * Check if the user is explicitly the demo student
 */
export function isDemoStudentUser(user) {
  if (!user) return false;
  return Boolean(user.isDemo && (user.id === 'demo_student' || user.id === 'stu-8821'));
}

/**
 * Retrieve student data.
 * RULE: Only the explicit demo account loads INITIAL_STUDENT_STATE.
 * Real users ALWAYS load from user-specific persistent storage.
 */
export function getStudentData(user) {
  if (!user) return null;

  // 1. Explicit Demo Account
  if (isDemoStudentUser(user)) {
    return {
      userId: user.id,
      isDemo: true,
      hasSkillData: true,
      profile: {
        name: INITIAL_STUDENT_STATE.student.name,
        targetRole: INITIAL_STUDENT_STATE.student.target_role,
        college: 'Apex Institute of Technology',
        branch: 'Computer Science',
        year: 'Final Year'
      },
      skills: [
        { name: 'SQL', level: 95 },
        { name: 'Python', level: 80 },
        { name: 'Excel', level: 90 },
        { name: 'Statistics', level: 70 },
        { name: 'Power BI', level: 25 },
        { name: 'Data Visualization', level: 30 },
        { name: 'Tableau', level: 35 },
        { name: 'Git', level: 45 }
      ],
      roadmapProgress: [
        { week: 1, milestoneId: 'm-101', completed: true }
      ],
      mockInterviews: [],
      resourceProgress: [],
      // Preserved full demo bundle for 100% backward demo compatibility
      demoBundle: INITIAL_STUDENT_STATE
    };
  }

  // 2. Real Registered User
  const storageKey = getUserStorageKey(user.id);
  const raw = localStorage.getItem(storageKey);

  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      // Ensure targetRole and profile are up to date with auth profile
      parsed.profile = {
        ...parsed.profile,
        name: user.name || parsed.profile?.name || 'Student Candidate',
        email: user.email || parsed.profile?.email,
        college: user.college || user.collegeName || user.institution || parsed.profile?.college || 'University',
        branch: user.branch || parsed.profile?.branch || 'Engineering',
        year: user.year || parsed.profile?.year || '1st Year',
        targetRole: user.targetRole || parsed.profile?.targetRole || 'Data Analyst'
      };
      parsed.hasSkillData = Array.isArray(parsed.skills) && parsed.skills.length > 0;
      return parsed;
    } catch {
      // Parse error fallback
    }
  }

  // Initialize clean blank real user data (Zero demo data)
  const cleanRealUserData = {
    userId: user.id,
    isDemo: false,
    hasSkillData: false,
    profile: {
      name: user.name || 'Student Candidate',
      email: user.email,
      college: user.college || user.collegeName || user.institution || 'University',
      branch: user.branch || 'Engineering',
      year: user.year || '1st Year',
      targetRole: user.targetRole || 'Data Analyst'
    },
    skills: [],
    roadmapProgress: [],
    mockInterviews: [],
    resourceProgress: []
  };

  saveStudentData(user.id, cleanRealUserData);
  return cleanRealUserData;
}

/**
 * Save real student data to user-specific localStorage key
 */
export function saveStudentData(userId, data) {
  if (!userId) return;
  try {
    localStorage.setItem(getUserStorageKey(userId), JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save student data', err);
  }
}

/**
 * Add or update a skill for a real user
 */
export function addOrUpdateSkill(userId, skillName, level) {
  if (!userId || !skillName) return null;
  const storageKey = getUserStorageKey(userId);
  let data = null;
  try {
    const raw = localStorage.getItem(storageKey);
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = null;
  }

  if (!data) return null;

  const numericLevel = Math.max(0, Math.min(100, Number(level) || 0));
  const existingIdx = data.skills.findIndex(
    s => s.name.trim().toLowerCase() === skillName.trim().toLowerCase()
  );

  if (existingIdx >= 0) {
    data.skills[existingIdx] = {
      ...data.skills[existingIdx],
      name: skillName.trim(),
      level: numericLevel,
      updatedAt: new Date().toISOString()
    };
  } else {
    data.skills.push({
      name: skillName.trim(),
      level: numericLevel,
      updatedAt: new Date().toISOString()
    });
  }

  data.hasSkillData = data.skills.length > 0;
  saveStudentData(userId, data);
  return data;
}

/**
 * Remove a skill for a real user
 */
export function removeSkill(userId, skillName) {
  if (!userId || !skillName) return null;
  const storageKey = getUserStorageKey(userId);
  let data = null;
  try {
    const raw = localStorage.getItem(storageKey);
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = null;
  }

  if (!data) return null;

  data.skills = data.skills.filter(
    s => s.name.trim().toLowerCase() !== skillName.trim().toLowerCase()
  );
  data.hasSkillData = data.skills.length > 0;
  saveStudentData(userId, data);
  return data;
}

/**
 * Record roadmap milestone completion
 */
export function recordRoadmapProgress(userId, weekNum, milestoneId) {
  if (!userId) return null;
  const storageKey = getUserStorageKey(userId);
  let data = null;
  try {
    const raw = localStorage.getItem(storageKey);
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = null;
  }

  if (!data) return null;

  const existingIdx = data.roadmapProgress.findIndex(
    p => p.week === weekNum && p.milestoneId === milestoneId
  );

  if (existingIdx >= 0) {
    data.roadmapProgress[existingIdx].completed = !data.roadmapProgress[existingIdx].completed;
  } else {
    data.roadmapProgress.push({
      week: weekNum,
      milestoneId,
      completed: true,
      completedAt: new Date().toISOString()
    });
  }

  saveStudentData(userId, data);
  return data;
}

/**
 * Record a mock interview result
 */
export function recordMockInterview(userId, result) {
  if (!userId || !result) return null;
  const storageKey = getUserStorageKey(userId);
  let data = null;
  try {
    const raw = localStorage.getItem(storageKey);
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = null;
  }

  if (!data) return null;

  data.mockInterviews = [
    {
      id: `interview-${Date.now()}`,
      date: new Date().toLocaleDateString(),
      completedAt: new Date().toISOString(),
      ...result
    },
    ...(data.mockInterviews || [])
  ];

  saveStudentData(userId, data);
  return data;
}

/**
 * ====================================================================
 * CALCULATION ENGINE: Compares Candidate Skills against Role Benchmark
 * ====================================================================
 */
export function calculateStudentAnalytics(user, studentData) {
  if (!studentData) return null;

  // 1. If explicit demo user, return demo calculations directly
  if (isDemoStudentUser(user) && studentData.demoBundle) {
    return {
      hasSkillData: true,
      target_role: studentData.demoBundle.student.target_role,
      match_score: studentData.demoBundle.student.match_score,
      target_score: studentData.demoBundle.student.target_score,
      journey_stage: studentData.demoBundle.student.journey_stage,
      score_progression: studentData.demoBundle.student.score_progression,
      acquired_skills: studentData.demoBundle.acquired_skills,
      critical_gaps: studentData.demoBundle.critical_gaps,
      secondary_gaps: studentData.demoBundle.secondary_gaps,
      highest_impact_skill: studentData.demoBundle.highest_impact_skill,
      role_breakdown: studentData.demoBundle.role_breakdown,
      roadmap: studentData.demoBundle.roadmap,
      resources: studentData.demoBundle.resources,
      interview_flow: studentData.demoBundle.interview_flow,
      canned_qa: studentData.demoBundle.canned_assistant_qa
    };
  }

  // 2. Real User Pipeline
  const targetRole = studentData.profile?.targetRole || 'Data Analyst';
  const benchmark = getRoleBenchmark(targetRole);
  const userSkills = studentData.skills || [];

  if (!userSkills.length) {
    return {
      hasSkillData: false,
      target_role: targetRole,
      match_score: 0,
      target_score: benchmark.targetScore,
      journey_stage: 'Profile Setup Required',
      score_progression: [
        { stage: 'Add Candidate Skills', score: 0, delta: '0%', active: true },
        { stage: 'Baseline Gap Analysis', score: 0, delta: '+0%', active: false },
        { stage: 'Sprint Learning Milestones', score: 0, delta: '+0%', active: false },
        { stage: 'Benchmark Qualification', score: benchmark.targetScore, delta: `+${benchmark.targetScore}%`, active: false }
      ],
      acquired_skills: [],
      critical_gaps: benchmark.skills.filter(s => s.isCore).map(s => ({
        id: `gap-${s.skill}`,
        name: s.skill,
        category: s.category,
        priority: 'critical',
        status: 'gap',
        marketDemand: `${s.requiredLevel}%`,
        impactScore: s.weight * 4,
        reason: `Benchmark qualification requirement for ${targetRole}.`,
        deficit: s.requiredLevel
      })),
      secondary_gaps: benchmark.skills.filter(s => !s.isCore).map(s => ({
        id: `gap-${s.skill}`,
        name: s.skill,
        category: s.category,
        priority: 'secondary',
        status: 'secondary',
        marketDemand: `${s.requiredLevel}%`,
        impactScore: s.weight * 3,
        reason: `Supplementary differentiator for ${targetRole}.`,
        deficit: s.requiredLevel
      })),
      highest_impact_skill: {
        skill: benchmark.skills[0]?.skill || 'Core Competency',
        potential_lift: '+15%',
        unlocked_roles_count: 35,
        headline: `Add your verified skills to calculate your alignment for ${targetRole}`
      },
      role_breakdown: {
        role_name: targetRole,
        total_benchmark_skills: benchmark.skills.length,
        formula_summary: {
          matched_skills_count: 0,
          total_required_skills: benchmark.coreRequiredCount,
          critical_gaps_count: benchmark.coreRequiredCount,
          secondary_gaps_count: benchmark.skills.length - benchmark.coreRequiredCount,
          core_match_percent: 0,
          final_score: 0,
          explanation: 'No verified competencies yet. Add your current skills to calculate your live role alignment.'
        },
        skills_comparison: benchmark.skills.map(b => ({
          skill: b.skill,
          category: b.category,
          requiredLevel: b.requiredLevel,
          demonstratedLevel: 0,
          status: b.isCore ? 'critical_gap' : 'secondary_gap',
          isCore: b.isCore
        }))
      },
      roadmap: generateRealUserRoadmap([], benchmark, studentData.roadmapProgress),
      resources: generateResourcesForGaps(benchmark.skills),
      interview_flow: INITIAL_STUDENT_STATE.interview_flow,
      canned_qa: INITIAL_STUDENT_STATE.canned_assistant_qa
    };
  }

  // Calculate comparison against benchmark
  const comparison = benchmark.skills.map(bSkill => {
    const match = userSkills.find(
      u => u.name.trim().toLowerCase() === bSkill.skill.trim().toLowerCase()
    );
    const demonstratedLevel = match ? match.level : 0;
    const delta = demonstratedLevel - bSkill.requiredLevel;

    let status = 'secondary_gap';
    if (demonstratedLevel >= bSkill.requiredLevel - 5) {
      status = 'acquired';
    } else if (bSkill.isCore) {
      status = 'critical_gap';
    }

    return {
      skill: bSkill.skill,
      category: bSkill.category,
      requiredLevel: bSkill.requiredLevel,
      demonstratedLevel,
      status,
      isCore: bSkill.isCore,
      delta,
      weight: bSkill.weight
    };
  });

  // Also append user skills not present in standard benchmark as acquired bonus skills
  userSkills.forEach(uSkill => {
    const inBenchmark = benchmark.skills.some(
      b => b.skill.trim().toLowerCase() === uSkill.name.trim().toLowerCase()
    );
    if (!inBenchmark) {
      comparison.push({
        skill: uSkill.name,
        category: 'Additional Competency',
        requiredLevel: 60,
        demonstratedLevel: uSkill.level,
        status: uSkill.level >= 50 ? 'acquired' : 'secondary_gap',
        isCore: false,
        delta: uSkill.level - 60,
        weight: 5
      });
    }
  });

  const coreComparison = comparison.filter(c => c.isCore);
  const coreVerifiedCount = coreComparison.filter(c => c.status === 'acquired').length;
  const coreTotalCount = coreComparison.length || benchmark.coreRequiredCount;

  // Match score formula: (Core verified / Core total) * 100 + secondary bonus
  const coreBasePercent = Math.round((coreVerifiedCount / coreTotalCount) * 100);
  const secondaryBonus = comparison.filter(c => !c.isCore && c.status === 'acquired').length * 2;
  const finalScore = Math.min(100, Math.max(5, coreBasePercent + secondaryBonus));

  const acquired_skills = comparison
    .filter(c => c.status === 'acquired')
    .map(c => ({
      id: `acq-${c.skill}`,
      name: c.skill,
      category: c.category,
      proficiency: c.demonstratedLevel >= 85 ? 'Advanced' : 'Proficient',
      status: 'acquired',
      level: c.demonstratedLevel
    }));

  const critical_gaps = comparison
    .filter(c => c.status === 'critical_gap')
    .map(c => ({
      id: `crit-${c.skill}`,
      name: c.skill,
      category: c.category,
      priority: 'critical',
      status: 'gap',
      deficit: c.requiredLevel - c.demonstratedLevel,
      marketDemand: `${c.requiredLevel}%`,
      impactScore: c.weight * 4,
      reason: `Demonstrated level (${c.demonstratedLevel}%) is below the ${c.requiredLevel}% benchmark requirement.`
    }))
    .sort((a, b) => b.deficit - a.deficit);

  const secondary_gaps = comparison
    .filter(c => c.status === 'secondary_gap')
    .map(c => ({
      id: `sec-${c.skill}`,
      name: c.skill,
      category: c.category,
      priority: 'secondary',
      status: 'secondary',
      deficit: c.requiredLevel - c.demonstratedLevel,
      marketDemand: `${c.requiredLevel}%`,
      impactScore: c.weight * 2,
      reason: `Supplementary differentiator (${c.demonstratedLevel}% vs ${c.requiredLevel}% benchmark).`
    }));

  const highestImpact = critical_gaps[0] || secondary_gaps[0] || {
    name: 'Advanced Portfolio',
    deficit: 10
  };

  const highest_impact_skill = {
    skill: highestImpact.name,
    potential_lift: `+${Math.min(15, Math.max(5, Math.round(highestImpact.deficit / 3)))}%`,
    unlocked_roles_count: Math.max(10, Math.round(highestImpact.deficit * 1.5)),
    headline: `Closing your ${highestImpact.name} gap provides the largest immediate qualification boost.`,
    description: `Bridging the ${highestImpact.deficit}% delta in ${highestImpact.name} directly clears critical employer requisition filters.`
  };

  const gapNames = critical_gaps.map(g => g.name);
  const explanationText = coreVerifiedCount === coreTotalCount
    ? `All ${coreTotalCount} core required competencies are fully verified (${coreBasePercent}%). You meet benchmark qualifications!`
    : `Currently ${coreVerifiedCount} of ${coreTotalCount} core required competencies are verified (${coreBasePercent}%). ${
        gapNames.length > 0 ? `The largest current gaps are ${gapNames.slice(0, 2).join(' and ')}.` : ''
      }`;

  const role_breakdown = {
    role_name: targetRole,
    total_benchmark_skills: comparison.length,
    formula_name: 'Match Score = (Matched Core Skills / Required Core Skills) × 100 + Bonuses',
    formula_summary: {
      matched_skills_count: coreVerifiedCount,
      total_required_skills: coreTotalCount,
      critical_gaps_count: critical_gaps.length,
      secondary_gaps_count: secondary_gaps.length,
      core_match_percent: coreBasePercent,
      final_score: finalScore,
      gap_names: gapNames,
      explanation: explanationText
    },
    skills_comparison: comparison
  };

  const score_progression = [
    { stage: 'Current Evaluation', score: finalScore, delta: '+0%', active: true },
    { stage: `Remediate ${highestImpact.name}`, score: Math.min(100, finalScore + 6), delta: '+6%', active: false },
    { stage: 'Mock Validation Drill', score: Math.min(100, finalScore + 12), delta: '+12%', active: false },
    { stage: 'Role Benchmark Target', score: benchmark.targetScore, delta: `Target: ${benchmark.targetScore}%`, active: false }
  ];

  return {
    hasSkillData: true,
    target_role: targetRole,
    match_score: finalScore,
    target_score: benchmark.targetScore,
    journey_stage: finalScore >= benchmark.targetScore ? 'Offer Ready' : 'Active Skill Sprint',
    score_progression,
    acquired_skills,
    critical_gaps,
    secondary_gaps,
    highest_impact_skill,
    role_breakdown,
    roadmap: generateRealUserRoadmap(critical_gaps, benchmark, studentData.roadmapProgress),
    resources: generateResourcesForGaps(critical_gaps.length ? critical_gaps : benchmark.skills),
    interview_flow: INITIAL_STUDENT_STATE.interview_flow,
    canned_qa: INITIAL_STUDENT_STATE.canned_assistant_qa
  };
}

/**
 * Generate a dynamic 4-week roadmap based on the user's actual gaps
 */
function generateRealUserRoadmap(criticalGaps, benchmark, completedProgress = []) {
  const topGap1 = criticalGaps[0]?.name || benchmark.skills[0]?.skill || 'Core Competency';
  const topGap2 = criticalGaps[1]?.name || benchmark.skills[1]?.skill || 'Technical Analysis';

  const isCompleted = (week, mId) =>
    completedProgress.some(p => p.week === week && p.milestoneId === mId && p.completed);

  return [
    {
      week: 1,
      title: `${topGap1} Fundamentals & Setup`,
      focusSkill: topGap1,
      status: isCompleted(1, 'm-102') ? 'done' : 'in-progress',
      estimatedHours: 8,
      objective: `Establish strong working command of ${topGap1} syntax and core practical workflows.`,
      milestones: [
        { id: 'm-101', title: `Complete interactive introductory modules for ${topGap1}`, completed: isCompleted(1, 'm-101') },
        { id: 'm-102', title: `Build an initial practice project demonstrating ${topGap1}`, completed: isCompleted(1, 'm-102') }
      ]
    },
    {
      week: 2,
      title: `${topGap2} Applied Practice`,
      focusSkill: topGap2,
      status: isCompleted(2, 'm-202') ? 'done' : 'locked',
      estimatedHours: 8,
      objective: `Apply structured patterns in ${topGap2} to solve real-world problem statements.`,
      milestones: [
        { id: 'm-201', title: `Translate business requirements into ${topGap2} solutions`, completed: isCompleted(2, 'm-201') },
        { id: 'm-202', title: `Validate edge cases and optimize execution performance`, completed: isCompleted(2, 'm-202') }
      ]
    },
    {
      week: 3,
      title: 'Integrated Project & Verification',
      focusSkill: `${topGap1} & ${topGap2}`,
      status: isCompleted(3, 'm-302') ? 'done' : 'locked',
      estimatedHours: 10,
      objective: 'Synthesize acquired competencies into an end-to-end portfolio project.',
      milestones: [
        { id: 'm-301', title: 'Architect multi-component pipeline integrating your skills', completed: isCompleted(3, 'm-301') },
        { id: 'm-302', title: 'Document GitHub repository with clean README and insights', completed: isCompleted(3, 'm-302') }
      ]
    },
    {
      week: 4,
      title: 'Technical Mock Drills & Screening',
      focusSkill: 'Technical Interview Prep',
      status: 'locked',
      estimatedHours: 6,
      objective: 'Pass automated conceptual drills and practice verbal technical defenses.',
      milestones: [
        { id: 'm-401', title: 'Complete 2-minute timed technical drill session', completed: isCompleted(4, 'm-401') },
        { id: 'm-402', title: 'Review flagged conceptual gaps and finalize candidate resume', completed: isCompleted(4, 'm-402') }
      ]
    }
  ];
}

/**
 * Generate resources tailored to actual user gaps
 */
function generateResourcesForGaps(gaps) {
  const resourceCatalog = { ...INITIAL_STUDENT_STATE.resources };

  // Ensure default keys exist for common gaps
  gaps.forEach(g => {
    const name = g.name || g.skill;
    if (!resourceCatalog[name]) {
      resourceCatalog[name] = [
        {
          id: `res-${name}-1`,
          title: `Mastering ${name}: Foundations & Best Practices`,
          provider: 'Official Documentation & Guided Path',
          url: 'https://learn.microsoft.com',
          tier: 'FREE',
          format: 'Documentation & Labs',
          estimatedHours: 6,
          skillTarget: name,
          tag: 'Official Free'
        },
        {
          id: `res-${name}-2`,
          title: `Hands-On Portfolio Workshop for ${name}`,
          provider: 'Interactive Learning Platform',
          url: 'https://coursera.org',
          tier: 'LOW COST',
          format: 'Project Course',
          estimatedHours: 10,
          skillTarget: name,
          tag: 'Recommended Capstone'
        }
      ];
    }
  });

  return resourceCatalog;
}
