-- ============================================================================
-- Campus2Career AI — Mock Seed Dataset
-- ============================================================================

-- 1. Colleges
INSERT INTO colleges (id, name, domain, student_count)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Stanford University', 'stanford.edu', 0),
    ('a0000000-0000-0000-0000-000000000002', 'Massachusetts Institute of Technology', 'mit.edu', 0),
    ('a0000000-0000-0000-0000-000000000003', 'UC Berkeley', 'berkeley.edu', 0)
ON CONFLICT (domain) DO UPDATE
SET name = EXCLUDED.name;

-- 2. Companies
INSERT INTO companies (id, name, industry, website)
VALUES
    ('b0000000-0000-0000-0000-000000000001', 'Google', 'Technology', 'https://google.com'),
    ('b0000000-0000-0000-0000-000000000002', 'Amazon', 'Cloud & E-Commerce', 'https://amazon.com'),
    ('b0000000-0000-0000-0000-000000000003', 'Meta', 'Social Technology', 'https://meta.com')
ON CONFLICT (id) DO NOTHING;

-- 3. Role Requirements (Single source of truth for match scoring)
INSERT INTO role_requirements (role_id, title, category, core_skills, secondary_skills, company_id)
VALUES
    (
        'full-stack-developer',
        'Full Stack Developer',
        'Software Engineering',
        ARRAY['JavaScript', 'React', 'Node.js', 'Express', 'SQL', 'Git'],
        ARRAY['TypeScript', 'Docker', 'Tailwind CSS', 'REST APIs', 'PostgreSQL'],
        'b0000000-0000-0000-0000-000000000001'
    ),
    (
        'frontend-developer',
        'Frontend Developer',
        'Software Engineering',
        ARRAY['JavaScript', 'React', 'HTML5', 'CSS3', 'Tailwind CSS'],
        ARRAY['TypeScript', 'Next.js', 'Redux', 'UI/UX Design'],
        'b0000000-0000-0000-0000-000000000002'
    ),
    (
        'backend-developer',
        'Backend Developer',
        'Software Engineering',
        ARRAY['Node.js', 'Express', 'SQL', 'PostgreSQL', 'REST APIs'],
        ARRAY['Docker', 'Redis', 'Authentication', 'System Design'],
        'b0000000-0000-0000-0000-000000000003'
    )
ON CONFLICT (role_id) DO UPDATE
SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    core_skills = EXCLUDED.core_skills,
    secondary_skills = EXCLUDED.secondary_skills,
    company_id = EXCLUDED.company_id,
    updated_at = NOW();
