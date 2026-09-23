import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStudent } from '../context/StudentContext';
import ResourceCard from '../components/resources/ResourceCard';

export default function ResourcesPage() {
  const { resources, critical_gaps, target_role } = useStudent();

  // Default to first critical gap: Power BI
  const [selectedSkill, setSelectedSkill] = useState('Power BI');

  // Tier sorting order: FREE -> LOW COST -> MEDIUM -> PREMIUM
  const tierOrder = {
    'FREE': 1,
    'LOW COST': 2,
    'MEDIUM': 3,
    'PREMIUM': 4
  };

  const skillResources = (resources[selectedSkill] || []).slice().sort((a, b) => {
    return (tierOrder[a.tier] || 99) - (tierOrder[b.tier] || 99);
  });

  const availableSkills = Object.keys(resources);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="executive-badge-navy text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Remediation Library
            </span>
            <span className="text-slate-300">•</span>
            <Link to="/student" className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition">
              Student Dashboard
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Curated Remediation Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            Vetted learning paths targeting core gaps: paired with foundational free modules and deep dive mastery options for{' '}
            <strong className="text-slate-900 font-bold">{target_role}</strong>.
          </p>
        </div>

        <Link
          to="/roadmap"
          className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs transition text-center shrink-0"
        >
          ← Back to Roadmap
        </Link>
      </div>

      {/* Skill Tabs Selector */}
      <div className="flex flex-wrap items-center gap-2 p-2 bg-white border border-slate-200/90 rounded-xl shadow-sm">
        {availableSkills.map((skillName) => {
          const isCritical = critical_gaps.some(g => g.name === skillName);
          const isSelected = selectedSkill === skillName;

          return (
            <button
              key={skillName}
              onClick={() => setSelectedSkill(skillName)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150 border ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'text-slate-600 bg-slate-50 hover:bg-slate-100 border-slate-200/80'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isCritical ? 'bg-rose-500' : 'bg-amber-500'}`} />
              <span>{skillName}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                isSelected 
                  ? 'bg-white/20 text-white' 
                  : isCritical 
                  ? 'bg-rose-100 text-rose-700' 
                  : 'bg-slate-200 text-slate-700'
              }`}>
                {isCritical ? 'Critical' : 'Secondary'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Skill Context Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Active Focus: {selectedSkill} Remediation
            </h3>
          </div>
          <p className="text-slate-600 text-xs pl-4">
            {selectedSkill === 'Power BI'
              ? 'Targeting 88% market demand and 42 role requisitions in entry-level analytics.'
              : selectedSkill === 'Data Visualization'
              ? 'Targeting cognitive chart design, visual hierarchy, and executive communication.'
              : `Curated learning paths to close ${selectedSkill} competency gap.`}
          </p>
        </div>
        <div className="text-xs text-slate-600 shrink-0 bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200">
          Curated Options: <strong className="text-emerald-700 font-semibold">1 Free Foundation</strong> + <strong className="text-blue-700 font-semibold">1 Deep Dive</strong>
        </div>
      </div>

      {/* Grid of Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch max-w-5xl">
        {skillResources.map((res) => (
          <ResourceCard key={res.id} resource={res} />
        ))}
      </div>
    </div>
  );
}

