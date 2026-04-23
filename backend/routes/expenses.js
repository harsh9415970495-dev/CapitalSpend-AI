const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const auth = require('../middleware/auth');

router.post('/', auth, expenseController.addExpense);
router.get('/', auth, expenseController.getExpenses);
router.get('/summary', auth, expenseController.getExpenseSummary);
router.get('/export-pdf', auth, expenseController.exportPDF);
router.get('/:id', auth, expenseController.getExpenseById);
router.put('/:id', auth, expenseController.updateExpense);
router.delete('/:id', auth, expenseController.deleteExpense);

module.exports = router;