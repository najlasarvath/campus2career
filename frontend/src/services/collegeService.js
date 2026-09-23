import { INITIAL_COLLEGE_DATA } from '../mock-data/collegeData';
import apiClient from './api';

export const collegeService = {
  // Fetch campus heatmap analytics with backend fallback
  async getHeatmap(roleFilter = '') {
    try {
      const endpoint = roleFilter 
        ? `/analytics/heatmap?role=${encodeURIComponent(roleFilter)}` 
        : '/analytics/heatmap';
      const data = await apiClient.get(endpoint);
      if (data && data.success) {
        return {
          skills: data.skills || INITIAL_COLLEGE_DATA.heatmapSkills,
          roleReadiness: data.roleReadiness || INITIAL_COLLEGE_DATA.departmentDistribution
        };
      }
    } catch {
      // Fallback seamlessly to local mock dataset
    }
    return {
      skills: INITIAL_COLLEGE_DATA.heatmapSkills,
      roleReadiness: INITIAL_COLLEGE_DATA.departmentDistribution
    };
  },

  // Fetch 40% college skill gap alerts
  async getAlerts() {
    try {
      const data = await apiClient.get('/analytics/alerts');
      if (data && data.success) {
        return {
          success: true,
          threshold: data.threshold || 40,
          college: data.college,
          totalStudents: data.totalStudents,
          assessedStudents: data.assessedStudents,
          alerts: (data.representativeAlerts || data.alerts || []).slice(0, 2)
        };
      }
    } catch {
      // Fallback alert calculation for mock/demo
    }
    return {
      success: true,
      threshold: 40,
      college: 'Apex Institute of Technology',
      totalStudents: 500,
      assessedStudents: 500,
      alerts: [
        {
          id: 'alert-power-bi',
          skill: 'Power BI',
          deficitPercentage: 58,
          lackingPercentage: 58,
          lackingCount: 290,
          affectedStudents: 290,
          totalAssessed: 500,
          totalStudentsAnalyzed: 500,
          isCritical: true,
          statusMessage: 'Deficit Threshold Exceeded (Threshold: 40%)',
          recommendedAction: 'Conduct Power BI Industry Readiness Workshop.',
          hasWorkshop: true,
          workshopActionText: 'Watch Power BI Workshop',
          workshop: {
            id: 'ws-powerbi-mastery',
            title: 'Power BI Industry Readiness Workshop',
            skill: 'Power BI',
            instructor: 'Elena Rostova, Lead BI & Analytics Consultant',
            duration: '1h 05m',
            videoUrl: 'https://www.youtube.com/watch?v=AGrl-H87pRU',
            embedUrl: 'https://www.youtube.com/embed/AGrl-H87pRU',
            thumbnailUrl: 'https://img.youtube.com/vi/AGrl-H87pRU/hqdefault.jpg',
            status: 'conducted',
            description: 'Hands-on enterprise analytics workshop covering Power Query and DAX.'
          }
        },
        {
          id: 'alert-sql',
          skill: 'SQL',
          deficitPercentage: 32,
          lackingPercentage: 32,
          lackingCount: 160,
          affectedStudents: 160,
          totalAssessed: 500,
          totalStudentsAnalyzed: 500,
          isCritical: false,
          statusMessage: 'Below intervention threshold (40%)',
          recommendedAction: 'Maintain standard curriculum cadence for SQL.',
          hasWorkshop: false,
          workshopActionText: 'No conducted workshop available',
          workshop: null
        }
      ]
    };
  },

  // Fetch institution stats with dynamic total count support
  getInstitutionStats(dynamicTotal) {
    const base = INITIAL_COLLEGE_DATA.institution;
    if (typeof dynamicTotal === 'number' && dynamicTotal > 0) {
      const atRisk = Math.max(1, Math.round(dynamicTotal * 0.28));
      return {
        ...base,
        totalStudents: dynamicTotal,
        assessedStudents: dynamicTotal,
        atRiskStudents: Math.min(atRisk, dynamicTotal)
      };
    }
    return base;
  },

  // Fetch department distributions scaled to dynamic total count
  getDepartments(dynamicTotal) {
    const base = INITIAL_COLLEGE_DATA.departmentDistribution;
    if (typeof dynamicTotal === 'number' && dynamicTotal > 0) {
      const cs = Math.max(1, Math.round(dynamicTotal * 0.42));
      const da = Math.max(1, Math.round(dynamicTotal * 0.29));
      const it = Math.max(1, Math.round(dynamicTotal * 0.18));
      const aiml = Math.max(1, dynamicTotal - cs - da - it);
      return [
        { department: "Computer Science", students: cs, assessed: cs, avgScore: 76, readinessPct: 78 },
        { department: "Data Analytics", students: da, assessed: da, avgScore: 68, readinessPct: 65 },
        { department: "Information Tech", students: it, assessed: it, avgScore: 71, readinessPct: 70 },
        { department: "AI & Machine Learning", students: aiml, assessed: aiml, avgScore: 74, readinessPct: 75 }
      ];
    }
    return base;
  },


  // Fetch all workshops from backend with fallback
  async getWorkshops() {
    try {
      const data = await apiClient.get('/workshops');
      if (data && data.success && Array.isArray(data.workshops)) {
        return data.workshops;
      }
    } catch {
      // Fallback to initial college workshops
    }
    return INITIAL_COLLEGE_DATA.workshops;
  },

  // Fetch previously conducted workshops from backend
  async getConductedWorkshops() {
    try {
      const data = await apiClient.get('/workshops/conducted');
      if (data && data.success && Array.isArray(data.workshops)) {
        return data.workshops;
      }
    } catch (err) {
      console.warn('[collegeService] getConductedWorkshops warning:', err);
    }
    return [];
  },

  // Create workshop via backend with deduplication
  async createWorkshop(payload) {
    try {
      const data = await apiClient.post('/workshops', payload);
      if (data && data.success && data.workshop) {
        return data.workshop;
      }
    } catch {
      // Local fallback
    }
    return this.generateWorkshop(payload);
  },

  // Generate a new workshop (mock template generator for fallback)
  generateWorkshop({ targetSkill, targetCohort, severity, duration, mode }) {
    const syllabusTemplates = {
      'Power BI': [
        'Module 1: Advanced Power Query M-Code transformations',
        'Module 2: DAX Context Transition, CALCULATE & Filter context',
        'Module 3: Enterprise visual hierarchy and KPI dashboard defense'
      ],
      'Cloud & AWS': [
        'Module 1: AWS VPC, Subnets, IAM security best practices',
        'Module 2: Serverless Lambda, API Gateway & DynamoDB integrations',
        'Module 3: Infrastructure as Code & CloudWatch diagnostics'
      ],
      'SQL & Querying': [
        'Module 1: Complex Window Functions, CTEs & Index optimization',
        'Module 2: Query Execution Plan analysis and ACID transactions',
        'Module 3: Enterprise schema design & analytical data warehouse models'
      ]
    };

    const effectiveSkill = targetSkill || 'Technical Competency';
    const modules = syllabusTemplates[effectiveSkill] || [
      `Module 1: Foundations & Core Concepts of ${effectiveSkill}`,
      `Module 2: Real-World Industry Projects & Hands-on Lab`,
      `Module 3: Placement Defense & Benchmark Assessment`
    ];

    return {
      id: `ws-${Date.now()}`,
      title: `${effectiveSkill} Placement Readiness Accelerator`,
      targetSkill: effectiveSkill,
      targetCohort: targetCohort || 'Data & Computer Science Cohort',
      severity: severity || 'Critical Deficit',
      duration: duration || '2 Days (12 Hours)',
      mode: mode || 'Hybrid',
      enrolledCount: Math.floor(Math.random() * 80) + 40,
      status: 'Scheduled',
      scheduledDate: 'Next Available Cycle',
      expectedLift: `+${Math.floor(Math.random() * 8) + 8}% Placement Readiness`,
      modules
    };
  },

  // Fetch certificates from backend with fallback
  async getCertificates() {
    try {
      const data = await apiClient.get('/certificates');
      if (data && data.success && Array.isArray(data.certificates)) {
        return data.certificates;
      }
    } catch {
      // Fallback
    }
    return INITIAL_COLLEGE_DATA.certificates;
  }
};

export default collegeService;

