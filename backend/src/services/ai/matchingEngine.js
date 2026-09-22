const path = require('path');
const roleData = require('../../data/roleRequirements.json');

/**
 * Normalizes a skill string for consistent matching.
 * @param {string} skill
 * @returns {string}
 */
function normalizeSkill(skill) {
  if (!skill || typeof skill !== 'string') return '';
  const cleaned = skill.trim().toLowerCase();
  // Common synonym normalization
  const aliases = {
    'reactjs': 'react',
    'react.js': 'react',
    'nodejs': 'node.js',
    'node': 'node.js',
    'postgres': 'postgresql',
    'mongo': 'mongodb',
    'golang': 'go',
    'js': 'javascript',
    'ts': 'typescript',
    'rest': 'rest apis',
    'restful api': 'rest apis',
    'rest api': 'rest apis',
    'restful apis': 'rest apis',
    'tailwind': 'tailwind css',
    'html': 'html5',
    'css': 'css3'
  };
  return aliases[cleaned] || cleaned;
}

/**
 * Finds a role definition by ID or title (case-insensitive).
 * @param {string} roleIdentifier
 * @returns {object|null}
 */
function getRole(roleIdentifier) {
  if (!roleIdentifier || typeof roleIdentifier !== 'string') return null;
  const normalized = roleIdentifier.trim().toLowerCase();
  return (
    roleData.roles.find(
      r => r.id.toLowerCase() === normalized || r.title.toLowerCase() === normalized
    ) || null
  );
}

/**
 * Lists all available target roles.
 * @returns {Array<{ id: string, title: string, category: string }>}
 */
function getAllRoles() {
  return roleData.roles.map(r => ({
    id: r.id,
    title: r.title,
    category: r.category
  }));
}

/**
 * Deterministically calculates role match percentage and skill gaps.
 * Core skills account for 70% of total score, secondary skills account for 30%.
 *
 * @param {string[]} candidateSkills - List of skills candidate possesses
 * @param {string|object} roleOrIdentifier - Target role name, ID, or role object
 * @returns {{
 *   roleId: string,
 *   roleTitle: string,
 *   matchPercentage: number,
 *   matchedSkills: string[],
 *   missingSkills: string[],
 *   criticalGaps: string[],
 *   secondaryGaps: string[]
 * }}
 */
function calculateMatch(candidateSkills = [], roleOrIdentifier) {
  const role = typeof roleOrIdentifier === 'object' && roleOrIdentifier !== null
    ? roleOrIdentifier
    : getRole(roleOrIdentifier);

  if (!role) {
    // If role not found in roleRequirements, return neutral 0 match with raw skills
    return {
      roleId: 'custom',
      roleTitle: String(roleOrIdentifier || 'Custom Role'),
      matchPercentage: 0,
      matchedSkills: [],
      missingSkills: [],
      criticalGaps: [],
      secondaryGaps: []
    };
  }

  const normalizedCandidate = new Set(
    (Array.isArray(candidateSkills) ? candidateSkills : []).map(normalizeSkill).filter(Boolean)
  );

  const matchedCore = [];
  const criticalGaps = [];
  for (const skill of role.coreSkills || []) {
    if (normalizedCandidate.has(normalizeSkill(skill))) {
      matchedCore.push(skill);
    } else {
      criticalGaps.push(skill);
    }
  }

  const matchedSecondary = [];
  const secondaryGaps = [];
  for (const skill of role.secondarySkills || []) {
    if (normalizedCandidate.has(normalizeSkill(skill))) {
      matchedSecondary.push(skill);
    } else {
      secondaryGaps.push(skill);
    }
  }

  const coreTotal = (role.coreSkills || []).length;
  const secTotal = (role.secondarySkills || []).length;

  let matchPercentage = 0;
  if (coreTotal > 0 && secTotal > 0) {
    const coreScore = (matchedCore.length / coreTotal) * 70;
    const secScore = (matchedSecondary.length / secTotal) * 30;
    matchPercentage = Math.round(coreScore + secScore);
  } else if (coreTotal > 0) {
    matchPercentage = Math.round((matchedCore.length / coreTotal) * 100);
  } else if (secTotal > 0) {
    matchPercentage = Math.round((matchedSecondary.length / secTotal) * 100);
  }

  // Ensure percentage stays strictly within 0 - 100
  matchPercentage = Math.max(0, Math.min(100, matchPercentage));

  return {
    roleId: role.id,
    roleTitle: role.title,
    matchPercentage,
    matchedSkills: [...matchedCore, ...matchedSecondary],
    missingSkills: [...criticalGaps, ...secondaryGaps],
    criticalGaps,
    secondaryGaps
  };
}

/**
 * Deterministically simulates adding a hypothetical skill across all supported roles.
 *
 * @param {string[]} currentSkills - Candidate's current skills
 * @param {string} hypotheticalSkill - The skill candidate is considering learning
 * @returns {Array<{ role: string, roleId: string, beforePercent: number, afterPercent: number, delta: number }>}
 */
function calculateWhatIf(currentSkills = [], hypotheticalSkill) {
  if (!hypotheticalSkill || typeof hypotheticalSkill !== 'string') {
    return [];
  }

  const augmentedSkills = [...currentSkills, hypotheticalSkill];

  return roleData.roles.map(role => {
    const before = calculateMatch(currentSkills, role);
    const after = calculateMatch(augmentedSkills, role);
    return {
      role: role.title,
      roleId: role.id,
      beforePercent: before.matchPercentage,
      afterPercent: after.matchPercentage,
      delta: after.matchPercentage - before.matchPercentage
    };
  }).sort((a, b) => b.delta - a.delta);
}

module.exports = {
  normalizeSkill,
  getRole,
  getAllRoles,
  calculateMatch,
  calculateWhatIf
};
