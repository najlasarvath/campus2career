const { z } = require('zod');
const { supabase, createAuthClient } = require('../config/supabaseClient');

// Validation Schemas
const SignupSchema = z.object({
  role: z.enum(['student', 'college', 'company']).optional().default('student'),
  email: z.string({ required_error: 'email is required' }).email('Invalid email address'),
  password: z.string({ required_error: 'password is required' }).min(6, 'Password must be at least 6 characters'),
  fullName: z.string().optional(),
  name: z.string().optional(),
  targetRole: z.string().optional().default('Full Stack Developer'),
  collegeName: z.string().optional(),
  collegeDomain: z.string().optional(),
  designation: z.string().optional(),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().optional(),
  branch: z.string().optional(),
  year: z.string().optional()
}).transform(data => ({
  ...data,
  fullName: (data.fullName || data.name || (data.role === 'college' ? data.collegeName : data.role === 'company' ? data.companyName : 'Student Candidate') || 'Candidate').trim()
}));

const LoginSchema = z.object({
  email: z.string({ required_error: 'email is required' }).email('Invalid email address'),
  password: z.string({ required_error: 'password is required' }).min(1, 'Password cannot be empty'),
  role: z.enum(['student', 'college', 'company']).optional()
});

/**
 * Helper to match or create college record by name/domain
 */
async function resolveOrCreateCollegeId(collegeName, email) {
  if (!collegeName && !email) return null;

  try {
    const emailDomain = email && email.includes('@') ? email.split('@')[1].toLowerCase() : null;

    // 1. Try matching by domain if college email
    if (emailDomain) {
      const { data: byDomain } = await supabase
        .from('colleges')
        .select('id')
        .eq('domain', emailDomain)
        .maybeSingle();

      if (byDomain?.id) return byDomain.id;
    }

    // 2. Try matching by name
    if (collegeName && collegeName.trim()) {
      const trimmedName = collegeName.trim();
      const { data: byName } = await supabase
        .from('colleges')
        .select('id')
        .ilike('name', `%${trimmedName}%`)
        .maybeSingle();

      if (byName?.id) return byName.id;

      // 3. Not found: auto-create the college institution record so students.college_id is NOT null
      const cleanDomain = emailDomain || `${trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '')}.edu`;
      const { data: newCollege, error: createColErr } = await supabase
        .from('colleges')
        .insert({
          name: trimmedName,
          domain: cleanDomain,
          student_count: 0
        })
        .select('id')
        .single();

      if (!createColErr && newCollege?.id) {
        return newCollege.id;
      }
    }
  } catch (err) {
    console.warn('[authController] resolveOrCreateCollegeId lookup warning:', err.message);
  }

  return null;
}

/**
 * POST /api/auth/signup
 * Role-aware registration for student, college, or company.
 */
async function signup(req, res, next) {
  try {
    const validated = SignupSchema.parse(req.body);
    const {
      role,
      email,
      password,
      fullName,
      targetRole,
      collegeName,
      collegeDomain,
      branch,
      year,
      companyName,
      industry,
      website,
      designation,
      phone
    } = validated;

    const cleanEmail = email.toLowerCase().trim();

    // 1. Check if email already registered in auth or target table
    if (role === 'student') {
      const { data: existingStudent } = await supabase
        .from('students')
        .select('id')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists. Please log in.'
        });
      }
    }

    // 2. Create user in Supabase Auth with metadata containing the explicit role
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: {
        role,
        full_name: fullName,
        target_role: targetRole,
        college: collegeName,
        collegeDomain,
        branch,
        year,
        company: companyName,
        industry,
        website,
        designation,
        phone
      }
    });

    if (authError) {
      return res.status(400).json({
        success: false,
        message: authError.message || 'Failed to create user account'
      });
    }

    const authUserId = authData.user.id;

    // 3. Role-specific database persistence
    let profileData = null;

    if (role === 'college') {
      // COLLEGE / PLACEMENT CELL: Insert into colleges table ONLY
      const cleanDomain = (collegeDomain || '').replace(/^@/, '').toLowerCase().trim() ||
        (cleanEmail.includes('@') ? cleanEmail.split('@')[1] : null);

      const collegePayload = {
        name: (collegeName || fullName || 'College Institution').trim(),
        domain: cleanDomain,
        student_count: 0
      };

      const { data: collegeRecord, error: collegeError } = await supabase
        .from('colleges')
        .upsert(collegePayload, { onConflict: 'domain' })
        .select()
        .single();

      if (collegeError) {
        console.error('[authController] Failed to insert college record:', collegeError.message);
        return res.status(400).json({
          success: false,
          message: 'Failed to create college profile in database: ' + collegeError.message
        });
      }

      profileData = {
        id: collegeRecord.id,
        authUserId,
        email: cleanEmail,
        role: 'college',
        name: collegeRecord.name,
        collegeName: collegeRecord.name,
        institution: collegeRecord.name
      };

    } else if (role === 'company') {
      // COMPANY: Insert into companies table ONLY
      const companyPayload = {
        name: (companyName || fullName || 'Partner Company').trim(),
        industry: industry || 'Technology',
        website: website || null
      };

      const { data: companyRecord, error: companyError } = await supabase
        .from('companies')
        .insert(companyPayload)
        .select()
        .single();

      if (companyError) {
        console.error('[authController] Failed to insert company record:', companyError.message);
        return res.status(400).json({
          success: false,
          message: 'Failed to create company profile in database: ' + companyError.message
        });
      }

      profileData = {
        id: companyRecord.id,
        authUserId,
        email: cleanEmail,
        role: 'company',
        name: companyRecord.name,
        companyName: companyRecord.name,
        institution: companyRecord.name
      };

    } else {
      // STUDENT: Resolve college and insert into students table ONLY
      const collegeId = await resolveOrCreateCollegeId(collegeName, cleanEmail);

      const { data: studentRecord, error: studentError } = await supabase
        .from('students')
        .insert({
          auth_user_id: authUserId,
          email: cleanEmail,
          full_name: fullName,
          target_role: targetRole,
          college_id: collegeId,
          extracted_skills: []
        })
        .select()
        .single();

      if (studentError) {
        console.error('[authController] Failed to insert student record:', studentError.message);
        return res.status(400).json({
          success: false,
          message: 'Failed to create student record in database: ' + studentError.message
        });
      }

      profileData = {
        id: studentRecord.id,
        authUserId,
        email: cleanEmail,
        role: 'student',
        fullName,
        targetRole,
        college: collegeName || null,
        collegeId: studentRecord.college_id,
        branch: branch || null,
        year: year || null,
        extractedSkills: []
      };
    }

    // 4. Establish authenticated session
    const authClient = createAuthClient();
    const { data: sessionData } = await authClient.auth.signInWithPassword({
      email: cleanEmail,
      password
    });

    const token = sessionData?.session?.access_token || null;

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: profileData
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues?.map(e => e.message).join(', ') || 'Validation error';
      return res.status(400).json({ success: false, message });
    }
    next(error);
  }
}

/**
 * POST /api/auth/login
 * Role-aware authentication returning matching entity profile.
 */
async function login(req, res, next) {
  try {
    const validated = LoginSchema.parse(req.body);
    const { email, password, role: reqRole } = validated;
    const cleanEmail = email.toLowerCase().trim();

    // 1. Authenticate with Supabase Auth
    const authClient = createAuthClient();
    const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
      email: cleanEmail,
      password
    });

    if (authError || !authData?.user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const authUser = authData.user;
    const token = authData.session?.access_token;
    const role = authUser.user_metadata?.role || reqRole || 'student';

    // 2. Fetch role-appropriate profile from database
    if (role === 'college') {
      const collegeName = authUser.user_metadata?.college || '';
      const emailDomain = cleanEmail.includes('@') ? cleanEmail.split('@')[1] : '';

      const { data: college } = await supabase
        .from('colleges')
        .select('*')
        .or(`domain.eq.${emailDomain},name.ilike.%${collegeName || cleanEmail}%`)
        .limit(1)
        .maybeSingle();

      return res.status(200).json({
        success: true,
        token,
        user: {
          id: college?.id || authUser.id,
          authUserId: authUser.id,
          email: authUser.email,
          role: 'college',
          name: authUser.user_metadata?.full_name || college?.name || 'College Admin',
          fullName: authUser.user_metadata?.full_name || college?.name || 'College Admin',
          collegeName: college?.name || authUser.user_metadata?.college || 'College',
          institution: college?.name || authUser.user_metadata?.college || 'Apex Institute of Technology',
          title: authUser.user_metadata?.designation || 'Placement Director'
        }
      });
    }

    if (role === 'company') {
      const companyName = authUser.user_metadata?.company || '';

      const { data: company } = await supabase
        .from('companies')
        .select('*')
        .ilike('name', `%${companyName || cleanEmail}%`)
        .limit(1)
        .maybeSingle();

      return res.status(200).json({
        success: true,
        token,
        user: {
          id: company?.id || authUser.id,
          authUserId: authUser.id,
          email: authUser.email,
          role: 'company',
          name: authUser.user_metadata?.full_name || company?.name || 'Recruiter',
          fullName: authUser.user_metadata?.full_name || company?.name || 'Recruiter',
          companyName: company?.name || authUser.user_metadata?.company || 'Company',
          institution: company?.name || authUser.user_metadata?.company || 'Acme Technologies',
          title: authUser.user_metadata?.designation || 'Lead Technical Recruiter'
        }
      });
    }

    // Default: Student role
    const { data: student } = await supabase
      .from('students')
      .select('*, colleges(name)')
      .or(`auth_user_id.eq.${authUser.id},email.eq.${authUser.email}`)
      .maybeSingle();

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: student?.id || authUser.id,
        authUserId: authUser.id,
        email: authUser.email,
        role: 'student',
        fullName: student?.full_name || authUser.user_metadata?.full_name || 'Student',
        targetRole: student?.target_role || authUser.user_metadata?.target_role || 'Full Stack Developer',
        college: student?.colleges?.name || authUser.user_metadata?.college || null,
        collegeId: student?.college_id || null,
        branch: authUser.user_metadata?.branch || null,
        year: authUser.user_metadata?.year || null,
        extractedSkills: student?.extracted_skills || []
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues?.map(e => e.message).join(', ') || 'Validation error';
      return res.status(400).json({ success: false, message });
    }
    next(error);
  }
}

/**
 * GET /api/auth/me
 * Returns current authenticated user and profile based on role.
 */
async function getMe(req, res, next) {
  try {
    const authUser = req.user;
    if (!authUser) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    const role = authUser.user_metadata?.role || 'student';

    if (role === 'college') {
      const collegeName = authUser.user_metadata?.college || '';
      const emailDomain = authUser.email.includes('@') ? authUser.email.split('@')[1] : '';

      const { data: college } = await supabase
        .from('colleges')
        .select('*')
        .or(`domain.eq.${emailDomain},name.ilike.%${collegeName || authUser.email}%`)
        .limit(1)
        .maybeSingle();

      return res.status(200).json({
        success: true,
        user: {
          id: college?.id || authUser.id,
          authUserId: authUser.id,
          email: authUser.email,
          role: 'college',
          name: authUser.user_metadata?.full_name || college?.name || 'College Admin',
          fullName: authUser.user_metadata?.full_name || college?.name || 'College Admin',
          collegeName: college?.name || authUser.user_metadata?.college || 'College',
          institution: college?.name || authUser.user_metadata?.college || 'Institution'
        }
      });
    }

    if (role === 'company') {
      const companyName = authUser.user_metadata?.company || '';

      const { data: company } = await supabase
        .from('companies')
        .select('*')
        .ilike('name', `%${companyName || authUser.email}%`)
        .limit(1)
        .maybeSingle();

      return res.status(200).json({
        success: true,
        user: {
          id: company?.id || authUser.id,
          authUserId: authUser.id,
          email: authUser.email,
          role: 'company',
          name: authUser.user_metadata?.full_name || company?.name || 'Recruiter',
          fullName: authUser.user_metadata?.full_name || company?.name || 'Recruiter',
          companyName: company?.name || authUser.user_metadata?.company || 'Company',
          institution: company?.name || authUser.user_metadata?.company || 'Company'
        }
      });
    }

    // Default: Student
    const { data: student } = await supabase
      .from('students')
      .select('*, colleges(name)')
      .or(`auth_user_id.eq.${authUser.id},email.eq.${authUser.email}`)
      .maybeSingle();

    return res.status(200).json({
      success: true,
      user: {
        id: student?.id || authUser.id,
        authUserId: authUser.id,
        email: authUser.email,
        role: 'student',
        fullName: student?.full_name || authUser.user_metadata?.full_name || 'Student',
        targetRole: student?.target_role || authUser.user_metadata?.target_role || 'Full Stack Developer',
        college: student?.colleges?.name || authUser.user_metadata?.college || null,
        collegeId: student?.college_id || null,
        branch: authUser.user_metadata?.branch || null,
        year: authUser.user_metadata?.year || null,
        extractedSkills: student?.extracted_skills || []
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/logout
 */
async function logout(req, res) {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
}

module.exports = {
  signup,
  login,
  getMe,
  logout
};
