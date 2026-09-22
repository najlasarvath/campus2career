const crypto = require('crypto');
const { parseResumePdf } = require('../services/resumeService');
const { extractSkills } = require('../services/skillExtractionService');
const { supabase } = require('../config/supabaseClient');

/**
 * Upload and process resume PDF.
 * Extracts text, runs skill extraction stub, and persists data to Supabase students table.
 */
async function uploadResume(req, res, next) {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: 'Only PDF files are supported or file missing'
      });
    }

    // 1. Parse text from uploaded PDF buffer
    const extractedText = await parseResumePdf(req.file.buffer);

    // 2. Extract skills via contract stub
    const { skills: extractedSkills } = extractSkills(extractedText);

    // 3. Persist resume_text and extracted_skills to Supabase students table
    const studentId = req.body.studentId || req.user?.id;
    const email = req.body.email || (studentId ? null : `student_${Date.now()}@campus.edu`);
    const fullName = req.body.fullName || 'Registered Student';
    const targetRole = req.body.targetRole || 'Full Stack Developer';

    let persistedResumeId = null;

    if (studentId) {
      // Update existing student record
      const { data, error } = await supabase
        .from('students')
        .update({
          resume_text: extractedText,
          extracted_skills: extractedSkills,
          updated_at: new Date().toISOString()
        })
        .eq('id', studentId)
        .select('id')
        .maybeSingle();

      if (error) {
        console.error('[ResumeController] Failed to update students table in Supabase:', error.message);
      } else if (data) {
        persistedResumeId = data.id;
      }
    } else {
      // Insert new student profile with parsed resume
      const { data, error } = await supabase
        .from('students')
        .upsert(
          {
            email,
            full_name: fullName,
            target_role: targetRole,
            resume_text: extractedText,
            extracted_skills: extractedSkills
          },
          { onConflict: 'email' }
        )
        .select('id')
        .maybeSingle();

      if (error) {
        console.error('[ResumeController] Failed to insert student record in Supabase:', error.message);
      } else if (data) {
        persistedResumeId = data.id;
      }
    }

    // Fallback ID if Supabase is unconfigured in local mock environment
    const responseId = persistedResumeId || studentId || crypto.randomUUID();

    // 4. Return response matching API_SPEC.md
    return res.status(200).json({
      success: true,
      resumeId: responseId,
      textLength: extractedText.length,
      extractedText: extractedText.length > 500 ? `${extractedText.slice(0, 500)}...` : extractedText,
      extractedSkills
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  uploadResume
};
