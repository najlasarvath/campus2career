/**
 * Skill Extraction Service (Stub)
 * 
 * CONTRACT: extractSkills(resumeText) -> { skills: string[] }
 * Note: Stub with mock/heuristic data — AI teammate will integrate Gemini API later.
 */

const KNOWN_SKILLS = [
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Express',
  'SQL',
  'PostgreSQL',
  'Git',
  'HTML5',
  'CSS3',
  'Tailwind CSS',
  'Docker',
  'REST APIs',
  'Redis',
  'Next.js',
  'Python',
  'MongoDB'
];

/**
 * Extracts skills from raw resume text.
 * @param {string} resumeText - Raw text extracted from resume.
 * @returns {{ skills: string[] }} Object containing array of extracted skill names.
 */
function extractSkills(resumeText = '') {
  if (!resumeText || typeof resumeText !== 'string') {
    return { skills: ['JavaScript', 'React', 'Node.js', 'Git'] };
  }

  const normalizedText = resumeText.toLowerCase();
  const detected = KNOWN_SKILLS.filter(skill => 
    normalizedText.includes(skill.toLowerCase())
  );

  // If text doesn't match any known skill heuristic, return standard baseline mock skills
  const skills = detected.length > 0 
    ? detected 
    : ['JavaScript', 'React', 'Node.js', 'Express', 'SQL', 'Git'];

  return {
    skills: Array.from(new Set(skills))
  };
}

module.exports = {
  extractSkills
};
