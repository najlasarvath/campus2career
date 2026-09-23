/**
 * AI Assistant Service - Intelligent Career Coach Engine
 * Powered by Gemini AI via backend POST /api/ai/chat.
 */
import apiClient from './api';

/**
 * Sanitizes coach responses to guarantee that raw JSON structures,
 * internal keys (e.g. coach_response), and escaped newlines are never rendered to the user.
 */
export function sanitizeClientCoachReply(raw) {
  if (typeof raw !== 'string') return '';
  let text = raw.trim();

  // Strip code blocks if present
  if (text.startsWith('```json')) {
    text = text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
  } else if (text.startsWith('```markdown')) {
    text = text.replace(/^```markdown\s*/i, '').replace(/```\s*$/, '').trim();
  } else if (text.startsWith('```')) {
    text = text.replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
  }

  // Parse if JSON array or object
  if (text.startsWith('[') || text.startsWith('{')) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const first = parsed[0];
        if (typeof first === 'string') return first.trim();
        if (first && typeof first === 'object') {
          const val = first.coach_response || first.response || first.reply || first.message || Object.values(first)[0];
          if (typeof val === 'string') return val.trim();
        }
      } else if (parsed && typeof parsed === 'object') {
        const val = parsed.coach_response || parsed.response || parsed.reply || parsed.message || Object.values(parsed)[0];
        if (typeof val === 'string') return val.trim();
      }
    } catch {
      // not JSON, keep text
    }
  }

  return text.replace(/\\n/g, '\n').replace(/\\"/g, '"').trim();
}

/**
 * Sends candidate query with authoritative context to the backend Gemini AI Career Coach.
 *
 * @param {string} userText - User question
 * @param {Object} context - Authoritative student context from StudentContext
 * @returns {Promise<string>} - Human-readable conversational markdown reply
 */
export async function generateAiResponse(userText, context = {}) {
  try {
    const res = await apiClient.post('/ai/chat', {
      message: userText,
      context: {
        studentName: context?.student?.name || context?.studentName || 'Student',
        target_role: context?.target_role || 'Software Engineer',
        match_score: context?.match_score ?? context?.readiness_score ?? 0,
        target_score: context?.target_score ?? 85,
        acquired_skills: context?.acquired_skills || [],
        critical_gaps: context?.critical_gaps || [],
        highest_impact_skill: context?.highest_impact_skill,
        company: context?.company || context?.selected_company || context?.target_company
      }
    });

    if (res && res.reply) {
      return sanitizeClientCoachReply(res.reply);
    }
    throw new Error('AI Coach returned an empty response. Please try again.');
  } catch (err) {
    console.error('[aiAssistantService] Error communicating with AI Coach:', err);
    throw new Error(err.message || 'Unable to connect to the AI Placement Coach service. Please try again.');
  }
}
