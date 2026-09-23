/**
 * Canonical demo dataset for the College Placement & Training Portal.
 * Single underlying baseline strictly matching backend Supabase cohort of 28 students.
 */

export const INITIAL_COLLEGE_DATA = {
  institution: {
    name: "Apex Institute of Technology",
    department: "School of Computing & Data Sciences",
    academicYear: "2025–2026",
    totalStudents: 28,
    assessedStudents: 28,
    averageReadiness: 72,
    atRiskStudents: 8, // ~28% of cohort needing intervention (<60% readiness)
    placementRateTarget: 88,
    activeWorkshops: 3,
    certificatesIssued: 14
  },

  departmentDistribution: [
    { department: "Computer Science", students: 12, assessed: 12, avgScore: 76, readinessPct: 78 },
    { department: "Data Analytics", students: 8, assessed: 8, avgScore: 68, readinessPct: 65 },
    { department: "Information Tech", students: 5, assessed: 5, avgScore: 71, readinessPct: 70 },
    { department: "AI & Machine Learning", students: 3, assessed: 3, avgScore: 74, readinessPct: 75 }
  ],

  // Skill Heatmap & Matrix using Canonical Skill Names
  heatmapSkills: [
    {
      id: "sk-powerbi",
      skill: "Power BI",
      category: "BI & Analytics",
      studentCount: 0,
      lowProficiency: 28,
      mediumProficiency: 0,
      highProficiency: 0,
      demandScore: 92,
      averageReadiness: 40,
      status: "Critical Deficit",
      statusColor: "rose"
    },
    {
      id: "sk-sql",
      skill: "SQL",
      category: "Database",
      studentCount: 18,
      lowProficiency: 10,
      mediumProficiency: 10,
      highProficiency: 8,
      demandScore: 94,
      averageReadiness: 79,
      status: "Moderate Gap",
      statusColor: "amber"
    },
    {
      id: "sk-python",
      skill: "Python",
      category: "Programming",
      studentCount: 15,
      lowProficiency: 13,
      mediumProficiency: 8,
      highProficiency: 7,
      demandScore: 95,
      averageReadiness: 76,
      status: "Healthy",
      statusColor: "emerald"
    },
    {
      id: "sk-docker",
      skill: "Docker",
      category: "DevOps & Cloud",
      studentCount: 10,
      lowProficiency: 18,
      mediumProficiency: 6,
      highProficiency: 4,
      demandScore: 84,
      averageReadiness: 58,
      status: "Critical Deficit",
      statusColor: "rose"
    },
    {
      id: "sk-excel",
      skill: "Excel",
      category: "Analytics",
      studentCount: 19,
      lowProficiency: 9,
      mediumProficiency: 11,
      highProficiency: 8,
      demandScore: 80,
      averageReadiness: 75,
      status: "Healthy",
      statusColor: "emerald"
    },
    {
      id: "sk-react",
      skill: "React",
      category: "Frontend",
      studentCount: 17,
      lowProficiency: 11,
      mediumProficiency: 9,
      highProficiency: 8,
      demandScore: 90,
      averageReadiness: 78,
      status: "Healthy",
      statusColor: "emerald"
    },
    {
      id: "sk-node",
      skill: "Node.js",
      category: "Backend",
      studentCount: 16,
      lowProficiency: 12,
      mediumProficiency: 9,
      highProficiency: 7,
      demandScore: 88,
      averageReadiness: 74,
      status: "Healthy",
      statusColor: "emerald"
    },
    {
      id: "sk-git",
      skill: "Git",
      category: "Engineering Tools",
      studentCount: 17,
      lowProficiency: 11,
      mediumProficiency: 10,
      highProficiency: 7,
      demandScore: 85,
      averageReadiness: 77,
      status: "Healthy",
      statusColor: "emerald"
    },
    {
      id: "sk-dataviz",
      skill: "Data Visualization",
      category: "Analytics",
      studentCount: 12,
      lowProficiency: 16,
      mediumProficiency: 7,
      highProficiency: 5,
      demandScore: 82,
      averageReadiness: 62,
      status: "Moderate Gap",
      statusColor: "amber"
    },
    {
      id: "sk-tableau",
      skill: "Tableau",
      category: "BI & Analytics",
      studentCount: 8,
      lowProficiency: 20,
      mediumProficiency: 5,
      highProficiency: 3,
      demandScore: 78,
      averageReadiness: 52,
      status: "Critical Deficit",
      statusColor: "rose"
    }
  ],

  // Workshops matching the authoritative backend registry
  workshops: [
    {
      id: "ws-powerbi-mastery",
      title: "Power BI Industry Readiness Workshop",
      targetSkill: "Power BI",
      targetCohort: "Data Analytics (Final Year)",
      severity: "Critical Deficit",
      duration: "1h 05m",
      mode: "Hybrid",
      enrolledCount: 28,
      status: "Completed",
      scheduledDate: "Sep 12, 2026",
      expectedLift: "+18% Placement Readiness",
      instructor: "Elena Rostova, Lead BI & Analytics Consultant",
      videoUrl: "https://www.youtube.com/watch?v=AGrl-H87pRU",
      embedUrl: "https://www.youtube.com/embed/AGrl-H87pRU",
      modules: [
        "Power Query ETL, Schema Modeling & Star Schemas",
        "Calculated Columns vs Measures, DAX Context Transition",
        "Executive Dashboard Storytelling & Real-Time Drilldowns"
      ]
    },
    {
      id: "ws-sql-readiness",
      title: "SQL Industry Readiness Workshop",
      targetSkill: "SQL",
      targetCohort: "Pre-final & Final Year Students",
      severity: "Moderate Gap",
      duration: "1h 12m",
      mode: "Hybrid",
      enrolledCount: 24,
      status: "Completed",
      scheduledDate: "Sep 18, 2026",
      expectedLift: "+15% Query Optimization",
      instructor: "Dr. Vikram Malhotra, Principal Database Architect",
      videoUrl: "https://www.youtube.com/watch?v=HXV3zeRR3h4",
      embedUrl: "https://www.youtube.com/embed/HXV3zeRR3h4",
      modules: [
        "Multi-table Joins with NULL-Safety",
        "Window Functions (ROW_NUMBER, DENSE_RANK, LEAD/LAG)",
        "Query Bottlenecks & EXPLAIN ANALYZE Optimization"
      ]
    },
    {
      id: "ws-docker-readiness",
      title: "Docker Industry Readiness Workshop",
      targetSkill: "Docker",
      targetCohort: "Computer Science & IT Students",
      severity: "Critical Deficit",
      duration: "1h 18m",
      mode: "Online Lab",
      enrolledCount: 22,
      status: "Completed",
      scheduledDate: "Sep 5, 2026",
      expectedLift: "+14% DevOps Proficiency",
      instructor: "Marcus Vance, Senior DevOps Engineer",
      videoUrl: "https://www.youtube.com/watch?v=fqMOX6JJhGo",
      embedUrl: "https://www.youtube.com/embed/fqMOX6JJhGo",
      modules: [
        "Container Runtime Isolation vs Virtual Machines",
        "Multi-Stage Dockerfiles for Lean Production Deployments",
        "Docker Compose Multi-Tier Microservice Orchestration"
      ]
    }
  ],

  // Certificates Registry
  certificates: [
    {
      id: "C2C-POWERBI-74A82F",
      studentName: "Alex Chen",
      studentId: "STU-8821",
      collegeName: "Apex Institute of Technology",
      college_name: "Apex Institute of Technology",
      program: "Power BI Industry Readiness Workshop",
      workshopTitle: "Power BI Industry Readiness Workshop",
      skill: "Power BI",
      issuedDate: "12 Sep 2026",
      status: "Issued",
      verified: true,
      assessmentScore: 88,
      score: "88%"
    },
    {
      id: "C2C-SQL-3541523C",
      studentName: "Sarah Khan",
      studentId: "STU-8845",
      collegeName: "Apex Institute of Technology",
      college_name: "Apex Institute of Technology",
      program: "SQL Industry Readiness Workshop",
      workshopTitle: "SQL Industry Readiness Workshop",
      skill: "SQL",
      issuedDate: "18 Sep 2026",
      status: "Issued",
      verified: true,
      assessmentScore: 92,
      score: "92%"
    },
    {
      id: "C2C-DOCKER-9B214D",
      studentName: "David Kim",
      studentId: "STU-8790",
      collegeName: "Apex Institute of Technology",
      college_name: "Apex Institute of Technology",
      program: "Docker Industry Readiness Workshop",
      workshopTitle: "Docker Industry Readiness Workshop",
      skill: "Docker",
      issuedDate: "5 Sep 2026",
      status: "Issued",
      verified: true,
      assessmentScore: 85,
      score: "85%"
    },
    {
      id: "C2C-DATAVIZ-44A712",
      studentName: "Priya Sharma",
      studentId: "STU-8902",
      collegeName: "Apex Institute of Technology",
      college_name: "Apex Institute of Technology",
      program: "Executive Data Storytelling & Presentation",
      workshopTitle: "Executive Data Storytelling & Presentation",
      skill: "Data Visualization",
      issuedDate: "28 Aug 2026",
      status: "Issued",
      verified: true,
      assessmentScore: 94,
      score: "94%"
    }
  ]
};
