require('dotenv').config();

async function rawTest() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  console.log("Testing RAW fetch to v1...");
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] })
    });
    const data = await res.json();
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.log("Fetch failed:", e.message);
  }
}

rawTest();
