import Theatre from '../models/Theatre.js';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

const streamUpload = (req) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'theatres' },
            (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
};

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

        let logoData = {};
        if (req.file) {
            const result = await streamUpload(req);
            logoData = {
                url: result.secure_url,
                publicId: result.public_id,
            };
        }

        const theatre = await Theatre.create({
            name,
            location,
            basePrice,
            logo: logoData,
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

        if (req.file) {
            if (theatre.logo && theatre.logo.publicId) {
                await cloudinary.uploader.destroy(theatre.logo.publicId);
            }
            const result = await streamUpload(req);
            theatre.logo = {
                url: result.secure_url,
                publicId: result.public_id
            };
        }

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
        const theatre = await Theatre.findById(req.params.id);

        if (!theatre) {
            return res.status(404).json({ message: 'Theatre not found' });
        }

        if (theatre.logo && theatre.logo.publicId) {
            await cloudinary.uploader.destroy(theatre.logo.publicId);
        }

        await theatre.deleteOne();

        res.json({ message: 'Theatre removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
