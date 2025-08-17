import React from 'react';
import { Transaction } from '../types';
import './TransactionHistory.css';

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (transactions.length === 0) {
    return (
      <div className="transaction-history">
        <h2>Recent Transactions</h2>
        <div className="no-transactions">
          <p>No transactions yet.</p>
          <p>Your buy/sell activity will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-history">
      <h2>Recent Transactions</h2>
      <div className="transactions-container">
        {transactions.slice(0, 10).map((transaction) => (
          <div key={transaction.id} className={`transaction-item ${transaction.type}`}>
            <div className="transaction-header">
              <div className="transaction-main">
                <span className={`transaction-type ${transaction.type}`}>
                  {transaction.type.toUpperCase()}
                </span>
                <span className="symbol">{transaction.symbol}</span>
              </div>
              <div className="transaction-amount">
                <span className={`total ${transaction.type === 'buy' ? 'negative' : 'positive'}`}>
                  {transaction.type === 'buy' ? '-' : '+'}{formatCurrency(transaction.total)}
                </span>
              </div>
            </div>
            
            <div className="transaction-details">
              <div className="detail-row">
                <span className="label">Quantity:</span>
                <span className="value">{transaction.quantity} shares</span>
              </div>
              <div className="detail-row">
                <span className="label">Price per share:</span>
                <span className="value">{formatCurrency(transaction.price)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Date:</span>
                <span className="value">{formatDate(transaction.date)}</span>
              </div>
            </div>
          </div>
        ))}
        
        {transactions.length > 10 && (
          <div className="transaction-footer">
            <p>Showing 10 most recent transactions</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
