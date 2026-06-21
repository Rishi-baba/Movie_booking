import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';
import redisClient from './config/redis.js';

import { seedAdmin } from './utils/seedAdmin.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB().then(() => {
    seedAdmin();
});

// Connect to Redis
(async () => {
    try {
        await redisClient.connect();
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
    }
})();

const PORT = process.env.PORT || 5000;

// Only start the server locally. On Vercel, it acts as a serverless function!
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    const server = app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err, promise) => {
        console.log(`Error: ${err.message}`);
        // Close server & exit process
        server.close(() => process.exit(1));
    });
}

// Export the app for Vercel serverless deployment
export default app;
