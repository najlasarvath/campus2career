process.env.NODE_ENV = 'test';
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { supabase, createAuthClient } = require('../src/config/supabaseClient');

async function seedDemoStudent() {
  const email = 'student@abccollege.edu';
  const password = 'student123';
  const fullName = 'Nehreen';
  const targetRole = 'AI/ML Engineer';

  // 1. Check if user already in auth
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  let user = authUsers?.users?.find(u => u.email === email);

  if (!user) {
    console.log('Creating demo student in Supabase Auth...');
    const { data: created, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        target_role: targetRole,
        college: 'ABC College',
        branch: 'Computer Science & Engineering',
        year: '3rd Year'
      }
    });
    if (error) {
      console.error('Failed to create auth user:', error.message);
      return;
    }
    user = created.user;
    console.log('Demo auth user created:', user.id);
  } else {
    console.log('Demo auth user already exists:', user.id);
    // Ensure password is set to student123
    await supabase.auth.admin.updateUserById(user.id, { password });
  }

  // 2. Ensure student record exists in students table
  const { data: existingStudent } = await supabase
    .from('students')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (!existingStudent) {
    console.log('Creating student record in students table...');
    const { data: inserted, error: insertError } = await supabase
      .from('students')
      .insert({
        auth_user_id: user.id,
        email,
        full_name: fullName,
        target_role: targetRole,
        extracted_skills: ['Python', 'SQL', 'Git', 'Machine Learning']
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError.message);
    } else {
      console.log('Student record created:', inserted.id);
    }
  } else {
    console.log('Student record already exists:', existingStudent.id);
  }
}

seedDemoStudent().then(() => {
  console.log('Demo student ready.');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
