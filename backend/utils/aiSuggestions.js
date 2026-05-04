const Expense = require('../models/Expense');
const mongoose = require('mongoose');
const { getChatResponse } = require('./chatbot');

// Generate AI-based suggestions based on spending patterns
const generateSuggestions = async (userId, monthlyBudget, targetMonth = null) => {
  try {
    const currentDate = targetMonth ? new Date(targetMonth) : new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get expenses for current month
    const expenses = await Expense.find({
      userId: userObjectId,
      date: { $gte: startOfMonth, $lt: endOfMonth },
    });

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const budgetUsage = monthlyBudget > 0 ? (totalExpenses / monthlyBudget) * 100 : 0;
    
    // Category Breakdown for context
    const categorySpending = {};
    expenses.forEach((exp) => {
      categorySpending[exp.category] = (categorySpending[exp.category] || 0) + exp.amount;
    });
    const categorySummary = Object.entries(categorySpending)
      .map(([cat, amt]) => `${cat}: ₹${amt}`)
      .join(', ');

    // Rule-based Fallback Suggestions
    const fallbackSuggestions = [];
    if (budgetUsage > 80) {
      fallbackSuggestions.push({ type: 'warning', message: `⚠️ Budget usage at ${budgetUsage.toFixed(1)}%. Be careful!` });
    }
    if (budgetUsage < 50 && totalExpenses > 0) {
      fallbackSuggestions.push({ type: 'success', message: "✅ You're doing great with your budget this month!" });
    }

    // Try to get AI-generated insights
    try {
      const prompt = [
        {
          role: "system",
          content: `You are a financial expert. Analyze this data and provide 2-3 extremely concise, punchy "Smart Insights" (max 15 words each). 
          Data:
          - Budget: ₹${monthlyBudget}
          - Total Spent: ₹${totalExpenses}
          - Category Breakdown: ${categorySummary || 'No expenses yet'}
          - Month: ${currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          
          Return ONLY a JSON array of strings. Example: ["Your food spending is 20% higher than last week.", "You have ₹5,000 left for the month."]
          Do not include any other text.`
        }
      ];

      const aiResponse = await getChatResponse(prompt);
      
      // Attempt to parse AI response (expecting ["insight1", "insight2"])
      try {
        // Clean response if AI adds markdown blocks
        const cleaned = aiResponse.replace(/```json|```/g, '').trim();
        const insights = JSON.parse(cleaned);
        if (Array.isArray(insights)) {
          return insights.map(text => ({
            type: 'ai',
            message: text.startsWith('"') ? text.slice(1, -1) : text,
            severity: 'medium'
          }));
        }
      } catch (parseError) {
        console.error('AI Parse Error:', parseError, 'Response was:', aiResponse);
      }
    } catch (aiError) {
      console.error('AI Suggestion Error:', aiError);
    }

    // Return fallbacks if AI fails
    return fallbackSuggestions.length > 0 ? fallbackSuggestions : [{ type: 'info', message: "Start adding expenses to see smart insights." }];
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return [];
  }
};

module.exports = { generateSuggestions };