import React from 'react';
import { Portfolio } from '../types';
import './PortfolioSummary.css';

interface PortfolioSummaryProps {
  portfolio: Portfolio | null;
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ portfolio }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (!portfolio) {
    return (
      <div className="portfolio-summary">
        <h2>Portfolio Summary</h2>
        <div className="summary-grid">
          <div className="summary-card">
            <h3>Total Value</h3>
            <p className="value">$0.00</p>
          </div>
          <div className="summary-card">
            <h3>Total Invested</h3>
            <p className="value">$0.00</p>
          </div>
          <div className="summary-card">
            <h3>Gain/Loss</h3>
            <p className="value neutral">$0.00 (0.00%)</p>
          </div>
          <div className="summary-card">
            <h3>Holdings</h3>
            <p className="value">0 stocks</p>
          </div>
        </div>
        <div className="no-data">
          <p>Start building your portfolio by adding stocks!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio-summary">
      <h2>Portfolio Summary</h2>
      <div className="summary-grid">
        <div className="summary-card">
          <h3>Total Value</h3>
          <p className="value">{formatCurrency(portfolio.totalValue)}</p>
        </div>
        <div className="summary-card">
          <h3>Total Invested</h3>
          <p className="value">{formatCurrency(portfolio.totalInvested)}</p>
        </div>
        <div className="summary-card">
          <h3>Gain/Loss</h3>
          <p className={`value ${portfolio.totalGainLoss >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(portfolio.totalGainLoss)} ({formatPercent(portfolio.totalGainLossPercent)})
          </p>
        </div>
        <div className="summary-card">
          <h3>Holdings</h3>
          <p className="value">{portfolio.stocks.length} stocks</p>
        </div>
      </div>
    </div>
  );
};

export default PortfolioSummary;
