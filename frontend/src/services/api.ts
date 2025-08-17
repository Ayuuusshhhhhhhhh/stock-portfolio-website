import axios from 'axios';
import { User, Portfolio, Transaction, Stock, StockSearchResult, ApiResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (name: string, email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },

  verifyToken: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/auth/verify');
    return response.data;
  },
};

export const portfolioAPI = {
  getPortfolio: async (): Promise<ApiResponse<Portfolio>> => {
    const response = await api.get('/portfolio');
    return response.data;
  },

  addStock: async (symbol: string, quantity: number, price: number): Promise<ApiResponse<Transaction>> => {
    const response = await api.post('/portfolio/add-stock', { symbol, quantity, price });
    return response.data;
  },

  removeStock: async (symbol: string, quantity: number, price: number): Promise<ApiResponse<Transaction>> => {
    const response = await api.post('/portfolio/remove-stock', { symbol, quantity, price });
    return response.data;
  },

  getTransactions: async (): Promise<ApiResponse<Transaction[]>> => {
    const response = await api.get('/portfolio/transactions');
    return response.data;
  },
};

export const stockAPI = {
  searchStocks: async (query: string): Promise<ApiResponse<StockSearchResult[]>> => {
    const response = await api.get(`/stocks/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  getStockPrice: async (symbol: string): Promise<ApiResponse<Stock>> => {
    const response = await api.get(`/stocks/quote/${symbol}`);
    return response.data;
  },

  getMultipleStockPrices: async (symbols: string[]): Promise<ApiResponse<Stock[]>> => {
    const response = await api.post('/stocks/quotes', { symbols });
    return response.data;
  },

  getStockHistory: async (symbol: string, period: string = '1M'): Promise<ApiResponse<any[]>> => {
    const response = await api.get(`/stocks/history/${symbol}?period=${period}`);
    return response.data;
  },
};

export default api;
