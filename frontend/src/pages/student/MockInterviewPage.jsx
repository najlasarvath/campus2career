import { useMemo, useState } from 'react';
import { Award, CheckCircle2, Mic, PlayCircle } from 'lucide-react';

const questions = [
  'What is overfitting in machine learning?',
  'What is the difference between supervised and unsupervised learning?',
  'How would you evaluate a classification model?',
];

const resultSummary = {
  technical: 78,
  problemSolving: 71,
  application: 62,
  communication: 84,
};

export default function MockInterviewPage() {
  const [step, setStep] = useState('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState(['', '', '']);
  const [submitted, setSubmitted] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = useMemo(() => ((currentQuestionIndex + 1) / questions.length) * 100, [currentQuestionIndex]);

  const handleAnswerChange = (event) => {
    const nextAnswers = [...answers];
    nextAnswers[currentQuestionIndex] = event.target.value;
    setAnswers(nextAnswers);
  };

  const handleSubmitAnswer = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((current) => current + 1);
      return;
    }

    setSubmitted(true);
    setStep('result');
  };

  const matchImproved = 78;

  if (step === 'intro') {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <Mic size={26} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">🎤 Gap-Specific Mock Interview</h1>
          <p className="mt-3 text-lg text-slate-600">We’ll test your weakest skill: Machine Learning.</p>
          <div className="mt-6 flex items-center gap-3 text-sm font-medium text-slate-600">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">3 questions</span>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">2 minutes</span>
          </div>
          <button
            type="button"
            onClick={() => setStep('question')}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-base font-semibold text-white transition hover:bg-blue-700"
          >
            <PlayCircle size={18} />
            Start Interview
          </button>
        </div>
      </div>
    );
  }

  if (step === 'question') {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3 text-sm text-slate-500">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="mb-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-blue-600" style={{ width: `${progress}%` }} />
          </div>

          <h2 className="text-2xl font-bold text-slate-900">{currentQuestion}</h2>

          <textarea
            value={answers[currentQuestionIndex]}
            onChange={handleAnswerChange}
            placeholder="Type your answer..."
            className="mt-6 min-h-40 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <button
            type="button"
            onClick={handleSubmitAnswer}
            className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-base font-semibold text-white transition hover:bg-blue-700"
          >
            Submit Answer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3 text-blue-600">
          <Award size={24} />
          <h1 className="text-3xl font-bold text-slate-900">YOUR RESULT 🎯</h1>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {Object.entries(resultSummary).map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-600">
                <span>{label}</span>
                <span>{value}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-blue-600" style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-amber-700">Main weakness</p>
          <p className="mt-2 text-lg font-medium text-slate-800">Applying concepts to real-world problems.</p>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" className="rounded-xl bg-slate-900 px-5 py-3 text-base font-semibold text-white transition hover:bg-slate-700">
            Practice This Skill
          </button>

          <div className="text-lg font-semibold text-slate-700">
            68% <span className="text-slate-400">→</span> <span className="text-emerald-600">{matchImproved}%</span>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-emerald-700">Updated readiness</p>
          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-emerald-200">
            <div className="h-full rounded-full bg-emerald-600" style={{ width: `${matchImproved}%` }} />
          </div>
          <p className="mt-3 text-sm text-emerald-700">AI performance score improved to {matchImproved}%.</p>
        </div>
      </div>
    </div>
  );
}
