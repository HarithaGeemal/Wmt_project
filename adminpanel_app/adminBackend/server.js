// dotenv MUST be the very first import in ES modules —
// static imports are hoisted before module body code, so
// dotenv.config() calls mid-file are too late for other imports.
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';
import logger from './utils/logger.js';
import errorHandler from './middlewares/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import categoriesRoutes from './routes/categoriesRoutes.js';
import productsRoutes from './routes/productRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import { connectDB } from './config/db.js';

// Guard: catch missing critical env vars at startup
const REQUIRED_ENV = ['JWT_SECRET', 'DATABASE_URL'];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
    console.error(`[STARTUP ERROR] Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(helmet());
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again after 15 minutes'
}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Backend is running 🚀');
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoriesRoutes);
app.use('/api/v1/products', productsRoutes);
app.use('/api/v1/addresses', addressRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/feedbacks', feedbackRoutes);
app.use('/api/v1/driver', driverRoutes);



// Error handler MUST come AFTER routes
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server is running on http://0.0.0.0:${PORT} (LAN accessible)`);
});
