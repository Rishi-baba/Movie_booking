import Theatre from '../models/Theatre.js';

/**
 * @desc    Get all theatres
 * @route   GET /api/theatres
 * @access  Public
 */
export const getTheatres = async (req, res) => {
    try {
        const theatres = await Theatre.find({});
        res.json(theatres);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get theatre by ID
 * @route   GET /api/theatres/:id
 * @access  Public
 */
export const getTheatreById = async (req, res) => {
    try {
        const theatre = await Theatre.findById(req.params.id);

        if (!theatre) {
            return res.status(404).json({ message: 'Theatre not found' });
        }

        res.json(theatre);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
