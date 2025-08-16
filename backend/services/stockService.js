const axios = require('axios');
const { setCache, getCache } = require('../config/redis');

class StockService {
  constructor() {
    this.apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    this.baseUrl = 'https://www.alphavantage.co/query';
    this.requestDelay = 12000; // 12 seconds between requests for free tier (5 requests/minute)
    this.lastRequestTime = 0;
  }

  // Rate limiting for Alpha Vantage API
  async rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.requestDelay) {
      const waitTime = this.requestDelay - timeSinceLastRequest;
      console.log(`Rate limiting: waiting ${waitTime}ms before next request`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  // Search for stocks
  async searchStocks(keywords) {
    try {
      // Check cache first
      const cacheKey = `search:${keywords.toLowerCase()}`;
      const cached = await getCache(cacheKey);
      if (cached) {
        return cached;
      }

      await this.rateLimit();

      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'SYMBOL_SEARCH',
          keywords,
          apikey: this.apiKey,
        },
        timeout: 10000,
      });

      if (response.data['Error Message']) {
        throw new Error('Invalid API call');
      }

      if (response.data['Note']) {
        throw new Error('API call frequency limit reached');
      }

      const matches = response.data['bestMatches'] || [];
      const results = matches.slice(0, 10).map(match => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
        type: match['3. type'],
        region: match['4. region'],
        marketOpen: match['5. marketOpen'],
        marketClose: match['6. marketClose'],
        timezone: match['7. timezone'],
        currency: match['8. currency'],
      }));

      // Cache for 1 hour
      await setCache(cacheKey, results, 3600);
      
      return results;
    } catch (error) {
      console.error('Stock search error:', error.message);
      throw new Error(`Failed to search stocks: ${error.message}`);
    }
  }

  // Get real-time stock quote
  async getStockQuote(symbol) {
    try {
      // Check cache first (cache for 1 minute for real-time data)
      const cacheKey = `quote:${symbol.toUpperCase()}`;
      const cached = await getCache(cacheKey);
      if (cached) {
        return cached;
      }

      await this.rateLimit();

      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol.toUpperCase(),
          apikey: this.apiKey,
        },
        timeout: 10000,
      });

      if (response.data['Error Message']) {
        throw new Error(`Invalid symbol: ${symbol}`);
      }

      if (response.data['Note']) {
        throw new Error('API call frequency limit reached');
      }

      const quote = response.data['Global Quote'];
      if (!quote || Object.keys(quote).length === 0) {
        throw new Error(`No data found for symbol: ${symbol}`);
      }

      const result = {
        symbol: quote['01. symbol'],
        name: quote['01. symbol'], // Alpha Vantage doesn't return company name in quote
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        previousClose: parseFloat(quote['08. previous close']),
        open: parseFloat(quote['02. open']),
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low']),
        lastUpdated: quote['07. latest trading day'],
      };

      // Cache for 1 minute
      await setCache(cacheKey, result, 60);
      
      return result;
    } catch (error) {
      console.error('Stock quote error:', error.message);
      throw new Error(`Failed to get stock quote: ${error.message}`);
    }
  }

  // Get multiple stock quotes
  async getMultipleQuotes(symbols) {
    try {
      const results = [];
      
      // Process symbols with delay to respect rate limits
      for (const symbol of symbols) {
        try {
          const quote = await this.getStockQuote(symbol);
          results.push(quote);
        } catch (error) {
          console.warn(`Failed to get quote for ${symbol}:`, error.message);
          // Continue with other symbols even if one fails
        }
      }
      
      return results;
    } catch (error) {
      console.error('Multiple quotes error:', error.message);
      throw new Error(`Failed to get multiple quotes: ${error.message}`);
    }
  }

  // Get historical data (daily)
  async getHistoricalData(symbol, period = '1M') {
    try {
      const cacheKey = `history:${symbol.toUpperCase()}:${period}`;
      const cached = await getCache(cacheKey);
      if (cached) {
        return cached;
      }

      await this.rateLimit();

      // For free tier, we'll use daily data
      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol: symbol.toUpperCase(),
          outputsize: period === '1Y' ? 'full' : 'compact',
          apikey: this.apiKey,
        },
        timeout: 15000,
      });

      if (response.data['Error Message']) {
        throw new Error(`Invalid symbol: ${symbol}`);
      }

      if (response.data['Note']) {
        throw new Error('API call frequency limit reached');
      }

      const timeSeries = response.data['Time Series (Daily)'];
      if (!timeSeries) {
        throw new Error(`No historical data found for symbol: ${symbol}`);
      }

      // Convert to array and limit based on period
      const data = Object.entries(timeSeries)
        .map(([date, values]) => ({
          date,
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseInt(values['5. volume']),
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      // Filter based on period
      let filteredData = data;
      const now = new Date();
      
      switch (period) {
        case '1W':
          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filteredData = data.filter(d => new Date(d.date) >= oneWeekAgo);
          break;
        case '1M':
          const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          filteredData = data.filter(d => new Date(d.date) >= oneMonthAgo);
          break;
        case '3M':
          const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          filteredData = data.filter(d => new Date(d.date) >= threeMonthsAgo);
          break;
        case '6M':
          const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
          filteredData = data.filter(d => new Date(d.date) >= sixMonthsAgo);
          break;
        case '1Y':
          const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          filteredData = data.filter(d => new Date(d.date) >= oneYearAgo);
          break;
        default:
          filteredData = data.slice(-30); // Last 30 days
      }

      // Cache for 4 hours
      await setCache(cacheKey, filteredData, 14400);
      
      return filteredData;
    } catch (error) {
      console.error('Historical data error:', error.message);
      throw new Error(`Failed to get historical data: ${error.message}`);
    }
  }

  // Get market overview (popular stocks)
  async getMarketOverview() {
    try {
      const cacheKey = 'market:overview';
      const cached = await getCache(cacheKey);
      if (cached) {
        return cached;
      }

      // Get quotes for popular stocks
      const popularSymbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX'];
      const quotes = await this.getMultipleQuotes(popularSymbols.slice(0, 4)); // Limit to 4 due to rate limits
      
      // Cache for 5 minutes
      await setCache(cacheKey, quotes, 300);
      
      return quotes;
    } catch (error) {
      console.error('Market overview error:', error.message);
      throw new Error(`Failed to get market overview: ${error.message}`);
    }
  }
}

module.exports = new StockService();
