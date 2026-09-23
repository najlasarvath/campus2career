process.env.NODE_ENV = 'test';
const http = require('http');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const app = require('../src/server');
const { supabase } = require('../src/config/supabaseClient');

async function testAuthPipeline() {
  console.log('=== TESTING AUTH & STUDENT PIPELINE ===');

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  const timestamp = Date.now();
  const testStudent = {
    email: `integration_test_${timestamp}@stanford.edu`,
    password: 'TestPassword123!',
    fullName: `Alex Rivera ${timestamp}`,
    targetRole: 'Full Stack Developer',
    collegeName: 'Stanford University',
    branch: 'Computer Science',
    year: '2025'
  };

  let token = null;
  let authUserId = null;
  let studentId = null;

  try {
    // 1. Test Signup
    console.log('\n1. Testing POST /api/auth/signup...');
    const signupRes = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testStudent)
    });
    const signupData = await signupRes.json();
    console.log('Signup status:', signupRes.status, 'success:', signupData.success);

    if (signupRes.status !== 201 || !signupData.success) {
      throw new Error(`Signup failed: ${JSON.stringify(signupData)}`);
    }

    token = signupData.token;
    authUserId = signupData.user.authUserId;
    studentId = signupData.user.id;
    console.log('User created:', { studentId, authUserId, email: signupData.user.email });

    // 2. Verify Database Record
    console.log('\n2. Verifying record in Supabase students table...');
    let dbStudent = null;
    let dbError = null;
    for (let attempt = 1; attempt <= 4; attempt++) {
      const res = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .maybeSingle();

      console.log(`Attempt ${attempt} query by id ${studentId}:`, res);
      dbStudent = res.data;
      dbError = res.error;
      if (dbStudent) break;
      await new Promise(r => setTimeout(r, 400));
    }

    console.log('Query result by auth_user_id:', { dbStudent: dbStudent?.id, email: dbStudent?.email });

    if (dbError || !dbStudent) {
      throw new Error(`DB verification failed: ${dbError?.message || 'Student not found in DB'}`);
    }
    console.log('DB Record verified! Full Name:', dbStudent.full_name, 'Target Role:', dbStudent.target_role);

    // 3. Test Login
    console.log('\n3. Testing POST /api/auth/login...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testStudent.email, password: testStudent.password })
    });
    const loginData = await loginRes.json();
    console.log('Login status:', loginRes.status, 'token received:', Boolean(loginData.token));
    if (!loginData.token) {
      throw new Error(`Login failed to return token: ${JSON.stringify(loginData)}`);
    }

    // 4. Test Current User (GET /api/auth/me)
    console.log('\n4. Testing GET /api/auth/me with Bearer token...');
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const meData = await meRes.json();
    console.log('GET /api/auth/me status:', meRes.status, 'User Name:', meData.user?.fullName);
    if (meRes.status !== 200 || meData.user?.email !== testStudent.email) {
      throw new Error(`GET /api/auth/me mismatch: ${JSON.stringify(meData)}`);
    }

    // 5. Test Student Dashboard (GET /api/students/me)
    console.log('\n5. Testing GET /api/students/me with Bearer token...');
    const dashRes = await fetch(`${baseUrl}/students/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const dashData = await dashRes.json();
    console.log('GET /api/students/me status:', dashRes.status);
    console.log('Dashboard Data:', {
      name: dashData.student?.name,
      role: dashData.student?.role,
      matchScore: dashData.student?.matchScore,
      criticalGaps: dashData.student?.criticalGaps
    });

    if (dashRes.status !== 200 || !dashData.student) {
      throw new Error(`Dashboard fetch failed: ${JSON.stringify(dashData)}`);
    }

    // 6. Test Unauthenticated Access
    console.log('\n6. Testing protected route rejection without token...');
    const unauthRes = await fetch(`${baseUrl}/students/me`);
    console.log('Unauthenticated status (expected 401):', unauthRes.status);
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401 for unauthenticated request, got ${unauthRes.status}`);
    }

    console.log('\n✅ ALL BACKEND AUTH & STUDENT PIPELINE TESTS PASSED!');
  } finally {
    // Cleanup created test user
    if (authUserId) {
      try {
        await supabase.from('students').delete().eq('auth_user_id', authUserId);
        await supabase.auth.admin.deleteUser(authUserId);
        console.log('Cleaned up test user from DB and Supabase Auth.');
      } catch (cleanErr) {
        console.warn('Cleanup warning:', cleanErr.message);
      }
    }
    server.close();
  }
}

testAuthPipeline().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('\n❌ AUTH PIPELINE TEST FAILED:', err);
  process.exit(1);
});
