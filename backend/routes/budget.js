const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const auth = require('../middleware/auth');

router.post('/set', auth, budgetController.setBudget);
router.get('/status', auth, budgetController.getBudgetStatus);
router.get('/current', auth, budgetController.getCurrentBudget);
router.get('/available-months', auth, budgetController.getAvailableMonths);

module.exports = router;