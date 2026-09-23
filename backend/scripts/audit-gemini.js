const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { GoogleGenAI } = require('@google/genai');

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  const configuredModel = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

  console.log('=== GEMINI SDK & MODEL AUDIT ===');
  console.log(`Node version: ${process.version}`);
  console.log(`Configured GEMINI_MODEL: ${configuredModel}`);
  console.log(`API Key present: ${Boolean(apiKey)} (Length: ${apiKey ? apiKey.length : 0})`);

  if (!apiKey) {
    console.error('FAIL: No API key found in backend/.env');
    return;
  }

  const ai = new GoogleGenAI({ apiKey });

  // 1. Try listing available models if supported
  console.log('\n--- 1. Testing ai.models.list() ---');
  try {
    const listRes = await ai.models.list();
    console.log('ai.models.list() call succeeded!');
    let count = 0;
    if (listRes && typeof listRes[Symbol.asyncIterator] === 'function') {
      for await (const m of listRes) {
        if (count < 10) console.log(`  - Model: ${m.name}`);
        count++;
      }
      console.log(`Total models returned: ${count}`);
    } else if (Array.isArray(listRes)) {
      listRes.slice(0, 10).forEach(m => console.log(`  - Model: ${m.name || m.id}`));
      console.log(`Total models returned: ${listRes.length}`);
    } else if (listRes && listRes.models) {
      listRes.models.slice(0, 10).forEach(m => console.log(`  - Model: ${m.name}`));
      console.log(`Total models returned: ${listRes.models.length}`);
    } else {
      console.log('List result structure:', Object.keys(listRes || {}));
    }
  } catch (err) {
    console.log(`ai.models.list() error (${err.status || err.code || 'unknown'}): ${err.message}`);
  }

  // 2. Perform minimal real generateContent call with configuredModel
  console.log(`\n--- 2. Real minimal call to configured model: "${configuredModel}" ---`);
  const startTime = Date.now();
  try {
    const response = await ai.models.generateContent({
      model: configuredModel,
      contents: 'Respond with exactly one word: PONG',
      config: {
        responseMimeType: 'text/plain'
      }
    });
    const latency = Date.now() - startTime;
    console.log(`[SUCCESS] Gemini call succeeded! Latency: ${latency}ms`);
    console.log(`Response text: "${(response.text || '').trim()}"`);
    console.log('Fallback used: NO');
  } catch (err) {
    const latency = Date.now() - startTime;
    console.log(`[FAILURE] Gemini call failed after ${latency}ms`);
    console.log(`Status / Code: ${err.status || err.code || 'N/A'}`);
    console.log(`Error message: ${err.message}`);
  }

  // 3. Test well-known models to discover what models work with this key
  const testCandidates = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-2.5-pro'
  ];

  console.log('\n--- 3. Testing other standard candidate models ---');
  for (const cand of testCandidates) {
    if (cand === configuredModel) continue;
    const t0 = Date.now();
    try {
      const resp = await ai.models.generateContent({
        model: cand,
        contents: 'Say PONG',
        config: { responseMimeType: 'text/plain' }
      });
      console.log(`  ✓ [${cand}] SUCCESS (${Date.now() - t0}ms): "${(resp.text || '').trim().slice(0, 30)}"`);
    } catch (e) {
      console.log(`  ✗ [${cand}] FAILED (${Date.now() - t0}ms): Status ${e.status || e.code} - ${e.message.slice(0, 100)}`);
    }
  }
}

testGemini().catch(err => {
  console.error('Fatal test error:', err);
});
