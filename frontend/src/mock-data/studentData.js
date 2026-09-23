/**
 * Mock Data Layer for Student Portal
 * Mimics API response shapes for target roles, skills, gaps, roadmap, resources, and interview assessments.
 * Based on the Data Analyst seed profile from the PRD.
 */

export const INITIAL_STUDENT_STATE = {
  student: {
    id: "std-4091",
    name: "Alex Morgan",
    avatar: "AM",
    target_role: "Data Analyst",
    match_score: 68,
    target_score: 85,
    journey_stage: "Baseline Evaluation",
    score_progression: [
      { stage: "Initial Resume Evaluation", score: 68, delta: "+0%", date: "Day 1", active: true },
      { stage: "Learning Phase (Power BI)", score: 72, delta: "+4%", date: "Target: Week 2", active: false },
      { stage: "Mock Interview Validation", score: 78, delta: "+6%", date: "Target: Week 3", active: false },
      { stage: "Skill Demonstration & Mastery", score: 84, delta: "+6%", date: "Target: Week 4", active: false }
    ]
  },

  // 🟢 Acquired Skills (Demonstrated in resume / project history)
  acquired_skills: [
    {
      id: "skill-1",
      name: "Python",
      category: "Programming",
      proficiency: "Proficient",
      demonstratedVia: "GitHub Projects & Coursework",
      status: "acquired",
      badgeColor: "emerald"
    },
    {
      id: "skill-2",
      name: "SQL",
      category: "Database & Queries",
      proficiency: "Advanced",
      demonstratedVia: "Relational schema design & joins",
      status: "acquired",
      badgeColor: "emerald"
    },
    {
      id: "skill-3",
      name: "Excel",
      category: "Data Analysis",
      proficiency: "Advanced",
      demonstratedVia: "VLOOKUP, Pivot Tables & Macro basics",
      status: "acquired",
      badgeColor: "emerald"
    },
    {
      id: "skill-4",
      name: "Statistics",
      category: "Mathematics",
      proficiency: "Intermediate",
      demonstratedVia: "Hypothesis testing & regression models",
      status: "acquired",
      badgeColor: "emerald"
    }
  ],

  // 🔴 Critical Gaps (Direct blockers for target role)
  critical_gaps: [
    {
      id: "gap-1",
      name: "Power BI",
      category: "BI & Reporting Tools",
      priority: "critical",
      status: "gap",
      marketDemand: "88%",
      unlockCount: 42,
      impactScore: 92,
      weightInRole: 20,
      reason: "Appears in 88% of entry-to-mid Data Analyst job listings. High priority blocker for recruiter screens.",
      badgeColor: "rose"
    },
    {
      id: "gap-2",
      name: "Data Visualization",
      category: "Analytical Storytelling",
      priority: "critical",
      status: "gap",
      marketDemand: "82%",
      unlockCount: 38,
      impactScore: 85,
      weightInRole: 15,
      reason: "Crucial for executive summaries, dashboard layout principles, and stakeholder communication.",
      badgeColor: "rose"
    }
  ],

  // 🟡 Secondary Gaps (Differentiating / nice-to-have skills)
  secondary_gaps: [
    {
      id: "gap-3",
      name: "Tableau",
      category: "BI Tools",
      priority: "secondary",
      status: "secondary",
      marketDemand: "64%",
      unlockCount: 24,
      impactScore: 68,
      weightInRole: 10,
      reason: "Strong secondary tool commonly required by enterprise teams alongside or instead of Power BI.",
      badgeColor: "amber"
    },
    {
      id: "gap-4",
      name: "Git",
      category: "Version Control",
      priority: "secondary",
      status: "secondary",
      marketDemand: "55%",
      unlockCount: 19,
      impactScore: 60,
      weightInRole: 8,
      reason: "Ensures reproducible analytical scripts, team collaboration, and portfolio verification.",
      badgeColor: "amber"
    }
  ],

  // Highest-impact skill callout
  highest_impact_skill: {
    skill: "Power BI",
    potential_lift: "+12%",
    unlocked_roles_count: 42,
    urgency: "Immediate",
    headline: "Power BI mastery unlocks 42 active roles in your college placement cycle",
    description: "Your Python & SQL foundations are solid. Closing the Power BI gap will boost your match score from 68% to 80% and qualify you for 42 target enterprise listings.",
    action_text: "Start Week 1 Roadmap"
  },

  // Role Match breakdown comparison
  role_breakdown: {
    role_name: "Data Analyst",
    total_benchmark_skills: 8,
    formula_name: "Match Score = (Matched Required Skills / Total Required Skills) × 100",
    formula_summary: {
      formula_text: "(Matched Required Skills / Total Required Skills) × 100",
      matched_skills_count: 4,
      total_required_skills: 6,
      critical_gaps_count: 2,
      secondary_gaps_count: 2,
      core_match_percent: 67,
      secondary_adjustment_percent: 1,
      final_score: 68,
      explanation: "4 of 6 core required skills are fully demonstrated (Python, SQL, Excel, Statistics). The 2 critical gaps (Power BI, Data Visualization) represent the primary 32% deficit from a perfect 100% role match."
    },
    formula_steps: [
      {
        step: "1. Core Acquired Match",
        matchedCount: 4,
        totalCount: 6,
        skills: ["Python", "SQL", "Excel", "Statistics"],
        points: 67,
        status: "acquired",
        note: "4 core skills acquired / 6 required = 66.7% baseline"
      },
      {
        step: "2. Critical Gaps Penalty",
        matchedCount: 0,
        totalCount: 2,
        skills: ["Power BI", "Data Visualization"],
        points: 0,
        status: "critical_gap",
        note: "2 critical skills missing = -33% gap from 100% target"
      },
      {
        step: "3. Secondary Skills Bonus",
        matchedCount: 2,
        totalCount: 2,
        skills: ["Tableau", "Git"],
        points: 1,
        status: "secondary_gap",
        note: "Demonstrated Git scripts & introductory Tableau contributes +1.3% adjustment"
      }
    ],
    skills_comparison: [
      { skill: "SQL", requiredLevel: 90, demonstratedLevel: 95, status: "acquired", category: "Database" },
      { skill: "Python", requiredLevel: 85, demonstratedLevel: 80, status: "acquired", category: "Programming" },
      { skill: "Excel", requiredLevel: 80, demonstratedLevel: 90, status: "acquired", category: "Analysis" },
      { skill: "Statistics", requiredLevel: 75, demonstratedLevel: 70, status: "acquired", category: "Mathematics" },
      { skill: "Power BI", requiredLevel: 85, demonstratedLevel: 25, status: "critical_gap", category: "BI Tools" },
      { skill: "Data Visualization", requiredLevel: 80, demonstratedLevel: 30, status: "critical_gap", category: "Storytelling" },
      { skill: "Tableau", requiredLevel: 65, demonstratedLevel: 35, status: "secondary_gap", category: "BI Tools" },
      { skill: "Git", requiredLevel: 60, demonstratedLevel: 45, status: "secondary_gap", category: "Version Control" }
    ]
  },

  // Week-by-week vertical roadmap (Week 1-4 per PRD, 2 deliverables max each)
  roadmap: [
    {
      week: 1,
      topic: "Power BI Fundamentals",
      title: "Power BI Fundamentals",
      focusSkill: "Power BI",
      status: "in-progress", // Baseline 68%: Week 1 in-progress, rest locked
      estimatedHours: 8,
      objective: "Master Power Query ETL, Star Schema data models, and basic calculated columns.",
      milestones: [
        { id: "m-101", title: "Connect datasets and apply transformations in Power Query", completed: true },
        { id: "m-102", title: "Construct star schema dimension and fact table relationships", completed: false }
      ],
      updatedDueToInterview: false
    },
    {
      week: 2,
      topic: "Data Visualization",
      title: "Data Visualization",
      focusSkill: "Data Visualization",
      status: "locked",
      estimatedHours: 8,
      objective: "Apply visual hierarchy, Gestalt decluttering, and chart selection principles.",
      milestones: [
        { id: "m-201", title: "Map business questions to appropriate chart types", completed: false },
        { id: "m-202", title: "Apply color accessibility and eliminate visual clutter", completed: false }
      ],
      updatedDueToInterview: false
    },
    {
      week: 3,
      topic: "Dashboard Project",
      title: "Dashboard Project",
      focusSkill: "Power BI & Data Visualization",
      status: "locked",
      estimatedHours: 10,
      objective: "Deliver an end-to-end interactive enterprise analytics dashboard with drill-through navigation.",
      milestones: [
        { id: "m-301", title: "Ingest multi-table schema and write core DAX measures", completed: false },
        { id: "m-302", title: "Design executive dashboard with interactive drill-through pages", completed: false }
      ],
      updatedDueToInterview: false
    },
    {
      week: 4,
      topic: "Mock Interview + Assessment",
      title: "Mock Interview + Assessment",
      focusSkill: "Interview Readiness",
      status: "locked",
      estimatedHours: 6,
      objective: "Validate competencies in the 2-minute technical drill and earn 84% placement certification.",
      milestones: [
        { id: "m-401", title: "Complete 2-minute AI conceptual drill on Power BI measures", completed: false },
        { id: "m-402", title: "Clear 84% benchmark score for campus recruitment shortlist", completed: false }
      ],
      updatedDueToInterview: false
    }
  ],

  // Sorted Resource Engine (2 per skill: 1 FREE + 1 PAID, no duplicate middle-tier)
  resources: {
    "Power BI": [
      {
        id: "res-pbi-1",
        title: "Microsoft Learn: Power BI Desktop Fundamentals",
        platform: "Microsoft Learn",
        tier: "FREE",
        costText: "Free",
        difficulty: "Beginner",
        duration: "3.5 Hours",
        url: "https://learn.microsoft.com/power-bi",
        whyRecommended: "Official sandbox tutorials with pre-built retail datasets."
      },
      {
        id: "res-pbi-2",
        title: "Power BI A-Z: Hands-On Business Intelligence",
        platform: "Udemy",
        tier: "PAID",
        costText: "₹499",
        difficulty: "Intermediate",
        duration: "14 Hours",
        url: "#",
        whyRecommended: "Practical course covering realistic sales pipeline and customer churn models."
      }
    ],
    "Data Visualization": [
      {
        id: "res-viz-1",
        title: "Storytelling with Data: Video Masterclass",
        platform: "Storytelling with Data",
        tier: "FREE",
        costText: "Free",
        difficulty: "Beginner",
        duration: "2.5 Hours",
        url: "https://storytellingwithdata.com",
        whyRecommended: "Core cognitive design principles to make data clear to business executives."
      },
      {
        id: "res-viz-2",
        title: "Data Storytelling & Executive Charting",
        platform: "Maven Analytics",
        tier: "PAID",
        costText: "₹699",
        difficulty: "Intermediate",
        duration: "6 Hours",
        url: "#",
        whyRecommended: "Pragmatic methods to replace cluttered graphics with clean bar charts."
      }
    ],
    "Tableau": [
      {
        id: "res-tab-1",
        title: "Tableau Public Starter Kit",
        platform: "Tableau Free",
        tier: "FREE",
        costText: "Free",
        difficulty: "Beginner",
        duration: "4 Hours",
        url: "#",
        whyRecommended: "Free desktop environment to build a public web portfolio."
      },
      {
        id: "res-tab-2",
        title: "Tableau A-Z Training",
        platform: "Udemy",
        tier: "PAID",
        costText: "₹499",
        difficulty: "Intermediate",
        duration: "10 Hours",
        url: "#",
        whyRecommended: "Parameters, calculated fields, and dual-axis chart formatting."
      }
    ],
    "Git": [
      {
        id: "res-git-1",
        title: "Introduction to GitHub & Repositories",
        platform: "GitHub Skills",
        tier: "FREE",
        costText: "Free",
        difficulty: "Beginner",
        duration: "1 Hour",
        url: "#",
        whyRecommended: "Interactive browser exercises on version control and commit workflows."
      },
      {
        id: "res-git-2",
        title: "Git & GitHub for Analysts",
        platform: "Udemy",
        tier: "PAID",
        costText: "₹449",
        difficulty: "Beginner",
        duration: "4 Hours",
        url: "#",
        whyRecommended: "Tailored for version controlling analysis scripts and SQL files."
      }
    ]
  },

  // Mock Interview questions mapped to critical gaps (3 per skill)
  interview_flow: {
    title: "2-Minute AI Mock Interview (Data Analyst)",
    focusGap: "Power BI & Data Visualization",
    timeLimitSeconds: 120,
    questions: [
      // Power BI Questions (3)
      {
        id: "q-pbi-1",
        skill: "Power BI",
        category: "Data Modeling & Calculations",
        question: "How would you explain the difference between a Calculated Column and a Measure in Power BI, and when would you choose one over the other?",
        hint: "Think about RAM/storage vs CPU computation at query time, and row context vs filter context.",
        sampleAnswers: [
          {
            label: "Basic Answer",
            text: "Calculated columns are created in tables and take up space, while measures are calculated when you click on visuals.",
            scoreTier: "Moderate"
          },
          {
            label: "Strong Technical Answer",
            text: "A Calculated Column evaluates row-by-row during data refresh and stores values in memory. A Measure evaluates dynamically at query time using filter context, without consuming model storage. For aggregated KPIs like Total Revenue or YoY Growth, Measures are best practice for performance.",
            scoreTier: "High"
          }
        ]
      },
      {
        id: "q-pbi-2",
        skill: "Power BI",
        category: "Schema Architecture",
        question: "Why is a Star Schema preferred over a Snowflake Schema or a single flat table in the Power BI VertiPaq engine?",
        hint: "Consider relationship traversal overhead, column compression, and DAX query simplicity.",
        sampleAnswers: [
          {
            label: "Basic Answer",
            text: "Star schema is cleaner and easier to connect with lines between dimension and fact tables.",
            scoreTier: "Moderate"
          },
          {
            label: "Strong Technical Answer",
            text: "The VertiPaq column-store engine is optimized for 1-to-many single-hop relationship traversals found in Star Schemas. Snowflaking introduces multi-hop table joins that degrade DAX performance, while flat denormalized tables hurt columnar dictionary compression.",
            scoreTier: "High"
          }
        ]
      },
      {
        id: "q-pbi-3",
        skill: "Power BI",
        category: "DAX Optimization",
        question: "How does the CALCULATE function alter filter context in DAX, and what is the difference between using FILTER versus ALL inside CALCULATE?",
        hint: "Explain filter transition and removing existing slicer constraints.",
        sampleAnswers: [
          {
            label: "Basic Answer",
            text: "CALCULATE changes the conditions of a formula and ALL clears the filters.",
            scoreTier: "Moderate"
          },
          {
            label: "Strong Technical Answer",
            text: "CALCULATE is the only DAX function that transitions row context into filter context and accepts filter overrides. ALL removes existing filter context from a column or table (ideal for calculating % of Total), whereas FILTER iterates row-by-row over a table to apply additional criteria.",
            scoreTier: "High"
          }
        ]
      },
      // Data Visualization Questions (3)
      {
        id: "q-viz-1",
        skill: "Data Visualization",
        category: "Stakeholder Management & UI",
        question: "A business stakeholder asks you to put 15 different KPI metrics and 6 complex charts on a single dashboard screen. How do you respond and redesign it?",
        hint: "Discuss cognitive load, hierarchical layout (Executive Summary vs Drill-down), and user-centered design.",
        sampleAnswers: [
          {
            label: "Basic Answer",
            text: "I would tell them it's too crowded and try to make smaller charts or use tabs.",
            scoreTier: "Moderate"
          },
          {
            label: "Strong Strategic Answer",
            text: "I would acknowledge their need for comprehensive visibility, then guide them through cognitive load principles. I'd propose an inverted pyramid structure: Top 3 primary KPI cards on the landing view, secondary trends in the mid-layer, and detailed tabular data accessible via interactive drill-through pages.",
            scoreTier: "High"
          }
        ]
      },
      {
        id: "q-viz-2",
        skill: "Data Visualization",
        category: "Chart Selection & Ethics",
        question: "When should you use a Bar Chart versus a Line Chart, and why is truncating the Y-axis considered bad practice for column charts?",
        hint: "Focus on discrete categories vs continuous time series, and area/length perception.",
        sampleAnswers: [
          {
            label: "Basic Answer",
            text: "Bar charts are for categories and line charts are for dates. Truncating axes looks bad.",
            scoreTier: "Moderate"
          },
          {
            label: "Strong Strategic Answer",
            text: "Bar charts encode discrete comparative values where visual length represents magnitude—truncating the baseline distorts the proportional ratio. Line charts encode continuous time series trends where slope indicates rate of change.",
            scoreTier: "High"
          }
        ]
      },
      {
        id: "q-viz-3",
        skill: "Data Visualization",
        category: "Color Theory & Accessibility",
        question: "How do you design dashboard color palettes to ensure accessibility for color-blind executives and prevent visual clutter?",
        hint: "Mention contrast ratios, relying on position/labels rather than color alone, and reserving bright accents for anomalies.",
        sampleAnswers: [
          {
            label: "Basic Answer",
            text: "Avoid red and green together and use muted colors for backgrounds.",
            scoreTier: "Moderate"
          },
          {
            label: "Strong Strategic Answer",
            text: "Use neutral slate tones for 80% of structural elements, reserve a single saturated accent for KPIs or alerts, and avoid pure Red/Green encoding by pairing with symbols (e.g. ▲ / ▼) or accessible color-safe palettes (such as Blue/Orange).",
            scoreTier: "High"
          }
        ]
      }
    ],
    // Baseline simulated results structure (PRD Seeded Values)
    defaultResults: {
      completedAt: "Just now",
      overallScore: 78, // progresses score to 78% (68% -> 72% -> 78%)
      dimensions: [
        { name: "Technical Understanding", score: 78, benchmark: 75, status: "strong" },
        { name: "Problem Solving", score: 71, benchmark: 70, status: "strong" },
        { name: "Application", score: 62, benchmark: 70, status: "needs_focus" },
        { name: "Communication", score: 84, benchmark: 75, status: "strong" }
      ],
      strengths: [
        "Excellent communication of DAX concepts and accessible design principles (84%).",
        "Solid grasp of Measure vs Calculated Column memory tradeoffs (78%)."
      ],
      remaining_weakness: {
        skill: "Data Visualization",
        subtopic: "Dashboard Storytelling & Cognitive Hierarchy",
        severity: "Medium",
        scoreInDimension: 62,
        justification: "Candidate answered technical DAX questions accurately, but struggled with negotiating stakeholder scope creep and structuring hierarchical drill-throughs in practical visual layouts (Application scored 62%).",
        impactOnRoadmap: "Added targeted milestone in Week 3: '[Remedial Focus] Executive Stakeholder Negotiation & Dashboard Layout Hierarchy'",
        roadmapAction: "Week 3 updated with remedial focus"
      }
    }
  },

  // Canned Q&A for Career Assistant drawer (3 PRD specified queries)
  canned_assistant_qa: [
    {
      id: "qa-1",
      question: "What should I learn first?",
      answer: "Focus on Power BI first! It's your single highest-impact critical gap, required in 88% of target Data Analyst job listings. Completing Week 1 of your sprint will lift your match score from 68% to 72% and unlock 42 active roles."
    },
    {
      id: "qa-2",
      question: "Why is my score 68%?",
      answer: "Your match score is 68% because you've demonstrated 4 of 6 core skills: Python, SQL, Excel, and Statistics (66.7% match), plus +1.3% secondary credit for Git & Tableau. Your two critical gaps—Power BI (25% level) and Data Visualization (30% level)—account for the remaining 32% deficit."
    },
    {
      id: "qa-3",
      question: "What if I learn Docker?",
      answer: "For your target role of Data Analyst, Docker is not part of the benchmark skill set. Learning Power BI or Data Visualization yields immediate score lift (+12% and 42 role unlocks), whereas Docker would only become a priority if you pivot towards a Data Engineering track."
    }
  ]
};
