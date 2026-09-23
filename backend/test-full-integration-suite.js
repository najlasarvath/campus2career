const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
process.env.NODE_ENV = 'test'; // prevent automatic listen in server.js

const app = require('./src/server');
const http = require('http');

async function runTestSuite() {
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(5005, resolve));
  const baseUrl = 'http://localhost:5005/api';
  console.log(`\n======================================================`);
  console.log(`RUNNING FULL CAMPUS2CAREER INTEGRATION SUITE ON PORT 5005`);
  console.log(`======================================================\n`);

  const results = [];
  function record(name, endpoint, method, status, pass, details = '') {
    results.push({ name, endpoint, method, status, pass, details });
    const mark = pass ? '✓ PASS' : '✗ FAIL';
    console.log(`[${mark}] [${method} ${endpoint}] ${name} (Status: ${status}) ${details ? '— ' + details : ''}`);
  }

  let jwtToken = null;
  const testEmail = `candidate_${Date.now()}@integration-test.org`;
  const testPassword = 'Password123!';

  try {
    // 1. Health check
    const rHealth = await fetch(`${baseUrl}/health`);
    const dHealth = await rHealth.json();
    record('System Health Check', '/api/health', 'GET', rHealth.status, rHealth.status === 200, `Supabase: ${dHealth.supabaseConnected}`);

    // 2. Real Auth Signup
    const rSignup = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        fullName: 'Integration Test Candidate',
        role: 'student',
        targetRole: 'Data Analyst'
      })
    });
    const dSignup = await rSignup.json();
    const signupOk = rSignup.status === 201 && dSignup.success;
    record('User Registration', '/api/auth/signup', 'POST', rSignup.status, signupOk, dSignup.message || '');

    // 3. Real Auth Login
    const rLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    const dLogin = await rLogin.json();
    jwtToken = dLogin.token;
    const loginOk = rLogin.status === 200 && Boolean(jwtToken);
    record('User Login & JWT Minting', '/api/auth/login', 'POST', rLogin.status, loginOk, jwtToken ? `JWT issued (${jwtToken.slice(0, 15)}...)` : 'No token');

    const authHeaders = {
      'Authorization': `Bearer ${jwtToken}`,
      'Content-Type': 'application/json'
    };

    // 4. Auth Me
    const rMe = await fetch(`${baseUrl}/auth/me`, {
      headers: { 'Authorization': `Bearer ${jwtToken}` }
    });
    const dMe = await rMe.json();
    record('Session Verification', '/api/auth/me', 'GET', rMe.status, rMe.status === 200 && dMe.success, `Verified user: ${dMe.user?.email}`);

    // 5. Student Dashboard
    const rDash = await fetch(`${baseUrl}/students/me`, {
      headers: { 'Authorization': `Bearer ${jwtToken}` }
    });
    const dDash = await rDash.json();
    const student1 = dDash.student || dDash.data;
    record('Authoritative Dashboard Data', '/api/students/me', 'GET', rDash.status, rDash.status === 200 && dDash.success, `Match Score: ${student1?.matchScore}%`);

    // 6. Student Profile & Skill Update
    const rUpdate = await fetch(`${baseUrl}/students/me`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        targetRole: 'Data Analyst',
        skills: ['Python', 'SQL', 'Tableau', 'Excel']
      })
    });
    const dUpdate = await rUpdate.json();
    record('Skill & Role Persistence', '/api/students/me', 'PUT', rUpdate.status, rUpdate.status === 200 && dUpdate.success, `Saved skills in Supabase`);

    // 7. Re-fetch Dashboard to verify persistence & re-calculated score
    const rDash2 = await fetch(`${baseUrl}/students/me`, {
      headers: { 'Authorization': `Bearer ${jwtToken}` }
    });
    const dDash2 = await rDash2.json();
    const student2 = dDash2.student || dDash2.data;
    const skillsSaved = (student2?.extractedSkills || []).length > 0;
    record('Profile Refresh with Re-calculated Score', '/api/students/me', 'GET', rDash2.status, rDash2.status === 200 && skillsSaved, `Updated Match Score: ${student2?.matchScore}%, Skills in DB: ${student2?.extractedSkills?.join(', ')}`);

    // 7b. Resume Upload Verification
    function createTestPdfBuffer(text) {
      const content = `BT /F1 12 Tf 50 700 Td (${text}) Tj ET`;
      const stream = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
      const body = `%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n4 0 obj ${stream} endobj\n5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000056 00000 n \n0000000111 00000 n \n0000000212 00000 n \n0000000290 00000 n \ntrailer << /Size 6 /Root 1 0 R >>\nstartxref\n367\n%%EOF`;
      return Buffer.from(body);
    }

    const samplePdfBuffer = createTestPdfBuffer('Candidate experienced in Python, SQL, React, Node.js, Docker, Git, Tableau');
    const uploadForm = new FormData();
    uploadForm.append('file', new Blob([samplePdfBuffer], { type: 'application/pdf' }), 'candidate_resume.pdf');
    uploadForm.append('targetRole', 'Data Analyst');

    const rResume = await fetch(`${baseUrl}/resumes/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${jwtToken}` },
      body: uploadForm
    });
    const dResume = await rResume.json();
    const resumeOk = rResume.status === 200 && dResume.success;
    record('PDF Resume Upload & Skill Parsing', '/api/resumes/upload', 'POST', rResume.status, resumeOk, `Extracted: ${dResume.extractedSkills?.length || 0} skills (${(dResume.extractedSkills || []).slice(0, 4).join(', ')})`);

    // 8. Role Benchmark Directory
    const rRoles = await fetch(`${baseUrl}/skills/roles`, {
      headers: { 'Authorization': `Bearer ${jwtToken}` }
    });
    const dRoles = await rRoles.json();
    record('Role Benchmarks & Company Req Catalog', '/api/skills/roles', 'GET', rRoles.status, rRoles.status === 200 && dRoles.success, `Roles found: ${dRoles.roles?.length || 0}`);

    // 9. AI What-If Simulation
    const rWhatif = await fetch(`${baseUrl}/whatif/simulate`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        hypotheticalSkill: 'Power BI',
        currentSkills: ['Python', 'SQL'],
        roleImpacts: [
          { role: 'Data Analyst', beforePercent: 60, afterPercent: 85, delta: 25 }
        ]
      })
    });
    const dWhatif = await rWhatif.json();
    record('AI What-If Simulation Engine', '/api/whatif/simulate', 'POST', rWhatif.status, rWhatif.status === 200 && dWhatif.success, `Gemini Explanation: "${(dWhatif.explanation || '').slice(0, 45)}..."`);

    // 10. AI Career Roadmap
    const rRoadmap = await fetch(`${baseUrl}/roadmaps/generate`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        targetRole: 'Data Analyst',
        currentSkills: ['Python', 'SQL'],
        criticalGaps: ['Power BI', 'DAX'],
        weeksAvailable: 4
      })
    });
    const dRoadmap = await rRoadmap.json();
    record('AI Career Roadmap Generation', '/api/roadmaps/generate', 'POST', rRoadmap.status, rRoadmap.status === 200 && dRoadmap.success, `Milestones: ${dRoadmap.milestones?.length || dRoadmap.weeks?.length || 0} items`);

    // 11. AI Interview Questions
    const rIQ = await fetch(`${baseUrl}/interview/questions`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        gapSkill: 'Power BI',
        count: 2
      })
    });
    const dIQ = await rIQ.json();
    record('AI Interview Question Generation', '/api/interview/questions', 'POST', rIQ.status, rIQ.status === 200 && dIQ.success, `Generated ${dIQ.questions?.length || 0} questions`);

    // 12. AI Interview Evaluation
    const rIE = await fetch(`${baseUrl}/interview/evaluate`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        question: 'Explain the difference between DAX CALCULATE and SUMX in Power BI.',
        answer: 'CALCULATE modifies the filter context of an expression, whereas SUMX is an iterator function that evaluates an expression row-by-row over a specified table.'
      })
    });
    const dIE = await rIE.json();
    const evalOk = rIE.status === 200 && dIE.success && typeof dIE.technical === 'number';
    record('AI Interview Rubric Evaluation', '/api/interview/evaluate', 'POST', rIE.status, evalOk, `Tech: ${dIE.technical}%, PS: ${dIE.problemSolving}%, Weakness: "${(dIE.remainingWeakness || '').slice(0, 30)}..."`);

    // 13. AI Career Coach Chat
    const rChat = await fetch(`${baseUrl}/ai/chat`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        message: 'What should I prioritize to improve my match score for Data Analyst?',
        context: {
          studentName: 'Integration Candidate',
          target_role: 'Data Analyst',
          match_score: 65,
          critical_gaps: ['Power BI', 'DAX']
        }
      })
    });
    const dChat = await rChat.json();
    record('AI Career Coach Chat', '/api/ai/chat', 'POST', rChat.status, rChat.status === 200 && dChat.success, `Reply: "${(dChat.reply || '').slice(0, 45)}..."`);

    // 14. Campus Heatmap Analytics
    const rHeat = await fetch(`${baseUrl}/analytics/heatmap`);
    const dHeat = await rHeat.json();
    record('College Skill Heatmap Analytics', '/api/analytics/heatmap', 'GET', rHeat.status, rHeat.status === 200 && dHeat.success, `Skills tracked: ${dHeat.skills?.length || 0}, Roles: ${dHeat.roleReadiness?.length || 0}`);

  } catch (err) {
    console.error('Test run error:', err);
  } finally {
    await new Promise(resolve => server.close(resolve));
    console.log(`\n======================================================`);
    console.log(`TEST SUITE SUMMARY: ${results.filter(r => r.pass).length} / ${results.length} PASSED`);
    console.log(`======================================================\n`);
  }
}

runTestSuite();
