import { useMemo, useState } from 'react';
import { Bot, SendHorizonal, Sparkles } from 'lucide-react';

const suggestedQuestions = [
  'What should I learn first?',
  'Why is my match score 68%?',
  'How can I improve my score?',
  'What should I practice today?',
];

const responses = {
  'What should I learn first?':
    'Your highest-impact skill is Machine Learning because it is a critical requirement for your selected AI/ML Engineer role. Start with the free resources in your roadmap, then take the mock interview.',
  'Why is my match score 68%?':
    'Your score reflects the gap between your current skills and the role requirements. You already have strong fundamentals in Python, SQL, Git, and Statistics, but Machine Learning and Deep Learning are still the key blockers.',
  'How can I improve my score?':
    'Focus on the highest-impact skill first: Machine Learning. Complete the free learning path, build one project, and then retake the mock interview to validate your understanding.',
  'What should I practice today?':
    'Practice a quick supervised learning example, review model evaluation concepts, and explain overfitting and classification metrics out loud to strengthen your fundamentals.',
};

export default function AssistantPage() {
  const [selectedQuestion, setSelectedQuestion] = useState('What should I learn first?');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Hi Nehreen 👋\nI know your target role and current skill gaps. Ask me what you should learn next.',
    },
  ]);

  const displayResponse = useMemo(() => responses[selectedQuestion], [selectedQuestion]);

  const handleQuestionClick = (question) => {
    setSelectedQuestion(question);
    setMessages((current) => [
      ...current,
      { sender: 'user', text: question },
      { sender: 'assistant', text: responses[question] },
    ]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const fallbackResponse = 'Start with Machine Learning fundamentals, complete the free roadmap, and then take the mock interview to verify your improvement.';

    setMessages((current) => [
      ...current,
      { sender: 'user', text: trimmed },
      { sender: 'assistant', text: responses[trimmed] || fallbackResponse },
    ]);
    setInput('');
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <Bot size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-blue-600">Career Assistant</p>
            <h1 className="text-3xl font-bold text-slate-900">🤖 Career Assistant</h1>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <p className="text-base text-slate-700">
              Hi Nehreen 👋
              <br />
              I know your target role and current skill gaps. Ask me what you should learn next.
            </p>
          </div>

          <div className="p-5">
            <div className="mb-5 flex flex-wrap gap-2">
              {suggestedQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => handleQuestionClick(question)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  {question}
                </button>
              ))}
            </div>

            <div className="space-y-4 rounded-2xl bg-slate-50 p-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.sender}-${index}`}
                  className={[
                    'max-w-3xl rounded-2xl px-4 py-3 text-sm leading-6',
                    message.sender === 'assistant'
                      ? 'bg-white text-slate-700 shadow-sm'
                      : 'ml-auto bg-blue-600 text-white',
                  ].join(' ')}
                >
                  {message.text}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 p-4">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about your next step..."
                className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                <SendHorizonal size={16} />
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
