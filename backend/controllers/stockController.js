const { validationResult } = require('express-validator');
const stockService = require('../services/stockService');

// @desc    Search for stocks
// @route   GET /api/stocks/search?q=keyword
// @access  Private
const searchStocks = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 1) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const results = await stockService.searchStocks(q.trim());

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Search stocks error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get stock quote
// @route   GET /api/stocks/quote/:symbol
// @access  Private
const getStockQuote = async (req, res) => {
  try {
    const { symbol } = req.params;

    if (!symbol || symbol.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock symbol is required',
      });
    }

    const quote = await stockService.getStockQuote(symbol.trim());

    res.status(200).json({
      success: true,
      data: quote,
    });
  } catch (error) {
    console.error('Get stock quote error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get multiple stock quotes
// @route   POST /api/stocks/quotes
// @access  Private
const getMultipleQuotes = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array(),
      });
    }

    const { symbols } = req.body;

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Symbols array is required',
      });
    }

    // Limit to 10 symbols to avoid rate limiting issues
    const limitedSymbols = symbols.slice(0, 10).map(s => s.trim().toUpperCase());
    const quotes = await stockService.getMultipleQuotes(limitedSymbols);

    res.status(200).json({
      success: true,
      data: quotes,
    });
  } catch (error) {
    console.error('Get multiple quotes error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get historical stock data
// @route   GET /api/stocks/history/:symbol?period=1M
// @access  Private
const getHistoricalData = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { period = '1M' } = req.query;

    if (!symbol || symbol.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock symbol is required',
      });
    }

    // Validate period
    const validPeriods = ['1W', '1M', '3M', '6M', '1Y'];
    if (!validPeriods.includes(period)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid period. Valid values: 1W, 1M, 3M, 6M, 1Y',
      });
    }

    const data = await stockService.getHistoricalData(symbol.trim(), period);

    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error('Get historical data error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get market overview
// @route   GET /api/stocks/overview
// @access  Private
const getMarketOverview = async (req, res) => {
  try {
    const overview = await stockService.getMarketOverview();

    res.status(200).json({
      success: true,
      data: overview,
    });
  } catch (error) {
    console.error('Get market overview error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  searchStocks,
  getStockQuote,
  getMultipleQuotes,
  getHistoricalData,
  getMarketOverview,
};
