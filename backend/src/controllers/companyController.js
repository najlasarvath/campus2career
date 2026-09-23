const { supabase } = require('../config/supabaseClient');

/**
 * GET /api/companies/requirements
 * Fetches all published job role requirements from Supabase role_requirements joined with companies.
 */
async function getCompanyRequirements(req, res, next) {
  try {
    const { data: dbRequirements, error } = await supabase
      .from('role_requirements')
      .select('*, companies(id, name, industry, website)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[companyController] Failed to fetch requirements:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve company requirements: ' + error.message
      });
    }

    const formattedRequirements = (dbRequirements || []).map(r => ({
      id: r.id || r.role_id,
      roleId: r.role_id,
      role: r.title,
      title: r.title,
      company: r.companies?.name || 'Partner Company',
      companyId: r.company_id,
      department: r.category || 'Engineering',
      requiredSkills: Array.isArray(r.core_skills) ? r.core_skills : [],
      secondarySkills: Array.isArray(r.secondary_skills) ? r.secondary_skills : [],
      status: 'Active',
      minReadiness: 75,
      openings: 2,
      location: 'Hybrid',
      experience: '0–2 Years',
      matchedCandidatesCount: 3,
      postedDate: r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'
    }));

    return res.status(200).json({
      success: true,
      requirements: formattedRequirements
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/companies/requirements
 * Inserts a new role requirement into Supabase role_requirements associated with a company.
 */
async function createCompanyRequirement(req, res, next) {
  try {
    const {
      role,
      title,
      department,
      category,
      requiredSkills,
      secondarySkills,
      companyId,
      companyName
    } = req.body;

    const requirementTitle = (title || role || 'Software Specialist').trim();
    const requirementCategory = (category || department || 'Software Engineering').trim();
    const coreSkills = Array.isArray(requiredSkills) ? requiredSkills : [];
    const secSkills = Array.isArray(secondarySkills) ? secondarySkills : [];

    // 1. Resolve or verify company_id
    let resolvedCompanyId = companyId;

    if (!resolvedCompanyId) {
      // Find matching company or fallback to first company in database
      if (companyName) {
        const { data: compByName } = await supabase
          .from('companies')
          .select('id')
          .ilike('name', `%${companyName.trim()}%`)
          .limit(1)
          .maybeSingle();

        if (compByName?.id) {
          resolvedCompanyId = compByName.id;
        }
      }

      if (!resolvedCompanyId) {
        // Pick any existing company as parent
        const { data: firstComp } = await supabase
          .from('companies')
          .select('id, name')
          .limit(1)
          .maybeSingle();

        resolvedCompanyId = firstComp?.id || null;
      }
    }

    // 2. Generate slug for role_id
    const slug = `${requirementTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

    // 3. Insert into Supabase role_requirements
    const { data: inserted, error: insertError } = await supabase
      .from('role_requirements')
      .insert({
        role_id: slug,
        title: requirementTitle,
        category: requirementCategory,
        core_skills: coreSkills,
        secondary_skills: secSkills,
        company_id: resolvedCompanyId
      })
      .select('*, companies(id, name, industry, website)')
      .single();

    if (insertError) {
      console.error('[companyController] Insert role requirement error:', insertError.message);
      return res.status(400).json({
        success: false,
        message: 'Database insert failed: ' + insertError.message
      });
    }

    const formatted = {
      id: inserted.id,
      roleId: inserted.role_id,
      role: inserted.title,
      title: inserted.title,
      company: inserted.companies?.name || companyName || 'Acme Technologies',
      companyId: inserted.company_id,
      department: inserted.category,
      requiredSkills: inserted.core_skills || [],
      secondarySkills: inserted.secondary_skills || [],
      status: 'Active',
      minReadiness: req.body.minReadiness || 75,
      openings: req.body.openings || 1,
      location: req.body.location || 'Hybrid',
      experience: req.body.experience || '0–2 Years',
      matchedCandidatesCount: 3,
      postedDate: 'Just now'
    };

    return res.status(201).json({
      success: true,
      message: 'Job requirement published successfully',
      requirement: formatted
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCompanyRequirements,
  createCompanyRequirement
};
