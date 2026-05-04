const getChatResponse = async (messages, userData = null) => {
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

    let apiMessages = messages.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    }));

    // If we have user data, prepend a system message to ground the AI
    if (userData) {
      const { 
        budget, 
        totalSpentThisMonth, 
        totalSpentAllTime, 
        categoryBreakdown, 
        allTimeCategoryBreakdown,
        recentExpenses,
        userName 
      } = userData;
      
      const remainingThisMonth = budget - totalSpentThisMonth;
      
      const systemPrompt = {
        role: "system",
        content: `You are Capital Spend AI, a helpful financial assistant for ${userName || 'the user'}.
        
        CRITICAL: You have access to ALL of the user's financial records. Use this data to answer ANY question about their spending history, categories, or specific recent items.

        Current Month Context:
        - Monthly Budget: INR ${budget.toLocaleString()}
        - Spent This Month: INR ${totalSpentThisMonth.toLocaleString()}
        - Remaining This Month: INR ${remainingThisMonth.toLocaleString()}
        - This Month's Category Breakdown: ${categoryBreakdown.length > 0 ? categoryBreakdown.map(c => `${c._id}: INR ${c.amount.toLocaleString()}`).join(', ') : 'No spending recorded yet this month.'}
        
        Historical Context (All-Time):
        - Total Lifetime Spending: INR ${totalSpentAllTime.toLocaleString()}
        - All-Time Top Categories: ${allTimeCategoryBreakdown.length > 0 ? allTimeCategoryBreakdown.map(c => `${c._id}: INR ${c.amount.toLocaleString()}`).join(', ') : 'No historical data available.'}
        
        Recent Transactions (Last 10):
        ${recentExpenses.length > 0 ? recentExpenses.map(e => `- ${e.date}: INR ${e.amount.toLocaleString()} in ${e.category}${e.note ? ` (${e.note})` : ''}`).join('\n        ') : 'No recent transactions found.'}

        Guidelines:
        1. Always use this specific data to provide personalized, accurate advice.
        2. If the user asks about their spending (e.g., "how much did I spend on food?"), check BOTH "This Month" and "All-Time" contexts and specify which one you are referring to.
        3. If they are over budget or close to it (>80%), give a gentle warning.
        4. When asked about specific categories, refer to the breakdown provided.
        5. Keep responses concise, friendly, and professional.
        6. Always reply in the same language the user uses (Hindi/English/Hinglish).`
      };
      
      apiMessages = [systemPrompt, ...apiMessages];
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: isGroq ? "llama-3.3-70b-versatile" : "grok-beta", 
        messages: apiMessages
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
