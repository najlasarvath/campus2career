const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Initialize Supabase client (connection-only, tables to be configured separately)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = {
  supabase
};
