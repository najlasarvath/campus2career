import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import companyService from '../../services/companyService';

export default function CompanyNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'UNREAD' | 'skill_verified' | 'threshold_reached'
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    companyService.getNotifications().then(res => setNotifications(res));
  }, []);

  const handleMarkAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const filteredNotifs = notifications.filter(n => {
    if (filterType === 'UNREAD') return !n.isRead;
    if (filterType === 'skill_verified') return n.type === 'skill_verified';
    if (filterType === 'threshold_reached') return n.type === 'threshold_reached';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="executive-badge-navy text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Recruitment Telemetry
            </span>
            <span className="text-slate-300">•</span>
            <Link to="/company/requirements" className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition">
              Requisition Publisher
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Verified Candidate Match Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            Real-time talent alerts triggering as campus candidates achieve verified benchmark qualification thresholds.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <Link
            to="/company/requirements"
            className="px-4 py-2.5 rounded-xl bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold border border-slate-200 shadow-2xs transition"
          >
            Manage Criteria →
          </Link>
        </div>
      </div>

      {/* Prototype Preview Notice */}
      <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs flex items-center justify-between shadow-2xs">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-200/80 text-amber-900">
            Demo Prototype Preview
          </span>
          <span className="text-amber-800">
            Company notifications portal is out of MVP scope per project rules. Telemetry alerts use local simulated state.
          </span>
        </div>
      </div>

      {/* Filter Tabs and Quick Unread Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: 'ALL', label: `All Alerts (${notifications.length})` },
            { key: 'UNREAD', label: `Unread (${unreadCount})` },
            { key: 'skill_verified', label: 'Skill Verified' },
            { key: 'threshold_reached', label: 'Threshold Reached' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilterType(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                filterType === tab.key
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          Mark all as read
        </button>
      </div>

      {/* Notification Stream Cards */}
      <div className="space-y-4 max-w-4xl">
        {filteredNotifs.length > 0 ? (
          filteredNotifs.map(notif => {
            const isSkillVerified = notif.type === 'skill_verified';

            return (
              <div
                key={notif.id}
                onClick={() => { handleMarkAsRead(notif.id); setSelectedCandidate(notif); }}
                className={`pro-card p-5 sm:p-6 transition-all duration-150 cursor-pointer hover:border-slate-300 hover:shadow-md ${
                  !notif.isRead ? 'bg-blue-50/20 border-blue-200/80' : 'bg-white'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${!notif.isRead ? 'bg-blue-600' : 'bg-slate-300'}`} />
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      isSkillVerified 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {isSkillVerified ? '★ Skill Verified' : '⚡ Threshold Met'}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{notif.role}</span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs">
                    <span className="text-slate-400">{notif.timestamp}</span>
                    <span className="font-mono font-extrabold text-sm text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {notif.matchScore}% Match
                    </span>
                  </div>
                </div>

                {/* Candidate Content Body */}
                <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <h4 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                      <span>{notif.candidateName}</span>
                      <span className="text-xs text-slate-400 font-normal font-mono">({notif.candidateId})</span>
                    </h4>
                    <p className="text-xs text-slate-600">
                      {notif.recentMilestone}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Verified:</span>
                      {notif.verifiedSkills.map((sk, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-medium">
                          ✓ {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="shrink-0">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold shadow-sm transition"
                    >
                      Review Profile →
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="pro-card p-12 text-center text-slate-500 text-xs space-y-2">
            <span className="text-2xl block">📭</span>
            <span className="font-bold text-slate-700 block">No notifications found</span>
            <p className="text-slate-400 max-w-sm mx-auto">
              Verified candidate notifications will appear here when students meet your published requirements.
            </p>
          </div>
        )}
      </div>

      {/* Candidate Review Drawer Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Verified Candidate Profile
              </span>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedCandidate.candidateName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedCandidate.institution} • GPA: {selectedCandidate.gpa}</p>
                  <p className="text-xs text-blue-700 font-semibold">{selectedCandidate.email}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Match Score</span>
                  <span className="text-2xl font-black text-emerald-600 font-mono">{selectedCandidate.matchScore}%</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2 text-xs">
                <span className="font-bold text-slate-700 block">Target Role Alignment:</span>
                <p className="text-slate-600">{selectedCandidate.role}</p>
                <div className="pt-1.5 border-t border-slate-200/60 flex flex-wrap gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Skills:</span>
                  {selectedCandidate.verifiedSkills.map((sk, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-white text-slate-800 border border-slate-200 font-medium">
                      ✓ {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-lg text-xs text-emerald-900">
                <span className="font-bold block mb-0.5">Verification Rubric Result:</span>
                {selectedCandidate.recentMilestone}
              </div>

              {actionSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold text-center animate-in fade-in">
                  ✓ {actionSuccess}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
              >
                Close
              </button>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setActionSuccess('Candidate added to recruiter shortlist pipeline.');
                    setTimeout(() => setActionSuccess(''), 3000);
                  }}
                  className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-800 font-semibold border border-slate-200 shadow-sm transition"
                >
                  Shortlist
                </button>
                <button
                  onClick={() => {
                    setActionSuccess(`Interview invite sent to ${selectedCandidate.email}.`);
                    setTimeout(() => setActionSuccess(''), 3000);
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition"
                >
                  Invite to Interview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
