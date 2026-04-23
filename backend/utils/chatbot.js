const getChatResponse = async (messages) => {
  try {
    const apiKey = process.env.GROQ_API_KEY?.trim() || process.env.GROK_API_KEY?.trim();
    
    if (!apiKey) {
      return "⚠️ API Key is missing. Please add GROQ_API_KEY to your .env file.";
    }

    // Detect if it's a Groq key (starts with gsk_)
    const isGroq = apiKey.startsWith('gsk_');
    const url = isGroq 
      ? "https://api.groq.com/openai/v1/chat/completions" 
      : "https://api.x.ai/v1/chat/completions";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: isGroq ? "llama-3.3-70b-versatile" : "grok-beta", 
        messages: messages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        }))
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error('API Error Data:', data.error);
      throw new Error(data.error.message || "API Error");
    }

    if (!data.choices || data.choices.length === 0) {
      console.error('Response missing choices:', data);
      throw new Error("No response from AI Assistant");
    }

    return data.choices[0].message.content;

  } catch (error) {
    console.error('Chat API Error:', error);
    return `❌ API Error: ${error.message}`;
  }
};

module.exports = { getChatResponse };
