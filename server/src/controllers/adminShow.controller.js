import Show from '../models/Show.js';

/**
 * @desc    Create a new show
 * @route   POST /api/admin/shows
 * @access  Private/Admin
 */
export const createShow = async (req, res) => {
    try {
        const { movieId, theatreId, date, time, format, priceMultiplier, seatConfiguration } = req.body;

        if (!movieId || !theatreId || !date || !time) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Parse seat configuration if provided as a string
        let parsedSeatConfig = seatConfiguration;
        if (typeof seatConfiguration === 'string') {
            try {
                parsedSeatConfig = JSON.parse(seatConfiguration);
            } catch (err) {
                return res.status(400).json({ message: 'Invalid seat configuration format' });
            }
        }

        const show = await Show.create({
            movieId,
            theatreId,
            date,
            time,
            format: format || '2D',
            priceMultiplier: priceMultiplier || 1.0,
            seatConfiguration: parsedSeatConfig || { rows: 10, columns: 10, bookedSeats: [] }
        });

        res.status(201).json(show);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get all shows
 * @route   GET /api/admin/shows
 * @access  Private/Admin
 */
export const getShows = async (req, res) => {
    try {
        const shows = await Show.find({})
            .populate('movieId', 'title poster')
            .populate('theatreId', 'name location')
            .sort('-createdAt');
        res.json(shows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Update show
 * @route   PUT /api/admin/shows/:id
 * @access  Private/Admin
 */
export const updateShow = async (req, res) => {
    try {
        const show = await Show.findById(req.params.id);

        if (!show) {
            return res.status(404).json({ message: 'Show not found' });
        }

        const { movieId, theatreId, date, time, format, priceMultiplier, seatConfiguration } = req.body;

        if (movieId) show.movieId = movieId;
        if (theatreId) show.theatreId = theatreId;
        if (date) show.date = date;
        if (time) show.time = time;
        if (format) show.format = format;
        if (priceMultiplier) show.priceMultiplier = priceMultiplier;
        
        if (seatConfiguration) {
            let parsedSeatConfig = seatConfiguration;
            if (typeof seatConfiguration === 'string') {
                try { parsedSeatConfig = JSON.parse(seatConfiguration); } 
                catch (err) { return res.status(400).json({ message: 'Invalid seat configuration format' }); }
            }
            show.seatConfiguration = parsedSeatConfig;
        }

        const updatedShow = await show.save();
        res.json(updatedShow);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Delete show
 * @route   DELETE /api/admin/shows/:id
 * @access  Private/Admin
 */
export const deleteShow = async (req, res) => {
    try {
        const show = await Show.findByIdAndDelete(req.params.id);

        if (!show) {
            return res.status(404).json({ message: 'Show not found' });
        }

        res.json({ message: 'Show removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
