const express = require('express');
const { body } = require('express-validator');
const {
  getPortfolio,
  addStock,
  removeStock,
  getTransactions,
  getPerformance,
} = require('../controllers/portfolioController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All portfolio routes are protected
router.use(protect);

// Validation rules
const stockTransactionValidation = [
  body('symbol')
    .isString()
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Symbol must be a string with 1-10 characters'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('price')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),
];

// Routes
router.get('/', getPortfolio);
router.post('/add-stock', stockTransactionValidation, addStock);
router.post('/remove-stock', stockTransactionValidation, removeStock);
router.get('/transactions', getTransactions);
router.get('/performance', getPerformance);

module.exports = router;
