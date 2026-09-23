process.env.NODE_ENV = 'test';
const http = require('http');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const app = require('../src/server');
const { supabase } = require('../src/config/supabaseClient');

// Minimal valid PDF binary generator
function createTestPdfBuffer(text) {
  const content = `BT /F1 12 Tf 50 700 Td (${text}) Tj ET`;
  const stream = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
  const body = `%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n4 0 obj ${stream} endobj\n5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000056 00000 n \n0000000111 00000 n \n0000000212 00000 n \n0000000290 00000 n \ntrailer << /Size 6 /Root 1 0 R >>\nstartxref\n367\n%%EOF`;
  return Buffer.from(body);
}

async function runFullIntegrationTest() {
  console.log('=== STARTING FULL END-TO-END INTEGRATION TEST ===\n');

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  const timestamp = Date.now();
  const testStudent = {
    email: `e2e_student_${timestamp}@harvard.edu`,
    password: 'SecurePassword123!',
    fullName: `Jordan Lee ${timestamp}`,
    targetRole: 'Full Stack Developer',
    collegeName: 'Harvard University',
    branch: 'Computer Science',
    year: '4th Year'
  };

  let token = null;
  let authUserId = null;
  let studentId = null;

  try {
    // 1. SIGNUP
    console.log('1. [Auth] Testing POST /api/auth/signup...');
    const signupRes = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testStudent)
    });
    const signupData = await signupRes.json();
    console.log(`   Signup Response: status=${signupRes.status}, success=${signupData.success}`);
    if (signupRes.status !== 201 || !signupData.token) {
      throw new Error(`Signup failed: ${JSON.stringify(signupData)}`);
    }
    token = signupData.token;
    authUserId = signupData.user.authUserId;
    studentId = signupData.user.id;
    console.log(`   Created User in Supabase Auth (authUserId=${authUserId}) and students table (id=${studentId})`);

    // 2. LOGIN
    console.log('\n2. [Auth] Testing POST /api/auth/login...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testStudent.email, password: testStudent.password })
    });
    const loginData = await loginRes.json();
    console.log(`   Login Response: status=${loginRes.status}, tokenReceived=${Boolean(loginData.token)}`);
    if (loginRes.status !== 200 || !loginData.token) {
      throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    }

    // 3. GET /auth/me
    console.log('\n3. [Auth] Testing GET /api/auth/me (Protected)...');
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const meData = await meRes.json();
    console.log(`   Me Response: status=${meRes.status}, name=${meData.user?.fullName}, email=${meData.user?.email}`);
    if (meRes.status !== 200 || meData.user?.email !== testStudent.email) {
      throw new Error(`GET /auth/me failed: ${JSON.stringify(meData)}`);
    }

    // 4. GET /students/me (Before resume upload)
    console.log('\n4. [Student] Testing GET /api/students/me (Initial state)...');
    const initDashRes = await fetch(`${baseUrl}/students/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const initDash = await initDashRes.json();
    console.log(`   Initial matchScore=${initDash.student?.matchScore}%, acquiredSkills=${initDash.student?.acquiredSkills?.length}, criticalGaps=${initDash.student?.criticalGaps?.length}`);
    if (initDashRes.status !== 200 || initDash.student?.matchScore !== 0) {
      throw new Error(`Initial dashboard check failed: ${JSON.stringify(initDash)}`);
    }

    // 5. WHAT-IF SIMULATOR
    console.log('\n5. [AI / Deterministic] Testing POST /api/whatif/simulate...');
    const whatifRes = await fetch(`${baseUrl}/whatif/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        hypotheticalSkill: 'React',
        currentSkills: ['JavaScript', 'HTML5', 'CSS3']
      })
    });
    const whatifData = await whatifRes.json();
    console.log(`   What-If Result: status=${whatifRes.status}, hypotheticalSkill=${whatifData.hypotheticalSkill}, impacts=${whatifData.roleImpacts?.length}`);
    if (whatifRes.status !== 200 || !whatifData.roleImpacts) {
      throw new Error(`What-If failed: ${JSON.stringify(whatifData)}`);
    }

    // 6. ROADMAP GENERATION
    console.log('\n6. [AI] Testing POST /api/roadmaps/generate...');
    const roadmapRes = await fetch(`${baseUrl}/roadmaps/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        targetRole: 'Full Stack Developer',
        missingSkills: ['React', 'Node.js'],
        weeksAvailable: 4
      })
    });
    const roadmapData = await roadmapRes.json();
    console.log(`   Roadmap Result: status=${roadmapRes.status}, title=${roadmapData.roadmap?.title}, milestones=${roadmapData.roadmap?.milestones?.length}`);
    if (roadmapRes.status !== 200 || !roadmapData.roadmap) {
      throw new Error(`Roadmap generation failed: ${JSON.stringify(roadmapData)}`);
    }

    // 7. MOCK INTERVIEW QUESTIONS
    console.log('\n7. [AI] Testing POST /api/interview/questions...');
    const questionsRes = await fetch(`${baseUrl}/interview/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        gapSkill: 'React',
        count: 2
      })
    });
    const questionsData = await questionsRes.json();
    console.log(`   Questions Result: status=${questionsRes.status}, count=${questionsData.questions?.length}`);
    if (questionsRes.status !== 200 || !questionsData.questions || questionsData.questions.length === 0) {
      throw new Error(`Interview questions failed: ${JSON.stringify(questionsData)}`);
    }

    // 8. RESUME UPLOAD & SKILL INGESTION
    console.log('\n8. [Resume] Testing POST /api/resumes/upload with PDF...');
    const pdfBuffer = createTestPdfBuffer('Experienced engineer proficient in JavaScript, React, Node.js, Express, and Git.');
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    let body = `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="file"; filename="resume.pdf"\r\n`;
    body += `Content-Type: application/pdf\r\n\r\n`;
    const headerBuffer = Buffer.from(body, 'utf-8');
    const footerBuffer = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8');
    const multipartBody = Buffer.concat([headerBuffer, pdfBuffer, footerBuffer]);

    const uploadRes = await fetch(`${baseUrl}/resumes/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Authorization': `Bearer ${token}`
      },
      body: multipartBody
    });
    const uploadData = await uploadRes.json();
    console.log(`   Upload Result: status=${uploadRes.status}, success=${uploadData.success}, extractedSkills=${uploadData.data?.extracted_skills || uploadData.skillsExtracted}`);

    // 9. GET /students/me (After resume upload: score should increase!)
    console.log('\n9. [Student] Testing GET /api/students/me (Post-upload state)...');
    const postDashRes = await fetch(`${baseUrl}/students/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const postDash = await postDashRes.json();
    console.log(`   Updated matchScore=${postDash.student?.matchScore}%, acquiredSkills=${postDash.student?.acquiredSkills?.length}, skills=${postDash.student?.acquiredSkills?.join(', ')}`);
    if (postDashRes.status !== 200 || postDash.student?.matchScore <= 0) {
      throw new Error(`Updated dashboard check failed (matchScore should be > 0): ${JSON.stringify(postDash)}`);
    }

    console.log('\n======================================================');
    console.log('🎉 ALL 9 END-TO-END INTEGRATION TESTS PASSED 100%!');
    console.log('======================================================\n');
  } finally {
    if (authUserId) {
      try {
        await supabase.from('students').delete().eq('auth_user_id', authUserId);
        await supabase.auth.admin.deleteUser(authUserId);
        console.log('Cleaned up test student from DB and Auth.');
      } catch (cleanErr) {
        console.warn('Cleanup warning:', cleanErr.message);
      }
    }
    server.close();
  }
}

runFullIntegrationTest().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('\n❌ E2E INTEGRATION TEST FAILED:', err);
  process.exit(1);
});
