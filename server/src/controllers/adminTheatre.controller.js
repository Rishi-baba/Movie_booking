import Theatre from '../models/Theatre.js';

/**
 * @desc    Create a new theatre
 * @route   POST /api/admin/theatres
 * @access  Private/Admin
 */
export const createTheatre = async (req, res) => {
    try {
        const { name, location, basePrice } = req.body;

        if (!name || !location || !basePrice) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const theatre = await Theatre.create({
            name,
            location,
            basePrice
        });

        res.status(201).json(theatre);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get all theatres
 * @route   GET /api/admin/theatres
 * @access  Private/Admin
 */
export const getTheatres = async (req, res) => {
    try {
        const theatres = await Theatre.find({}).sort('-createdAt');
        res.json(theatres);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Update theatre
 * @route   PUT /api/admin/theatres/:id
 * @access  Private/Admin
 */
export const updateTheatre = async (req, res) => {
    try {
        const theatre = await Theatre.findById(req.params.id);

        if (!theatre) {
            return res.status(404).json({ message: 'Theatre not found' });
        }

        const { name, location, basePrice } = req.body;

        if (name) theatre.name = name;
        if (location) theatre.location = location;
        if (basePrice) theatre.basePrice = basePrice;

        const updatedTheatre = await theatre.save();
        res.json(updatedTheatre);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Delete theatre
 * @route   DELETE /api/admin/theatres/:id
 * @access  Private/Admin
 */
export const deleteTheatre = async (req, res) => {
    try {
        const theatre = await Theatre.findByIdAndDelete(req.params.id);

        if (!theatre) {
            return res.status(404).json({ message: 'Theatre not found' });
        }

        res.json({ message: 'Theatre removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
