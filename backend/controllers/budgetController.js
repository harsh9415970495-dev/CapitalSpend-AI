const Budget = require('../models/Budget');
const User = require('../models/User');
const Expense = require('../models/Expense');
const mongoose = require('mongoose');
const { generateSuggestions } = require('../utils/aiSuggestions');
// Set or update budget
exports.setBudget = async (req, res) => {
  try {
    const { amount } = req.body;
    
    // Convert to number and ensure it's valid
    const budgetAmount = parseFloat(amount);
    if (isNaN(budgetAmount) || budgetAmount < 0) {
      return res.status(400).json({ error: 'Invalid budget amount' });
    }

    // Normalize month to the first day of the current month
    const startOfMonth = new Date();
    startOfMonth.setHours(0, 0, 0, 0);
    startOfMonth.setDate(1);

    // Create or update budget entry
    // Explicitly cast userId to ObjectId to ensure matching works correctly
    const budget = await Budget.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(req.user._id) },
      { 
        $set: { 
          amount: budgetAmount, 
          month: startOfMonth 
        } 
      },
      { new: true, upsert: true, runValidators: true }
    );
    
    // Update the user's monthly budget as well so it reflects in the profile
    await User.findByIdAndUpdate(req.user._id, { monthlyBudget: budgetAmount });
    
    res.json({
      success: true,
      message: 'Budget updated successfully!',
      budget
    });

  } catch (error) {
    console.error('Budget save error:', error);
    res.status(500).json({ error: 'Failed to update budget', details: error.message });
  }
};

// Get current budget
exports.getCurrentBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(1);
    
    if (!budget) {
      return res.json({ budget: null });
    }
    
    res.json({ budget });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get budget' });
  }
};

// Get budget status with AI suggestions
exports.getBudgetStatus = async (req, res) => {
  try {
    // Get current budget
    const budget = await Budget.findOne({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(1);
    
    if (!budget) {
      return res.json({ 
        budget: null, 
        status: 'No budget set',
        suggestions: []
      });
    }

    // Get current month expenses
    const currentDate = new Date();
    const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

    const monthlyExpenses = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user._id),
          date: { $gte: currentMonth, $lt: nextMonth },
        },
      },

      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const totalSpent = monthlyExpenses[0]?.total || 0;
    const remaining = budget.amount - totalSpent;
    const percentageUsed = budget.amount > 0 ? (totalSpent / budget.amount) * 100 : 0;

    // Generate AI suggestions
    const suggestions = await generateSuggestions(req.user._id, budget.amount);

    res.json({
      budget: {
        amount: budget.amount,
        month: budget.month,
        createdAt: budget.createdAt
      },
      currentMonth: {
        totalSpent,
        remaining,
        percentageUsed: Math.round(percentageUsed),
        status: percentageUsed >= 80 ? 'Warning' : percentageUsed >= 100 ? 'Over Budget' : 'Good'
      },
      suggestions
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get budget status' });
  }
};