const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function checkV1() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const genAI = new GoogleGenerativeAI(apiKey); // Default
  
  console.log("--- Testing with default (v1beta) ---");
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    await model.generateContent("test");
    console.log("✅ v1beta worked");
  } catch (e) {
    console.log("❌ v1beta failed:", e.message);
  }

  // Some SDK versions allow passing an option object, but let's try to just change the model name to include the version if possible? No.
  // Let's try to use a different approach.
}

checkV1();
