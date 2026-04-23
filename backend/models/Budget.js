const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  month: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Budget', budgetSchema);