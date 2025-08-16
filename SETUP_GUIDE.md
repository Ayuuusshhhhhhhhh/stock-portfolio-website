# Stock Portfolio Website - Setup Guide

## Overview
This is a full-stack stock portfolio management website built with React (frontend) and Node.js/Express (backend), featuring real-time stock data, portfolio tracking, and analytics.

## Prerequisites

### Required Software
- **Node.js** (version 16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** - [Download here](https://www.mongodb.com/try/download/community) or use MongoDB Atlas (cloud)
- **Git** - [Download here](https://git-scm.com/)
- **Redis** (optional, for caching) - [Download here](https://redis.io/download)

### API Keys Required
- **Alpha Vantage API Key** (free) - [Get it here](https://www.alphavantage.co/support/#api-key)

## Installation & Setup

### 1. Clone and Setup Project
```bash
# Navigate to the project directory
cd stock-portfolio-website

# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Environment Configuration

#### Frontend Environment (.env)
```bash
# In /frontend/.env
REACT_APP_API_URL=http://localhost:5000/api
```

#### Backend Environment (.env)
```bash
# In /backend/.env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/stockportfolio
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Alpha Vantage API (Get your free key)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get connection string and update `MONGODB_URI` in backend/.env

### 4. API Key Setup
1. Get free Alpha Vantage API key: https://www.alphavantage.co/support/#api-key
2. Replace `ALPHA_VANTAGE_API_KEY` in backend/.env with your actual key

## Running the Application

### Development Mode

#### Option 1: Run Both Services Simultaneously
```bash
# From the root directory
npm run dev
```

#### Option 2: Run Services Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Production Mode
```bash
# Build frontend
cd frontend
npm run build

# Start backend
cd ../backend
npm start
```

## Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## Features Available

### ✅ Completed Features
1. **User Authentication**
   - User registration and login
   - JWT-based authentication
   - Protected routes

2. **Modern React Frontend**
   - Responsive design
   - Component-based architecture
   - Context-based state management
   - React Router for navigation

3. **Express.js Backend**
   - RESTful API design
   - MongoDB integration
   - Security middleware (Helmet, CORS, Rate limiting)
   - Error handling

4. **Database Models**
   - User model with encrypted passwords
   - Transaction model for stock trades
   - MongoDB with Mongoose ODM

### 🚧 In Progress Features
1. **Stock Market Integration**
   - Alpha Vantage API integration
   - Real-time stock price fetching
   - Stock search functionality

2. **Portfolio Management**
   - Buy/sell stock transactions
   - Portfolio performance tracking
   - Real-time portfolio value calculation

3. **Dashboard & Analytics**
   - Portfolio allocation charts
   - Performance metrics
   - Transaction history
   - Interactive charts with Chart.js

4. **Caching & Optimization**
   - Redis caching for API calls
   - Performance optimizations

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in .env
   - Verify network connectivity for Atlas

2. **Port Already in Use**
   - Change PORT in backend/.env
   - Kill processes using the ports:
     ```bash
     # Windows
     netstat -ano | findstr :5000
     taskkill /PID <PID> /F
     
     # macOS/Linux
     lsof -ti:5000 | xargs kill -9
     ```

3. **API Key Issues**
   - Verify Alpha Vantage API key is correct
   - Check API rate limits (5 requests/minute for free tier)

4. **Dependencies Issues**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

## Next Steps

### To Complete the Application:
1. **Stock Market Integration** - Add remaining API endpoints for stock data
2. **Portfolio Features** - Complete buy/sell functionality
3. **Dashboard Charts** - Implement Chart.js visualizations
4. **Testing** - Add unit and integration tests
5. **Deployment** - Deploy to production (Vercel + Heroku/AWS)

### Recommended Development Order:
1. Test user authentication (register/login)
2. Add stock market API integration
3. Implement portfolio CRUD operations
4. Build dashboard with charts
5. Add caching layer
6. Optimize and deploy

## Support
For issues or questions:
1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Ensure all services (MongoDB, Redis) are running
4. Check console logs for error messages

## Security Notes
- Never commit .env files to version control
- Use strong JWT secrets in production
- Enable MongoDB authentication in production
- Use HTTPS in production
- Set appropriate CORS origins for production
