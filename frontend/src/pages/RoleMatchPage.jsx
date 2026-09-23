import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStudent } from '../context/StudentContext';
import apiClient from '../services/api';
import ScoreFormulaCard from '../components/rolematch/ScoreFormulaCard';
import RoleDeltaChart from '../components/rolematch/RoleDeltaChart';
import RoleDeltaTable from '../components/rolematch/RoleDeltaTable';
import WhatIfSimulatorCard from '../components/rolematch/WhatIfSimulatorCard';
import SkillEditorModal from '../components/dashboard/SkillEditorModal';

export default function RoleMatchPage() {
  const { target_role, student, updateTargetRole, isDemo } = useStudent();
  const [isSkillEditorOpen, setIsSkillEditorOpen] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [selectedRoleOption, setSelectedRoleOption] = useState(target_role || 'Full Stack Developer');
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  // Fetch available roles and company requirements from backend GET /api/skills/roles
  useEffect(() => {
    let isMounted = true;
    async function loadRoles() {
      try {
        const response = await apiClient.get('/skills/roles');
        if (isMounted && response && Array.isArray(response.roles)) {
          setAvailableRoles(response.roles);
        }
      } catch (err) {
        console.warn('[RoleMatchPage] Failed to fetch roles from backend:', err);
      }
    }
    loadRoles();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync selected option when context target_role loads
  useEffect(() => {
    if (target_role) {
      setSelectedRoleOption(target_role);
      const isKnown = availableRoles.some(r => r.title.toLowerCase() === target_role.toLowerCase());
      if (!isKnown && availableRoles.length > 0) {
        setIsCustomMode(true);
        setCustomRoleInput(target_role);
      }
    }
  }, [target_role, availableRoles]);

  const handleRoleChange = async (e) => {
    const val = e.target.value;
    if (val === '__OTHER__') {
      setIsCustomMode(true);
      setSelectedRoleOption('__OTHER__');
    } else {
      setIsCustomMode(false);
      setSelectedRoleOption(val);
      setIsUpdatingRole(true);
      try {
        if (updateTargetRole) {
          await updateTargetRole(val);
        }
      } finally {
        setIsUpdatingRole(false);
      }
    }
  };

  const handleApplyCustomRole = async (e) => {
    e.preventDefault();
    if (!customRoleInput.trim()) return;

    setIsUpdatingRole(true);
    try {
      if (updateTargetRole) {
        await updateTargetRole(customRoleInput.trim());
      }
    } finally {
      setIsUpdatingRole(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="executive-badge-navy text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {student?.name || 'Candidate'} · {student?.isDemo ? 'Demo Assessment' : 'Verified Profile'}
            </span>
            <span className="text-slate-300">•</span>
            <Link to="/student" className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition">
              Student Dashboard
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Role Alignment & Competency Delta
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            Live benchmark comparison of candidate demonstrated skills against real enterprise requisitions for{' '}
            <strong className="text-slate-900 font-bold">{target_role}</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={() => setIsSkillEditorOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#173B8F] bg-[#F0F4FC] hover:bg-[#E2ECFC] border border-[#D0DCF5] transition shadow-2xs cursor-pointer flex items-center space-x-1.5"
          >
            <span>⚡ Manage Skills</span>
          </button>
          <Link
            to="/roadmap"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#173B8F] to-[#2563EB] hover:from-[#132E70] hover:to-[#1D4ED8] text-white text-xs font-bold shadow-sm transition self-start sm:self-auto flex items-center space-x-1.5"
          >
            <span>View Roadmap</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* Target Role & Company Selector Strip */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Target Requisition & Enterprise Benchmark
            </h3>
            <p className="text-xs text-slate-600">
              Select an enterprise role requirement to evaluate your match score against database rubrics.
            </p>
          </div>
          {isUpdatingRole && (
            <span className="text-xs font-semibold text-blue-600 flex items-center space-x-1.5">
              <span className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Updating alignment...</span>
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="flex-1">
            <select
              value={isCustomMode ? '__OTHER__' : selectedRoleOption}
              onChange={handleRoleChange}
              disabled={isUpdatingRole}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600 cursor-pointer"
            >
              {availableRoles.length > 0 ? (
                availableRoles.map(r => (
                  <option key={r.id || r.role_id} value={r.title}>
                    {r.title} {r.companies?.name ? `(${r.companies.name})` : `(${r.category})`}
                  </option>
                ))
              ) : (
                <>
                  <option value="Full Stack Developer">Full Stack Developer (Google)</option>
                  <option value="Frontend Developer">Frontend Developer (Amazon)</option>
                  <option value="Backend Developer">Backend Developer (Meta)</option>
                </>
              )}
              <option value="__OTHER__">Other (Enter Custom Role)...</option>
            </select>
          </div>

          {isCustomMode && (
            <form onSubmit={handleApplyCustomRole} className="flex-1 flex gap-2">
              <input
                type="text"
                value={customRoleInput}
                onChange={(e) => setCustomRoleInput(e.target.value)}
                placeholder="Enter custom role title..."
                required
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
              <button
                type="submit"
                disabled={isUpdatingRole || !customRoleInput.trim()}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                Apply
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Section 1: Condensed Match Score Formula Callout */}
      <ScoreFormulaCard />

      {/* Section 2: What-If Skill Simulator Card (Phase 8) */}
      <WhatIfSimulatorCard />

      {/* Section 3: Recharts Dual-Bar Comparison */}
      <RoleDeltaChart onOpenSkillEditor={() => setIsSkillEditorOpen(true)} />

      {/* Section 4: Detailed Audit Table */}
      <RoleDeltaTable />

      {/* Reusable Skill Editor Modal */}
      <SkillEditorModal
        isOpen={isSkillEditorOpen}
        onClose={() => setIsSkillEditorOpen(false)}
      />
    </div>
  );
}
