const { GoogleGenAI } = require('@google/genai');
const dotenv = require('dotenv');
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function check() {
  const models = ['gemini-3.6-flash', 'models/gemini-3.6-flash'];
  for (const m of models) {
    try {
      console.log(`Testing ${m}...`);
      const res = await ai.models.generateContent({
        model: m,
        contents: 'Hello, reply with JSON: {"success": true}',
        config: { responseMimeType: 'application/json' }
      });
      console.log(`✓ SUCCESS ${m}: ${res.text}`);
    } catch (e) {
      console.log(`✗ FAILED ${m}: ${e.message}`);
    }
  }
}

check();
