const { supabase } = require('../config/supabaseClient');
const { generateRoadmap, generateRemedialTasks } = require('../services/ai/roadmapAI');

// In-memory fallback task store keyed by student ID to guarantee resilience if Supabase table is pending
const inMemoryTasks = new Map();

/**
 * Helper to get default initial tasks if none exist yet.
 */
function getDefaultDailyTasks(targetRole = 'Software Engineer', skill = 'Core Architecture') {
  return [
    {
      id: `task-d1-${Date.now()}`,
      day: 1,
      skill,
      title: `Day 1 — ${skill} Fundamentals & Architecture`,
      description: `Understand the core mechanics, system design patterns, and foundational syntax of ${skill}.`,
      duration: '30 mins',
      learningResource: 'Official Documentation & Standards Guide',
      practiceActivity: 'Build a foundational demo project implementing core interfaces',
      completed: false,
      isRemedial: false,
      assessment: `What is the core trade-off when selecting ${skill} over alternatives?`
    },
    {
      id: `task-d2-${Date.now()}`,
      day: 2,
      skill,
      title: `Day 2 — Deep-Dive Operations & Data Flow`,
      description: `Master data transformations, filtering, and state management in ${skill}.`,
      duration: '45 mins',
      learningResource: 'Comprehensive Guide & Video Walkthrough',
      practiceActivity: 'Implement data pipeline with input validation and error handling',
      completed: false,
      isRemedial: false,
      assessment: 'How does error propagation work in this architecture?'
    },
    {
      id: `task-d3-${Date.now()}`,
      day: 3,
      skill,
      title: `Day 3 — Integration & Relations`,
      description: 'Connect modules, manage foreign keys or external dependencies, and optimize relations.',
      duration: '45 mins',
      learningResource: 'Integration Patterns & API Guide',
      practiceActivity: 'Perform complex joins/integrations across 2 independent services',
      completed: false,
      isRemedial: false,
      assessment: 'What strategy prevents cascade failure during integrations?'
    },
    {
      id: `task-d4-${Date.now()}`,
      day: 4,
      skill,
      title: `Day 4 — Performance Profiling & Optimization`,
      description: 'Profile execution bottlenecks, implement caching, and benchmark query/runtime latency.',
      duration: '45 mins',
      learningResource: 'Performance Optimization & APM Guide',
      practiceActivity: 'Profile code and reduce execution latency by at least 25%',
      completed: false,
      isRemedial: false,
      assessment: 'Explain the difference between CPU-bound and I/O-bound bottlenecks.'
    },
    {
      id: `task-d5-${Date.now()}`,
      day: 5,
      skill,
      title: `Day 5 — Practical Engineering Challenge`,
      description: `Solve an industry-simulated engineering problem utilizing ${skill}.`,
      duration: '60 mins',
      learningResource: 'Engineering Challenge Repository',
      practiceActivity: 'Solve automated test suite and pass all edge-case assertions',
      completed: false,
      isRemedial: false,
      assessment: 'What edge case was hardest to resolve?'
    },
    {
      id: `task-d6-${Date.now()}`,
      day: 6,
      skill,
      title: `Day 6 — Capstone Mini-Project`,
      description: 'Build a production-grade portfolio feature showcasing verified mastery.',
      duration: '60 mins',
      learningResource: 'Full-Stack Architecture Boilerplate',
      practiceActivity: 'Deploy feature or commit working implementation to GitHub repository',
      completed: false,
      isRemedial: false,
      assessment: 'How would you defend your architecture in an interview?'
    },
    {
      id: `task-d7-${Date.now()}`,
      day: 7,
      skill,
      title: `Day 7 — Mock Drill & Skill Assessment`,
      description: 'Take the adaptive technical mock drill to verify competency and earn readiness lift.',
      duration: '30 mins',
      learningResource: 'Campus2Career Technical Assessment Rubric',
      practiceActivity: 'Complete the 2-minute timed conceptual assessment drill',
      completed: false,
      isRemedial: false,
      assessment: 'Achieve score >= 70% to verify skill'
    }
  ];
}

/**
 * Controller: Get student daily tasks.
 * GET /api/tasks/daily
 */
async function getDailyTasks(req, res, next) {
  try {
    const studentId = req.user?.id || req.query.studentId || 'default-student';
    let tasks = inMemoryTasks.get(studentId);

    // If no tasks exist for student, fetch profile context and initialize
    if (!tasks || tasks.length === 0) {
      let targetRole = req.user?.targetRole || 'Full Stack Developer';
      let focusSkill = 'SQL';

      if (supabase && req.user?.id) {
        try {
          const { data: student } = await supabase
            .from('students')
            .select('target_role, extracted_skills')
            .eq('id', req.user.id)
            .single();

          if (student) {
            targetRole = student.target_role || targetRole;
            focusSkill = (student.extracted_skills && student.extracted_skills[0]) || focusSkill;
          }
        } catch {
          // continue with defaults
        }
      }

      tasks = getDefaultDailyTasks(targetRole, focusSkill);
      inMemoryTasks.set(studentId, tasks);
    }

    const total = tasks.length;
    const completedCount = tasks.filter(t => t.completed).length;
    const progressPct = total > 0 ? Math.round((completedCount / total) * 100) : 0;
    const todayTask = tasks.find(t => !t.completed) || tasks[0];

    return res.status(200).json({
      success: true,
      tasks,
      todayTask,
      stats: {
        total,
        completed: completedCount,
        progressPct
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: Toggle daily task completion.
 * PUT /api/tasks/daily/:id/toggle
 */
async function toggleDailyTask(req, res, next) {
  try {
    const studentId = req.user?.id || req.query.studentId || 'default-student';
    const taskId = req.params.id;

    let tasks = inMemoryTasks.get(studentId) || getDefaultDailyTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);

    if (taskIndex < 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    tasks[taskIndex].completed = !tasks[taskIndex].completed;
    inMemoryTasks.set(studentId, tasks);

    return res.status(200).json({
      success: true,
      task: tasks[taskIndex]
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: Inject remedial tasks when an assessment reveals a persistent gap.
 * POST /api/tasks/daily/remediate
 */
async function injectRemedialTasks(req, res, next) {
  try {
    const studentId = req.user?.id || req.body.studentId || 'default-student';
    const { skill, weakAreas } = req.body;

    if (!skill) {
      return res.status(400).json({
        success: false,
        message: 'Skill is required to generate remedial tasks'
      });
    }

    let existingTasks = inMemoryTasks.get(studentId) || getDefaultDailyTasks();
    const maxDay = existingTasks.reduce((max, t) => Math.max(max, t.day || 0), 0);

    // Call AI to generate 3 targeted remedial tasks
    let remedialList = [];
    try {
      const aiResult = await generateRemedialTasks({
        skill,
        weakAreas: Array.isArray(weakAreas) ? weakAreas : [weakAreas].filter(Boolean),
        startDay: maxDay + 1
      });
      remedialList = aiResult.remedialTasks || [];
    } catch (aiErr) {
      console.warn('[TaskController] AI remedial generation error, using structured template:', aiErr.message);
      remedialList = [
        {
          id: `remedial-${skill.toLowerCase()}-${maxDay + 1}`,
          day: maxDay + 1,
          skill,
          title: `Day ${maxDay + 1} — Targeted ${skill} Remediation: Foundations`,
          description: `Intensive focus on resolving identified conceptual weaknesses in ${skill}.`,
          duration: '45 mins',
          learningResource: `${skill} Deep-Dive Lab & Documentation`,
          practiceActivity: 'Implement core pattern resolving edge cases',
          completed: false,
          isRemedial: true,
          assessment: 'Explain the resolution to the previous assessment gap'
        },
        {
          id: `remedial-${skill.toLowerCase()}-${maxDay + 2}`,
          day: maxDay + 2,
          skill,
          title: `Day ${maxDay + 2} — Targeted ${skill} Remediation: Hands-on Challenge`,
          description: 'Solve real-world debugging challenge to eliminate errors under pressure.',
          duration: '60 mins',
          learningResource: `${skill} Production Debugging Guide`,
          practiceActivity: 'Debug simulated broken query/code and verify correct output',
          completed: false,
          isRemedial: true,
          assessment: 'Demonstrate code defense'
        }
      ];
    }

    // Preserve already completed tasks and append remedial tasks
    const updatedTasks = [...existingTasks, ...remedialList];
    inMemoryTasks.set(studentId, updatedTasks);

    return res.status(200).json({
      success: true,
      message: `Injected ${remedialList.length} targeted remedial tasks for ${skill}`,
      remedialTasks: remedialList,
      remedialTasksCount: remedialList.length,
      totalTasks: updatedTasks.length
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDailyTasks,
  toggleDailyTask,
  injectRemedialTasks
};
