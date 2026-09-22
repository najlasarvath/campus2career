/**
 * Match Score Calculation Logic
 * 
 * CONTRACT:
 * calculateMatchScore(extractedSkills, roleRequirements) -> 
 *   { matchScore: number, acquired: string[], criticalGaps: string[], secondaryGaps: string[] }
 */

/**
 * Calculates candidate match score and skill gaps against a target role requirement.
 * 
 * @param {string[]} extractedSkills - Skills acquired by the candidate.
 * @param {object} roleRequirements - Role requirements object containing coreSkills and secondarySkills.
 * @returns {{ matchScore: number, acquired: string[], criticalGaps: string[], secondaryGaps: string[] }}
 */
function calculateMatchScore(extractedSkills = [], roleRequirements = {}) {
  // Normalize candidate skills set (lowercased for case-insensitive lookup)
  const candidateList = Array.isArray(extractedSkills) ? extractedSkills : [];
  const candidateLowerMap = new Map();
  candidateList.forEach(s => {
    if (typeof s === 'string' && s.trim()) {
      candidateLowerMap.set(s.trim().toLowerCase(), s.trim());
    }
  });

  // Extract core and secondary skills from role requirements (handles camelCase and snake_case)
  const coreSkills = Array.isArray(roleRequirements.coreSkills) 
    ? roleRequirements.coreSkills 
    : (Array.isArray(roleRequirements.core_skills) ? roleRequirements.core_skills : []);

  const secondarySkills = Array.isArray(roleRequirements.secondarySkills) 
    ? roleRequirements.secondarySkills 
    : (Array.isArray(roleRequirements.secondary_skills) ? roleRequirements.secondary_skills : []);

  const acquiredSet = new Set();
  const criticalGaps = [];
  const secondaryGaps = [];

  let coreAcquiredCount = 0;
  let secondaryAcquiredCount = 0;

  // 1. Evaluate Core / Critical Skills
  coreSkills.forEach(skill => {
    const cleanSkill = typeof skill === 'string' ? skill.trim() : '';
    if (!cleanSkill) return;

    const lower = cleanSkill.toLowerCase();
    if (candidateLowerMap.has(lower)) {
      acquiredSet.add(cleanSkill);
      coreAcquiredCount++;
    } else {
      criticalGaps.push(cleanSkill);
    }
  });

  // 2. Evaluate Secondary / Nice-to-have Skills
  secondarySkills.forEach(skill => {
    const cleanSkill = typeof skill === 'string' ? skill.trim() : '';
    if (!cleanSkill) return;

    const lower = cleanSkill.toLowerCase();
    if (candidateLowerMap.has(lower)) {
      acquiredSet.add(cleanSkill);
      secondaryAcquiredCount++;
    } else {
      secondaryGaps.push(cleanSkill);
    }
  });

  // 3. Add any other candidate skills that matched
  candidateList.forEach(skill => {
    const cleanSkill = typeof skill === 'string' ? skill.trim() : '';
    if (!cleanSkill) return;
    const lower = cleanSkill.toLowerCase();
    const inCore = coreSkills.some(cs => cs.toLowerCase() === lower);
    const inSecondary = secondarySkills.some(ss => ss.toLowerCase() === lower);
    if (inCore || inSecondary) {
      acquiredSet.add(cleanSkill);
    }
  });

  // 4. Calculate Weighted Match Score (0 - 100)
  // Weights: Core Skills = 70%, Secondary Skills = 30%
  const totalCore = coreSkills.length;
  const totalSecondary = secondarySkills.length;

  let calculatedScore = 0;

  if (totalCore > 0 && totalSecondary > 0) {
    const coreRatio = coreAcquiredCount / totalCore;
    const secondaryRatio = secondaryAcquiredCount / totalSecondary;
    calculatedScore = (coreRatio * 0.70) + (secondaryRatio * 0.30);
  } else if (totalCore > 0) {
    calculatedScore = coreAcquiredCount / totalCore;
  } else if (totalSecondary > 0) {
    calculatedScore = secondaryAcquiredCount / totalSecondary;
  } else {
    calculatedScore = 0;
  }

  const matchScore = Math.min(100, Math.max(0, Math.round(calculatedScore * 100)));

  return {
    matchScore,
    acquired: Array.from(acquiredSet),
    criticalGaps,
    secondaryGaps
  };
}

module.exports = {
  calculateMatchScore
};
