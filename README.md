<img width="1919" height="717" alt="image" src="https://github.com/user-attachments/assets/83aa5968-e4e0-478d-acf2-65dd52f27fe2" />

<img width="1918" height="927" alt="image" src="https://github.com/user-attachments/assets/b7216cf9-39bd-493e-8f93-96ce3fc04da0" />

<img width="1916" height="926" alt="image" src="https://github.com/user-attachments/assets/a71ae3fe-c361-42f1-97a1-7482761b83fc" />

<img width="1918" height="925" alt="image" src="https://github.com/user-attachments/assets/09b2f7b8-de8e-494c-a8b8-d8cf946fd761" />

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
