import { useState } from 'react';
import apiClient from '../../services/api';

export default function WorkshopModal({ workshop, isOpen, onClose, onSkillVerified, onOpenCertificate }) {
  if (!isOpen || !workshop) return null;

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'videos' | 'assessment' | 'result'
  const [video1Watched, setVideo1Watched] = useState(false);
  const [video2Watched, setVideo2Watched] = useState(false);
  const [isTrackingVideo, setIsTrackingVideo] = useState(false);

  // Assessment state
  const [answers, setAnswers] = useState({});
  const [isSubmittingAssessment, setIsSubmittingAssessment] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [assessmentError, setAssessmentError] = useState(null);

  const videos = workshop.videos || [
    {
      id: 'v1',
      title: `Video 1: ${workshop.skill} Core Concepts & Implementation Foundations`,
      duration: '45 mins',
      url: 'https://www.youtube.com/watch?v=HXV3zeRR3h4'
    },
    {
      id: 'v2',
      title: `Video 2: ${workshop.skill} Real-World Industry Case Study & Best Practices`,
      duration: '50 mins',
      url: 'https://www.youtube.com/watch?v=7S_tz1z_5bA'
    }
  ];

  const assessmentQuestions = workshop.assessment || [
    {
      id: 'q1',
      question: `In production environments, how do you handle performance bottlenecks, query optimization, and transaction isolation in ${workshop.skill}?`
    }
  ];

  const handleTrackVideo = async (videoId) => {
    setIsTrackingVideo(true);
    try {
      await apiClient.post(`/workshops/${workshop.id}/videos`, { videoId, watched: true });
      if (videoId === 'v1' || videoId === 1) setVideo1Watched(true);
      if (videoId === 'v2' || videoId === 2) setVideo2Watched(true);
    } catch {
      // Fallback local tracking
      if (videoId === 'v1' || videoId === 1) setVideo1Watched(true);
      if (videoId === 'v2' || videoId === 2) setVideo2Watched(true);
    } finally {
      setIsTrackingVideo(false);
    }
  };

  const handleSubmitAssessment = async (e) => {
    e.preventDefault();
    setIsSubmittingAssessment(true);
    setAssessmentError(null);

    const answerPayload = Object.entries(answers).map(([qId, ans]) => ({
      questionId: qId,
      answer: ans
    }));

    try {
      const response = await apiClient.post(`/workshops/${workshop.id}/assess`, {
        answers: answerPayload
      });

      if (response && response.success) {
        setAssessmentResult(response);
        setActiveTab('result');
        if (response.skillVerified && onSkillVerified) {
          onSkillVerified(workshop.skill, response.postScore);
        }
      } else {
        throw new Error(response?.message || 'Failed to evaluate assessment');
      }
    } catch (err) {
      setAssessmentError(err.message || 'Error submitting assessment. Please check inputs.');
    } finally {
      setIsSubmittingAssessment(false);
    }
  };

  const embedUrl = (() => {
    if (workshop?.embedUrl) return workshop.embedUrl;
    const rawUrl = workshop?.videoUrl || workshop?.videos?.[0]?.url;
    if (!rawUrl) return 'https://www.youtube.com/embed/HXV3zeRR3h4';
    if (rawUrl.includes('youtube.com/embed/')) return rawUrl;
    const match = rawUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    return rawUrl;
  })();

  const conductedDate = workshop.conductedDate || (workshop.conductedAt
    ? new Date(workshop.conductedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'September 18, 2026');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-[#0F1E36] text-white p-6 relative">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-600/40 text-blue-200 border border-blue-400/40 px-2.5 py-0.5 rounded-full">
                  {workshop.status === 'conducted' ? 'Conducted Workshop' : 'Industry Readiness Workshop'}
                </span>
                <span className="text-slate-400 text-xs">•</span>
                <span className="text-xs text-slate-300 font-semibold">{workshop.skill}</span>
              </div>
              <h2 className="text-xl font-extrabold tracking-tight">{workshop.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition text-lg leading-none"
            >
              ✕
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-2 mt-5 border-b border-white/10 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-2.5 px-3 border-b-2 transition flex items-center space-x-1.5 ${
                activeTab === 'overview'
                  ? 'border-blue-400 text-blue-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>▶ Watch & Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`pb-2.5 px-3 border-b-2 transition flex items-center space-x-1.5 ${
                activeTab === 'videos'
                  ? 'border-blue-400 text-blue-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Curriculum Modules ({videos.length})</span>
              {(video1Watched && video2Watched) && <span className="text-emerald-400 text-[10px]">✓</span>}
            </button>
            <button
              onClick={() => setActiveTab('assessment')}
              className={`pb-2.5 px-3 border-b-2 transition flex items-center space-x-1.5 ${
                activeTab === 'assessment'
                  ? 'border-blue-400 text-blue-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Skill Assessment</span>
              {assessmentResult?.skillVerified && <span className="text-emerald-400 text-[10px]">★</span>}
            </button>
            {assessmentResult && (
              <button
                onClick={() => setActiveTab('result')}
                className={`pb-2.5 px-3 border-b-2 transition ${
                  activeTab === 'result'
                    ? 'border-blue-400 text-blue-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Verification Result
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* TAB 1: OVERVIEW & EMBEDDED VIDEO */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Metadata Badges & Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Conducted</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{conductedDate}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Duration</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{workshop.duration || '1h 12m'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Instructor</span>
                  <span className="font-bold text-slate-900 mt-0.5 block truncate" title={workshop.instructor || 'Senior Technical Architect'}>
                    {workshop.instructor || 'Senior Technical Architect'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
                  <span className="font-bold text-emerald-700 mt-0.5 block capitalize">
                    ● {workshop.status || 'Conducted'}
                  </span>
                </div>
              </div>

              {/* Responsive Embedded Video Player (autoplay=0) */}
              <div className="space-y-2">
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-md">
                  <iframe
                    src={`${embedUrl}?autoplay=0&rel=0`}
                    title={workshop.title}
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0 absolute inset-0"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 px-0.5">
                  <span className="font-medium">Official Recorded Masterclass (No Autoplay)</span>
                  <a
                    href={workshop.videoUrl || `https://www.youtube.com/watch?v=HXV3zeRR3h4`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center space-x-1"
                  >
                    <span>Open in YouTube ↗</span>
                  </a>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5 pt-1">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Workshop Overview</h4>
                <p className="text-slate-600 leading-relaxed text-xs">
                  {workshop.description || `Targeted curriculum to eliminate candidate deficit in ${workshop.skill}.`}
                </p>
              </div>

              {workshop.learningObjectives && (
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Key Learning Objectives</h4>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-600">
                    {workshop.learningObjectives.map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab('videos')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-xs flex items-center space-x-1.5"
                >
                  <span>Curriculum Breakdown & Resources</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: VIDEOS */}
          {activeTab === 'videos' && (
            <div className="space-y-4">
              {/* Important Policy Alert */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 flex items-start space-x-2.5">
                <span className="text-base shrink-0 mt-0.5">⚠️</span>
                <div className="text-[11px] leading-relaxed">
                  <strong>Verification Policy:</strong> Watching video lectures prepares you for the post-workshop assessment, but does <strong>NOT</strong> automatically verify skill competency. Certification and skill acquisition are determined strictly through the evaluation assessment.
                </div>
              </div>

              <div className="space-y-3">
                {videos.map((vid, idx) => {
                  const isWatched = idx === 0 ? video1Watched : video2Watched;
                  return (
                    <div
                      key={vid.id || idx}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition shadow-2xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {vid.duration || '45 mins'}
                          </span>
                          <h4 className="font-bold text-slate-900 text-xs mt-1">{vid.title}</h4>
                        </div>
                        {isWatched ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                            ✓ Watched
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 shrink-0">
                            Pending
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <a
                          href={vid.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center space-x-1"
                        >
                          <span>▶ Launch Video Resource</span>
                          <span>↗</span>
                        </a>

                        <button
                          type="button"
                          disabled={isTrackingVideo}
                          onClick={() => handleTrackVideo(vid.id || (idx === 0 ? 'v1' : 'v2'))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            isWatched
                              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                          }`}
                        >
                          {isWatched ? 'Mark Again' : 'Mark as Watched'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-[11px] text-slate-500">
                  {video1Watched && video2Watched
                    ? 'Both modules completed! Ready for post-workshop assessment.'
                    : 'Watch both videos to prepare for the assessment.'}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('assessment')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-xs flex items-center space-x-1.5"
                >
                  <span>Take Assessment</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: ASSESSMENT */}
          {activeTab === 'assessment' && (
            <form onSubmit={handleSubmitAssessment} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-blue-950 text-xs">
                <strong className="block mb-0.5">Post-Workshop Technical Skill Verification</strong>
                Provide substantive answers demonstrating conceptual depth, edge-case awareness, and practical industry application for {workshop.skill}.
              </div>

              {assessmentError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {assessmentError}
                </div>
              )}

              <div className="space-y-4">
                {assessmentQuestions.map((q, idx) => (
                  <div key={q.id || idx} className="space-y-2">
                    <label className="font-bold text-slate-800 text-xs block leading-relaxed">
                      Question {idx + 1}: {q.question}
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={answers[q.id || `q${idx + 1}`] || ''}
                      onChange={(e) => setAnswers(prev => ({
                        ...prev,
                        [q.id || `q${idx + 1}`]: e.target.value
                      }))}
                      placeholder={`Explain your solution, technical reasoning, and real-world considerations for ${workshop.skill}...`}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingAssessment}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-xs flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <span>{isSubmittingAssessment ? 'Evaluating Answers...' : 'Submit Assessment for Verification'}</span>
                  <span>✓</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: RESULT */}
          {activeTab === 'result' && assessmentResult && (
            <div className="space-y-5">
              <div className={`p-5 rounded-2xl border text-center space-y-3 ${
                assessmentResult.skillVerified
                  ? 'bg-emerald-50/60 border-emerald-200'
                  : 'bg-rose-50/60 border-rose-200'
              }`}>
                <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border inline-block ${
                  assessmentResult.skillVerified
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border-rose-300'
                }`}>
                  {assessmentResult.skillVerified ? '✓ Benchmark Met — Skill Verified!' : '⚠️ Skill Gap Remains'}
                </span>

                <div className="flex items-center justify-center space-x-6 text-xs pt-1">
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Pre-Workshop Score</span>
                    <span className="text-2xl font-black text-slate-700">{assessmentResult.preScore}%</span>
                  </div>
                  <span className="text-lg font-bold text-slate-300">→</span>
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Post-Workshop Score</span>
                    <span className={`text-3xl font-black ${assessmentResult.skillVerified ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {assessmentResult.postScore}%
                    </span>
                  </div>
                  <span className="text-lg font-bold text-slate-300">•</span>
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Passing Benchmark</span>
                    <span className="text-2xl font-black text-slate-800">{assessmentResult.passingScore}%</span>
                  </div>
                </div>

                <p className="text-xs font-medium text-slate-700 max-w-md mx-auto leading-relaxed">
                  {assessmentResult.outcomeMessage}
                </p>
              </div>

              {/* If Remediation Needed */}
              {!assessmentResult.skillVerified && assessmentResult.recommendedDailyTasks && (
                <div className="space-y-2 p-4 rounded-xl bg-amber-50/70 border border-amber-200/80">
                  <h4 className="font-bold text-amber-900 text-xs">Recommended Adaptive Practice Tasks:</h4>
                  <ul className="space-y-1 text-slate-700 text-xs list-disc list-inside">
                    {assessmentResult.recommendedDailyTasks.map((task, i) => (
                      <li key={i}>{task}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
                >
                  Close
                </button>

                {assessmentResult.skillVerified && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenCertificate) onOpenCertificate(workshop);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold transition shadow-xs flex items-center space-x-1.5"
                  >
                    <span>🎓 View College-Branded Certificate</span>
                    <span>→</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
