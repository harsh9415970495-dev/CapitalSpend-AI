require('dotenv').config();

async function openRouterTest() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const url = "https://openrouter.ai/api/v1/chat/completions";
  
  console.log("Testing OpenRouter with model google/gemini-2.0-flash-001...");
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5000",
        "X-Title": "Diagnostic"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [{ role: "user", content: "hi" }]
      })
    });
    const data = await res.json();
    console.log("Full Response:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.log("Fetch failed:", e.message);
  }
}

openRouterTest();
