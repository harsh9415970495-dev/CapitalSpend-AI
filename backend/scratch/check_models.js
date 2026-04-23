const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    console.error("No API key found.");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    // There isn't a direct listModels in the main SDK class usually, 
    // but we can try to fetch it via a raw request or check documentation.
    // Actually, the SDK version 0.24.1 has it? Let's check.
    
    // Fallback: Just try common ones and see which one doesn't 404
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro", "gemini-1.5-flash-latest"];
    for (const m of models) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        await model.generateContent("test");
        console.log(`✅ Model ${m} is AVAILABLE`);
      } catch (e) {
        console.log(`❌ Model ${m} failed: ${e.message}`);
      }
    }
  } catch (error) {
    console.error("List Models Error:", error.message);
  }
}

listModels();
