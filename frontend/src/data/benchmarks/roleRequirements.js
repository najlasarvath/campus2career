/**
 * Role Benchmark Requirements
 * Standard industry benchmark profiles for technical and analytical roles.
 * NOTE: These are role requirement specifications, NEVER candidate data.
 */

export const ROLE_BENCHMARKS = {
  'Data Analyst': {
    title: 'Data Analyst',
    targetScore: 85,
    coreRequiredCount: 6,
    skills: [
      {
        skill: 'SQL',
        category: 'Database & Queries',
        requiredLevel: 90,
        isCore: true,
        weight: 20,
        description: 'Complex joins, window functions, CTEs, and aggregation pipelines'
      },
      {
        skill: 'Python',
        category: 'Programming & Analysis',
        requiredLevel: 85,
        isCore: true,
        weight: 18,
        description: 'Pandas data manipulation, NumPy arrays, and exploratory data analysis'
      },
      {
        skill: 'Power BI',
        category: 'BI & Reporting Tools',
        requiredLevel: 85,
        isCore: true,
        weight: 18,
        description: 'Power Query ETL, star-schema data modeling, and DAX measures'
      },
      {
        skill: 'Data Visualization',
        category: 'Storytelling & Design',
        requiredLevel: 80,
        isCore: true,
        weight: 16,
        description: 'Cognitive hierarchy, accessible color palettes, and executive storytelling'
      },
      {
        skill: 'Excel',
        category: 'Spreadsheet Analytics',
        requiredLevel: 80,
        isCore: true,
        weight: 14,
        description: 'PivotTables, XLOOKUP, statistical modeling, and data cleansing'
      },
      {
        skill: 'Statistics',
        category: 'Mathematics & Inference',
        requiredLevel: 75,
        isCore: true,
        weight: 14,
        description: 'Hypothesis testing, probability distributions, and A/B test analysis'
      },
      {
        skill: 'Tableau',
        category: 'BI Tools',
        requiredLevel: 65,
        isCore: false,
        weight: 5,
        description: 'Interactive workbook design, LOD expressions, and dashboard publishing'
      },
      {
        skill: 'Git',
        category: 'Version Control',
        requiredLevel: 60,
        isCore: false,
        weight: 5,
        description: 'Branching, commit hygiene, pull requests, and collaborative codebases'
      }
    ]
  },

  'Full Stack Developer': {
    title: 'Full Stack Developer',
    targetScore: 85,
    coreRequiredCount: 6,
    skills: [
      { skill: 'JavaScript / TypeScript', category: 'Frontend & Backend', requiredLevel: 90, isCore: true, weight: 20 },
      { skill: 'React', category: 'Frontend', requiredLevel: 85, isCore: true, weight: 18 },
      { skill: 'Node.js', category: 'Backend', requiredLevel: 85, isCore: true, weight: 18 },
      { skill: 'SQL & Relational Databases', category: 'Database', requiredLevel: 80, isCore: true, weight: 16 },
      { skill: 'REST & GraphQL APIs', category: 'Architecture', requiredLevel: 80, isCore: true, weight: 14 },
      { skill: 'Git & Version Control', category: 'DevOps', requiredLevel: 75, isCore: true, weight: 14 },
      { skill: 'Docker & Containers', category: 'DevOps', requiredLevel: 65, isCore: false, weight: 5 },
      { skill: 'Tailwind / CSS Architecture', category: 'Frontend', requiredLevel: 70, isCore: false, weight: 5 }
    ]
  },

  'Frontend Developer': {
    title: 'Frontend Developer',
    targetScore: 85,
    coreRequiredCount: 5,
    skills: [
      { skill: 'JavaScript / TypeScript', category: 'Core', requiredLevel: 90, isCore: true, weight: 25 },
      { skill: 'React', category: 'Framework', requiredLevel: 90, isCore: true, weight: 25 },
      { skill: 'CSS3 & Responsive Design', category: 'Styling', requiredLevel: 85, isCore: true, weight: 20 },
      { skill: 'Web Performance & Accessibility', category: 'Optimization', requiredLevel: 80, isCore: true, weight: 15 },
      { skill: 'Git & CI/CD Basics', category: 'Tools', requiredLevel: 75, isCore: true, weight: 15 }
    ]
  },

  'Backend Developer': {
    title: 'Backend Developer',
    targetScore: 85,
    coreRequiredCount: 5,
    skills: [
      { skill: 'Python / Node.js / Java', category: 'Languages', requiredLevel: 90, isCore: true, weight: 25 },
      { skill: 'SQL & Database Optimization', category: 'Databases', requiredLevel: 90, isCore: true, weight: 25 },
      { skill: 'API Architecture (REST / gRPC)', category: 'Design', requiredLevel: 85, isCore: true, weight: 20 },
      { skill: 'System Design & Caching', category: 'Architecture', requiredLevel: 75, isCore: true, weight: 15 },
      { skill: 'Docker & Cloud Deployment', category: 'DevOps', requiredLevel: 75, isCore: true, weight: 15 }
    ]
  }
};

export function getRoleBenchmark(roleName) {
  return ROLE_BENCHMARKS[roleName] || ROLE_BENCHMARKS['Data Analyst'];
}
