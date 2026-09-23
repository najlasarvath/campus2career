/**
 * Comprehensive Enhanced Feature Verification Suite
 * Tests all 8 newly implemented enhancement phases:
 * Phase 1: AI Chatbot latency + clean conversational text response (no JSON wrappers)
 * Phase 2: Mock Drill technical overhaul, 5 question types, zero answer spoilers, rubric evaluation
 * Phase 3: Adaptive Daily Tasks generation, toggling, and remedial task injection
 * Phase 4: 40% College Skill-Gap Alert calculation and aggregation
 * Phase 5: Workshop creation and deduplication
 * Phase 6: Workshop video tracking (video completion != skill verified) and post-workshop assessment
 * Phase 7: College-branded certificate generation, configurable passing threshold, unique IDs
 * Phase 8: Persistence and Security (JWT verification)
 */

const http = require('http');
const dotenv = require('dotenv');
dotenv.config();

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5000/api';

let passed = 0;
let failed = 0;
const results = [];

function assert(condition, testName, details = '') {
  if (condition) {
    passed++;
    console.log(`  \x1b[32m✓ PASS\x1b[0m: ${testName}`);
    results.push({ name: testName, status: 'PASS', details });
  } else {
    failed++;
    console.error(`  \x1b[31m✗ FAIL\x1b[0m: ${testName} - ${details}`);
    results.push({ name: testName, status: 'FAIL', details });
  }
}

async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  const parsed = new URL(url);

  const reqOptions = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(parsed, reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json
        });
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runEnhancedSuite() {
  console.log('\n=============================================================');
  console.log('  CAMPUS2CAREER AI - ENHANCED FEATURES INTEGRATION SUITE');
  console.log('=============================================================\n');

  // PHASE 1: AI Chatbot Clean Output & Latency
  console.log('\x1b[34m[Phase 1] AI Chatbot Clean Output & Latency\x1b[0m');
  try {
    const startTime = Date.now();
    const chatRes = await request('/ai/chat', {
      method: 'POST',
      body: {
        message: 'How should I improve my SQL query optimization skills?',
        studentContext: {
          target_role: 'Data Analyst',
          match_score: 55,
          critical_gaps: [{ name: 'SQL', deficit: 35 }]
        }
      }
    });
    const latency = Date.now() - startTime;

    assert(chatRes.status === 200, 'Chat endpoint returns 200 OK');
    const reply = chatRes.data.reply || '';
    assert(typeof reply === 'string' && reply.length > 20, 'Chat returns non-empty conversational reply');
    
    // Check that reply is clean prose and NOT raw JSON
    const containsRawJson = reply.trim().startsWith('[') || 
                            reply.trim().startsWith('{') || 
                            reply.includes('"coach_response":') || 
                            reply.includes('\\n');
    assert(!containsRawJson, 'Chat reply is natural text without raw JSON wrappers or coach_response keys');
    console.log(`    Chat latency: ${latency}ms`);
    assert(latency < 6000, `Chat latency (${latency}ms) is within acceptable range without failed model cascades`);
  } catch (err) {
    assert(false, 'Chat endpoint execution', err.message);
  }

  // PHASE 2: Mock Drill / Technical Assessment Overhaul
  console.log('\n\x1b[34m[Phase 2] Mock Drill Technical Questions & Evaluation\x1b[0m');
  try {
    const qRes = await request('/interview/questions', {
      method: 'POST',
      body: {
        targetRole: 'Data Analyst',
        candidateSkills: ['Python', 'Excel'],
        criticalGaps: ['SQL', 'Power BI'],
        experienceLevel: 'Entry',
        count: 3
      }
    });

    assert(qRes.status === 200, 'Question generation returns 200 OK');
    const questions = qRes.data.questions || [];
    assert(Array.isArray(questions) && questions.length >= 2, 'Returns array of technical questions');

    // Verify 5 question types supported and zero answer spoilers
    let hasTechnicalConcept = false;
    let hasAnswerSpoilers = false;

    questions.forEach(q => {
      if (q.type || q.questionType) hasTechnicalConcept = true;
      const text = JSON.stringify(q);
      if (text.includes('Option 01: High Response') || text.includes('Option 02:') || text.includes('sampleAnswer')) {
        hasAnswerSpoilers = true;
      }
    });

    assert(!hasAnswerSpoilers, 'Mock drill has ZERO pre-formulated answer spoilers');
    assert(hasTechnicalConcept, 'Questions support specialized technical and scenario-based categories');

    // Evaluation endpoint verification
    const evalRes = await request('/interview/evaluate', {
      method: 'POST',
      body: {
        question: 'How do you optimize a slow running SQL query involving multi-million row tables?',
        answer: 'I would first generate the EXPLAIN ANALYZE query execution plan to inspect whether table scans or hash joins are causing high buffer I/O. Then create appropriate B-Tree indexes on joined foreign keys and filter predicates, and replace subqueries with CTEs or indexed joins.',
        targetRole: 'Data Analyst',
        topic: 'SQL'
      }
    });

    assert(evalRes.status === 200, 'Interview evaluation returns 200 OK');
    const evaluation = evalRes.data.evaluation || evalRes.data;
    assert(typeof evaluation.overallScore === 'number' || typeof evaluation.technical_score === 'number', 'Evaluation returns numeric scoring rubric');
    assert(Array.isArray(evaluation.correct_concepts || evaluation.correctConcepts || evaluation.strengths), 'Evaluation provides correct concept diagnoses');
    assert(Boolean(evaluation.model_answer || evaluation.betterApproach || evaluation.modelAnswer), 'Evaluation provides reference model answer');
  } catch (err) {
    assert(false, 'Mock Drill test execution', err.message);
  }

  // PHASE 3: Adaptive Daily Tasks
  console.log('\n\x1b[34m[Phase 3] Adaptive Daily Tasks\x1b[0m');
  let firstTaskId = null;
  try {
    const tasksRes = await request('/tasks/daily');
    assert(tasksRes.status === 200, 'Daily tasks endpoint returns 200 OK');
    const tasks = tasksRes.data.tasks || [];
    assert(Array.isArray(tasks) && tasks.length >= 7, 'Returns 7+ adaptive daily tasks');

    const day1 = tasks[0];
    assert(day1.day === 1, 'Tasks are structured as Day 1..N');
    assert(Boolean(day1.title && day1.description && day1.practiceActivity), 'Task includes title, description, and hands-on practice activity');
    assert(typeof day1.completed === 'boolean', 'Task includes completion status boolean');
    firstTaskId = day1.id;

    // Toggle completion status
    const toggleRes = await request(`/tasks/daily/${firstTaskId}/toggle`, { method: 'PUT' });
    assert(toggleRes.status === 200, 'Toggle task status returns 200 OK');
    assert(toggleRes.data.completed !== day1.completed, 'Task completion status successfully toggled');

    // Inject remedial tasks
    const remediateRes = await request('/tasks/daily/remediate', {
      method: 'POST',
      body: {
        skill: 'SQL',
        assessmentScore: 42
      }
    });
    assert(remediateRes.status === 200, 'Inject remedial tasks returns 200 OK');
    assert(remediateRes.data.remedialTasksCount >= 2, 'Injected targeted remedial tasks for unmastered skill');
  } catch (err) {
    assert(false, 'Adaptive Daily Tasks execution', err.message);
  }

  // PHASE 4: 40% College Skill-Gap Alert
  console.log('\n\x1b[34m[Phase 4] 40% College Skill-Gap Alert\x1b[0m');
  try {
    const alertRes = await request('/analytics/alerts');
    assert(alertRes.status === 200, 'Analytics alerts endpoint returns 200 OK');
    assert(alertRes.data.threshold === 40, 'Configured alert threshold is 40%');
    assert(Array.isArray(alertRes.data.alerts), 'Returns array of campus skill alerts');

    const criticalAlert = alertRes.data.alerts.find(a => (a.deficitPercentage ?? a.percentLacking) >= 40)
      || alertRes.data.allAboveThreshold?.[0]
      || alertRes.data.alerts[0];
    assert(Boolean(criticalAlert), 'Identified skill deficit exceeding 40% threshold');
    if (criticalAlert) {
      const pct = criticalAlert.lackingPercentage ?? criticalAlert.percentLacking;
      const count = criticalAlert.lackingCount ?? criticalAlert.affectedStudents;
      const total = criticalAlert.totalAssessed ?? criticalAlert.totalStudentsAnalyzed;
      assert(pct >= 40, `Skill gap percentage (${pct}%) >= 40% threshold`);
      assert(Boolean(criticalAlert.recommendedAction), 'Provides concrete recommended workshop action');
      console.log(`    Campus Alert: ${pct}% lack ${criticalAlert.skill} (${count}/${total} affected)`);
    }
  } catch (err) {
    assert(false, '40% College Alert execution', err.message);
  }

  // PHASE 5: Workshop Creation & Deduplication
  console.log('\n\x1b[34m[Phase 5] Workshop Creation & Deduplication\x1b[0m');
  let testWorkshopId = 'ws-sql-readiness';
  try {
    const listRes = await request('/workshops');
    assert(listRes.status === 200, 'Get workshops returns 200 OK');
    assert(Array.isArray(listRes.data.workshops) && listRes.data.workshops.length > 0, 'Workshops list populated');

    // Deduplication test: Attempt to create another workshop for SQL
    const dupRes = await request('/workshops', {
      method: 'POST',
      body: {
        skill: 'SQL',
        title: 'Duplicate SQL Workshop'
      }
    });
    assert(dupRes.status === 200 || dupRes.status === 201, 'Create workshop responds cleanly');
    assert(dupRes.data.isExisting === true || dupRes.data.workshop.id === 'ws-sql-readiness', 'Deduplication preserves existing workshop without redundant duplication');
  } catch (err) {
    assert(false, 'Workshop creation execution', err.message);
  }

  // PHASE 6: Workshop Videos & Post-Workshop Skill Verification
  console.log('\n\x1b[34m[Phase 6] Workshop Videos & Post-Assessment Skill Verification\x1b[0m');
  try {
    // 1. Track Video 1
    const v1Res = await request(`/workshops/${testWorkshopId}/videos`, {
      method: 'POST',
      body: { videoId: 'v1', watched: true }
    });
    assert(v1Res.status === 200, 'Track video 1 progress returns 200 OK');
    assert(v1Res.data.videoProgress.video1_watched === true, 'Video 1 marked watched');

    // 2. Track Video 2
    const v2Res = await request(`/workshops/${testWorkshopId}/videos`, {
      method: 'POST',
      body: { videoId: 'v2', watched: true }
    });
    assert(v2Res.status === 200, 'Track video 2 progress returns 200 OK');
    assert(v2Res.data.videoProgress.videosCompleted === true, 'Both videos marked completed');

    // 3. Post-Workshop Assessment Submission
    const assessRes = await request(`/workshops/${testWorkshopId}/assess`, {
      method: 'POST',
      body: {
        answers: [
          {
            questionId: 'q1',
            answer: 'In high-scale relational databases, query performance depends on using EXPLAIN ANALYZE to identify sequential scans, creating composite indexes for multi-column WHERE clauses, and preventing N+1 query patterns using batch joins.'
          }
        ]
      }
    });

    assert(assessRes.status === 200, 'Submit workshop assessment returns 200 OK');
    assert(assessRes.data.preScore !== undefined && assessRes.data.postScore !== undefined, 'Tracks pre-score vs post-score progression');
    assert(assessRes.data.postScore >= assessRes.data.passingScore, `Post-score (${assessRes.data.postScore}%) meets passing score (${assessRes.data.passingScore}%)`);
    assert(assessRes.data.skillVerified === true, 'Skill verification awarded upon passing assessment');
    assert(assessRes.data.eligibleForCertificate === true, 'Candidate marked eligible for college-branded certificate');
    console.log(`    Assessment Improvement: ${assessRes.data.preScore}% -> ${assessRes.data.postScore}% (${assessRes.data.improvement})`);
  } catch (err) {
    assert(false, 'Post-workshop assessment execution', err.message);
  }

  // PHASE 7: College-Branded Certificates
  console.log('\n\x1b[34m[Phase 7] College-Branded Certificates\x1b[0m');
  try {
    // Generate certificate
    const certRes = await request('/certificates/generate', {
      method: 'POST',
      body: {
        workshopId: testWorkshopId,
        studentName: 'Aarav Patel',
        assessmentScore: 82
      }
    });

    assert(certRes.status === 201, 'Generate certificate returns 201 Created');
    const cert = certRes.data.certificate;
    assert(Boolean(cert && cert.id), 'Certificate created with valid ID');
    assert(cert.id.startsWith('C2C-SQL-'), `Certificate ID format matches C2C-{SKILL}-{HEX} (${cert.id})`);
    assert(cert.collegeName === 'Apex Institute of Technology', `College name pulled from institution profile (${cert.collegeName})`);
    assert(cert.passingScore === 70, 'Passing score uses configured WORKSHOP_PASSING_SCORE=70');

    // Test unique ID generation
    const certRes2 = await request('/certificates/generate', {
      method: 'POST',
      body: {
        workshopId: 'ws-powerbi-mastery',
        studentName: 'Priya Sharma',
        assessmentScore: 90
      }
    });
    assert(certRes2.status === 201, 'Second certificate generated');
    assert(certRes2.data.certificate.id !== cert.id, 'Certificate IDs are strictly unique');

    // List certificates
    const listCerts = await request('/certificates');
    assert(listCerts.status === 200, 'Get certificates returns 200 OK');
    assert(listCerts.data.total >= 2, 'Certificates ledger lists issued credentials');
  } catch (err) {
    assert(false, 'Certificate generation execution', err.message);
  }

  // PHASE 8: Security & Authentication Checks
  console.log('\n\x1b[34m[Phase 8] Security & Authentication Verification\x1b[0m');
  try {
    // 1. Missing JWT on protected route
    const noAuth = await request('/students/me');
    assert(noAuth.status === 401, 'Protected route rejects missing Authorization header with 401');

    // 2. Invalid JWT on protected route
    const badAuth = await request('/students/me', {
      headers: { 'Authorization': 'Bearer invalid.bogus.jwt.token' }
    });
    assert(badAuth.status === 401, 'Protected route rejects forged/invalid JWT with 401');
  } catch (err) {
    assert(false, 'Security checks execution', err.message);
  }

  // Summary
  console.log('\n=============================================================');
  console.log(`  ENHANCED SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('=============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runEnhancedSuite().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
