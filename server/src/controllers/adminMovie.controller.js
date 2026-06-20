import Movie from '../models/Movie.js';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

// Helper to upload to Cloudinary using buffer
const streamUpload = (req) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'movies' },
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
 * @desc    Create a new movie
 * @route   POST /api/admin/movies
 * @access  Private/Admin
 */
export const createMovie = async (req, res) => {
    try {
        const { title, description, duration, formats, cast } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Movie poster image is required' });
        }

        // Upload to cloudinary
        const result = await streamUpload(req);

        // Parse formats and cast which might come as JSON strings from FormData
        let parsedFormats = formats;
        let parsedCast = cast;
        try {
            if (typeof formats === 'string') parsedFormats = JSON.parse(formats);
            if (typeof cast === 'string') parsedCast = JSON.parse(cast);
        } catch (err) {
            // fallback if it's just a comma separated string
            if (typeof formats === 'string') parsedFormats = formats.split(',').map(f => f.trim());
            if (typeof cast === 'string') parsedCast = cast.split(',').map(c => c.trim());
        }

        const movie = await Movie.create({
            title,
            description,
            duration,
            formats: parsedFormats || ['2D'],
            cast: parsedCast || [],
            poster: {
                url: result.secure_url,
                publicId: result.public_id,
            }
        });

        res.status(201).json(movie);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get all movies
 * @route   GET /api/admin/movies
 * @access  Private/Admin
 */
export const getMovies = async (req, res) => {
    try {
        const movies = await Movie.find({}).sort('-createdAt');
        res.json(movies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Update movie details
 * @route   PUT /api/admin/movies/:id
 * @access  Private/Admin
 */
export const updateMovie = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);

        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        const { title, description, duration, formats, cast } = req.body;

        let parsedFormats = formats;
        let parsedCast = cast;
        if (formats) {
            try { parsedFormats = typeof formats === 'string' ? JSON.parse(formats) : formats; } 
            catch { parsedFormats = formats.split(',').map(f => f.trim()); }
        }
        if (cast) {
            try { parsedCast = typeof cast === 'string' ? JSON.parse(cast) : cast; }
            catch { parsedCast = cast.split(',').map(c => c.trim()); }
        }

        // Handle possible poster update
        if (req.file) {
            // Delete old poster from Cloudinary
            if (movie.poster && movie.poster.publicId) {
                await cloudinary.uploader.destroy(movie.poster.publicId);
            }
            // Upload new poster
            const result = await streamUpload(req);
            movie.poster = {
                url: result.secure_url,
                publicId: result.public_id
            };
        }

        if (title) movie.title = title;
        if (description) movie.description = description;
        if (duration) movie.duration = duration;
        if (parsedFormats) movie.formats = parsedFormats;
        if (parsedCast) movie.cast = parsedCast;

        const updatedMovie = await movie.save();
        res.json(updatedMovie);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Delete movie
 * @route   DELETE /api/admin/movies/:id
 * @access  Private/Admin
 */
export const deleteMovie = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);

        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        // Delete from Cloudinary
        if (movie.poster && movie.poster.publicId) {
            await cloudinary.uploader.destroy(movie.poster.publicId);
        }

        await movie.deleteOne();

        res.json({ message: 'Movie removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
