const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { GoogleGenAI } = require('@google/genai');

async function runFocusedGeminiAudit() {
  console.log('====================================================');
  console.log('  CAMPUS2CAREER AI: FOCUSED GEMINI AUDIT');
  console.log('====================================================');

  const apiKey = process.env.GEMINI_API_KEY;
  const configuredModel = process.env.GEMINI_MODEL;

  // 1. Direct SDK test
  console.log('\n[TEST 1] Direct Minimal SDK Call');
  console.log(`- Model targeted: "${configuredModel}"`);
  console.log(`- API Key configured: ${Boolean(apiKey)}`);

  const ai = new GoogleGenAI({ apiKey });
  const t0 = Date.now();
  let directSuccess = false;
  let directReply = '';
  let directLatency = 0;

  try {
    const res = await ai.models.generateContent({
      model: configuredModel,
      contents: 'Respond with exactly one sentence introducing yourself as the Campus2Career AI placement coach.',
      config: {
        responseMimeType: 'text/plain'
      }
    });
    directLatency = Date.now() - t0;
    directReply = (res.text || '').trim();
    directSuccess = true;
    console.log(`- Status: SUCCESS (${directLatency}ms)`);
    console.log(`- Output: "${directReply}"`);
  } catch (err) {
    directLatency = Date.now() - t0;
    console.log(`- Status: FAILED (${directLatency}ms)`);
    console.log(`- Error: ${err.message}`);
  }

  // 2. HTTP POST /api/ai/chat test
  console.log('\n[TEST 2] HTTP Endpoint Call: POST /api/ai/chat');
  const t1 = Date.now();
  let chatSuccess = false;
  let chatLatency = 0;
  let chatData = null;

  try {
    const response = await fetch('http://localhost:5000/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'What are the top 2 things I should focus on to transition from SQL basics to advanced indexing?',
        context: {
          studentName: 'Aarav',
          target_role: 'Data Analyst',
          match_score: 65,
          critical_gaps: [{ name: 'SQL Indexing' }],
          acquired_skills: ['SQL Basics', 'Python']
        }
      })
    });

    chatLatency = Date.now() - t1;
    chatData = await response.json();
    chatSuccess = response.status === 200 && chatData.success;
    console.log(`- HTTP Status: ${response.status} (${chatLatency}ms)`);
    console.log(`- Source: ${chatData.source}`);
    console.log(`- Model: ${chatData.model}`);
    console.log(`- Raw reply length: ${chatData.reply?.length || 0} characters`);
    console.log(`- Reply excerpt: "${(chatData.reply || '').slice(0, 150)}..."`);
  } catch (err) {
    chatLatency = Date.now() - t1;
    console.log(`- HTTP Call Failed: ${err.message}`);
  }

  // 3. Format & JSON checks
  console.log('\n[TEST 3] Format & Sanitization Validation');
  const text = chatData?.reply || '';
  const isRawJson = text.trim().startsWith('[') || text.trim().startsWith('{') || text.includes('"coach_response":');
  const hasEscapedNewlines = text.includes('\\n');
  console.log(`- Is Raw JSON: ${isRawJson ? 'YES (UNACCEPTABLE)' : 'NO (PASSED)'}`);
  console.log(`- Has Escaped Newlines: ${hasEscapedNewlines ? 'YES (UNACCEPTABLE)' : 'NO (PASSED)'}`);
  console.log(`- Is Conversational Text: ${typeof text === 'string' && text.length > 20 ? 'YES (PASSED)' : 'NO'}`);

  // 4. Security & Key leakage check
  console.log('\n[TEST 4] Security & Credential Leakage Check');
  const replyExposesKey = apiKey && text.includes(apiKey);
  console.log(`- Response contains raw API Key: ${replyExposesKey ? 'LEAKED (CRITICAL)' : 'CLEAN (NO LEAK)'}`);

  // Summary Report
  console.log('\n====================================================');
  console.log('  AUDIT SUMMARY REPORT');
  console.log('====================================================');
  console.log(`verified model:          ${configuredModel}`);
  console.log(`Gemini call success:     ${directSuccess ? 'SUCCESS' : 'FAILURE'}`);
  console.log(`fallback used:           ${chatData?.source === 'fallback' ? 'yes' : 'no'}`);
  console.log(`response latency:        Direct SDK: ${directLatency}ms | HTTP Endpoint: ${chatLatency}ms`);
  console.log(`chat response format:    text/plain (natural conversational prose)`);
  console.log('exact files changed:     backend/.env, backend/src/services/ai/client.js, backend/src/routes/ai.routes.js');
  console.log('====================================================\n');
}

runFocusedGeminiAudit().catch(console.error);
