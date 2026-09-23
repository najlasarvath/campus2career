import { useState, useEffect } from 'react';
import apiClient from '../../services/api';

export default function CertificateModal({ certificate: initialCertificate, workshop, isOpen, onClose }) {
  if (!isOpen) return null;

  const [cert, setCert] = useState(initialCertificate || null);
  const [loading, setLoading] = useState(!initialCertificate && Boolean(workshop));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialCertificate) {
      setCert(initialCertificate);
      setLoading(false);
      return;
    }

    if (workshop) {
      setLoading(true);
      setError(null);
      // Call backend certificate generation
      apiClient.post('/certificates/generate', { workshopId: workshop.id })
        .then(res => {
          if (res && res.success && res.certificate) {
            setCert(res.certificate);
          } else {
            setError(res?.message || 'Could not generate certificate.');
          }
        })
        .catch(err => {
          setError(err.message || 'Error generating certificate');
        })
        .finally(() => setLoading(false));
    }
  }, [initialCertificate, workshop]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-6 animate-in zoom-in-95 duration-200 flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full">
              ✓ Verified Credential
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-mono font-bold text-slate-600">{cert?.id || 'Credential'}</span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition"
          >
            ✕
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 sm:p-8 space-y-6">
          {loading && (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-semibold">Generating college-branded certificate ledger...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 text-center space-y-2">
              <p className="font-bold">Verification Requirement Not Met</p>
              <p>{error}</p>
            </div>
          )}

          {cert && (
            <div className="relative border-8 border-double border-slate-200 p-8 sm:p-10 rounded-2xl bg-gradient-to-b from-white via-[#FAF9F5] to-white shadow-inner text-center space-y-5 print:border-none print:shadow-none">
              {/* Corner Watermarks */}
              <div className="flex justify-between items-start">
                <div className="text-left">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 block">
                    Institutional Placement Authority
                  </span>
                  <span className="text-sm font-black text-[#0F1E36] tracking-tight block mt-0.5">
                    {cert.collegeName || 'Apex Institute of Technology'}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-amber-400/80 bg-amber-50 flex items-center justify-center text-amber-700 font-black text-xs shadow-xs">
                  ★ C2C
                </div>
              </div>

              {/* Certificate Main Title */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-blue-700 block">
                  Certificate of Competency & Placement Readiness
                </span>
                <p className="text-xs text-slate-500">This officially certifies that</p>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif">
                  {cert.studentName}
                </h2>
              </div>

              {/* Certificate Citation */}
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                has successfully passed the benchmark skill verification assessment for{' '}
                <strong className="text-slate-950 font-bold">{cert.skill}</strong> under the curriculum program{' '}
                <span className="italic font-semibold text-slate-800">{cert.workshopTitle}</span> with a demonstrated score of{' '}
                <strong className="text-emerald-700 font-extrabold">{cert.assessmentScore}%</strong> (Passing Benchmark: {cert.passingScore}%).
              </p>

              {/* Metadata Badges */}
              <div className="pt-4 grid grid-cols-3 gap-3 border-t border-slate-200 text-xs">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Issued By</span>
                  <span className="font-bold text-slate-800 block text-[11px] mt-0.5">{cert.collegeName || 'University'}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Date of Verification</span>
                  <span className="font-bold text-slate-800 block text-[11px] mt-0.5">
                    {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString() : 'Active'}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Certificate ID</span>
                  <span className="font-mono font-bold text-blue-700 block text-[10px] mt-0.5">{cert.id}</span>
                </div>
              </div>

              {/* Cryptographic Ledger Footer */}
              <div className="pt-3 text-[10px] font-mono text-slate-400 flex items-center justify-between border-t border-slate-100">
                <span>Ledger Status: VERIFIED & SEALED</span>
                <span>Verification Hash: {cert.verificationHash || 'sha256-verified'}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
            >
              Close
            </button>

            {cert && (
              <button
                type="button"
                onClick={handlePrint}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center space-x-1.5"
              >
                <span>🖨️ Print / Save as PDF</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
