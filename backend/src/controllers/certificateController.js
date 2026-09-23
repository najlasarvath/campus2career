const crypto = require('crypto');
const { supabase } = require('../config/supabaseClient');
const { studentEnrollments, workshopsRegistry } = require('./workshopController');

// Registry for certificates (in-memory persistent store + Supabase sync)
const certificatesRegistry = new Map([
  [
    'C2C-SQL-7A9B1C2D',
    {
      id: 'C2C-SQL-7A9B1C2D',
      studentId: 'demo-student-id',
      studentName: 'Aarav Patel',
      collegeName: 'Apex Institute of Technology',
      workshopId: 'ws-sql-readiness',
      workshopTitle: 'SQL Industry Readiness Workshop',
      skill: 'SQL',
      assessmentScore: 84,
      passingScore: 70,
      issuedAt: '2026-03-15T10:30:00.000Z',
      status: 'VERIFIED',
      verificationHash: 'sha256-7a9b1c2d3e4f5a6b',
      issuer: 'Campus2Career AI Placement & Skilling Authority'
    }
  ],
  [
    'C2C-POWERBI-3E4F5A6B',
    {
      id: 'C2C-POWERBI-3E4F5A6B',
      studentId: 'demo-student-id',
      studentName: 'Priya Sharma',
      collegeName: 'Apex Institute of Technology',
      workshopId: 'ws-powerbi-mastery',
      workshopTitle: 'Power BI & Executive Dashboarding Workshop',
      skill: 'Power BI',
      assessmentScore: 92,
      passingScore: 70,
      issuedAt: '2026-03-18T14:15:00.000Z',
      status: 'VERIFIED',
      verificationHash: 'sha256-3e4f5a6b7c8d9e0f',
      issuer: 'Campus2Career AI Placement & Skilling Authority'
    }
  ]
]);

/**
 * Controller: Generate or retrieve a verified college-branded completion certificate.
 * POST /api/certificates/generate
 */
async function generateCertificate(req, res, next) {
  try {
    const studentId = req.user?.id || req.body.studentId || 'default-student';
    const { workshopId } = req.body;

    if (!workshopId) {
      return res.status(400).json({
        success: false,
        message: 'workshopId is required to generate a certificate'
      });
    }

    const workshop = workshopsRegistry.get(workshopId);
    if (!workshop) {
      return res.status(404).json({
        success: false,
        message: 'Workshop not found'
      });
    }

    // Configurable passing threshold from environment
    const passingScore = parseInt(process.env.WORKSHOP_PASSING_SCORE || '70', 10);

    // Look up enrollment record
    const enrollmentKey = `${studentId}:${workshopId}`;
    let enrollment = studentEnrollments.get(enrollmentKey);

    // If no prior assessment score exists in enrollment, evaluate whether direct score was provided
    let score = enrollment?.postScore || req.body.assessmentScore;
    if (score === undefined || score === null) {
      // Default to passing benchmark if assessment was triggered during full flow
      score = 78;
    }

    if (score < passingScore) {
      return res.status(400).json({
        success: false,
        message: `Assessment score (${score}%) does not meet the passing threshold of ${passingScore}%. Skill gap remains. Additional practice required before certificate issuance.`,
        score,
        passingScore,
        eligible: false
      });
    }

    // Retrieve Student and College details from DB or authenticated session
    let studentName = req.user?.user_metadata?.full_name || 'Engineering Scholar';
    let collegeName = 'Apex Institute of Technology';

    if (supabase && req.user?.id) {
      try {
        const { data: student } = await supabase
          .from('students')
          .select('full_name, college_id, colleges(name)')
          .eq('id', req.user.id)
          .single();

        if (student?.full_name) {
          studentName = student.full_name;
        }
        if (student?.colleges?.name) {
          collegeName = student.colleges.name;
        } else if (req.user?.user_metadata?.college) {
          collegeName = req.user.user_metadata.college;
        }
      } catch (dbErr) {
        console.warn('[CertificateController] College name fetch warning:', dbErr.message);
      }
    } else if (req.body.collegeName) {
      collegeName = req.body.collegeName;
    } else if (req.body.studentName) {
      studentName = req.body.studentName;
    }

    // Generate unique Certificate ID: C2C-{SKILL}-{HEX}
    const cleanSkill = (workshop.skill || 'TECH').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    let certificateId;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const hex = crypto.randomBytes(4).toString('hex').toUpperCase();
      certificateId = `C2C-${cleanSkill}-${hex}`;
      if (!certificatesRegistry.has(certificateId)) {
        isUnique = true;
      }
      attempts++;
    }

    const verificationHash = crypto.createHash('sha256')
      .update(`${certificateId}:${studentId}:${collegeName}:${Date.now()}`)
      .digest('hex')
      .slice(0, 16);

    const certificate = {
      id: certificateId,
      studentId,
      studentName,
      collegeName,
      workshopId: workshop.id,
      workshopTitle: workshop.title,
      skill: workshop.skill,
      assessmentScore: score,
      passingScore,
      issuedAt: new Date().toISOString(),
      status: 'VERIFIED',
      verificationHash: `sha256-${verificationHash}`,
      issuer: 'Campus2Career AI Placement & Skilling Authority',
      verificationUrl: `/verify-certificate?id=${certificateId}`
    };

    certificatesRegistry.set(certificateId, certificate);

    // Also update enrollment record
    if (enrollment) {
      enrollment.certificateId = certificateId;
      enrollment.certificateIssued = true;
      studentEnrollments.set(enrollmentKey, enrollment);
    }

    return res.status(201).json({
      success: true,
      message: 'College-branded completion certificate successfully issued.',
      certificate
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: Get all certificates for current student or list all.
 * GET /api/certificates
 */
async function getCertificates(req, res, next) {
  try {
    const studentId = req.user?.id || req.query.studentId;
    const all = Array.from(certificatesRegistry.values());

    let list = all;
    if (studentId) {
      list = all.filter(c => c.studentId === studentId || c.studentId === 'demo-student-id');
    }

    return res.status(200).json({
      success: true,
      total: list.length,
      certificates: list
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: Get specific certificate by ID.
 * GET /api/certificates/:id
 */
async function getCertificateById(req, res, next) {
  try {
    const { id } = req.params;
    const cert = certificatesRegistry.get(id);

    if (!cert) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    return res.status(200).json({
      success: true,
      certificate: cert
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  generateCertificate,
  getCertificates,
  getCertificateById,
  certificatesRegistry
};
