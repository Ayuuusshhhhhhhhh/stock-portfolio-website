import React, { useState, useRef, useEffect } from 'react';
import { stockAPI } from '../services/api';
import { StockSearchResult, Stock } from '../types';
import './StockSearch.css';

interface StockSearchProps {
  onAddStock: (symbol: string, quantity: number, price: number) => void;
}

const StockSearch: React.FC<StockSearchProps> = ({ onAddStock }) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchStocks(query);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  const searchStocks = async (searchQuery: string) => {
    try {
      setLoading(true);
      const response = await stockAPI.searchStocks(searchQuery);
      
      if (response.success) {
        setSearchResults(response.data);
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const selectStock = async (stockResult: StockSearchResult) => {
    try {
      setLoading(true);
      const response = await stockAPI.getStockPrice(stockResult.symbol);
      
      if (response.success) {
        setSelectedStock(response.data);
        setSearchResults([]);
        setQuery(stockResult.symbol);
      }
    } catch (err: any) {
      setError('Failed to fetch stock price');
      console.error('Stock price error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = async () => {
    if (!selectedStock || quantity <= 0) return;

    try {
      await onAddStock(selectedStock.symbol, quantity, selectedStock.price);
      // Reset form
      setQuery('');
      setSelectedStock(null);
      setQuantity(1);
      setError('');
    } catch (err: any) {
      setError('Failed to add stock to portfolio');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="stock-search">
      <h2>Add Stock to Portfolio</h2>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Search for stocks (e.g., AAPL, MSFT)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        
        {loading && <div className="search-loading">Searching...</div>}
        
        {searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.slice(0, 5).map((stock) => (
              <div
                key={stock.symbol}
                className="search-result-item"
                onClick={() => selectStock(stock)}
              >
                <div className="stock-symbol">{stock.symbol}</div>
                <div className="stock-name">{stock.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedStock && (
        <div className="selected-stock">
          <h3>Selected Stock</h3>
          <div className="stock-details">
            <div className="stock-info">
              <span className="symbol">{selectedStock.symbol}</span>
              <span className="name">{selectedStock.name}</span>
              <span className={`price ${selectedStock.change >= 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(selectedStock.price)} 
                ({selectedStock.change >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%)
              </span>
            </div>
            
            <div className="quantity-input">
              <label htmlFor="quantity">Quantity:</label>
              <input
                type="number"
                id="quantity"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>
            
            <div className="total-cost">
              Total Cost: {formatCurrency(selectedStock.price * quantity)}
            </div>
            
            <button
              onClick={handleAddStock}
              className="add-stock-button"
              disabled={quantity <= 0}
            >
              Add to Portfolio
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}
    </div>
  );
};

export default StockSearch;
