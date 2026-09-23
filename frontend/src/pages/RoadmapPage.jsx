import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStudent } from '../context/StudentContext';
import apiClient from '../services/api';
import DailyTaskCard from '../components/roadmap/DailyTaskCard';
import RoadmapWeek from '../components/roadmap/RoadmapWeek';

export default function RoadmapPage() {
  const {
    target_role,
    readiness_score,
    acquired_skills,
    critical_gaps,
    secondary_gaps,
    roadmapUpdatedBanner,
    dismissRoadmapBanner
  } = useStudent();

  const [aiRoadmap, setAiRoadmap] = useState(null);
  const [dailyTasks, setDailyTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' | 'weekly'
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);

  // Fetch initial tasks from backend
  const fetchTasks = async () => {
    try {
      const res = await apiClient.get('/tasks/daily');
      if (res && res.success && res.tasks) {
        setDailyTasks(res.tasks);
      }
    } catch {
      // ignore
    }
  };

  // Toggle task completion
  const handleToggleTask = async (taskId) => {
    setDailyTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
    try {
      await apiClient.put(`/tasks/daily/${taskId}/toggle`);
    } catch (err) {
      console.warn('[RoadmapPage] Toggle persistence warning:', err.message);
    }
  };

  // Function to call real backend Gemini AI roadmap generation
  const handleGenerateRoadmap = async () => {
    setIsGenerating(true);
    setGenerationError(null);

    try {
      const currentSkills = (acquired_skills || []).map(s => s.name || s);
      const missingSkills = [
        ...(critical_gaps || []).map(g => g.name || g),
        ...(secondary_gaps || []).map(g => g.name || g)
      ];

      // POST /api/roadmaps/generate
      const response = await apiClient.post('/roadmaps/generate', {
        targetRole: target_role || 'Full Stack Developer',
        currentSkills: currentSkills.length > 0 ? currentSkills : ['JavaScript', 'HTML5', 'CSS3'],
        missingSkills: missingSkills.length > 0 ? missingSkills : ['Docker', 'Node.js', 'PostgreSQL'],
        weeksAvailable: 4
      });

      if (response && response.success) {
        setAiRoadmap(response.roadmap || response);
        if (response.tasks && response.tasks.length > 0) {
          setDailyTasks(response.tasks);
        } else if (response.roadmap?.tasks && response.roadmap.tasks.length > 0) {
          setDailyTasks(response.roadmap.tasks);
        }
      } else {
        throw new Error(response?.message || 'Failed to generate career roadmap');
      }
    } catch (err) {
      console.error('[RoadmapPage] Error generating roadmap:', err);
      setGenerationError(err.message || 'Error communicating with Gemini AI roadmap service.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Automatically fetch on mount if not already loaded
  useEffect(() => {
    let isMounted = true;
    async function initRoadmap() {
      await fetchTasks();
      if (!aiRoadmap && target_role) {
        setIsGenerating(true);
        setGenerationError(null);
        try {
          const currentSkills = (acquired_skills || []).map(s => s.name || s);
          const missingSkills = [
            ...(critical_gaps || []).map(g => g.name || g),
            ...(secondary_gaps || []).map(g => g.name || g)
          ];

          const response = await apiClient.post('/roadmaps/generate', {
            targetRole: target_role || 'Full Stack Developer',
            currentSkills: currentSkills.length > 0 ? currentSkills : ['JavaScript', 'HTML5', 'CSS3'],
            missingSkills: missingSkills.length > 0 ? missingSkills : ['Docker', 'Node.js', 'PostgreSQL'],
            weeksAvailable: 4
          });

          if (isMounted && response?.success) {
            setAiRoadmap(response.roadmap || response);
            if (response.tasks && response.tasks.length > 0) {
              setDailyTasks(response.tasks);
            } else if (response.roadmap?.tasks && response.roadmap.tasks.length > 0) {
              setDailyTasks(response.roadmap.tasks);
            }
          }
        } catch (err) {
          if (isMounted) {
            setGenerationError(err.message || 'Could not load AI roadmap.');
          }
        } finally {
          if (isMounted) setIsGenerating(false);
        }
      }
    }

    initRoadmap();

    return () => {
      isMounted = false;
    };
  }, [target_role]);

  // Format AI milestones for display
  const displayWeeks = (aiRoadmap?.milestones || []).map((m, idx) => ({
    week: m.week || (idx + 1),
    topic: m.topic,
    focusSkill: Array.isArray(m.resources) && m.resources.length > 0 ? m.resources[0] : m.topic,
    status: idx === 0 ? 'in-progress' : idx === 1 ? 'in-progress' : 'locked',
    objective: m.actionItem,
    milestones: [
      { id: `m-${m.week || idx + 1}-1`, title: m.actionItem, completed: false }
    ]
  }));

  const totalTasks = dailyTasks.length;
  const completedTasks = dailyTasks.filter(t => t.completed).length;
  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="executive-badge-navy text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Gemini AI Curriculum
            </span>
            <span className="text-slate-300">•</span>
            <Link to="/student" className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition">
              Student Dashboard
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Adaptive Learning Sprint
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            Granular daily tasks generated dynamically by Gemini AI to systematically clear critical blockers for{' '}
            <strong className="text-slate-900 font-bold">{target_role}</strong>.
          </p>
        </div>

        {/* Action Toggle */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleGenerateRoadmap}
            disabled={isGenerating}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-2xs transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            {isGenerating && (
              <span className="w-3.5 h-3.5 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
            )}
            <span>{isGenerating ? 'Generating with AI...' : '⚡ Regenerate Sprint'}</span>
          </button>

          <Link
            to="/interview"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#173B8F] to-[#2563EB] hover:from-[#132E70] hover:to-[#1D4ED8] text-white text-xs font-bold shadow-sm transition flex items-center space-x-1.5"
          >
            <span>Mock Drill</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* Progress & Statistics Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-slate-900 block">
              Daily Sprint Velocity: {completedTasks} of {totalTasks} Tasks Completed ({progressPct}%)
            </span>
            <span className="text-[11px] text-slate-500">
              Each completed daily task directly advances your readiness towards {target_role} benchmark.
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'daily'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              📅 Daily Tasks ({dailyTasks.length})
            </button>
            <button
              onClick={() => setActiveTab('weekly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'weekly'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🗓️ Weekly Overview
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#173B8F] to-[#2563EB] h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Generation Error State */}
      {generationError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>⚠️</span>
            <span>{generationError}</span>
          </div>
          <button
            onClick={handleGenerateRoadmap}
            className="px-3 py-1 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isGenerating && dailyTasks.length === 0 && (
        <div className="p-12 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-800">Synthesizing Daily Tasks with Gemini AI...</p>
          <p className="text-xs text-slate-500">Aligning daily practice challenges to your critical skill gaps.</p>
        </div>
      )}

      {/* View 1: Daily Tasks (Primary) */}
      {activeTab === 'daily' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>Adaptive Daily Task Sequence</span>
            </h3>
            <span className="text-xs text-slate-500">
              Check off tasks as you finish them to log progress
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {dailyTasks.map(task => (
              <DailyTaskCard
                key={task.id}
                task={task}
                onToggle={handleToggleTask}
              />
            ))}
          </div>
        </div>
      )}

      {/* View 2: Weekly Milestones Overview */}
      {activeTab === 'weekly' && (
        <div className="pt-2 max-w-4xl">
          {displayWeeks.map((weekData, index) => (
            <RoadmapWeek
              key={weekData.week}
              weekData={weekData}
              isLast={index === displayWeeks.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
