const express = require('express');
const router = express.Router();
const { getChatResponse } = require('../utils/chatbot');
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const Chat = require('../models/Chat');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get chat history
router.get('/', auth, async (req, res) => {
  try {
    const history = await Chat.find({ userId: req.user._id }).sort({ createdAt: 1 }).limit(50);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat history' });
  }
});

// Send message and get AI response
router.post('/', auth, async (req, res) => {
  try {
    const { messages } = req.body;
    const userId = req.user._id;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: 'Messages array is required' });
    }

    // Get current month's data for context
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

    const userIdObj = new mongoose.Types.ObjectId(userId);

    const [budgetDoc, currentMonthExpenses, categoryBreakdown, user, allTimeTotal, allTimeCategoryBreakdown, recentExpenses] = await Promise.all([
      Budget.findOne({ userId, month: { $gte: startOfMonth, $lt: endOfMonth } }),
      Expense.find({ userId, date: { $gte: startOfMonth, $lt: endOfMonth } }),
      Expense.aggregate([
        { $match: { userId: userIdObj, date: { $gte: startOfMonth, $lt: endOfMonth } } },
        { $group: { _id: '$category', amount: { $sum: '$amount' } } }
      ]),
      User.findById(userId),
      Expense.aggregate([
        { $match: { userId: userIdObj } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: { userId: userIdObj } },
        { $group: { _id: '$category', amount: { $sum: '$amount' } } },
        { $sort: { amount: -1 } }
      ]),
      Expense.find({ userId }).sort({ date: -1 }).limit(10)
    ]);

    const budget = budgetDoc?.amount || 0;
    const totalSpentThisMonth = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalSpentAllTime = allTimeTotal[0]?.total || 0;

    const userData = {
      budget,
      totalSpentThisMonth,
      totalSpentAllTime,
      categoryBreakdown,
      allTimeCategoryBreakdown,
      recentExpenses: recentExpenses.map(e => ({
          amount: e.amount,
          category: e.category,
          date: e.date.toISOString().split('T')[0],
          note: e.note
      })),
      userName: user?.username
    };

    // Get the last user message to save it
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage && lastUserMessage.role === 'user') {
        await Chat.create({
            userId,
            role: 'user',
            content: lastUserMessage.content
        });
    }

    // Get AI response
    const reply = await getChatResponse(messages, userData);

    // Save AI response
    await Chat.create({
        userId,
        role: 'assistant',
        content: reply
    });

    res.json({ reply });
  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({ message: 'Error communicating with AI' });
  }
});

module.exports = router;
