import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { availableSkills, companyRoles, initialRequirements } from '../../data/companyData';

export default function CompanyRequirementsPage() {
  const [selectedRole, setSelectedRole] = useState('Backend Developer');
  const [requirements, setRequirements] = useState(initialRequirements);
  const [newSkill, setNewSkill] = useState('');

  const currentSkills = requirements[selectedRole] || [];

  const handleAddSkill = () => {
    const skill = newSkill.trim();
    if (!skill) return;
    if (currentSkills.includes(skill)) {
      setNewSkill('');
      return;
    }

    setRequirements((current) => ({
      ...current,
      [selectedRole]: [...current[selectedRole], skill],
    }));
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setRequirements((current) => ({
      ...current,
      [selectedRole]: current[selectedRole].filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleSaveRequirement = () => {
    alert(`Saved requirements for ${selectedRole}.`);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-blue-600">Requirements</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Job Role Requirements</h1>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <label htmlFor="job-role" className="mb-2 block text-sm font-medium text-slate-700">Job Role</label>
            <select
              id="job-role"
              value={selectedRole}
              onChange={(event) => setSelectedRole(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {companyRoles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="new-skill" className="mb-2 block text-sm font-medium text-slate-700">Add required skill</label>
            <div className="flex gap-2">
              <select
                id="new-skill"
                value={newSkill}
                onChange={(event) => setNewSkill(event.target.value)}
                className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select skill</option>
                {availableSkills.map((skill) => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddSkill}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700"
              >
                <Plus size={16} />
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Required Skills</p>
          <div className="flex flex-wrap gap-2">
            {currentSkills.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                {skill}
                <Minus size={14} />
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSaveRequirement}
          className="mt-6 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Save Requirement
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Saved Roles</p>
        <div className="space-y-3">
          {Object.entries(requirements).map(([role, skills]) => (
            <div key={role} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 text-lg font-bold text-slate-900">{role}</div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span key={`${role}-${skill}`} className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
