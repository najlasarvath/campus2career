import { useState, useRef, useEffect } from 'react';
import { useStudent } from '../../context/StudentContext';
import { generateAiResponse } from '../../services/aiAssistantService';

import { sanitizeClientCoachReply } from '../../services/aiAssistantService';

function FormattedText({ text, isUser }) {
  const sanitized = sanitizeClientCoachReply(text);
  if (!sanitized) return null;
  const lines = sanitized.split('\n');

  return (
    <div className="space-y-1 text-xs">
      {lines.map((line, idx) => {
        if (!line.trim()) {
          return <div key={idx} className="h-1.5" />;
        }

        // Process bold (**word**) and inline code (`code`)
        const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);

        return (
          <p key={idx} className={`leading-relaxed ${isUser ? 'text-white' : 'text-slate-800'}`}>
            {parts.map((part, pIdx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong
                    key={pIdx}
                    className={`font-bold ${isUser ? 'text-white underline decoration-white/30' : 'text-slate-950 font-semibold'}`}
                  >
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              if (part.startsWith('`') && part.endsWith('`')) {
                return (
                  <code
                    key={pIdx}
                    className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${
                      isUser
                        ? 'bg-blue-800/80 text-white'
                        : 'bg-slate-100 text-blue-900 border border-slate-200/80'
                    }`}
                  >
                    {part.slice(1, -1)}
                  </code>
                );
              }
              return part;
            })}
          </p>
        );
      })}
    </div>
  );
}

export default function AssistantChat() {
  const [isOpen, setIsOpen] = useState(false);
  const studentContext = useStudent();
  const {
    target_role = 'Data Analyst',
    match_score = 0,
    target_score = 85
  } = studentContext || {};
  const studentName = studentContext?.student?.name ? studentContext.student.name.split(' ')[0] : 'there';
  const topSkill = (studentContext?.critical_gaps?.[0]?.name) || studentContext?.highest_impact_skill?.skill || 'core skills';

  const [messages, setMessages] = useState(() => [
    {
      id: 'init-1',
      sender: 'assistant',
      text: `Hello ${studentName}! 👋 I am your AI Placement Coach for the **${target_role}** track.

You are currently at **${match_score}% readiness** (Target Benchmark: ${target_score}%). 

Ask me anything regarding your critical skill gaps (${topSkill}), daily study tasks, or technical interview questions!`,
      timestamp: 'Just now'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Synchronize initial greeting when authoritative student data finishes loading
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'init-1') {
        return [
          {
            id: 'init-1',
            sender: 'assistant',
            text: `Hello ${studentName}! 👋 I am your AI Placement Coach for the **${target_role}** track.

You are currently at **${match_score}% readiness** (Target Benchmark: ${target_score}%). 

Ask me anything regarding your critical skill gaps (${topSkill}), daily study tasks, or technical interview questions!`,
            timestamp: 'Just now'
          }
        ];
      }
      return prev;
    });
  }, [studentName, target_role, match_score, target_score, topSkill]);

  // Auto-scroll to bottom whenever messages or typing state updates
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Dynamic quick prompts based on active student skill gaps
  const quickPrompts = [
    { label: `🎯 Master ${topSkill}`, text: `What is the most effective daily strategy to master ${topSkill} for a ${target_role} role?` },
    { label: `📊 Why is my score ${match_score}%?`, text: `Explain why my current readiness score is ${match_score}% and how closing ${topSkill} lifts it towards ${target_score}%.` },
    { label: '🗓️ Today’s Action Item', text: `What should I focus on practicing today to advance my placement preparation?` },
    { label: `🎙️ Drill Question on ${topSkill}`, text: `Give me a realistic technical interview question specifically testing my knowledge of ${topSkill}.` },
    { label: `💡 Portfolio Project for ${topSkill}`, text: `What is an impressive industry project I can build to showcase my ${topSkill} ability on my resume?` }
  ];

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isTyping) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const replyText = await generateAiResponse(query, {
        ...studentContext,
        studentName: studentContext?.student?.name
      });
      const assistantMsg = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: 'Just now'
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('[AssistantChat] Error sending message:', err);
      const errorMsg = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ I encountered an issue connecting to the AI Career Coach: ${err.message || 'Please try again.'}`,
        timestamp: 'Just now'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'assistant',
        text: `Chat reset. Hello ${studentName}! How can I help you accelerate your **${target_role}** placement preparation today?`,
        timestamp: 'Just now'
      }
    ]);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-3 bg-white hover:bg-slate-50 text-slate-800 px-5 py-3 rounded-full border border-slate-300 shadow-xl transition-all hover:scale-105 group focus:outline-none ring-4 ring-slate-900/5 cursor-pointer"
          aria-label="Open AI Career Coach"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-xs tracking-wide text-slate-900">AI Career Coach</span>
          <svg
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-slate-800' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Persistent Drawer / Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[430px] max-w-[calc(100vw-2.5rem)] h-[620px] max-h-[82vh] bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-[#0F1E36] px-4 py-3.5 flex items-center justify-between border-b border-slate-800 text-white select-none">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#173B8F] to-[#2563EB] flex items-center justify-center text-white font-bold text-xs shadow-sm ring-1 ring-blue-400/30">
                  AI
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0F1E36]" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="text-xs font-bold text-white tracking-tight">AI Placement Coach</h3>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    Live
                  </span>
                </div>
                <p className="text-[10px] text-slate-300">
                  Target: {target_role} • {match_score}% Readiness
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={handleResetChat}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition text-[11px]"
                title="Reset conversation"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
                aria-label="Close"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#F9F9F7]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 leading-relaxed shadow-xs transition-all ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-[#173B8F] to-[#2563EB] text-white rounded-br-xs'
                      : 'bg-white border border-[#E2E8F0] text-slate-800 rounded-bl-xs'
                  }`}
                >
                  <FormattedText text={msg.text} isUser={msg.sender === 'user'} />
                  <span
                    className={`block mt-1.5 text-[9px] text-right font-medium ${
                      msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#E2E8F0] text-slate-600 rounded-2xl rounded-bl-xs px-4 py-2.5 shadow-xs flex items-center space-x-2">
                  <span className="text-[11px] font-medium text-slate-500">Coach is thinking</span>
                  <div className="flex space-x-1">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Compact Quick Inquiries Pill Strip (Scrollable horizontally) */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Ask:
            </span>
            {quickPrompts.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(item.text)}
                disabled={isTyping}
                className="shrink-0 text-[11px] font-semibold text-slate-700 hover:text-blue-900 bg-slate-50 hover:bg-blue-50/80 border border-slate-200/90 hover:border-blue-300 rounded-full px-3 py-1 transition shadow-2xs disabled:opacity-50"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={handleFormSubmit}
            className="p-3 bg-white border-t border-[#E2E8F0] flex items-center space-x-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything (e.g. 'What are my top gaps?', 'How to improve score?')..."
              disabled={isTyping}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="bg-gradient-to-r from-[#173B8F] to-[#2563EB] hover:from-[#132E70] hover:to-[#1D4ED8] disabled:opacity-40 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1 shrink-0 cursor-pointer"
            >
              <span>Send</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
