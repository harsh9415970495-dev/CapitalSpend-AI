require('dotenv').config();

async function debugKey() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('Raw Key:', `"${apiKey}"`);
  console.log('Trimmed Key:', `"${apiKey?.trim()}"`);
}

debugKey();
