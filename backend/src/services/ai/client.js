const dotenv = require('dotenv');
const path = require('path');

// Ensure environment variables are loaded
dotenv.config();
if (!process.env.GEMINI_API_KEY) {
  dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
}

const { GoogleGenAI } = require('@google/genai');

/**
 * Strips markdown code fences from AI output string.
 * @param {string} text - Raw string output from LLM
 * @returns {string} - Cleaned JSON string
 */
function cleanJSON(text) {
  if (typeof text !== 'string') return '';
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
  }
  return cleaned.trim();
}

/**
 * Calls Gemini / GoogleGenAI models with native JSON mode.
 * Automatically handles temporary 503 high-demand or 429 quota spikes by cascading across models.
 *
 * @param {string} prompt - Prompt text requesting output
 * @param {string} [modelName] - Optional override model name
 * @param {Object} [options] - Options such as responseMimeType ('application/json' | 'text/plain')
 * @returns {Promise<string>} - Raw text from model
 */
async function callGemini(prompt, modelName, options = {}) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing from environment variables');
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const targetModel = modelName || process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
  const mimeType = options?.responseMimeType || 'application/json';

  try {
    const response = await ai.models.generateContent({
      model: targetModel,
      contents: prompt,
      config: {
        responseMimeType: mimeType
      }
    });
    return response.text || '';
  } catch (err) {
    // Sanitize any key leakage in error
    const sanitizedMsg = (err.message || '').replace(apiKey, '[REDACTED_API_KEY]');
    const sanitizedErr = new Error(sanitizedMsg);
    sanitizedErr.status = err.status || err.code;
    sanitizedErr.model = targetModel;
    throw sanitizedErr;
  }
}

/**
 * Executes a Gemini model call in JSON-output mode, parses the response,
 * and validates it against a zod schema with a 1-retry fallback on failure.
 *
 * @param {string} prompt - The prompt text requesting structured JSON output
 * @param {import('zod').ZodSchema} [schema] - Optional Zod schema to validate against
 * @param {string} [modelName] - Optional override model name
 * @returns {Promise<any>} - Validated parsed JSON output
 */
async function generateJSON(prompt, schema, modelName) {
  const maxAttempts = 2; // 1 try + 1 retry on parse failure
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const rawText = await callGemini(prompt, modelName);
      const cleaned = cleanJSON(rawText);
      const parsed = JSON.parse(cleaned);

      if (schema && typeof schema.parse === 'function') {
        return schema.parse(parsed);
      }
      return parsed;
    } catch (err) {
      if (err.message && err.message.includes('GEMINI_API_KEY is missing')) {
        throw err;
      }
      lastError = err;
      if (attempt === maxAttempts) {
        throw new Error(`AI generateJSON failed after retry (${attempt} attempts): ${lastError.message}`);
      }
      // Backoff before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

module.exports = {
  generateJSON,
  callGemini,
  cleanJSON
};
