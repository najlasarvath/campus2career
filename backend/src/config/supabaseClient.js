const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Ensure .env is loaded from backend/.env regardless of process current working directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder-project.supabase.co';
const anonKey = process.env.SUPABASE_ANON_KEY || 'placeholder-anon-key';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || anonKey;

if (!process.env.SUPABASE_URL || (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_ANON_KEY)) {
  console.warn('[Supabase] Warning: SUPABASE_URL or Supabase Key is missing from environment variables.');
}

// Admin client for server-side trusted DB queries and admin operations (bypasses RLS)
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// Create fresh client for user auth operations (signInWithPassword) to prevent mutating admin client session
function createAuthClient() {
  return createClient(supabaseUrl, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

// Scoped client for user's Bearer token
function createUserClient(token) {
  return createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

module.exports = {
  supabase: supabaseAdmin,
  supabaseAdmin,
  createAuthClient,
  createUserClient
};
