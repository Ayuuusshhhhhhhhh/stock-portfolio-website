import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Portfolio, PortfolioStock, Transaction } from '../types';
import { portfolioAPI, stockAPI } from '../services/api';
import PortfolioSummary from '../components/PortfolioSummary';
import StockSearch from '../components/StockSearch';
import PortfolioChart from '../components/PortfolioChart';
import StockList from '../components/StockList';
import TransactionHistory from '../components/TransactionHistory';
import ThemeToggle from '../components/ThemeToggle';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPortfolioData();
  }, []);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      const [portfolioResponse, transactionsResponse] = await Promise.all([
        portfolioAPI.getPortfolio(),
        portfolioAPI.getTransactions()
      ]);

      if (portfolioResponse.success) {
        setPortfolio(portfolioResponse.data);
      }

      if (transactionsResponse.success) {
        setTransactions(transactionsResponse.data);
      }
    } catch (err: any) {
      setError('Failed to load portfolio data');
      console.error('Error loading portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = async (symbol: string, quantity: number, price: number) => {
    try {
      const response = await portfolioAPI.addStock(symbol, quantity, price);
      if (response.success) {
        await loadPortfolioData(); // Refresh portfolio data
      }
    } catch (err: any) {
      setError('Failed to add stock');
      console.error('Error adding stock:', err);
    }
  };

  const handleRemoveStock = async (symbol: string, quantity: number, price: number) => {
    try {
      const response = await portfolioAPI.removeStock(symbol, quantity, price);
      if (response.success) {
        await loadPortfolioData(); // Refresh portfolio data
      }
    } catch (err: any) {
      setError('Failed to remove stock');
      console.error('Error removing stock:', err);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading your portfolio...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Stock Portfolio Dashboard</h1>
          <p>Welcome back, {user?.name}!</p>
        </div>
        <div className="header-right">
          <ThemeToggle />
          <button onClick={logout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      <div className="dashboard-content">
        <div className="dashboard-grid">
          {/* Portfolio Summary */}
          <div className="grid-item summary">
            <PortfolioSummary portfolio={portfolio} />
          </div>

          {/* Stock Search */}
          <div className="grid-item search">
            <StockSearch onAddStock={handleAddStock} />
          </div>

          {/* Portfolio Chart */}
          <div className="grid-item chart">
            <PortfolioChart portfolio={portfolio} />
          </div>

          {/* Stock Holdings */}
          <div className="grid-item stocks">
            <StockList
              stocks={portfolio?.stocks || []}
              onRemoveStock={handleRemoveStock}
            />
          </div>

          {/* Transaction History */}
          <div className="grid-item transactions">
            <TransactionHistory transactions={transactions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
