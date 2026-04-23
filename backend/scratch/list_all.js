require('dotenv').config();

async function listAll() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  console.log("Listing all available models for this key...");
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.models) {
      console.log("Available models:", data.models.map(m => m.name));
    } else {
      console.log("No models found. Error:", JSON.stringify(data, null, 2));
    }
  } catch (e) {
    console.log("Fetch failed:", e.message);
  }
}

listAll();
