const { validationResult } = require('express-validator');
const portfolioService = require('../services/portfolioService');

// @desc    Get user's portfolio
// @route   GET /api/portfolio
// @access  Private
const getPortfolio = async (req, res) => {
  try {
    const portfolio = await portfolioService.getUserPortfolio(req.user.id);

    res.status(200).json({
      success: true,
      data: portfolio,
    });
  } catch (error) {
    console.error('Get portfolio error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Add stock to portfolio
// @route   POST /api/portfolio/add-stock
// @access  Private
const addStock = async (req, res) => {
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

    const { symbol, quantity, price } = req.body;

    const transaction = await portfolioService.addStock(
      req.user.id,
      symbol,
      quantity,
      price
    );

    res.status(201).json({
      success: true,
      data: transaction,
      message: 'Stock added to portfolio successfully',
    });
  } catch (error) {
    console.error('Add stock error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Remove stock from portfolio
// @route   POST /api/portfolio/remove-stock
// @access  Private
const removeStock = async (req, res) => {
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

    const { symbol, quantity, price } = req.body;

    const transaction = await portfolioService.removeStock(
      req.user.id,
      symbol,
      quantity,
      price
    );

    res.status(201).json({
      success: true,
      data: transaction,
      message: 'Stock removed from portfolio successfully',
    });
  } catch (error) {
    console.error('Remove stock error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user's transactions
// @route   GET /api/portfolio/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const transactions = await portfolioService.getUserTransactions(
      req.user.id,
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.error('Get transactions error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get portfolio performance
// @route   GET /api/portfolio/performance?period=1M
// @access  Private
const getPerformance = async (req, res) => {
  try {
    const { period = '1M' } = req.query;

    // Validate period
    const validPeriods = ['1W', '1M', '3M', '6M', '1Y'];
    if (!validPeriods.includes(period)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid period. Valid values: 1W, 1M, 3M, 6M, 1Y',
      });
    }

    const performance = await portfolioService.getPortfolioPerformance(
      req.user.id,
      period
    );

    res.status(200).json({
      success: true,
      data: performance,
    });
  } catch (error) {
    console.error('Get performance error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getPortfolio,
  addStock,
  removeStock,
  getTransactions,
  getPerformance,
};
