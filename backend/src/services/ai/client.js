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
 * @param {string} prompt - Prompt text requesting structured JSON output
 * @param {string} [modelName] - Optional override model name
 * @returns {Promise<string>} - Raw text JSON from model
 */
async function callGemini(prompt, modelName) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing from environment variables');
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Model cascade: configured override -> process.env.GEMINI_MODEL -> gemini-3.5-flash -> gemma-4-26b-a4b-it -> gemini-3.1-flash-lite
  const candidates = [
    modelName,
    process.env.GEMINI_MODEL,
    'gemini-3.5-flash',
    'gemma-4-26b-a4b-it',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest'
  ].filter(Boolean);

  const modelsToTry = [...new Set(candidates)];
  let lastErr = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });
      return response.text || '';
    } catch (err) {
      lastErr = err;
      const isTransient = err.status === 429 || err.status === 503 || err.status === 404 ||
        (err.message && (
          err.message.includes('503') ||
          err.message.includes('429') ||
          err.message.includes('404') ||
          err.message.includes('demand') ||
          err.message.includes('quota') ||
          err.message.includes('RESOURCE_EXHAUSTED')
        ));
      if (isTransient) {
        // Try next candidate model in cascade
        continue;
      }
      throw err;
    }
  }

  throw lastErr || new Error('All model candidates failed to respond');
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
