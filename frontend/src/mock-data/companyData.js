/**
 * Mock data for the Company / Recruiter Portal
 */

export const INITIAL_COMPANY_DATA = {
  company: {
    name: "Acme Technologies",
    recruiterName: "Elena Rostova",
    industry: "Enterprise SaaS & AI Analytics",
    activeRequisitions: 3,
    verifiedMatchesCount: 14
  },

  // Available skills for tagging in job requirements
  availableSkills: [
    "SQL",
    "Python",
    "Power BI",
    "Excel",
    "Data Visualization",
    "Tableau",
    "Docker",
    "React",
    "Node.js",
    "JavaScript",
    "PostgreSQL",
    "Git"
  ],

  // Pre-configured published job requirements
  publishedRequirements: [
    {
      id: "req-1",
      company: "Acme Technologies",
      role: "Associate Data Analyst",
      department: "Business Intelligence",
      requiredSkills: ["SQL", "Power BI", "Excel", "Data Visualization"],
      minReadiness: 75,
      experience: "0–2 Years",
      openings: 4,
      location: "San Francisco, CA (Hybrid)",
      postedDate: "14 Sep 2026",
      status: "Active",
      matchedCandidatesCount: 6
    },
    {
      id: "req-2",
      company: "Acme Technologies",
      role: "Junior Cloud & DevOps Associate",
      department: "Infrastructure",
      requiredSkills: ["Docker", "Python", "SQL", "Git"],
      minReadiness: 80,
      experience: "0–1 Years",
      openings: 2,
      location: "New York, NY (Remote)",
      postedDate: "08 Sep 2026",
      status: "Active",
      matchedCandidatesCount: 3
    }
  ],

  // Real-time Skill Verified Candidate Notifications
  notifications: [
    {
      id: "notif-1",
      type: "skill_verified", // "skill_verified" | "threshold_reached"
      candidateName: "Alex Chen",
      candidateId: "STU-8821",
      role: "Associate Data Analyst",
      matchScore: 87,
      verifiedSkills: ["Power BI", "SQL", "Data Visualization"],
      recentMilestone: "Completed Power BI Industry Readiness Workshop",
      timestamp: "10 mins ago",
      isRead: false,
      status: "Verified Ready",
      email: "alex.chen@apex.edu",
      gpa: "3.85 / 4.0",
      institution: "Apex Institute of Technology"
    },
    {
      id: "notif-2",
      type: "threshold_reached",
      candidateName: "Sarah Khan",
      candidateId: "STU-8845",
      role: "Junior Cloud & DevOps Associate",
      matchScore: 84,
      verifiedSkills: ["React", "Docker", "Python"],
      recentMilestone: "Completed SQL Industry Readiness Workshop",
      timestamp: "2 hours ago",
      isRead: false,
      status: "Threshold Met",
      email: "sarah.k@apex.edu",
      gpa: "3.92 / 4.0",
      institution: "Apex Institute of Technology"
    },
    {
      id: "notif-3",
      type: "skill_verified",
      candidateName: "David Kim",
      candidateId: "STU-8790",
      role: "Junior Cloud & DevOps Associate",
      matchScore: 82,
      verifiedSkills: ["Docker", "Python"],
      recentMilestone: "Completed Docker Industry Readiness Workshop",
      timestamp: "1 day ago",
      isRead: true,
      status: "Verified Ready",
      email: "david.kim@apex.edu",
      gpa: "3.78 / 4.0",
      institution: "Apex Institute of Technology"
    },
    {
      id: "notif-4",
      type: "threshold_reached",
      candidateName: "Priya Sharma",
      candidateId: "STU-8902",
      role: "Associate Data Analyst",
      matchScore: 91,
      verifiedSkills: ["SQL", "Data Visualization", "Python"],
      recentMilestone: "Honors in Executive Data Storytelling Presentation",
      timestamp: "2 days ago",
      isRead: true,
      status: "Threshold Met",
      email: "priya.s@apex.edu",
      gpa: "3.96 / 4.0",
      institution: "Apex Institute of Technology"
    }
  ]
};

