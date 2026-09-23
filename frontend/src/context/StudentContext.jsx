import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth, DEMO_USERS } from './AuthContext';
import apiClient from '../services/api';
import {
  getStudentData,
  saveStudentData,
  calculateStudentAnalytics,
  isDemoStudentUser
} from '../services/studentDataService';
import { getRoleBenchmark } from '../data/benchmarks/roleRequirements';

const StudentContext = createContext(null);

export function StudentProvider({ children }) {
  const { user, isAuthenticated } = useAuth();

  // For College role viewing student experience
  const [collegeSelectedStudentId, setCollegeSelectedStudentId] = useState('demo_student');

  // Backend student data state for real authenticated users
  const [backendStudent, setBackendStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Demo student data state
  const isDemo = Boolean(user?.isDemo);
  const [demoStudentData, setDemoStudentData] = useState(() => (isDemo ? getStudentData(user) : null));
  const [roadmapUpdatedBanner, setRoadmapUpdatedBanner] = useState(false);

  // Fetch real student data from backend GET /api/students/me
  const fetchBackendStudent = useCallback(async () => {
    if (!isAuthenticated || isDemo) return;

    setIsLoading(true);
    setApiError(null);
    try {
      const response = await apiClient.get('/students/me');
      if (response && response.student) {
        setBackendStudent(response.student);
      }
    } catch (err) {
      console.error('[StudentContext] Failed to fetch student data from backend:', err);
      setApiError(err.message || 'Failed to load student data from server');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isDemo]);

  // Trigger fetch when user changes
  useEffect(() => {
    if (isAuthenticated && !isDemo) {
      fetchBackendStudent();
    } else if (isDemo && user) {
      setDemoStudentData(getStudentData(user));
      setBackendStudent(null);
    } else {
      setBackendStudent(null);
      setDemoStudentData(null);
    }
  }, [isAuthenticated, isDemo, user, fetchBackendStudent]);

  // Add or update skill
  const addOrUpdateSkill = useCallback(async (skillName, level = 80) => {
    if (!skillName) return;

    if (isDemo) {
      setDemoStudentData(prev => {
        if (!prev) return prev;
        const skills = [...(prev.skills || [])];
        const idx = skills.findIndex(s => s.name.toLowerCase() === skillName.toLowerCase());
        if (idx >= 0) skills[idx] = { ...skills[idx], level: Number(level) };
        else skills.push({ name: skillName, level: Number(level) });
        return { ...prev, skills };
      });
      return;
    }

    // Real backend update via PUT /api/students/me
    try {
      setIsLoading(true);
      const currentList = Array.isArray(backendStudent?.extractedSkills)
        ? [...backendStudent.extractedSkills]
        : [];

      if (!currentList.some(s => s.toLowerCase() === skillName.trim().toLowerCase())) {
        currentList.push(skillName.trim());
      }

      await apiClient.put('/students/me', {
        skills: currentList
      });

      await fetchBackendStudent();
    } catch (err) {
      console.error('[StudentContext] Failed to add skill:', err);
      setApiError(err.message || 'Failed to persist skill to server');
    } finally {
      setIsLoading(false);
    }
  }, [isDemo, backendStudent, fetchBackendStudent]);

  // Remove skill
  const removeSkill = useCallback(async (skillName) => {
    if (!skillName) return;

    if (isDemo) {
      setDemoStudentData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          skills: (prev.skills || []).filter(s => s.name.toLowerCase() !== skillName.toLowerCase())
        };
      });
      return;
    }

    try {
      setIsLoading(true);
      const currentList = Array.isArray(backendStudent?.extractedSkills)
        ? backendStudent.extractedSkills.filter(s => s.toLowerCase() !== skillName.trim().toLowerCase())
        : [];

      await apiClient.put('/students/me', {
        skills: currentList
      });

      await fetchBackendStudent();
    } catch (err) {
      console.error('[StudentContext] Failed to remove skill:', err);
      setApiError(err.message || 'Failed to remove skill from server');
    } finally {
      setIsLoading(false);
    }
  }, [isDemo, backendStudent, fetchBackendStudent]);

  // Update target role
  const updateTargetRole = useCallback(async (newRole) => {
    if (!newRole) return;

    if (isDemo) {
      setDemoStudentData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          profile: { ...prev.profile, targetRole: newRole }
        };
      });
      return;
    }

    try {
      setIsLoading(true);
      await apiClient.put('/students/me', {
        targetRole: newRole
      });
      await fetchBackendStudent();
    } catch (err) {
      console.error('[StudentContext] Failed to update target role:', err);
      setApiError(err.message || 'Failed to update target role on server');
    } finally {
      setIsLoading(false);
    }
  }, [isDemo, fetchBackendStudent]);

  // Toggle milestone (roadmap checkbox)
  const toggleMilestone = useCallback((weekNum, milestoneId) => {
    if (isDemo && demoStudentData?.demoBundle) {
      setDemoStudentData(prev => {
        if (!prev || !prev.demoBundle) return prev;
        const newRoadmap = prev.demoBundle.roadmap.map(w => {
          if (w.week === weekNum) {
            return {
              ...w,
              milestones: w.milestones.map(m => m.id === milestoneId ? { ...m, completed: !m.completed } : m)
            };
          }
          return w;
        });
        return {
          ...prev,
          demoBundle: { ...prev.demoBundle, roadmap: newRoadmap }
        };
      });
    }
  }, [isDemo, demoStudentData]);

  // Complete mock interview callback
  const completeMockInterview = useCallback((resultData) => {
    setRoadmapUpdatedBanner(true);
  }, []);

  // Set score stage simulation (demo)
  const setScoreStage = useCallback((targetScore, stageName) => {
    if (isDemo && demoStudentData?.demoBundle) {
      setDemoStudentData(prev => {
        if (!prev || !prev.demoBundle) return prev;
        return {
          ...prev,
          demoBundle: {
            ...prev.demoBundle,
            student: {
              ...prev.demoBundle.student,
              match_score: targetScore,
              journey_stage: stageName || prev.demoBundle.student.journey_stage
            }
          }
        };
      });
    }
  }, [isDemo, demoStudentData]);

  // Mark skill demonstrated
  const markSkillDemonstrated = useCallback((skillName = 'Power BI') => {
    addOrUpdateSkill(skillName, 85);
  }, [addOrUpdateSkill]);

  // Reset demo
  const resetDemo = useCallback(() => {
    if (isDemo && user) {
      setDemoStudentData(getStudentData(user));
      setRoadmapUpdatedBanner(false);
    }
  }, [isDemo, user]);

  // Compute final contextual presentation data
  const contextValue = useMemo(() => {
    // 1. If in Demo Mode, format via studentDataService
    if (isDemo) {
      const demoEffectiveUser = DEMO_USERS.student;
      const demoAnalytics = calculateStudentAnalytics(demoEffectiveUser, demoStudentData || getStudentData(demoEffectiveUser));

      const studentProfile = {
        id: demoEffectiveUser.id,
        name: demoEffectiveUser.name,
        target_role: demoAnalytics?.target_role || 'Data Analyst',
        match_score: demoAnalytics?.match_score ?? 68,
        target_score: 85,
        journey_stage: 'Active Candidate',
        score_progression: demoAnalytics?.score_progression || [],
        isDemo: true
      };

      return {
        hasSkillData: true,
        isDemo: true,
        isLoading: false,
        apiError: null,
        rawSkills: demoStudentData?.skills || [],
        student: studentProfile,
        target_role: studentProfile.target_role,
        match_score: studentProfile.match_score,
        readiness_score: studentProfile.match_score,
        target_score: studentProfile.target_score,
        journey_stage: studentProfile.journey_stage,
        score_progression: studentProfile.score_progression,
        acquired_skills: demoAnalytics?.acquired_skills || [],
        critical_gaps: demoAnalytics?.critical_gaps || [],
        secondary_gaps: demoAnalytics?.secondary_gaps || [],
        highest_impact_skill: demoAnalytics?.highest_impact_skill || { skill: 'Power BI' },
        role_breakdown: demoAnalytics?.role_breakdown || { formula_summary: {}, skills_comparison: [] },
        roadmap: demoAnalytics?.roadmap || [],
        resources: demoAnalytics?.resources || {},
        interview_flow: demoAnalytics?.interview_flow || { questions: [], defaultResults: {} },
        interview_history: demoStudentData?.mockInterviews || [],
        canned_qa: demoAnalytics?.canned_qa || [],
        roadmapUpdatedBanner,
        dismissRoadmapBanner: () => setRoadmapUpdatedBanner(false),
        setScoreStage,
        completeMockInterview,
        markSkillDemonstrated,
        toggleMilestone,
        addOrUpdateSkill,
        removeSkill,
        updateTargetRole,
        resetDemo,
        refreshStudentData: fetchBackendStudent,
        collegeSelectedStudentId,
        setCollegeSelectedStudentId
      };
    }

    // 2. Real Authenticated User (Driven by Backend Data from Supabase)
    const targetRole = backendStudent?.targetRole || user?.targetRole || 'Full Stack Developer';
    const matchScore = backendStudent?.matchScore ?? 0;
    const extractedSkills = Array.isArray(backendStudent?.extractedSkills)
      ? backendStudent.extractedSkills
      : [];
    const acquiredSkillsRaw = Array.isArray(backendStudent?.acquiredSkills)
      ? backendStudent.acquiredSkills
      : extractedSkills;
    const criticalGapsRaw = Array.isArray(backendStudent?.criticalGaps)
      ? backendStudent.criticalGaps
      : [];
    const secondaryGapsRaw = Array.isArray(backendStudent?.secondarySkills)
      ? backendStudent.secondarySkills
      : [];

    const hasSkillData = extractedSkills.length > 0 || acquiredSkillsRaw.length > 0;

    // Format skill objects for chart and table consumption
    const acquired_skills = acquiredSkillsRaw.map(name => ({
      name,
      level: 85,
      status: 'acquired'
    }));

    const critical_gaps = criticalGapsRaw.map(name => ({
      name,
      level: 25,
      status: 'critical_gap'
    }));

    const secondary_gaps = secondaryGapsRaw.map(name => ({
      name,
      level: 40,
      status: 'secondary_gap'
    }));

    // Build skills comparison for RoleDeltaChart from backend benchmark
    const benchmark = getRoleBenchmark(targetRole);
    const skills_comparison = benchmark.skills.map(bSkill => {
      const isAcquired = acquiredSkillsRaw.some(s => s.toLowerCase() === bSkill.skill.toLowerCase());
      const demonstratedLevel = isAcquired ? 85 : 0;
      let status = 'secondary_gap';
      if (isAcquired) {
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
        isCore: bSkill.isCore
      };
    });

    const studentProfile = {
      id: backendStudent?.id || user?.id || 'candidate',
      authUserId: backendStudent?.authUserId || user?.authUserId,
      name: backendStudent?.name || user?.name || 'Candidate',
      target_role: targetRole,
      match_score: matchScore,
      target_score: 85,
      journey_stage: matchScore >= 80 ? 'Placement Ready' : matchScore >= 40 ? 'Active Accelerator' : 'Skill Profile Setup',
      score_progression: [
        { stage: 'Initial Evaluation', score: matchScore, delta: '+0%', date: 'Today', active: true }
      ],
      isDemo: false
    };

    return {
      hasSkillData,
      isDemo: false,
      isLoading,
      apiError,
      rawSkills: extractedSkills.map(name => ({ name, level: 80 })),
      student: studentProfile,
      target_role: targetRole,
      match_score: matchScore,
      readiness_score: matchScore,
      target_score: 85,
      journey_stage: studentProfile.journey_stage,
      score_progression: studentProfile.score_progression,
      acquired_skills,
      critical_gaps,
      secondary_gaps,
      highest_impact_skill: {
        skill: backendStudent?.topSkill || criticalGapsRaw[0] || (acquiredSkillsRaw[0] || 'Core Technical Competency'),
        potential_lift: '+18%',
        unlocked_roles_count: 24,
        headline: `Closing ${backendStudent?.topSkill || criticalGapsRaw[0] || 'core gaps'} directly maximizes alignment for ${targetRole}`
      },
      role_breakdown: {
        role_name: targetRole,
        total_benchmark_skills: skills_comparison.length,
        formula_summary: {
          matched_skills_count: acquired_skills.length,
          total_required_skills: benchmark.coreRequiredCount,
          critical_gaps_count: critical_gaps.length,
          secondary_gaps_count: secondary_gaps.length,
          core_match_percent: matchScore,
          final_score: matchScore,
          explanation: `Calculated from verified skills in Supabase against ${targetRole} industry specifications.`
        },
        skills_comparison
      },
      roadmap: [], // Populated live via Phase 7
      resources: {},
      interview_flow: { questions: [], defaultResults: {} },
      interview_history: [],
      canned_qa: [],
      roadmapUpdatedBanner,
      dismissRoadmapBanner: () => setRoadmapUpdatedBanner(false),
      setScoreStage,
      completeMockInterview,
      markSkillDemonstrated,
      toggleMilestone,
      addOrUpdateSkill,
      removeSkill,
      updateTargetRole,
      resetDemo,
      refreshStudentData: fetchBackendStudent,
      collegeSelectedStudentId,
      setCollegeSelectedStudentId
    };
  }, [
    isDemo,
    demoStudentData,
    backendStudent,
    user,
    isLoading,
    apiError,
    roadmapUpdatedBanner,
    setScoreStage,
    completeMockInterview,
    markSkillDemonstrated,
    toggleMilestone,
    addOrUpdateSkill,
    removeSkill,
    updateTargetRole,
    resetDemo,
    fetchBackendStudent,
    collegeSelectedStudentId
  ]);

  return (
    <StudentContext.Provider value={contextValue}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
}
