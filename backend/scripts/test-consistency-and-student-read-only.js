/**
 * Comprehensive Verification Suite:
 * 1. Data Consistency Across All Views (Heatmap, Alerts, Workshops)
 * 2. Deterministic Execution (Zero Math.random())
 * 3. Student Read-Only Access (GET allowed, Mutations rejected with 403)
 * 4. College Admin Mutation Privileges Preserved
 * 5. Student-Owned Functionality Preserved
 */

const assert = require('assert');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function req(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const { headers, ...restOptions } = options;
  const res = await fetch(url, {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {})
    }
  });
  let body;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { status: res.status, data: body };
}

async function runTests() {
  console.log('\n=============================================================');
  console.log('  TESTING DEMO DATA CONSISTENCY & STUDENT READ-ONLY PORTAL');
  console.log('=============================================================\n');

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  \x1b[32m✓ PASS\x1b[0m: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  \x1b[31m✗ FAIL\x1b[0m: ${name} -> ${err.message}`);
      failed++;
    }
  }

  // 1. Fetch data from Alerts and Heatmap
  const alertsRes1 = await req('/analytics/alerts');
  const alertsRes2 = await req('/analytics/alerts');
  const heatmapRes1 = await req('/analytics/heatmap');
  const heatmapRes2 = await req('/analytics/heatmap');
  const workshopsRes = await req('/workshops/conducted');

  console.log('[SECTION 1] Deterministic Output & Absence of Math.random()');
  test('Alerts response is deterministic across sequential requests', () => {
    assert.strictEqual(alertsRes1.status, 200);
    assert.strictEqual(alertsRes2.status, 200);
    assert.deepStrictEqual(alertsRes1.data.representativeAlerts, alertsRes2.data.representativeAlerts);
  });

  test('Heatmap response is deterministic across sequential requests', () => {
    assert.strictEqual(heatmapRes1.status, 200);
    assert.strictEqual(heatmapRes2.status, 200);
    assert.deepStrictEqual(heatmapRes1.data.skills, heatmapRes2.data.skills);
    assert.deepStrictEqual(heatmapRes1.data.roleReadiness, heatmapRes2.data.roleReadiness);
  });

  console.log('\n[SECTION 2] Canonical Skill Data Consistency (Alerts vs Heatmap)');
  const alerts = alertsRes1.data.allSkills || alertsRes1.data.alerts;
  const heatmapSkills = heatmapRes1.data.skills;

  const skillsToCheck = ['Power BI', 'SQL', 'Python', 'Docker', 'Excel'];

  skillsToCheck.forEach(skillName => {
    test(`Skill "${skillName}" has identical deficit % and student counts across Alerts and Heatmap`, () => {
      const alertItem = alerts.find(a => a.skill.toLowerCase() === skillName.toLowerCase());
      const heatmapItem = heatmapSkills.find(s => s.skill.toLowerCase() === skillName.toLowerCase());

      assert(alertItem, `Alert item found for ${skillName}`);
      assert(heatmapItem, `Heatmap item found for ${skillName}`);

      assert.strictEqual(alertItem.deficitPercentage, heatmapItem.deficitPercentage, `Deficit % matches for ${skillName}`);
      assert.strictEqual(alertItem.affectedStudents, heatmapItem.affectedStudents, `Affected students matches for ${skillName}`);
      assert.strictEqual(alertItem.totalStudents, heatmapItem.totalStudents, `Total students matches for ${skillName}`);
      assert.strictEqual(alertItem.status, heatmapItem.status, `Status matches for ${skillName}`);
      assert.strictEqual(alertItem.hasWorkshop, heatmapItem.hasWorkshop, `hasWorkshop matches for ${skillName}`);
    });
  });

  test('Power BI end-to-end trace: 100% deficit, all affected, linked to ws-powerbi-mastery', () => {
    const pbiAlert = alerts.find(a => a.skill === 'Power BI');
    const pbiHeatmap = heatmapSkills.find(s => s.skill === 'Power BI');
    const pbiWorkshop = workshopsRes.data.workshops?.find(w => w.skill === 'Power BI');

    assert.strictEqual(pbiAlert.deficitPercentage, 100);
    assert.strictEqual(pbiHeatmap.deficitPercentage, 100);
    assert(pbiAlert.totalStudents >= 28, 'Cohort has at least 28 students');
    assert.strictEqual(pbiAlert.affectedStudents, pbiAlert.totalStudents);
    assert.strictEqual(pbiHeatmap.affectedStudents, pbiHeatmap.totalStudents);
    assert.strictEqual(pbiAlert.status, 'Critical Deficit');
    assert.strictEqual(pbiHeatmap.status, 'Critical Deficit');
    assert.strictEqual(pbiAlert.workshopId, 'ws-powerbi-mastery');
    assert.strictEqual(pbiHeatmap.workshopId, 'ws-powerbi-mastery');
    assert(pbiWorkshop, 'Conducted Power BI workshop exists in registry');
    assert.strictEqual(pbiWorkshop.id, 'ws-powerbi-mastery');
  });

  console.log('\n[SECTION 3] Student Read-Only Access (GET Allowed)');
  const studentHeaders = { 'x-user-role': 'student' };

  const getAlertsAsStudent = await req('/analytics/alerts', { headers: studentHeaders });
  test('Student can GET /api/analytics/alerts (Status 200)', () => {
    assert.strictEqual(getAlertsAsStudent.status, 200);
    assert(getAlertsAsStudent.data.success);
  });

  const getHeatmapAsStudent = await req('/analytics/heatmap', { headers: studentHeaders });
  test('Student can GET /api/analytics/heatmap (Status 200)', () => {
    assert.strictEqual(getHeatmapAsStudent.status, 200);
    assert(getHeatmapAsStudent.data.success);
  });

  const getWorkshopsAsStudent = await req('/workshops', { headers: studentHeaders });
  test('Student can GET /api/workshops (Status 200)', () => {
    assert.strictEqual(getWorkshopsAsStudent.status, 200);
    assert(Array.isArray(getWorkshopsAsStudent.data.workshops));
  });

  const getCertificatesAsStudent = await req('/certificates', { headers: studentHeaders });
  test('Student can GET /api/certificates (Status 200)', () => {
    assert.strictEqual(getCertificatesAsStudent.status, 200);
    assert(Array.isArray(getCertificatesAsStudent.data.certificates));
  });

  console.log('\n[SECTION 4] Student Mutation Rejection (403 Forbidden)');
  const postWorkshopAsStudent = await req('/workshops', {
    method: 'POST',
    headers: studentHeaders,
    body: JSON.stringify({ skill: 'GraphQL', title: 'Unauthorized Student Workshop' })
  });
  test('Student is blocked from POST /api/workshops (Status 403 Forbidden)', () => {
    assert.strictEqual(postWorkshopAsStudent.status, 403);
    assert.strictEqual(postWorkshopAsStudent.data.success, false);
    assert(postWorkshopAsStudent.data.message.includes('Forbidden'));
  });

  const putWorkshopAsStudent = await req('/workshops/ws-sql-readiness', {
    method: 'PUT',
    headers: studentHeaders,
    body: JSON.stringify({ title: 'Tampered Title' })
  });
  test('Student is blocked from PUT /api/workshops/:id (Status 403 Forbidden)', () => {
    assert.strictEqual(putWorkshopAsStudent.status, 403);
    assert.strictEqual(putWorkshopAsStudent.data.success, false);
  });

  const deleteWorkshopAsStudent = await req('/workshops/ws-sql-readiness', {
    method: 'DELETE',
    headers: studentHeaders
  });
  test('Student is blocked from DELETE /api/workshops/:id (Status 403 Forbidden)', () => {
    assert.strictEqual(deleteWorkshopAsStudent.status, 403);
    assert.strictEqual(deleteWorkshopAsStudent.data.success, false);
  });

  const postCompanyReqAsStudent = await req('/companies/requirements', {
    method: 'POST',
    headers: studentHeaders,
    body: JSON.stringify({ role: 'Hacker', requiredSkills: ['Bash'] })
  });
  test('Student is blocked from POST /api/companies/requirements (Status 403 Forbidden)', () => {
    assert.strictEqual(postCompanyReqAsStudent.status, 403);
    assert.strictEqual(postCompanyReqAsStudent.data.success, false);
  });

  const postAnalyticsAsStudent = await req('/analytics/heatmap', {
    method: 'POST',
    headers: studentHeaders,
    body: JSON.stringify({})
  });
  test('Any mutation on /api/analytics is rejected (Status 403 Forbidden)', () => {
    assert.strictEqual(postAnalyticsAsStudent.status, 403);
    assert.strictEqual(postAnalyticsAsStudent.data.success, false);
  });

  console.log('\n[SECTION 5] College Admin Mutation Privileges Preserved');
  const collegeHeaders = { 'x-user-role': 'college' };
  const postWorkshopAsCollege = await req('/workshops', {
    method: 'POST',
    headers: collegeHeaders,
    body: JSON.stringify({ skill: 'SQL', title: 'SQL Industry Readiness Workshop' })
  });
  test('College admin can create/deduplicate workshops (Status 200 or 201)', () => {
    assert(postWorkshopAsCollege.status === 200 || postWorkshopAsCollege.status === 201);
    assert(postWorkshopAsCollege.data.success);
  });

  console.log('\n[SECTION 6] Student-Owned Functionality Preserved');
  const trackVideoAsStudent = await req('/workshops/ws-sql-readiness/videos', {
    method: 'POST',
    headers: studentHeaders,
    body: JSON.stringify({ videoId: 'v1', watched: true })
  });
  test('Student can track video progress via POST /api/workshops/:id/videos (Status 200)', () => {
    assert.strictEqual(trackVideoAsStudent.status, 200);
    assert(trackVideoAsStudent.data.success);
  });

  const enrollAsStudent = await req('/workshops/ws-sql-readiness/enroll', {
    method: 'POST',
    headers: studentHeaders,
    body: JSON.stringify({ studentId: 'test-student-read-only-check' })
  });
  test('Student can enroll in workshops via POST /api/workshops/:id/enroll (Status 200)', () => {
    assert.strictEqual(enrollAsStudent.status, 200);
    assert(enrollAsStudent.data.success);
  });

  const extractSkillsAsStudent = await req('/skills/extract', {
    method: 'POST',
    headers: studentHeaders,
    body: JSON.stringify({
      resumeText: 'Experienced with Python, SQL, and Git in relational data systems.',
      targetRole: 'Full Stack Developer'
    })
  });
  test('Student can extract skills via POST /api/skills/extract (Status 200)', () => {
    assert.strictEqual(extractSkillsAsStudent.status, 200);
    assert(extractSkillsAsStudent.data.success);
  });

  console.log('\n=============================================================');
  console.log(`  VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('=============================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
