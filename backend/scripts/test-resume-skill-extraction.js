/**
 * Verification Test Suite: Resume Skill Extraction
 * Tests all required cases:
 *  1. Non-technical PDF -> extractedSkills = [] (no fake demo skills)
 *  2. Technical PDF ("Skills: Python, Java, SQL, Git") -> only those skills (no unrelated demo skills)
 *  3. Second upload with non-tech PDF -> previous skills cleared in profile
 *  4. Invalid/corrupt upload -> clean error status
 */

const assert = require('assert');

function createTestPdfBuffer(text) {
  const content = `BT /F1 12 Tf 50 700 Td (${text}) Tj ET`;
  const stream = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
  const body = `%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n4 0 obj ${stream} endobj\n5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000056 00000 n \n0000000111 00000 n \n0000000212 00000 n \n0000000290 00000 n \ntrailer << /Size 6 /Root 1 0 R >>\nstartxref\n367\n%%EOF`;
  return Buffer.from(body);
}

function buildMultipartBody(buffer, filename = 'resume.pdf') {
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  let header = `--${boundary}\r\n`;
  header += `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n`;
  header += `Content-Type: application/pdf\r\n\r\n`;
  const footer = `\r\n--${boundary}--\r\n`;

  const multipartBody = Buffer.concat([
    Buffer.from(header, 'utf-8'),
    buffer,
    Buffer.from(footer, 'utf-8')
  ]);

  return {
    body: multipartBody,
    contentType: `multipart/form-data; boundary=${boundary}`
  };
}

async function runTests() {
  const baseUrl = 'http://localhost:5000/api';
  console.log('=====================================================');
  console.log('  TESTING RESUME SKILL EXTRACTION & DEMO FALLBACK REMOVAL');
  console.log('=====================================================\n');

  // Register a test candidate so we can test session state and persistence
  const candidateEmail = `skill_test_${Date.now()}@campus.edu`;
  const signupRes = await fetch(`${baseUrl}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: candidateEmail,
      password: 'TestPassword123!',
      fullName: 'Skill Extraction Candidate',
      role: 'student',
      targetRole: 'Full Stack Developer',
      collegeName: 'Apex Institute of Technology'
    })
  });
  const signupData = await signupRes.json();
  assert.strictEqual(signupRes.status, 201, 'Student created');
  const token = signupData.token;

  // -------------------------------------------------------------------
  // TEST 1: Non-technical resume
  // -------------------------------------------------------------------
  console.log('[TEST 1] Uploading non-technical PDF...');
  const nonTechText = 'Name: John\nObjective: Seeking an opportunity.\nEducation: B.Com\nInterests: Reading and sports.';
  const pdf1 = createTestPdfBuffer(nonTechText);
  const mp1 = buildMultipartBody(pdf1);

  const res1 = await fetch(`${baseUrl}/resumes/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': mp1.contentType,
      'Authorization': `Bearer ${token}`
    },
    body: mp1.body
  });
  const data1 = await res1.json();

  console.log(`   Response status: ${res1.status}, success: ${data1.success}`);
  console.log(`   Extracted skills:`, data1.extractedSkills);

  assert.strictEqual(res1.status, 200, 'Endpoint returns 200 OK');
  assert.strictEqual(data1.success, true, 'Returns success: true');
  assert.ok(Array.isArray(data1.extractedSkills), 'extractedSkills is an array');
  assert.strictEqual(data1.extractedSkills.length, 0, 'No technical skills extracted for non-technical PDF');
  
  // Verify NO fake demo skills are returned
  const forbiddenSkills = ['JavaScript', 'React', 'Node.js', 'Express', 'SQL', 'Git'];
  const hasDemoSkill = data1.extractedSkills.some(s => forbiddenSkills.includes(s));
  assert.strictEqual(hasDemoSkill, false, 'Does NOT return fake baseline demo skills');
  console.log('   ✓ PASS TEST 1: extractedSkills = [] and zero fake skills returned.\n');

  // -------------------------------------------------------------------
  // TEST 2: Resume with specific technical skills: Python, Java, SQL, Git
  // -------------------------------------------------------------------
  console.log('[TEST 2] Uploading technical resume containing Python, Java, SQL, Git...');
  const techText = 'Skills: Python, Java, SQL, Git';
  const pdf2 = createTestPdfBuffer(techText);
  const mp2 = buildMultipartBody(pdf2);

  const res2 = await fetch(`${baseUrl}/resumes/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': mp2.contentType,
      'Authorization': `Bearer ${token}`
    },
    body: mp2.body
  });
  const data2 = await res2.json();

  console.log(`   Response status: ${res2.status}, success: ${data2.success}`);
  console.log(`   Extracted skills:`, data2.extractedSkills);

  assert.strictEqual(res2.status, 200, 'Endpoint returns 200 OK');
  assert.strictEqual(data2.success, true, 'Returns success: true');
  assert.strictEqual(data2.extractedSkills.length, 4, 'Exactly 4 skills detected');
  assert.ok(data2.extractedSkills.includes('Python'), 'Contains Python');
  assert.ok(data2.extractedSkills.includes('Java'), 'Contains Java');
  assert.ok(data2.extractedSkills.includes('SQL'), 'Contains SQL');
  assert.ok(data2.extractedSkills.includes('Git'), 'Contains Git');

  // Verify it does NOT contain unmentioned skills like JavaScript, React, Express
  assert.strictEqual(data2.extractedSkills.includes('JavaScript'), false, 'Does not falsely include JavaScript');
  assert.strictEqual(data2.extractedSkills.includes('React'), false, 'Does not falsely include React');
  assert.strictEqual(data2.extractedSkills.includes('Express'), false, 'Does not falsely include Express');
  console.log('   ✓ PASS TEST 2: extractedSkills strictly contains only actual skills [Python, Java, SQL, Git].\n');

  // -------------------------------------------------------------------
  // TEST 3: Upload a second resume after TEST 2 containing no technical skills
  // -------------------------------------------------------------------
  console.log('[TEST 3] Re-uploading non-technical PDF to confirm previous skills are cleared...');
  const res3 = await fetch(`${baseUrl}/resumes/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': mp1.contentType,
      'Authorization': `Bearer ${token}`
    },
    body: mp1.body
  });
  const data3 = await res3.json();

  console.log(`   Response status: ${res3.status}, success: ${data3.success}`);
  console.log(`   Extracted skills after re-upload:`, data3.extractedSkills);

  assert.strictEqual(data3.extractedSkills.length, 0, 'Re-uploading non-tech resume yields zero skills');

  // Query student profile to verify previous Python/Java/SQL/Git are replaced with empty array
  const profileRes = await fetch(`${baseUrl}/students/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const profileData = await profileRes.json();
  console.log(`   Student profile extracted_skills:`, profileData.student?.extractedSkills);
  console.log(`   Student profile matchScore:`, profileData.student?.matchScore);

  assert.strictEqual(profileData.student?.extractedSkills.length, 0, 'Profile skills reset to 0 in database');
  assert.strictEqual(profileData.student?.matchScore, 0, 'Match score resets to 0% without fake demo calculation');
  console.log('   ✓ PASS TEST 3: Previous skills successfully cleared, zero skills in database and matchScore=0%.\n');

  // -------------------------------------------------------------------
  // TEST 4: Invalid/corrupt file upload handling
  // -------------------------------------------------------------------
  console.log('[TEST 4] Uploading corrupt/invalid PDF buffer...');
  const corruptBuffer = Buffer.from('NOT_A_VALID_PDF_HEADER_OR_CONTENT');
  const mp4 = buildMultipartBody(corruptBuffer);

  const res4 = await fetch(`${baseUrl}/resumes/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': mp4.contentType,
      'Authorization': `Bearer ${token}`
    },
    body: mp4.body
  });
  const data4 = await res4.json();
  console.log(`   Response status: ${res4.status}, success: ${data4.success}, message: "${data4.message}"`);

  assert.strictEqual(res4.status, 400, 'Corrupt PDF returns HTTP 400');
  assert.strictEqual(data4.success, false, 'Corrupt PDF returns success: false');
  assert.strictEqual(data4.extractedSkills, undefined, 'No fake demo skills returned on error');
  console.log('   ✓ PASS TEST 4: Clean error response returned without demo skills.\n');

  console.log('=====================================================');
  console.log('  ALL 4 TESTS PASSED COMPLETELY!');
  console.log('=====================================================');
}

runTests().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
