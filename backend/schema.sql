-- ============================================================================
-- Campus2Career AI — PostgreSQL Schema (Supabase)
-- ============================================================================

-- Enable pgcrypto / uuid generation if not present
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. Colleges Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS colleges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    domain TEXT UNIQUE,
    student_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. Companies Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    industry TEXT,
    website TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. Students Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID,
    college_id UUID REFERENCES colleges(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    target_role TEXT,
    resume_text TEXT,
    extracted_skills TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. Role Requirements Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS role_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    core_skills TEXT[] NOT NULL DEFAULT '{}',
    secondary_skills TEXT[] NOT NULL DEFAULT '{}',
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. Skill Progress Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS skill_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'acquired', -- 'acquired', 'in_progress', 'gap'
    proficiency_level INTEGER NOT NULL DEFAULT 1,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_student_skill UNIQUE (student_id, skill_name)
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_students_college_id ON students(college_id);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_target_role ON students(target_role);
CREATE INDEX IF NOT EXISTS idx_role_requirements_role_id ON role_requirements(role_id);
CREATE INDEX IF NOT EXISTS idx_skill_progress_student ON skill_progress(student_id);

-- ============================================================================
-- Trigger: Automatic Maintenance of colleges.student_count
-- Increments on INSERT, decrements on DELETE, adjusts on UPDATE if college changes.
-- ============================================================================
CREATE OR REPLACE FUNCTION update_college_student_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF NEW.college_id IS NOT NULL THEN
            UPDATE colleges
            SET student_count = student_count + 1,
                updated_at = NOW()
            WHERE id = NEW.college_id;
        END IF;
        RETURN NEW;

    ELSIF (TG_OP = 'DELETE') THEN
        IF OLD.college_id IS NOT NULL THEN
            UPDATE colleges
            SET student_count = GREATEST(0, student_count - 1),
                updated_at = NOW()
            WHERE id = OLD.college_id;
        END IF;
        RETURN OLD;

    ELSIF (TG_OP = 'UPDATE') THEN
        IF OLD.college_id IS DISTINCT FROM NEW.college_id THEN
            IF OLD.college_id IS NOT NULL THEN
                UPDATE colleges
                SET student_count = GREATEST(0, student_count - 1),
                    updated_at = NOW()
                WHERE id = OLD.college_id;
            END IF;

            IF NEW.college_id IS NOT NULL THEN
                UPDATE colleges
                SET student_count = student_count + 1,
                    updated_at = NOW()
                WHERE id = NEW.college_id;
            END IF;
        END IF;
        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 6. Workshops Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workshops (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    skill TEXT NOT NULL,
    description TEXT,
    instructor TEXT,
    conducted_at TIMESTAMPTZ,
    duration TEXT,
    video_url TEXT,
    embed_url TEXT,
    thumbnail_url TEXT,
    status TEXT NOT NULL DEFAULT 'conducted', -- 'conducted', 'active', 'scheduled'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workshops_skill ON workshops(skill);
CREATE INDEX IF NOT EXISTS idx_workshops_status ON workshops(status);

DROP TRIGGER IF EXISTS trigger_update_college_student_count ON students;
CREATE TRIGGER trigger_update_college_student_count
AFTER INSERT OR UPDATE OR DELETE ON students
FOR EACH ROW
EXECUTE FUNCTION update_college_student_count();

-- ----------------------------------------------------------------------------
-- 7. Certificates Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS certificates (
    id TEXT PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    workshop_id TEXT NOT NULL,
    workshop_title TEXT NOT NULL,
    student_name TEXT NOT NULL,
    college_name TEXT NOT NULL,
    assessment_score INTEGER NOT NULL,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_student_workshop_certificate UNIQUE (student_id, workshop_id)
);

CREATE INDEX IF NOT EXISTS idx_certificates_student_id ON certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_workshop_id ON certificates(workshop_id);

