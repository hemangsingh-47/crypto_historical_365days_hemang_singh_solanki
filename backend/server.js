import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import coinRoutes from './routes/coinRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { logger } from './middlewares/loggerMiddleware.js';
import { rateLimiter } from './middlewares/rateLimitMiddleware.js';
import { errorHandler } from './middlewares/errorMiddleware.js';

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure Cross-Origin Resource Sharing (CORS)
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Register Custom IP-based Rate Limiter (Limit each IP to 250 requests per 15 minutes by default)
app.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 250 }));

// Body parser middleware (supports json and urlencoded)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register Custom Request Logger
app.use(logger);

// Health check / Welcome endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Crypto Market Analytics API is running successfully!',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// API Routes
app.use('/coins', coinRoutes);
app.use('/search', searchRoutes);
app.use('/auth', authRoutes);


// Fallback 404 handler (route not found)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Cannot find ${req.method} ${req.url} on this server`
  });
});

// Centralized Global Error Handler Middleware
app.use(errorHandler);

// Start the Express server
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
// Nodemon restart trigger
