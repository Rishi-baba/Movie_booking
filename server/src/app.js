import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Route Imports
import authRoutes from './routes/auth.routes.js';
import movieRoutes from './routes/movie.routes.js';
import theatreRoutes from './routes/theatre.routes.js';
import showRoutes from './routes/show.routes.js';
import bookingRoutes from './routes/booking.routes.js';

// Admin Routes
import adminMovieRoutes from './routes/adminMovie.routes.js';
import adminTheatreRoutes from './routes/adminTheatre.routes.js';
import adminShowRoutes from './routes/adminShow.routes.js';

// Middleware Imports
import { errorHandler, notFound } from './middleware/error.middleware.js';

const app = express();

// Security Middlewares
app.use(helmet()); // Set security HTTP headers

// Global Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api', limiter);

// CORS Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
};
app.use(cors(corsOptions));

// Body parsing middlewares
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev')); // Request logging
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/theatres', theatreRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/bookings', bookingRoutes);

// Admin API Routes
app.use('/api/admin/movies', adminMovieRoutes);
app.use('/api/admin/theatres', adminTheatreRoutes);
app.use('/api/admin/shows', adminShowRoutes);

// Base route
app.get('/', (req, res) => {
    res.send('Movie Ticket Reservation API is running...');
});

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
