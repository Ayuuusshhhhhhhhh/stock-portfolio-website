const express = require('express');
const { body } = require('express-validator');
const {
  searchStocks,
  getStockQuote,
  getMultipleQuotes,
  getHistoricalData,
  getMarketOverview,
} = require('../controllers/stockController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All stock routes are protected
router.use(protect);

// Validation rules
const multipleQuotesValidation = [
  body('symbols')
    .isArray({ min: 1, max: 10 })
    .withMessage('Symbols must be an array with 1-10 items')
    .bail()
    .custom((symbols) => {
      // Check each symbol
      for (const symbol of symbols) {
        if (typeof symbol !== 'string' || symbol.trim().length === 0) {
          throw new Error('Each symbol must be a non-empty string');
        }
      }
      return true;
    }),
];

// Routes
router.get('/search', searchStocks);
router.get('/quote/:symbol', getStockQuote);
router.post('/quotes', multipleQuotesValidation, getMultipleQuotes);
router.get('/history/:symbol', getHistoricalData);
router.get('/overview', getMarketOverview);

module.exports = router;
