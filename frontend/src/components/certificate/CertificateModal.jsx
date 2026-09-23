import { useState, useEffect } from 'react';
import apiClient, { tokenStorage } from '../../services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function CertificateModal({ certificate: initialCertificate, workshop, isOpen, onClose }) {
  if (!isOpen) return null;

  const [cert, setCert] = useState(initialCertificate || null);
  const [loading, setLoading] = useState(!initialCertificate && Boolean(workshop));
  const [downloading, setDownloading] = useState(false);
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

  const handleDownloadPdf = async () => {
    if (!cert?.id) return;
    setDownloading(true);
    try {
      const token = tokenStorage.get();
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/certificates/${cert.id}/pdf`, {
        headers
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificate-${cert.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Direct PDF download error:', err);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Robust metadata resolution to ensure no field is ever blank
  const collegeName =
    cert?.collegeName ||
    cert?.college_name ||
    cert?.college ||
    cert?.institution ||
    'Apex Institute of Technology';

  const studentName =
    cert?.studentName ||
    cert?.student_name ||
    cert?.name ||
    'Student Candidate';

  const workshopTitle =
    cert?.workshopTitle ||
    cert?.workshop_title ||
    cert?.program ||
    cert?.title ||
    workshop?.title ||
    'Technical Industry Readiness Workshop';

  let scoreDisplay = '85%';
  if (cert?.assessmentScore !== undefined && cert?.assessmentScore !== null) {
    scoreDisplay = `${cert.assessmentScore}%`;
  } else if (cert?.assessment_score !== undefined && cert?.assessment_score !== null) {
    scoreDisplay = `${cert.assessment_score}%`;
  } else if (cert?.score) {
    scoreDisplay = String(cert.score).includes('%') ? cert.score : `${cert.score}%`;
  }

  const certificateId = cert?.id || 'C2C-CERT-OFFICIAL';

  const formattedDate =
    cert?.issuedDate ||
    cert?.issued_date ||
    (cert?.issuedAt || cert?.issued_at
      ? new Date(cert.issuedAt || cert.issued_at).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        })
      : new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/70 rounded-2xl sm:rounded-3xl max-w-4xl lg:max-w-5xl w-full shadow-2xl overflow-hidden my-auto flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-900/90 border-b border-slate-800 text-white">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center space-x-1.5">
              <span>🏛️</span>
              <span>OFFICIALLY ISSUED CERTIFICATE</span>
            </span>
            <span className="text-slate-600 text-xs hidden sm:inline">•</span>
            <span className="text-xs font-mono font-bold text-slate-400 hidden sm:inline">{certificateId}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              title="Close Modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-3 sm:p-6 lg:p-8 bg-slate-950/50 space-y-4">
          {loading && (
            <div className="py-20 text-center space-y-3 bg-white rounded-2xl p-8">
              <div className="w-10 h-10 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-600 font-semibold tracking-wide">
                Retrieving official college-issued completion certificate...
              </p>
            </div>
          )}

          {error && (
            <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-center space-y-2">
              <p className="font-bold text-sm">Certificate Issuance Notice</p>
              <p className="text-xs">{error}</p>
            </div>
          )}

          {cert && (
            <div
              id="printable-certificate"
              className="relative bg-[#FFFDF8] text-slate-900 rounded-xl sm:rounded-2xl p-2 sm:p-3.5 shadow-2xl border-4 border-[#0F1E36] print:border-none print:shadow-none"
            >
              {/* Inner Double Border with Metallic Gold Accent */}
              <div className="relative border-2 border-[#D4AF37] rounded-lg p-1.5 sm:p-2 bg-gradient-to-b from-[#FFFDF8] via-[#FAF6EC] to-[#FFFDF8]">
                <div className="relative border border-[#0F1E36]/20 rounded-md p-6 sm:p-10 lg:p-12 text-center space-y-4 sm:space-y-6 overflow-hidden">
                  
                  {/* Four Corner Ornamental Brackets */}
                  <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#D4AF37]" />
                  <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#D4AF37]" />
                  <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[#D4AF37]" />
                  <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#D4AF37]" />

                  {/* Subtle Background Watermark Seal */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035]">
                    <div className="w-72 h-72 sm:w-96 sm:h-96 rounded-full border-12 border-[#0F1E36] flex items-center justify-center font-serif text-6xl font-black">
                      C2C
                    </div>
                  </div>

                  {/* 1. Header: College Name & Institutional Authority */}
                  <div className="space-y-1.5 pt-1 sm:pt-2">
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#8C6D23] block font-sans">
                      INSTITUTIONAL PLACEMENT & SKILLING AUTHORITY
                    </span>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-[#0F1E36] tracking-wide uppercase px-2">
                      {collegeName}
                    </h1>
                    <div className="w-36 sm:w-56 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-2" />
                  </div>

                  {/* 2. Certificate Formal Title */}
                  <div className="space-y-1 pt-1 sm:pt-2">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-black tracking-[0.22em] text-[#0F1E36] uppercase">
                      CERTIFICATE OF COMPLETION
                    </h2>
                    <p className="text-xs sm:text-sm font-serif italic text-slate-500 pt-1">
                      This certificate is proudly presented to
                    </p>
                  </div>

                  {/* 3. Recipient Full Name (Visual Focal Point) */}
                  <div className="py-1 sm:py-2">
                    <div className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-[#0F1E36] tracking-normal inline-block pb-1.5 border-b-2 border-[#D4AF37] min-w-[260px] sm:min-w-[420px] px-4">
                      {studentName}
                    </div>
                  </div>

                  {/* 4. Completion Statement & Workshop Title */}
                  <div className="max-w-2xl mx-auto space-y-1 sm:space-y-1.5 px-2">
                    <p className="text-xs sm:text-sm text-slate-600 font-sans">
                      for successfully completing the
                    </p>
                    <h3 className="text-base sm:text-xl lg:text-2xl font-bold text-[#0F1E36] font-serif tracking-tight px-3 py-0.5">
                      {workshopTitle}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 font-sans">
                      and achieving the required assessment standard.
                    </p>
                  </div>

                  {/* 5. Metrics & Assessment Performance Row */}
                  <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-3 sm:pt-4 border-t border-slate-200/90 text-xs sm:text-sm font-sans text-slate-700">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-slate-500">Assessment Score:</span>
                      <strong className="text-emerald-700 font-black text-sm sm:text-base">{scoreDisplay}</strong>
                    </div>
                    <span className="text-slate-300 hidden sm:inline">•</span>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-slate-500">Completed on:</span>
                      <strong className="text-slate-900 font-semibold">{formattedDate}</strong>
                    </div>
                    <span className="text-slate-300 hidden sm:inline">•</span>
                    <div className="flex items-center space-x-1.5 font-mono">
                      <span className="text-slate-500">Certificate ID:</span>
                      <span className="font-bold text-[#0F1E36]">{certificateId}</span>
                    </div>
                  </div>

                  {/* 6. Signatures and Official College Seal Area */}
                  <div className="pt-6 sm:pt-8 grid grid-cols-3 items-end gap-2 sm:gap-6 text-center">
                    
                    {/* Left: Authorized Signatory */}
                    <div className="space-y-1">
                      <div className="font-serif italic font-bold text-sm sm:text-base text-slate-800">
                        Dr. K. R. Sharma
                      </div>
                      <div className="w-32 sm:w-44 border-b border-slate-400 mx-auto" />
                      <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-700">
                        Authorized Signatory
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-slate-500 font-sans">
                        Dean of Academic & Placement Affairs
                      </div>
                    </div>

                    {/* Center: Official Seal Medallion */}
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-[#D4AF37] bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 shadow-md flex flex-col items-center justify-center text-center p-1">
                        <span className="text-[8px] sm:text-[9px] font-black tracking-widest text-[#8C6D23] uppercase">
                          OFFICIAL
                        </span>
                        <span className="text-[10px] sm:text-xs text-amber-600 font-bold leading-tight">
                          ★ ★ ★
                        </span>
                        <span className="text-[8px] sm:text-[9px] font-black tracking-widest text-[#0F1E36] uppercase">
                          SEAL
                        </span>
                      </div>
                      <span className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-400 mt-1 tracking-wider">
                        Verified Credential
                      </span>
                    </div>

                    {/* Right: College / Program Authority */}
                    <div className="space-y-1">
                      <div className="font-serif italic font-bold text-sm sm:text-base text-slate-800">
                        Prof. M. K. Deshmukh
                      </div>
                      <div className="w-32 sm:w-44 border-b border-slate-400 mx-auto" />
                      <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-700">
                        College / Program Authority
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-slate-500 font-sans truncate max-w-[180px] sm:max-w-[220px] mx-auto">
                        {collegeName}
                      </div>
                    </div>

                  </div>

                  {/* 7. Institutional Footer */}
                  <div className="pt-3 border-t border-slate-200/80 text-[10px] font-mono text-slate-400 text-center">
                    Officially issued by {collegeName} in partnership with Campus2Career Placement & Skilling Authority
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* Action Buttons Bar */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer border border-slate-700"
            >
              Close
            </button>

            {cert && (
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-xs shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>🖨️ Print</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={downloading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-slate-950 font-black text-xs shadow-md transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{downloading ? 'Compiling PDF...' : '📥 Download Official PDF'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
