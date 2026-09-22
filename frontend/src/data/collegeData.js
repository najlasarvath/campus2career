export const collegeStats = {
  collegeName: 'ABC College',
  registeredStudents: 428,
  studentsWithSkillGaps: 267,
  skillsCompleted: 146,
  workshopsRequired: 3,
};

export const campusSkillGaps = [
  { skill: 'Cloud Computing', value: 46 },
  { skill: 'Docker', value: 42 },
  { skill: 'Data Visualization', value: 35 },
  { skill: 'DSA', value: 28 },
  { skill: 'SQL', value: 21 },
  { skill: 'Git', value: 12 },
];

export const collegeStudents = [
  { id: 1, name: 'Nehreen', targetRole: 'AI/ML Engineer', matchScore: 68, skillGaps: 'Machine Learning, Deep Learning', status: 'Monitor' },
  { id: 2, name: 'Aisha', targetRole: 'Data Analyst', matchScore: 74, skillGaps: 'Visualization', status: 'Normal' },
  { id: 3, name: 'Rahul', targetRole: 'Full Stack Developer', matchScore: 69, skillGaps: 'Cloud, Docker', status: 'Workshop Required' },
  { id: 4, name: 'Meera', targetRole: 'Backend Developer', matchScore: 81, skillGaps: 'None', status: 'Normal' },
  { id: 5, name: 'Dev', targetRole: 'Cloud Engineer', matchScore: 58, skillGaps: 'Cloud Computing, Docker', status: 'Workshop Required' },
  { id: 6, name: 'Ishita', targetRole: 'AI/ML Engineer', matchScore: 70, skillGaps: 'Deep Learning', status: 'Monitor' },
];

export const collegeCertificates = [
  { id: 1, studentName: 'Nehreen', skill: 'Machine Learning', status: 'Completed' },
  { id: 2, studentName: 'Aisha', skill: 'SQL', status: 'Completed' },
  { id: 3, studentName: 'Rahul', skill: 'Docker', status: 'Completed' },
];

export const collegeAlerts = [
  { skill: 'Docker', value: 42, type: 'Workshop Required' },
  { skill: 'Cloud Computing', value: 46, type: 'Workshop Required' },
];
