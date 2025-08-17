import React from 'react';
import { Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Portfolio } from '../types';
import './PortfolioChart.css';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PortfolioChartProps {
  portfolio: Portfolio | null;
}

const PortfolioChart: React.FC<PortfolioChartProps> = ({ portfolio }) => {
  if (!portfolio || portfolio.stocks.length === 0) {
    return (
      <div className="portfolio-chart">
        <h2>Portfolio Allocation</h2>
        <div className="no-data">
          <p>Add stocks to see portfolio allocation</p>
        </div>
      </div>
    );
  }

  const colors = [
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#4BC0C0',
    '#9966FF',
    '#FF9F40',
    '#FF6384',
    '#C9CBCF',
    '#4BC0C0',
    '#FF6384'
  ];

  const data = {
    labels: portfolio.stocks.map(stock => stock.symbol),
    datasets: [
      {
        data: portfolio.stocks.map(stock => stock.totalValue),
        backgroundColor: colors.slice(0, portfolio.stocks.length),
        borderColor: colors.slice(0, portfolio.stocks.length).map(color => color + '80'),
        borderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: $${value.toLocaleString()} (${percentage}%)`;
          },
        },
      },
    },
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="portfolio-chart">
      <h2>Portfolio Allocation</h2>
      <div className="chart-container">
        <Doughnut data={data} options={options} />
      </div>
      <div className="allocation-list">
        {portfolio.stocks.map((stock, index) => {
          const percentage = ((stock.totalValue / portfolio.totalValue) * 100).toFixed(1);
          return (
            <div key={stock.symbol} className="allocation-item">
              <div 
                className="allocation-color" 
                style={{ backgroundColor: colors[index] }}
              ></div>
              <span className="symbol">{stock.symbol}</span>
              <span className="percentage">{percentage}%</span>
              <span className="value">{formatCurrency(stock.totalValue)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PortfolioChart;
