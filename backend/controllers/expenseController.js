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
        date: expenseDate.toISOString().split('T')[0] // Return in YYYY-MM-DD format
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
      date: exp.date.toISOString().split('T')[0] // Return in YYYY-MM-DD format
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
      date: expense.date.toISOString().split('T')[0]
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
        date: expense.date.toISOString().split('T')[0]
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
      currentDate: currentDate.toISOString().split('T')[0]
    });
  } catch (error) {
    res.status(500).json({ message: '❌ Server error', error: error.message });
  }
};

const Budget = require('../models/Budget');
const PDFDocument = require('pdfkit');


// Export expenses as PDF
exports.exportPDF = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { userId: req.user._id };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const [expenses, budgetDoc, fullUser] = await Promise.all([
      Expense.find(filter).sort({ date: -1 }),
      Budget.findOne({ userId: req.user._id }).sort({ month: -1 }),
      User.findById(req.user._id)
    ]);

    const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
    let filename = `CapitalSpend_${fullUser?.username || 'Report'}.pdf`;

    res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
    res.setHeader('Content-type', 'application/pdf');

    // --- Branded Header ---
    doc.rect(0, 0, 600, 120).fill('#0f172a'); // Dark Obsidian Header
    doc.fillColor('#3b82f6').fontSize(28).font('Helvetica-Bold').text('Capital Spend', 50, 40);
    doc.fillColor('#94a3b8').fontSize(10).font('Helvetica').text('FINANCIAL INTELLIGENCE REPORT', 50, 75, { characterSpacing: 2 });

    // User Info (Right Aligned)
    doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold').text(fullUser?.username?.toUpperCase() || 'VALUED MEMBER', 400, 45, { align: 'right' });
    doc.fillColor('#94a3b8').font('Helvetica').fontSize(8).text(fullUser?.email || '', 400, 58, { align: 'right' });
    doc.fillColor('#ffffff').fontSize(8).text(`Report Date: ${new Date().toLocaleDateString()}`, 400, 75, { align: 'right' });

    doc.moveDown(4);


    // --- Summary Section (3 Rounded Cards) ---
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const budgetAmount = budgetDoc?.amount || 0;
    const remaining = budgetAmount - totalSpent;

    // Card 1: Monthly Budget
    doc.roundedRect(50, 140, 155, 80, 15).fill('#f8fafc').stroke('#e2e8f0');
    doc.fillColor('#64748b').fontSize(7).font('Helvetica-Bold').text('MONTHLY BUDGET', 65, 160);
    doc.fillColor('#3b82f6').fontSize(16).text(`INR ${budgetAmount.toLocaleString()}`, 65, 175);

    // Card 2: Total Spent
    doc.roundedRect(220, 140, 155, 80, 15).fill('#f8fafc').stroke('#e2e8f0');
    doc.fillColor('#64748b').fontSize(7).font('Helvetica-Bold').text('TOTAL SPENT', 235, 160);
    doc.fillColor('#ef4444').fontSize(16).text(`INR ${totalSpent.toLocaleString()}`, 235, 175);

    // Card 3: Remaining
    doc.roundedRect(390, 140, 155, 80, 15).fill('#f8fafc').stroke('#e2e8f0');
    doc.fillColor('#64748b').fontSize(7).font('Helvetica-Bold').text('REMAINING BALANCE', 405, 160);
    doc.fillColor(remaining >= 0 ? '#10b981' : '#ef4444').fontSize(16).text(`INR ${remaining.toLocaleString()}`, 405, 175);

    doc.moveDown(7);


    // --- Transactions Table ---
    doc.fillColor('#0f172a').fontSize(14).font('Helvetica-Bold').text('Transaction History', 50, 250);
    doc.moveDown(1);

    // Table Header Bar
    const tableTop = 280;
    doc.rect(50, tableTop, 495, 25).fill('#1e293b');
    doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
    doc.text('DATE', 70, tableTop + 8);
    doc.text('CATEGORY', 160, tableTop + 8);
    doc.text('MEMO / NOTE', 260, tableTop + 8);
    doc.text('AMOUNT', 450, tableTop + 8, { align: 'right', width: 80 });

    let currentY = tableTop + 25;

    // Rows
    doc.font('Helvetica').fontSize(9);
    expenses.forEach((exp, i) => {
      // zebra striping
      if (i % 2 === 0) {
        doc.rect(50, currentY, 495, 25).fill('#f1f5f9');
      }

      doc.fillColor('#64748b').text(new Date(exp.date).toLocaleDateString(), 70, currentY + 8);
      doc.fillColor('#0f172a').font('Helvetica-Bold').text(exp.category, 160, currentY + 8);
      doc.fillColor('#64748b').font('Helvetica').text(exp.note || '---', 260, currentY + 8, { width: 180, ellipsis: true });
      doc.fillColor('#0f172a').font('Helvetica-Bold').text(`INR ${exp.amount.toLocaleString()}`, 450, currentY + 8, { align: 'right', width: 80 });

      currentY += 25;

      // Page break check
      if (currentY > 750) {
        doc.addPage();
        currentY = 50;
      }
    });

    // --- Footer ---
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fillColor('#94a3b8').fontSize(8).text(
        `Capital Spend - Page ${i + 1} of ${pageCount} | Generated on ${new Date().toLocaleString()}`,
        0,
        800,
        { align: 'center', width: 595 }
      );
    }

    doc.pipe(res);
    doc.end();


  } catch (error) {
    console.error('PDF Export Error:', error);
    res.status(500).json({ message: '❌ PDF Generation Failed', error: error.message });
  }
};
