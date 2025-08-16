const Transaction = require('../models/Transaction');
const stockService = require('./stockService');
const { getCache, setCache, deleteCache } = require('../config/redis');

class PortfolioService {
  // Get user's portfolio with current values
  async getUserPortfolio(userId) {
    try {
      // Check cache first
      const cacheKey = `portfolio:${userId}`;
      const cached = await getCache(cacheKey);
      if (cached) {
        return cached;
      }

      // Get all user transactions
      const transactions = await Transaction.find({ userId }).sort({ date: -1 });

      if (transactions.length === 0) {
        const emptyPortfolio = {
          id: `portfolio_${userId}`,
          userId,
          stocks: [],
          totalValue: 0,
          totalInvested: 0,
          totalGainLoss: 0,
          totalGainLossPercent: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        // Cache empty portfolio for 1 minute
        await setCache(cacheKey, emptyPortfolio, 60);
        return emptyPortfolio;
      }

      // Calculate portfolio holdings
      const holdings = this.calculateHoldings(transactions);
      
      if (holdings.length === 0) {
        const emptyPortfolio = {
          id: `portfolio_${userId}`,
          userId,
          stocks: [],
          totalValue: 0,
          totalInvested: 0,
          totalGainLoss: 0,
          totalGainLossPercent: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        await setCache(cacheKey, emptyPortfolio, 60);
        return emptyPortfolio;
      }

      // Get current prices for all held stocks
      const symbols = holdings.map(h => h.symbol);
      const currentPrices = await stockService.getMultipleQuotes(symbols);

      // Create price lookup map
      const priceMap = {};
      currentPrices.forEach(quote => {
        priceMap[quote.symbol] = quote;
      });

      // Calculate portfolio with current prices
      const portfolio = this.calculatePortfolioValue(holdings, priceMap, userId);

      // Cache for 1 minute (due to real-time price updates)
      await setCache(cacheKey, portfolio, 60);
      
      return portfolio;
    } catch (error) {
      console.error('Get user portfolio error:', error);
      throw new Error(`Failed to get portfolio: ${error.message}`);
    }
  }

  // Calculate holdings from transactions
  calculateHoldings(transactions) {
    const holdings = {};

    transactions.forEach(transaction => {
      const { symbol, type, quantity, price } = transaction;
      
      if (!holdings[symbol]) {
        holdings[symbol] = {
          symbol,
          totalQuantity: 0,
          totalInvested: 0,
          transactions: [],
        };
      }

      holdings[symbol].transactions.push(transaction);

      if (type === 'buy') {
        holdings[symbol].totalQuantity += quantity;
        holdings[symbol].totalInvested += quantity * price;
      } else if (type === 'sell') {
        holdings[symbol].totalQuantity -= quantity;
        holdings[symbol].totalInvested -= quantity * price;
      }
    });

    // Filter out stocks with zero or negative quantities
    return Object.values(holdings).filter(holding => holding.totalQuantity > 0);
  }

  // Calculate portfolio value with current prices
  calculatePortfolioValue(holdings, priceMap, userId) {
    let totalValue = 0;
    let totalInvested = 0;

    const stocks = holdings.map(holding => {
      const { symbol, totalQuantity, totalInvested: invested } = holding;
      const currentQuote = priceMap[symbol];
      
      // Use cached price or fallback to average price
      const currentPrice = currentQuote ? currentQuote.price : invested / totalQuantity;
      const avgPrice = invested / totalQuantity;
      const currentValue = totalQuantity * currentPrice;
      const gainLoss = currentValue - invested;
      const gainLossPercent = invested > 0 ? (gainLoss / invested) * 100 : 0;

      totalValue += currentValue;
      totalInvested += invested;

      return {
        symbol,
        name: currentQuote ? currentQuote.name : symbol,
        quantity: totalQuantity,
        avgPrice: Math.round(avgPrice * 100) / 100,
        currentPrice: Math.round(currentPrice * 100) / 100,
        totalValue: Math.round(currentValue * 100) / 100,
        gainLoss: Math.round(gainLoss * 100) / 100,
        gainLossPercent: Math.round(gainLossPercent * 100) / 100,
      };
    });

    const totalGainLoss = totalValue - totalInvested;
    const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

    return {
      id: `portfolio_${userId}`,
      userId,
      stocks,
      totalValue: Math.round(totalValue * 100) / 100,
      totalInvested: Math.round(totalInvested * 100) / 100,
      totalGainLoss: Math.round(totalGainLoss * 100) / 100,
      totalGainLossPercent: Math.round(totalGainLossPercent * 100) / 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Add stock to portfolio (buy)
  async addStock(userId, symbol, quantity, price) {
    try {
      // Validate inputs
      if (!symbol || typeof symbol !== 'string') {
        throw new Error('Valid symbol is required');
      }
      if (!quantity || quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
      }
      if (!price || price <= 0) {
        throw new Error('Price must be greater than 0');
      }

      // Create buy transaction
      const transaction = new Transaction({
        userId,
        symbol: symbol.toUpperCase(),
        type: 'buy',
        quantity: parseInt(quantity),
        price: parseFloat(price),
      });

      await transaction.save();

      // Clear portfolio cache
      await deleteCache(`portfolio:${userId}`);

      return transaction;
    } catch (error) {
      console.error('Add stock error:', error);
      throw new Error(`Failed to add stock: ${error.message}`);
    }
  }

  // Remove stock from portfolio (sell)
  async removeStock(userId, symbol, quantity, price) {
    try {
      // Validate inputs
      if (!symbol || typeof symbol !== 'string') {
        throw new Error('Valid symbol is required');
      }
      if (!quantity || quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
      }
      if (!price || price <= 0) {
        throw new Error('Price must be greater than 0');
      }

      // Check if user has enough shares
      const transactions = await Transaction.find({ 
        userId, 
        symbol: symbol.toUpperCase() 
      });

      const holdings = this.calculateHoldings(transactions);
      const holding = holdings.find(h => h.symbol === symbol.toUpperCase());

      if (!holding || holding.totalQuantity < quantity) {
        throw new Error('Insufficient shares to sell');
      }

      // Create sell transaction
      const transaction = new Transaction({
        userId,
        symbol: symbol.toUpperCase(),
        type: 'sell',
        quantity: parseInt(quantity),
        price: parseFloat(price),
      });

      await transaction.save();

      // Clear portfolio cache
      await deleteCache(`portfolio:${userId}`);

      return transaction;
    } catch (error) {
      console.error('Remove stock error:', error);
      throw new Error(`Failed to remove stock: ${error.message}`);
    }
  }

  // Get user transactions
  async getUserTransactions(userId, limit = 50) {
    try {
      const transactions = await Transaction.find({ userId })
        .sort({ date: -1 })
        .limit(limit);

      return transactions;
    } catch (error) {
      console.error('Get user transactions error:', error);
      throw new Error(`Failed to get transactions: ${error.message}`);
    }
  }

  // Get portfolio performance over time
  async getPortfolioPerformance(userId, period = '1M') {
    try {
      const transactions = await Transaction.find({ userId }).sort({ date: 1 });
      
      if (transactions.length === 0) {
        return [];
      }

      // Calculate portfolio value at different points in time
      const performanceData = [];
      const now = new Date();
      let startDate;

      switch (period) {
        case '1W':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '1M':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '3M':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '6M':
          startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
          break;
        case '1Y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      // Filter transactions within the period
      const relevantTransactions = transactions.filter(t => new Date(t.date) >= startDate);
      
      // For now, return simplified performance data
      // In a full implementation, you'd calculate portfolio value at regular intervals
      const performance = relevantTransactions.map(transaction => ({
        date: transaction.date,
        value: transaction.total,
        type: transaction.type,
        symbol: transaction.symbol,
      }));

      return performance;
    } catch (error) {
      console.error('Get portfolio performance error:', error);
      throw new Error(`Failed to get portfolio performance: ${error.message}`);
    }
  }
}

module.exports = new PortfolioService();
