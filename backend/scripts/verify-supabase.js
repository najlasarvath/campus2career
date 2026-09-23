process.env.NODE_ENV = 'test';
const http = require('http');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const app = require('../src/server');

async function run() {
  console.log('=== SUPABASE CONFIGURATION DIAGNOSTIC ===');
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('SUPABASE_URL present:', Boolean(url));
  console.log('SUPABASE_ANON_KEY present:', Boolean(anonKey), 'length:', anonKey ? anonKey.length : 0);
  console.log('SUPABASE_SERVICE_ROLE_KEY present:', Boolean(serviceKey), 'length:', serviceKey ? serviceKey.length : 0);

  // 1. Direct fetch with ANON_KEY
  try {
    const resAnon = await fetch(`${url}/rest/v1/role_requirements?select=count`, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });
    console.log('[Direct REST] ANON_KEY status:', resAnon.status, resAnon.statusText);
  } catch (err) {
    console.error('[Direct REST] ANON_KEY error:', err.message);
  }

  // 2. Direct fetch with SERVICE_ROLE_KEY
  try {
    const resService = await fetch(`${url}/rest/v1/role_requirements?select=count`, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    });
    console.log('[Direct REST] SERVICE_ROLE_KEY status:', resService.status, resService.statusText);
    if (resService.status === 401) {
      const body = await resService.json();
      console.log('[Direct REST] SERVICE_ROLE_KEY error detail:', body);
    }
  } catch (err) {
    console.error('[Direct REST] SERVICE_ROLE_KEY error:', err.message);
  }

  // 3. Test backend supabase client database operation
  try {
    const { supabase } = require('../src/config/supabaseClient');
    const { data, error } = await supabase.from('role_requirements').select('role_id').limit(1);
    if (error) {
      console.log('[Backend Client DB Operation] error:', error.message);
    } else {
      console.log('[Backend Client DB Operation] success, returned records:', Array.isArray(data) ? data.length : 0);
    }
  } catch (err) {
    console.error('[Backend Client DB Operation] exception:', err.message);
  }

  // 4. Test /api/health endpoint
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;

  try {
    const healthRes = await fetch(`http://localhost:${port}/api/health`);
    const healthJson = await healthRes.json();
    console.log('[/api/health] status:', healthRes.status, 'body:', healthJson);
  } finally {
    server.close();
  }
  process.exit(0);
}

run().catch(err => {
  console.error('Fatal diagnostic error:', err);
  process.exit(1);
});
