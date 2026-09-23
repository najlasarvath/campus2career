import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStudent } from '../context/StudentContext';
import apiClient from '../services/api';
import InterviewQuestion from '../components/interview/InterviewQuestion';
import ScoreBar from '../components/interview/ScoreBar';

export default function InterviewPage() {
  const {
    interview_flow,
    target_role,
    completeMockInterview,
    match_score,
    critical_gaps,
    highest_impact_skill,
    addOrUpdateSkill,
    isDemo
  } = useStudent();

  const [interviewState, setInterviewState] = useState('intro'); // 'intro' | 'active' | 'results'
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [candidateAnswers, setCandidateAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [evaluatedResults, setEvaluatedResults] = useState(null);

  const evaluatedGapSkill = (critical_gaps && critical_gaps.length > 0
    ? (critical_gaps[0].name || critical_gaps[0].skill || critical_gaps[0])
    : null) || highest_impact_skill?.skill || 'Core Technical Concepts';

  // 2-minute countdown timer
  useEffect(() => {
    let timer = null;
    if (interviewState === 'active' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleFinishInterview();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [interviewState, timeLeft]);

  const handleStartDrill = async () => {
    setApiError(null);
    setIsLoadingQuestions(true);

    try {
      // Call backend to generate questions via Gemini AI
      const response = await apiClient.post('/interview/questions', {
        targetRole: target_role,
        gapSkill: evaluatedGapSkill,
        currentSkills: (acquired_skills || []).map(s => s.name || s),
        count: 2
      });

      const rawQuestions = response.questions || [];
      const formatted = rawQuestions.map((q, idx) => {
        if (typeof q === 'string') {
          return {
            question: q,
            skill: evaluatedGapSkill,
            questionType: idx === 0 ? 'Technical Concept' : 'Scenario-Based Problem Solving',
            category: idx === 0 ? 'Foundational Mechanics & Architecture' : 'Production Troubleshooting & Trade-offs',
            hint: `Demonstrate your analytical reasoning, handling of edge cases, and best practices with ${evaluatedGapSkill}.`
          };
        }
        return {
          question: q.question,
          skill: evaluatedGapSkill,
          questionType: q.questionType || (idx === 0 ? 'Technical Concept' : 'Scenario-Based Problem Solving'),
          category: q.category || 'Core Competency',
          hint: q.hint || `Demonstrate your analytical reasoning and best practices with ${evaluatedGapSkill}.`
        };
      });

      if (formatted.length > 0) {
        setActiveQuestions(formatted);
      } else {
        setActiveQuestions([
          {
            question: `In production environments utilizing ${evaluatedGapSkill}, how do you diagnose latency, handle edge cases, and ensure high availability under load?`,
            skill: evaluatedGapSkill,
            questionType: 'Scenario-Based Problem Solving',
            category: 'System Architecture & Mechanics',
            hint: `Consider state management, resource consumption, profiling, and failure modes.`
          }
        ]);
      }

      setInterviewState('active');
      setTimeLeft(180); // 3 minutes for comprehensive response
      setCurrentQuestionIndex(0);
      setCandidateAnswers({});
    } catch (err) {
      console.error('[InterviewPage] Question generation failed:', err);
      setApiError(err.message || 'Failed to generate interview questions. Please try again.');
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleChangeAnswerText = (text) => {
    setCandidateAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: text
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleFinishInterview();
    }
  };

  const handleFinishInterview = async () => {
    setIsEvaluating(true);
    setApiError(null);

    const currentQ = activeQuestions[currentQuestionIndex] || activeQuestions[0];
    const qText = currentQ?.question || `Technical evaluation on ${evaluatedGapSkill}`;
    const aText = candidateAnswers[currentQuestionIndex] || '';

    try {
      // Evaluate candidate answer using backend Gemini AI
      const evalRes = await apiClient.post('/interview/evaluate', {
        question: qText,
        answer: aText,
        targetRole: target_role,
        gapSkill: evaluatedGapSkill
      });

      const overall = evalRes.overallScore || Math.round(
        ((evalRes.technical || 75) +
          (evalRes.problemSolving || 75) +
          (evalRes.application || 75) +
          (evalRes.communication || 75)) /
          4
      );

      const formattedResults = {
        overallScore: overall,
        skillVerified: overall >= 70,
        correctConcepts: evalRes.correctConcepts || [],
        incorrectConcepts: evalRes.incorrectConcepts || [],
        missingConcepts: evalRes.missingConcepts || [],
        weakAreas: evalRes.weakAreas || [],
        betterApproach: evalRes.betterApproach || '',
        recommendedPractice: evalRes.recommendedPractice || '',
        dimensions: [
          {
            name: 'Technical Understanding',
            score: evalRes.technical || 80,
            benchmark: 75,
            status: (evalRes.technical || 80) >= 75 ? 'Exceeds Benchmark' : 'Needs Practice'
          },
          {
            name: 'Problem Solving',
            score: evalRes.problemSolving || 75,
            benchmark: 75,
            status: (evalRes.problemSolving || 75) >= 75 ? 'Exceeds Benchmark' : 'Needs Practice'
          },
          {
            name: 'Practical Application',
            score: evalRes.application || 75,
            benchmark: 75,
            status: (evalRes.application || 75) >= 75 ? 'Exceeds Benchmark' : 'Needs Practice'
          },
          {
            name: 'Communication',
            score: evalRes.communication || 85,
            benchmark: 75,
            status: (evalRes.communication || 85) >= 75 ? 'Exceeds Benchmark' : 'Needs Practice'
          }
        ],
        remaining_weakness: {
          subtopic: evaluatedGapSkill,
          scoreInDimension: Math.min(
            evalRes.technical || 75,
            evalRes.problemSolving || 75,
            evalRes.application || 75,
            evalRes.communication || 75
          ),
          justification:
            evalRes.remainingWeakness ||
            `Candidate showed conceptual grasp of ${evaluatedGapSkill}. Additional hands-on practice recommended.`,
          impactOnRoadmap: `Dynamic Feedback Loop: Remediation for ${evaluatedGapSkill} prioritized in your learning milestones.`
        }
      };

      setEvaluatedResults(formattedResults);
      setInterviewState('results');
      completeMockInterview(formattedResults);

      // Persist verified skill to backend if candidate achieved passing benchmark (70+)
      if (overall >= 70 && addOrUpdateSkill) {
        await addOrUpdateSkill(evaluatedGapSkill, overall);
      }
    } catch (err) {
      console.error('[InterviewPage] Evaluation failed:', err);
      setApiError(err.message || 'Evaluation service unavailable. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins}:${remSecs < 10 ? '0' : ''}${remSecs}`;
  };

  const results = evaluatedResults || interview_flow.defaultResults;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="executive-badge-navy text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Technical Evaluation
            </span>
            <span className="text-slate-300">•</span>
            <Link to="/student" className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition">
              Student Dashboard
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Adaptive Technical Assessment Drill
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            High-velocity conceptual simulation targeting identified critical gap skills for{' '}
            <strong className="text-slate-900 font-bold">{target_role}</strong>.
          </p>
        </div>

        {interviewState === 'active' && (
          <div className="flex items-center space-x-2.5 bg-white border border-[#E2E8F0] px-4 py-2 rounded-xl shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span className="text-xs text-slate-500 font-semibold">Remaining Time:</span>
            <span className="font-mono font-bold text-amber-700 text-sm">
              {formatTime(timeLeft)}
            </span>
          </div>
        )}
      </div>

      {/* Global Error Banner */}
      {apiError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center justify-between">
          <span>{apiError}</span>
          <button
            onClick={() => setApiError(null)}
            className="text-rose-600 font-bold hover:text-rose-900 ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* State 1: Intro / Launch Screen */}
      {interviewState === 'intro' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              <span>Adaptive Evaluator Active</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
              Test candidate defenses before facing recruiter screens
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              This drill assesses conceptual depth in{' '}
              <strong className="text-slate-900 font-semibold">{evaluatedGapSkill}</strong>.
              Responses are scored in real time across 4 employer benchmark dimensions via Gemini AI, dynamically injecting remediation into your roadmap.
            </p>

            {/* 4 Dimension Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-900 block mb-0.5">1. Technical Understanding</span>
                <span className="text-[11px] text-slate-500">Architecture, syntax & core runtime mechanics</span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-900 block mb-0.5">2. Problem Solving</span>
                <span className="text-[11px] text-slate-500">Edge cases, scalability & design trade-offs</span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-900 block mb-0.5">3. Practical Application</span>
                <span className="text-[11px] text-slate-500">Production best practices & code ergonomics</span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-900 block mb-0.5">4. Communication</span>
                <span className="text-[11px] text-slate-500">Clarity, conciseness & technical articulation</span>
              </div>
            </div>

            {/* Launch Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={handleStartDrill}
                disabled={isLoadingQuestions}
                className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition flex items-center space-x-2 disabled:opacity-50"
              >
                {isLoadingQuestions ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating Questions with AI...</span>
                  </>
                ) : (
                  <>
                    <span>Start 2-Minute Drill Now</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Card: Drill Specifications */}
          <div className="lg:col-span-5 bg-white rounded-xl p-6 space-y-4 shadow-sm border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              <span>Drill Specifications</span>
            </h3>
            <div className="space-y-3 text-xs divide-y divide-slate-100">
              <div className="flex justify-between pt-1">
                <span className="text-slate-500">Target Role:</span>
                <span className="font-semibold text-slate-900">{target_role}</span>
              </div>
              <div className="flex justify-between pt-2.5">
                <span className="text-slate-500">Evaluated Critical Gap:</span>
                <span className="font-bold text-rose-600">
                  {evaluatedGapSkill}
                </span>
              </div>
              <div className="flex justify-between pt-2.5">
                <span className="text-slate-500">Max Time Allotted:</span>
                <span className="font-mono font-semibold text-slate-900">120 Seconds</span>
              </div>
              <div className="flex justify-between pt-2.5">
                <span className="text-slate-500">Evaluation Engine:</span>
                <span className="font-semibold text-blue-700">Gemini 2.5 Flash Rubrics</span>
              </div>
              <div className="flex justify-between pt-2.5">
                <span className="text-slate-500">Dynamic Feedback:</span>
                <span className="font-semibold text-amber-700">Auto-injects remedial roadmap milestone</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Evaluating Loading State */}
      {isEvaluating && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200 space-y-4 animate-in fade-in">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">
            Gemini AI is evaluating your responses...
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Scoring technical depth, problem-solving reasoning, production practicality, and communication articulation against employer hiring rubrics.
          </p>
        </div>
      )}

      {/* State 2: Interactive Drill Screen */}
      {!isEvaluating && interviewState === 'active' && activeQuestions[currentQuestionIndex] && (
        <div className="max-w-3xl mx-auto">
          <InterviewQuestion
            question={activeQuestions[currentQuestionIndex]}
            questionIndex={currentQuestionIndex}
            totalQuestions={activeQuestions.length}
            answerText={candidateAnswers[currentQuestionIndex] || ''}
            onChangeAnswerText={handleChangeAnswerText}
            onNextQuestion={handleNextQuestion}
            isLast={currentQuestionIndex === activeQuestions.length - 1}
          />
        </div>
      )}

      {/* State 3: Post-Interview Results */}
      {!isEvaluating && interviewState === 'results' && results && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Results Hero Card */}
          <div className="bg-white rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm relative overflow-hidden border border-slate-200">
            <div className="space-y-2 text-center md:text-left">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                results.overallScore >= 70
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}>
                {results.overallScore >= 70 ? '✓ Skill Benchmark Passed (Verified)' : '⚡ Skill Gap Persists — Remediation Required'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Readiness Evaluation: {results.overallScore}%
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
                Technical assessment for <strong className="text-slate-900 font-semibold">{evaluatedGapSkill}</strong> has been evaluated against industry benchmarks. {results.overallScore >= 70 ? 'Verified proficiency has been updated in your profile.' : 'Targeted daily practice tasks have been injected to close remaining gaps.'}
              </p>
            </div>

            <div className="text-center bg-slate-50 border border-slate-200 rounded-xl p-5 min-w-[190px] shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">Overall Score</span>
              <span className={`text-4xl sm:text-5xl font-extrabold tracking-tight block my-1 ${
                results.overallScore >= 70 ? 'text-emerald-600' : 'text-amber-600'
              }`}>
                {results.overallScore}%
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Hiring Benchmark: 70%</span>
            </div>
          </div>

          {/* 4 Scored Dimensions Progress Bars */}
          <div className="bg-white rounded-xl p-6 space-y-4 shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-1">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>Evaluated Competency Dimensions</span>
                </h3>
                <p className="text-xs text-slate-500">
                  AI performance breakdown across technical, tactical, application, and communication dimensions.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-auto">
                4 Dimensions Scored
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {(results.dimensions || []).map((dim) => (
                <ScoreBar
                  key={dim.name}
                  name={dim.name}
                  score={dim.score}
                  benchmark={dim.benchmark}
                  status={dim.status}
                />
              ))}
            </div>
          </div>

          {/* Diagnostic Concepts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Correct Concepts */}
            <div className="p-5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2.5 shadow-2xs">
              <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center space-x-1.5">
                <span>✓ Demonstrated Concepts</span>
              </h4>
              {results.correctConcepts && results.correctConcepts.length > 0 ? (
                <ul className="space-y-1.5 text-xs text-emerald-950">
                  {results.correctConcepts.map((item, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-emerald-800 italic">Foundational principles identified in response.</p>
              )}
            </div>

            {/* Missing Concepts */}
            <div className="p-5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2.5 shadow-2xs">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center space-x-1.5">
                <span>🔍 Missing Key Concepts</span>
              </h4>
              {results.missingConcepts && results.missingConcepts.length > 0 ? (
                <ul className="space-y-1.5 text-xs text-amber-950">
                  {results.missingConcepts.map((item, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-amber-800 italic">No critical conceptual omissions detected.</p>
              )}
            </div>
          </div>

          {/* Model Answer / Better Approach */}
          {results.betterApproach && (
            <div className="p-6 rounded-xl bg-slate-900 text-white space-y-2.5 shadow-sm border border-slate-800">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                <span>💡 Principal Engineer Reference Approach</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {results.betterApproach}
              </p>
            </div>
          )}

          {/* Recommended Practice Activity */}
          {results.recommendedPractice && (
            <div className="p-5 rounded-xl bg-blue-50 border border-blue-200 space-y-2 text-xs">
              <span className="font-bold text-blue-900 uppercase tracking-wider text-[11px] block">
                🎯 Recommended Next Practice Activity
              </span>
              <p className="text-slate-800 leading-relaxed">
                {results.recommendedPractice}
              </p>
            </div>
          )}

          {/* Flagged Remaining Weakness */}
          {results.remaining_weakness && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 space-y-3 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <h4 className="text-sm font-bold text-amber-950">
                    Identified Weakness: {results.remaining_weakness.subtopic}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-200/70 text-amber-800 border border-amber-300">
                    Score: {results.remaining_weakness.scoreInDimension}%
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed">
                {results.remaining_weakness.justification}
              </p>

              {/* Direct Feedback into Roadmap */}
              <div className="mt-3 p-4 bg-white border border-amber-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
                <div className="space-y-0.5">
                  <span className="font-bold text-amber-900 block">
                    Feedback Loop: Roadmap Dynamically Adjusted
                  </span>
                  <span className="text-slate-600 text-[11px]">
                    {results.remaining_weakness.impactOnRoadmap}
                  </span>
                </div>
                <Link
                  to="/roadmap"
                  className="inline-flex items-center space-x-1 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition whitespace-nowrap shadow-sm"
                >
                  <span>View Updated Roadmap</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          )}

          {/* Bottom Navigation CTAs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={() => {
                setInterviewState('intro');
                setEvaluatedResults(null);
              }}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-4 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition"
            >
              ↺ Retake Mock Drill
            </button>
            <div className="flex items-center space-x-3">
              <Link
                to="/student"
                className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-sm transition"
              >
                Return to Dashboard
              </Link>
              <Link
                to="/roadmap"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition flex items-center space-x-1"
              >
                <span>Continue to Roadmap</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


