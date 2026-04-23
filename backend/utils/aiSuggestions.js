const Expense = require('../models/Expense');
const mongoose = require('mongoose');

// Generate AI-based suggestions based on spending patterns
const generateSuggestions = async (userId, monthlyBudget) => {
  try {
    const currentDate = new Date();
    const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get expenses for current month
    const expenses = await Expense.find({
      userId: userObjectId,
      date: { $gte: currentMonth, $lt: nextMonth },
    });

    const suggestions = [];
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const budgetUsage = (totalExpenses / monthlyBudget) * 100;

    // Suggestion 1: Budget warning
    if (budgetUsage > 80) {
      suggestions.push({
        type: 'warning',
        message: `⚠️ You've used ${budgetUsage.toFixed(1)}% of your monthly budget!`,
        severity: 'high',
      });
    } else if (budgetUsage > 60) {
      suggestions.push({
        type: 'info',
        message: `📊 You've used ${budgetUsage.toFixed(1)}% of your monthly budget.`,
        severity: 'medium',
      });
    }

    // Suggestion 2: Category analysis
    const categorySpending = {};
    expenses.forEach((exp) => {
      categorySpending[exp.category] = (categorySpending[exp.category] || 0) + exp.amount;
    });

    const sortedCategories = Object.entries(categorySpending).sort(([, a], [, b]) => b - a);
    if (sortedCategories.length > 0) {
      const [maxCategoryName, maxCategoryAmount] = sortedCategories[0];
      const percentage = ((maxCategoryAmount / totalExpenses) * 100).toFixed(1);
      if (percentage > 40) {
        suggestions.push({
          type: 'warning',
          message: `🛑 ${maxCategoryName} is your highest spending category at ${percentage}% of total expenses.`,
          severity: 'high',
        });
      }
    }

    // Suggestion 3: Daily average
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const dailyAverage = (totalExpenses / daysInMonth).toFixed(0);
    const recommendedDaily = (monthlyBudget / daysInMonth).toFixed(0);

    if (dailyAverage > recommendedDaily) {
      const excess = (dailyAverage - recommendedDaily).toFixed(0);
      suggestions.push({
        type: 'tip',
        message: `💡 Try to reduce daily expenses by ₹${excess} to stay within budget.`,
        severity: 'medium',
      });
    }

    // Suggestion 4: Positive reinforcement
    if (budgetUsage < 50) {
      suggestions.push({
        type: 'success',
        message: '✅ Great job! You\'re spending wisely this month.',
        severity: 'low',
      });
    }

    return suggestions;
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return [];
  }
};

module.exports = { generateSuggestions };