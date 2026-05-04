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

    // Create or update budget entry for this specific month
    const budget = await Budget.findOneAndUpdate(
      { 
        userId: new mongoose.Types.ObjectId(req.user._id),
        month: startOfMonth 
      },
      { 
        $set: { amount: budgetAmount } 
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

// Get available months (months with expenses or budget)
exports.getAvailableMonths = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    // Get unique months from expenses
    const expenseMonths = await Expense.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);

    // Get unique months from budgets
    const budgetMonths = await Budget.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: {
            year: { $year: '$month' },
            month: { $month: '$month' }
          }
        }
      }
    ]);

    // Combine and format
    const monthsSet = new Set();
    [...expenseMonths, ...budgetMonths].forEach(item => {
      const { year, month } = item._id;
      monthsSet.add(`${year}-${String(month).padStart(2, '0')}`);
    });

    // Add current month if not present
    const now = new Date();
    monthsSet.add(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);

    const availableMonths = Array.from(monthsSet).sort().reverse();

    res.json({ availableMonths });
  } catch (error) {
    console.error('Error fetching available months:', error);
    res.status(500).json({ error: 'Failed to get available months' });
  }
};

// Get budget status with AI suggestions
exports.getBudgetStatus = async (req, res) => {
  try {
    const { month, year, allTime } = req.query;
    const userId = new mongoose.Types.ObjectId(req.user._id);

    if (allTime === 'true') {
      // Find all unique months with expenses
      const expenseMonths = await Expense.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' }
            }
          }
        }
      ]);

      const allBudgets = await Budget.find({ userId }).sort({ month: 1 });
      const latestBudget = allBudgets.length > 0 ? allBudgets[allBudgets.length - 1].amount : 0;

      // Create a map of year-month to budget
      const budgetMap = {};
      allBudgets.forEach(b => {
        const key = `${b.month.getFullYear()}-${b.month.getMonth() + 1}`;
        budgetMap[key] = b.amount;
      });

      // Sum budgets for every month that has expenses
      let totalBudget = 0;
      const monthsWithActivity = new Set();
      
      expenseMonths.forEach(item => {
        const key = `${item._id.year}-${item._id.month}`;
        monthsWithActivity.add(key);
        totalBudget += budgetMap[key] || latestBudget;
      });

      // Also include any months that have a budget set but no expenses yet
      allBudgets.forEach(b => {
        const key = `${b.month.getFullYear()}-${b.month.getMonth() + 1}`;
        if (!monthsWithActivity.has(key)) {
          totalBudget += b.amount;
        }
      });

      const totalExpensesRes = await Expense.aggregate([
        { $match: { userId } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const totalSpent = totalExpensesRes[0]?.total || 0;
      const remaining = totalBudget - totalSpent;
      const percentageUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

      // Generate AI suggestions for all-time data
      const suggestions = await generateSuggestions(req.user._id, totalBudget, null);

      return res.json({
        budget: {
          amount: totalBudget,
          isAllTime: true
        },
        currentMonth: { // Keeping same keys for frontend compatibility
          totalSpent,
          remaining,
          percentageUsed: Math.round(percentageUsed),
          status: percentageUsed >= 100 ? 'Over Budget' : 'Good'
        },
        suggestions
      });
    }

    let targetDate;
    if (month && year) {
      targetDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    } else {
      const now = new Date();
      targetDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 1);

    // Get budget for that specific month (or most recent one if not found)
    let budget = await Budget.findOne({ 
      userId, 
      month: { $gte: startOfMonth, $lt: endOfMonth } 
    });

    // If no specific budget for this month, get the most recent one overall
    if (!budget) {
      budget = await Budget.findOne({ userId })
        .sort({ month: -1 })
        .limit(1);
    }
    
    if (!budget) {
      return res.json({ 
        budget: null, 
        status: 'No budget set',
        suggestions: []
      });
    }

    const monthlyExpenses = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startOfMonth, $lt: endOfMonth },
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

    // Generate AI suggestions (still use current budget context for general advice)
    const suggestions = await generateSuggestions(req.user._id, budget.amount, targetDate);

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