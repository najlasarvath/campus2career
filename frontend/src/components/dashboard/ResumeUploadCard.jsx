import { useState, useRef } from 'react';
import apiClient from '../../services/api';
import { useStudent } from '../../context/StudentContext';

export default function ResumeUploadCard() {
  const { refreshStudentData } = useStudent();
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
        setUploadError('Only PDF files are supported.');
        setFile(null);
        return;
      }
      setFile(selected);
      setUploadError(null);
      setUploadSuccess(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      if (dropped.type !== 'application/pdf' && !dropped.name.toLowerCase().endsWith('.pdf')) {
        setUploadError('Only PDF files are supported.');
        setFile(null);
        return;
      }
      setFile(dropped);
      setUploadError(null);
      setUploadSuccess(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setUploadError('Please select a PDF resume file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // POST /api/resumes/upload
      const result = await apiClient.post('/resumes/upload', formData, true);

      if (result && result.success) {
        const skills = Array.isArray(result.extractedSkills)
          ? result.extractedSkills
          : (Array.isArray(result.skills) ? result.skills : []);

        if (skills.length > 0) {
          setUploadSuccess({
            status: 'success',
            message: 'Resume parsed and skills extracted successfully!',
            extractedSkills: skills,
            textLength: result.textLength || 0
          });
        } else {
          setUploadSuccess({
            status: 'no_skills',
            message: 'No technical skills were detected in this resume.',
            extractedSkills: [],
            textLength: result.textLength || 0
          });
        }
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';

        // Refresh student dashboard with updated skills and recalculated match score
        if (refreshStudentData) {
          await refreshStudentData();
        }
      } else {
        throw new Error(result?.message || 'Failed to parse resume');
      }
    } catch (err) {
      console.error('[ResumeUploadCard] Upload error:', err);
      setUploadError(err.message || 'Error uploading resume to server. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            AI Resume Parser & Skill Extractor
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          PDF Format Only
        </span>
      </div>

      <p className="text-xs text-slate-600">
        Upload your resume to automatically parse your technical competencies with the backend parser and compute your role readiness score.
      </p>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50/50'
            : file
            ? 'border-emerald-400 bg-emerald-50/30'
            : 'border-slate-200 hover:border-blue-400 bg-slate-50/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-lg shadow-2xs">
            📄
          </div>
          {file ? (
            <div>
              <p className="text-xs font-bold text-slate-800">{file.name}</p>
              <p className="text-[11px] text-slate-500">{(file.size / 1024).toFixed(1)} KB — Ready to upload</p>
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold text-slate-700">
                Click to browse or drop your resume PDF here
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Maximum file size: 5MB</p>
            </div>
          )}
        </div>
      </div>

      {uploadError && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center space-x-2">
          <span>⚠️</span>
          <span>{uploadError}</span>
        </div>
      )}

      {uploadSuccess && uploadSuccess.status === 'success' && uploadSuccess.extractedSkills.length > 0 && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
          <div className="flex items-center space-x-2 text-emerald-900 font-bold">
            <span>✅</span>
            <span>{uploadSuccess.message}</span>
          </div>
          <div>
            <p className="text-[11px] text-emerald-800 font-semibold mb-1.5">
              Extracted Skills ({uploadSuccess.extractedSkills.length}):
            </p>
            <div className="flex flex-wrap gap-1.5">
              {uploadSuccess.extractedSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-[11px] font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {uploadSuccess && (uploadSuccess.status === 'no_skills' || uploadSuccess.extractedSkills.length === 0) && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-2">
          <div className="flex items-center space-x-2 text-amber-900 font-bold">
            <span>ℹ️</span>
            <span>{uploadSuccess.message || 'No technical skills were detected in this resume.'}</span>
          </div>
          <p className="text-[11px] text-amber-800">
            No industry-standard technical competencies were identified. Update your resume with your technical toolkit, programming languages, or engineering frameworks to compute your placement readiness score.
          </p>
        </div>
      )}

      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition flex items-center space-x-2 cursor-pointer"
        >
          {isUploading && (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          <span>{isUploading ? 'Parsing Resume...' : 'Upload & Analyze Resume'}</span>
        </button>
      </div>
    </div>
  );
}
