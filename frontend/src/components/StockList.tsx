import React, { useState } from 'react';
import { PortfolioStock } from '../types';
import './StockList.css';

interface StockListProps {
  stocks: PortfolioStock[];
  onRemoveStock: (symbol: string, quantity: number, price: number) => void;
}

const StockList: React.FC<StockListProps> = ({ stocks, onRemoveStock }) => {
  const [sellQuantities, setSellQuantities] = useState<{ [symbol: string]: number }>({});

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const handleSellQuantityChange = (symbol: string, quantity: number) => {
    setSellQuantities(prev => ({
      ...prev,
      [symbol]: Math.max(1, Math.min(quantity, stocks.find(s => s.symbol === symbol)?.quantity || 1))
    }));
  };

  const handleSellStock = (stock: PortfolioStock) => {
    const quantity = sellQuantities[stock.symbol] || 1;
    onRemoveStock(stock.symbol, quantity, stock.currentPrice);
    
    // Reset sell quantity
    setSellQuantities(prev => ({
      ...prev,
      [stock.symbol]: 1
    }));
  };

  if (stocks.length === 0) {
    return (
      <div className="stock-list">
        <h2>Your Holdings</h2>
        <div className="no-stocks">
          <p>No stocks in your portfolio yet.</p>
          <p>Start by searching and adding stocks above!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stock-list">
      <h2>Your Holdings ({stocks.length} stocks)</h2>
      <div className="stocks-container">
        {stocks.map((stock) => (
          <div key={stock.symbol} className="stock-item">
            <div className="stock-header">
              <div className="stock-title">
                <span className="symbol">{stock.symbol}</span>
                <span className="name">{stock.name}</span>
              </div>
              <div className="stock-price">
                <span className="current-price">{formatCurrency(stock.currentPrice)}</span>
                <span className={`gain-loss ${stock.gainLoss >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(stock.gainLoss)} ({formatPercent(stock.gainLossPercent)})
                </span>
              </div>
            </div>

            <div className="stock-details">
              <div className="detail-item">
                <span className="label">Quantity:</span>
                <span className="value">{stock.quantity} shares</span>
              </div>
              <div className="detail-item">
                <span className="label">Avg. Price:</span>
                <span className="value">{formatCurrency(stock.avgPrice)}</span>
              </div>
              <div className="detail-item">
                <span className="label">Total Value:</span>
                <span className="value">{formatCurrency(stock.totalValue)}</span>
              </div>
            </div>

            <div className="stock-actions">
              <div className="sell-section">
                <input
                  type="number"
                  min="1"
                  max={stock.quantity}
                  value={sellQuantities[stock.symbol] || 1}
                  onChange={(e) => handleSellQuantityChange(stock.symbol, parseInt(e.target.value))}
                  className="sell-quantity-input"
                />
                <button
                  onClick={() => handleSellStock(stock)}
                  className="sell-button"
                >
                  Sell Shares
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockList;
