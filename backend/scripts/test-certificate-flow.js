/**
 * Verification Test Suite: Workshop Completion Certificate End-to-End Flow
 * Tests:
 * 1. Existing assessment still works
 * 2. Passing assessment auto-issues certificate
 * 3. Certificate appears for the student (GET /api/certificates)
 * 4. Certificate contains correct student/workshop/college information
 * 5. PDF downloads successfully (GET /api/certificates/:id/pdf)
 * 6. PDF contains valid PDF-1.4 header bytes and structure
 * 7. Persistence: certificate remains available across fetches
 * 8. Deduplication: submitting assessment/generate again returns existing certificate
 * 9. Security: student is blocked from accessing another student's certificate (403)
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

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/pdf')) {
    const arrayBuffer = await res.arrayBuffer();
    return { status: res.status, headers: res.headers, buffer: Buffer.from(arrayBuffer) };
  }

  let body;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { status: res.status, headers: res.headers, data: body };
}

async function runTests() {
  console.log('\n=============================================================');
  console.log('  VERIFYING WORKSHOP COMPLETION CERTIFICATE FLOW');
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

  const studentHeaders = {
    'x-user-role': 'student',
    'x-user-id': 'demo_student'
  };

  // 1. Submit Passing Assessment for SQL Workshop
  const assessRes = await req('/workshops/ws-sql-readiness/assess', {
    method: 'POST',
    headers: studentHeaders,
    body: JSON.stringify({
      studentId: 'demo_student',
      answers: [
        {
          questionId: 'q1',
          answer: 'In high-scale PostgreSQL production environments, unnested CTEs and multi-table joins require dedicated composite b-tree indexing, query planner analysis using EXPLAIN ANALYZE BUFFERS, and strict connection pool tuning to minimize disk buffer spills and deadlocks.'
        },
        {
          questionId: 'q2',
          answer: 'Window functions evaluate during SELECT projection after WHERE and GROUP BY aggregations. ROW_NUMBER assigns monotonically increasing unique integers, whereas DENSE_RANK handles duplicate values without skipping rank positions.'
        }
      ]
    })
  });

  console.log('[CHECK 1] Assessment Verification & Auto-Issuance');
  test('1. Existing assessment still works and grades submission (Status 200)', () => {
    assert.strictEqual(assessRes.status, 200);
    assert.strictEqual(assessRes.data.success, true);
    assert.strictEqual(assessRes.data.skillVerified, true);
    assert(assessRes.data.postScore >= 70, 'Score is at or above passing threshold');
  });

  test('2. Passing assessment auto-creates and returns certificate object', () => {
    assert(assessRes.data.certificate, 'Certificate object included in assessment response');
    assert(assessRes.data.certificate.id.startsWith('C2C-SQL-'), 'Certificate ID matches format C2C-SQL-HEX');
    assert.strictEqual(assessRes.data.certificate.status, 'VERIFIED');
  });

  const certId = assessRes.data.certificate.id;

  console.log('\n[CHECK 2] Certificate Metadata & Student Identity');
  test('3. Certificate contains correct student, workshop, and college info', () => {
    const cert = assessRes.data.certificate;
    assert.strictEqual(cert.workshopId, 'ws-sql-readiness');
    assert.strictEqual(cert.skill, 'SQL');
    assert(cert.workshopTitle.includes('SQL'), 'Workshop title is correct');
    assert(cert.studentName.length > 0, 'Student name is present');
    assert(cert.collegeName.length > 0, 'College name is present');
    assert(cert.assessmentScore >= 70, 'Assessment score is recorded');
  });

  console.log('\n[CHECK 3] Student Portal Availability & Persistence');
  const getCertsRes = await req('/certificates', { headers: studentHeaders });
  test('4. Certificate appears in student certificates list (GET /api/certificates)', () => {
    assert.strictEqual(getCertsRes.status, 200);
    assert(Array.isArray(getCertsRes.data.certificates));
    const found = getCertsRes.data.certificates.find(c => c.id === certId);
    assert(found, `Certificate ${certId} found in student list`);
  });

  const getCertByIdRes = await req(`/certificates/${certId}`, { headers: studentHeaders });
  test('5. Certificate details accessible via GET /api/certificates/:id', () => {
    assert.strictEqual(getCertByIdRes.status, 200);
    assert.strictEqual(getCertByIdRes.data.certificate.id, certId);
  });

  console.log('\n[CHECK 4] Vector PDF Download & Compliance');
  const pdfRes = await req(`/certificates/${certId}/pdf`, { headers: studentHeaders });
  test('6. PDF downloads successfully with application/pdf Content-Type (GET /api/certificates/:id/pdf)', () => {
    assert.strictEqual(pdfRes.status, 200);
    const contentType = pdfRes.headers.get('content-type');
    assert(contentType.includes('application/pdf'), `Content-Type is application/pdf, got ${contentType}`);
    const disposition = pdfRes.headers.get('content-disposition');
    assert(disposition.includes(`Certificate-${certId}.pdf`), `Content-Disposition has filename: ${disposition}`);
  });

  test('7. PDF buffer is valid binary starting with %PDF-1.4 header', () => {
    assert(pdfRes.buffer, 'PDF buffer received');
    assert(pdfRes.buffer.length > 500, 'PDF buffer has non-trivial size');
    const magic = pdfRes.buffer.slice(0, 8).toString();
    assert(magic.startsWith('%PDF-1.4'), `Magic bytes match %PDF-1.4, got ${magic}`);
  });

  console.log('\n[CHECK 5] Deduplication & Idempotency');
  const duplicateRes = await req('/workshops/ws-sql-readiness/assess', {
    method: 'POST',
    headers: studentHeaders,
    body: JSON.stringify({
      studentId: 'demo_student',
      answers: [
        {
          questionId: 'q1',
          answer: 'Detailed response repeated for deduplication test.'
        }
      ]
    })
  });
  test('8. Re-submitting assessment reuses existing certificate without creating duplicate', () => {
    assert.strictEqual(duplicateRes.status, 200);
    assert.strictEqual(duplicateRes.data.certificate.id, certId, 'Reused same certificate ID');
  });

  console.log('\n[CHECK 6] Security & Ownership Isolation');
  const otherStudentHeaders = {
    'x-user-role': 'student',
    'x-user-id': 'unauthorized-other-student-id'
  };
  const unauthorizedPdfRes = await req(`/certificates/${certId}/pdf`, { headers: otherStudentHeaders });
  test('9. Unauthorized student is blocked from downloading another student certificate (403 Forbidden)', () => {
    assert.strictEqual(unauthorizedPdfRes.status, 403);
  });

  console.log('\n=============================================================');
  console.log(`  VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('=============================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exitCode = 0;
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
