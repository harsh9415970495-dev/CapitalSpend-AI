const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  category: {
    type: String,
    required: true,
    enum: ['Food', 'Travel', 'Entertainment', 'Shopping', 'Bills', 'Other']
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  note: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);