/**
 * Skill Extraction Service
 * 
 * CONTRACT: extractSkills(resumeText) -> { skills: string[] }
 * Extracts technical skills actually found in the raw resume text.
 * Strictly returns an empty array if no technical skills are detected.
 */

const SKILL_PATTERNS = [
  { name: 'JavaScript', regex: /\bjavascript\b/i },
  { name: 'TypeScript', regex: /\btypescript\b/i },
  { name: 'React', regex: /\breact(?:\.js|js)?\b/i },
  { name: 'Node.js', regex: /\bnode(?:\.js|js)?\b/i },
  { name: 'Express', regex: /\bexpress(?:\.js|js)?\b/i },
  { name: 'SQL', regex: /\bsql\b/i },
  { name: 'PostgreSQL', regex: /\bpostgres(?:ql)?\b/i },
  { name: 'MySQL', regex: /\bmysql\b/i },
  { name: 'MongoDB', regex: /\bmongo(?:db)?\b/i },
  { name: 'Git', regex: /\bgit\b/i },
  { name: 'HTML5', regex: /\bhtml(?:5)?\b/i },
  { name: 'CSS3', regex: /\bcss(?:3)?\b/i },
  { name: 'Tailwind CSS', regex: /\btailwind(?:\s*css)?\b/i },
  { name: 'Docker', regex: /\bdocker\b/i },
  { name: 'Kubernetes', regex: /\bkubernetes\b|\bk8s\b/i },
  { name: 'REST APIs', regex: /\brest(?:ful)?(?:\s*apis?)?\b/i },
  { name: 'Redis', regex: /\bredis\b/i },
  { name: 'Next.js', regex: /\bnext(?:\.js|js)?\b/i },
  { name: 'Python', regex: /\bpython\b/i },
  { name: 'Java', regex: /\bjava\b(?!script)/i },
  { name: 'C++', regex: /\bc\+\+\b/i },
  { name: 'C#', regex: /\bc#\b/i },
  { name: 'Power BI', regex: /\bpower\s*bi\b/i },
  { name: 'Tableau', regex: /\btableau\b/i },
  { name: 'Excel', regex: /\bexcel\b/i },
  { name: 'Linux', regex: /\blinux\b/i },
  { name: 'AWS', regex: /\baws\b|\bamazon\s+web\s+services\b/i },
  { name: 'Azure', regex: /\bazure\b/i },
  { name: 'GCP', regex: /\bgcp\b|\bgoogle\s+cloud\b/i },
  { name: 'CI/CD', regex: /\bci\/cd\b|\bci-cd\b/i },
  { name: 'Data Visualization', regex: /\bdata\s+visualization\b/i },
  { name: 'Statistics', regex: /\bstatistics\b|\bstatistical\s+analysis\b/i },
  { name: 'GraphQL', regex: /\bgraphql\b/i },
  { name: 'Redux', regex: /\bredux\b/i },
  { name: 'Spring Boot', regex: /\bspring(?:\s*boot)?\b/i },
  { name: 'Django', regex: /\bdjango\b/i },
  { name: 'Flask', regex: /\bflask\b/i }
];

/**
 * Extracts skills from raw resume text.
 * @param {string} resumeText - Raw text extracted from resume.
 * @returns {{ skills: string[] }} Object containing array of extracted skill names.
 */
function extractSkills(resumeText = '') {
  if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length === 0) {
    return { skills: [] };
  }

  const matches = [];
  for (const { name, regex } of SKILL_PATTERNS) {
    const match = regex.exec(resumeText);
    if (match) {
      matches.push({ name, index: match.index });
    }
  }

  // Sort by order of appearance in resume text
  matches.sort((a, b) => a.index - b.index);

  const skills = Array.from(new Set(matches.map(m => m.name)));

  // Strictly return only detected skills — NEVER return fake baseline or demo skills
  return {
    skills
  };
}

module.exports = {
  extractSkills
};
