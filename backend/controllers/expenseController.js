const Expense = require('../models/Expense');
const User = require('../models/User');
const mongoose = require('mongoose');
const { validateExpense } = require('../utils/validators');

// Add expense
exports.addExpense = async (req, res) => {
  try {
    const { amount, category, date, note } = req.body;

    // Validate expense data
    if (!validateExpense(amount, category)) {
      return res.status(400).json({ message: '❌ Invalid expense data' });
    }

    // Handle date properly
    let expenseDate;
    if (date) {
      expenseDate = new Date(date);
      if (isNaN(expenseDate.getTime())) {
        return res.status(400).json({ message: '❌ Invalid date format' });
      }
    } else {
      expenseDate = new Date();
    }

    const expense = new Expense({
      userId: req.user._id, // Fixed: using req.user._id
      amount: parseFloat(amount),
      category,
      date: expenseDate,
      note,
    });

    await expense.save();
    res.status(201).json({ 
      message: '✅ Expense added successfully', 
      expense: {
        ...expense.toObject(),
        date: expenseDate.toISOString().split('T') // Return in YYYY-MM-DD format
      }
    });
  } catch (error) {
    res.status(500).json({ message: '❌ Server error', error: error.message });
  }
};

// Get all expenses
exports.getExpenses = async (req, res) => {
  try {
    const { category, startDate, endDate, limit = 50, page = 1 } = req.query;

    const filter = { userId: req.user._id }; // Fixed: using req.user._id

    if (category) {
      filter.category = category;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
          return res.status(400).json({ message: '❌ Invalid start date format' });
        }
        filter.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        if (isNaN(end.getTime())) {
          return res.status(400).json({ message: '❌ Invalid end date format' });
        }
        filter.date.$lte = end;
      }
    }

    const skip = (page - 1) * limit;

    const expenses = await Expense.find(filter)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Format dates for response
    const formattedExpenses = expenses.map(exp => ({
      ...exp.toObject(),
      date: exp.date.toISOString().split('T') // Return in YYYY-MM-DD format
    }));

    const total = await Expense.countDocuments(filter);

    res.json({
      expenses: formattedExpenses,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: '❌ Server error', error: error.message });
  }
};

// Get expense by ID
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user._id, // Fixed: using req.user._id
    });

    if (!expense) {
      return res.status(404).json({ message: '❌ Expense not found' });
    }

    // Format date for response
    const formattedExpense = {
      ...expense.toObject(),
      date: expense.date.toISOString().split('T')
    };

    res.json(formattedExpense);
  } catch (error) {
    res.status(500).json({ message: '❌ Server error', error: error.message });
  }
};

// Update expense
exports.updateExpense = async (req, res) => {
  try {
    const { amount, category, date, note } = req.body;

    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user._id, // Fixed: using req.user._id
    });

    if (!expense) {
      return res.status(404).json({ message: '❌ Expense not found' });
    }

    if (amount !== undefined) expense.amount = parseFloat(amount);
    if (category !== undefined) expense.category = category;
    if (date !== undefined) {
      const newDate = new Date(date);
      if (isNaN(newDate.getTime())) {
        return res.status(400).json({ message: '❌ Invalid date format' });
      }
      expense.date = newDate;
    }
    if (note !== undefined) expense.note = note;

    await expense.save();
    res.json({ 
      message: '✅ Expense updated successfully', 
      expense: {
        ...expense.toObject(),
        date: expense.date.toISOString().split('T')
      }
    });
  } catch (error) {
    res.status(500).json({ message: '❌ Server error', error: error.message });
  }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id, // Fixed: using req.user._id
    });

    if (!expense) {
      return res.status(404).json({ message: '❌ Expense not found' });
    }

    res.json({ message: '✅ Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: '❌ Server error', error: error.message });
  }
};

// Get expense summary
exports.getExpenseSummary = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

    const userId = req.user._id; // Fixed: using req.user._id

    // Monthly expenses
    const monthlyExpenses = await Expense.aggregate([
      {
        $match: {
          userId: userId,
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

    // Category-wise breakdown
    const categoryBreakdown = await Expense.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: currentMonth, $lt: nextMonth },
        },
      },
      {
        $group: {
          _id: '$category',
          amount: { $sum: '$amount' },
        },
      },
      {
        $sort: { amount: -1 }
      }
    ]);

    // Daily expenses for current month
    const dailyExpenses = await Expense.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: currentMonth, $lt: nextMonth },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          amount: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      monthlyTotal: monthlyExpenses?.total || 0,
      categoryBreakdown,
      dailyExpenses,
      currentDate: currentDate.toISOString().split('T')
    });
  } catch (error) {
    res.status(500).json({ message: '❌ Server error', error: error.message });
  }
};

// Export expenses as CSV
exports.exportExpenses = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = { userId: req.user._id }; // Fixed: using req.user._id

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
          return res.status(400).json({ message: '❌ Invalid start date format' });
        }
        filter.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        if (isNaN(end.getTime())) {
          return res.status(400).json({ message: '❌ Invalid end date format' });
        }
        filter.date.$lte = end;
      }
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });

    let csv = 'Date,Category,Amount,Note\n';
    expenses.forEach((exp) => {
      const dateStr = exp.date.toISOString().split('T');
      csv += `${dateStr},${exp.category},${exp.amount},"${exp.note}"\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename="expenses.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: '❌ Server error', error: error.message });
  }
};