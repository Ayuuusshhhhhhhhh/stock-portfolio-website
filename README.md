<img width="1918" height="928" alt="g1" src="https://github.com/user-attachments/assets/47794356-b9e5-4d5b-8372-58b11987390d" />

<img width="1918" height="927" alt="g2" src="https://github.com/user-attachments/assets/c466bf94-990a-453c-b9ab-4c3c360aeb52" />

<img width="1918" height="930" alt="g3" src="https://github.com/user-attachments/assets/87f9d42c-385c-4b3f-aee8-e141e78a948d" />

<img width="1918" height="925" alt="g4" src="https://github.com/user-attachments/assets/89d9ef81-51c8-4d33-90b7-d2c1a5a303c1" />

# Stock Portfolio Website

A full-stack web application for managing and tracking stock portfolios with real-time data.

## Features

- User authentication (JWT-based)
- Real-time stock data integration
- Portfolio management and tracking
- Performance analytics and visualization
- Interactive dashboard with charts
- Transaction history
- Caching for optimized performance

## Tech Stack

**Frontend:**
- React.js
- React Router
- Chart.js for data visualization
- Axios for API calls
- CSS Modules for styling

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Redis for caching
- Alpha Vantage API for stock data

## Project Structure

```
stock-portfolio-website/
├── frontend/           # React frontend application
├── backend/            # Express.js backend API
├── README.md          # Project documentation
└── package.json       # Root package.json for scripts
```

## Quick Start

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install-all
   ```
3. Set up environment variables (see .env.example files)
4. Start the development servers:
   ```bash
   npm run dev
   ```

## Environment Variables

Create `.env` files in both frontend and backend directories. See `.env.example` files for required variables.

## API Integration

This project uses Alpha Vantage API for stock market data. Get your free API key at: https://www.alphavantage.co/support/#api-key

## Deployment

- Frontend: Vercel/Netlify
- Backend: AWS/Heroku
- Database: MongoDB Atlas
- Cache: Redis Cloud

## License

MIT License
