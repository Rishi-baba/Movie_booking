import Show from '../models/Show.js';

/**
 * @desc    Get all shows (with optional movieId or theatreId query params)
 * @route   GET /api/shows
 * @access  Public
 */
export const getShows = async (req, res) => {
    try {
        const { movieId, theatreId, date } = req.query;
        
        // Build query object
        const query = {};
        if (movieId) query.movieId = movieId;
        if (theatreId) query.theatreId = theatreId;
        if (date) query.date = date; // Expecting YYYY-MM-DD

        const shows = await Show.find(query)
            .populate('movieId', 'title poster duration genre format')
            .populate('theatreId', 'name location basePrice')
            .sort('date time');
            
        res.json(shows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

import redisClient from '../config/redis.js';

/**
 * @desc    Get show by ID
 * @route   GET /api/shows/:id
 * @access  Public
 */
export const getShowById = async (req, res) => {
    try {
        const show = await Show.findById(req.params.id)
            .populate('movieId', 'title poster duration format genre releaseDate')
            .populate('theatreId', 'name location basePrice');

        if (!show) {
            return res.status(404).json({ message: 'Show not found' });
        }

        // Find currently locked seats from Redis
        let lockedSeats = [];
        try {
            const keys = await redisClient.keys(`seat_lock:${show._id}:*`);
            lockedSeats = keys.map(key => key.split(':').pop());
        } catch (err) {
            console.error('Failed to fetch locked seats from Redis', err);
        }

        // Append lockedSeats to the response
        const showData = show.toObject();
        showData.lockedSeats = lockedSeats;

        res.json(showData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get show seat configuration
 * @route   GET /api/shows/:id/seats
 * @access  Public
 */
export const getShowSeats = async (req, res) => {
    try {
        const show = await Show.findById(req.params.id);

        if (!show) {
            return res.status(404).json({ message: 'Show not found' });
        }

        // Find currently locked seats from Redis
        let lockedSeats = [];
        try {
            const keys = await redisClient.keys(`seat_lock:${show._id}:*`);
            lockedSeats = keys.map(key => key.split(':').pop());
        } catch (err) {
            console.error('Failed to fetch locked seats from Redis', err);
        }

        res.json({
            rows: show.seatConfiguration.rows,
            columns: show.seatConfiguration.columns,
            bookedSeats: show.seatConfiguration.bookedSeats,
            lockedSeats: lockedSeats,
            screenType: show.screenType || 'Curved'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
