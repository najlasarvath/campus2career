import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import collegeService from '../../services/collegeService';

export default function CollegeCertificatesPage() {
  const { role } = useAuth();
  const isStudent = role === 'student';

  const [certificates, setCertificates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCert, setSelectedCert] = useState(null);
  const [filterSkill, setFilterSkill] = useState('ALL');

  useEffect(() => {
    collegeService.getCertificates().then(data => {
      if (Array.isArray(data)) {
        setCertificates(data);
      }
    });
  }, []);

  const filteredCerts = certificates.filter(c => {
    const matchesSearch = c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.skill.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterSkill !== 'ALL' && !c.skill.includes(filterSkill)) return false;
    return true;
  });

  const uniqueSkills = ['ALL', 'Power BI', 'React', 'Docker', 'Data Visualization', 'SQL'];

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1.5 font-medium">
            <Link to="/college/dashboard" className="hover:text-blue-600 transition">College Portal</Link>
            <span>/</span>
            <span className="text-blue-600 font-semibold">Verified Credentials Registry</span>
            {isStudent && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Student Read-Only Ledger
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Institutional Certificates & Verification
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Verifiable employer-aligned credential ledger issued to candidates completing targeted assessment tracks and bootcamp milestones.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/college/dashboard"
            className="px-4 py-2 rounded-lg bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold border border-slate-200 shadow-sm transition"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {uniqueSkills.map(skill => (
            <button
              key={skill}
              onClick={() => setFilterSkill(skill)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                filterSkill === skill
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200/80'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate name, ID, or skill..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Certificates Table */}
      <div className="pro-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Certificate ID</th>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Program & Verified Competency</th>
                <th className="py-3 px-4">Assessment Grade</th>
                <th className="py-3 px-4">Issued Date</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCerts.length > 0 ? (
                filteredCerts.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{c.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{c.studentName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{c.studentId}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{c.program}</div>
                      <div className="text-[11px] text-blue-600 font-medium">{c.skill}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-700 font-mono">
                      {c.score}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{c.issuedDate}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span>✓</span>
                        <span>Verified Ledger</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedCert(c)}
                        className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 transition"
                      >
                        Inspect & Verify
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-slate-400 text-xs">
                    No certificate records matched your search parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Certificate Modal Drawer */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                ✓ Cryptographically Verified Credential
              </span>
              <button
                onClick={() => setSelectedCert(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            {/* Certificate Visual Mock */}
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                Campus2Career Placement Credential
              </span>
              <h3 className="text-xl font-bold text-slate-900">{selectedCert.studentName}</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Has successfully demonstrated benchmark competency in{' '}
                <strong className="text-blue-700 font-semibold">{selectedCert.skill}</strong> under the program{' '}
                <span className="italic">{selectedCert.program}</span>.
              </p>
              <div className="pt-2 flex justify-center items-center space-x-4 text-xs font-mono">
                <span className="text-slate-500">Grade: <strong className="text-emerald-700">{selectedCert.score}</strong></span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">Issued: <strong>{selectedCert.issuedDate}</strong></span>
              </div>
              <div className="pt-2 text-[10px] font-mono text-slate-400 bg-white py-1 px-3 rounded border border-slate-200 inline-block">
                Hash: {selectedCert.hash}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-mono text-slate-400">{selectedCert.id}</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => alert(`Certificate ${selectedCert.id} downloaded as PDF.`)}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition"
                >
                  Download PDF
                </button>
                <button
                  onClick={() => setSelectedCert(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
