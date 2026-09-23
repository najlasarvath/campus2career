import { useState } from 'react';

export default function InterviewQuestion({
  question,
  questionIndex,
  totalQuestions,
  answerText = '',
  onChangeAnswerText,
  onNextQuestion,
  isLast = false
}) {
  const [showHint, setShowHint] = useState(false);

  return (
    <div className="bg-white rounded-xl p-6 sm:p-8 space-y-6 shadow-sm border border-slate-200 relative">
      {/* Question Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            {question.skill || 'Technical Assessment'}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-xs text-slate-500 font-medium">
            {question.questionType || question.category || 'Core Competency'}
          </span>
        </div>
        <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          Question {questionIndex + 1} / {totalQuestions}
        </span>
      </div>

      {/* Main Question Text */}
      <div className="space-y-3">
        <div className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 mb-1">
          {question.category || 'Engineering Challenge'}
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
          "{question.question}"
        </h3>

        {/* Concept Context / Hint Drawer */}
        {question.hint && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1.5 transition cursor-pointer"
            >
              <span>{showHint ? '▲ Hide Concept Context' : '💡 Show Concept Context'}</span>
            </button>
            {showHint && (
              <p className="text-xs text-slate-700 mt-2 p-3.5 rounded-lg bg-slate-50 border border-slate-200 leading-relaxed shadow-sm">
                {question.hint}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Freeform Answer Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
            Your Technical Solution & Reasoning:
          </label>
          <span className="text-[10px] text-slate-400">
            Explain trade-offs, internal mechanics & edge cases
          </span>
        </div>
        <textarea
          rows={6}
          value={answerText}
          onChange={(e) => onChangeAnswerText && onChangeAnswerText(e.target.value)}
          placeholder="Formulate your technical approach here. Explain architectural patterns, root-cause investigation steps, database/runtime trade-offs, and edge case handling..."
          className="w-full text-xs sm:text-sm p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder-slate-400 bg-slate-50/50 leading-relaxed"
        />
      </div>

      {/* Bottom Controls */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Evaluated via Gemini AI against industry engineering rubrics
        </span>
        <button
          onClick={onNextQuestion}
          disabled={!answerText?.trim()}
          className="px-6 py-2.5 rounded-lg font-semibold text-xs bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm flex items-center space-x-1.5 cursor-pointer"
        >
          <span>{isLast ? 'Complete & Submit Solution' : 'Next Question'}</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
