import Movie from '../models/Movie.js';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

// Helper to upload to Cloudinary using buffer
const streamUpload = (file) => {
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
        streamifier.createReadStream(file.buffer).pipe(stream);
    });
};

/**
 * @desc    Create a new movie
 * @route   POST /api/admin/movies
 * @access  Private/Admin
 */
export const createMovie = async (req, res) => {
    try {
        const { title, description, duration, formats, cast, genre, releaseDate, rating, certificate, status } = req.body;

        if (!req.files || !req.files.poster) {
            return res.status(400).json({ message: 'Movie poster image is required' });
        }

        // Upload to cloudinary
        const posterResult = await streamUpload(req.files.poster[0]);
        let bannerResult = null;
        if (req.files.banner) {
            bannerResult = await streamUpload(req.files.banner[0]);
        }

        // Parse formats and cast which might come as JSON strings from FormData
        let parsedFormats = formats;
        let parsedCast = cast;
        let parsedGenre = genre;
        
        if (typeof formats === 'string') {
            try { parsedFormats = JSON.parse(formats); }
            catch { parsedFormats = formats.split(',').map(f => f.trim()); }
        }
        
        if (typeof cast === 'string') {
            try { parsedCast = JSON.parse(cast); }
            catch { parsedCast = cast.split(',').map(c => ({ name: c.trim(), role: 'Actor', image: '' })); }
        }
        
        if (typeof genre === 'string') {
            try { parsedGenre = JSON.parse(genre); }
            catch { parsedGenre = genre.split(',').map(g => g.trim()); }
        }

        const movieData = {
            title,
            description,
            duration,
            formats: parsedFormats || ['2D'],
            genre: parsedGenre || [],
            releaseDate: releaseDate || Date.now(),
            rating: Number(rating) || 0,
            certificate: certificate || 'U/A',
            status: status || 'Now Showing',
            cast: parsedCast || [],
            poster: {
                url: posterResult.secure_url,
                publicId: posterResult.public_id,
            }
        };

        if (bannerResult) {
            movieData.banner = {
                url: bannerResult.secure_url,
                publicId: bannerResult.public_id,
            };
        }

        const movie = await Movie.create(movieData);

        // Auto-generate shows in all theatres for the next 7 days
        try {
            const Theatre = (await import('../models/Theatre.js')).default;
            const Show = (await import('../models/Show.js')).default;
            const theatres = await Theatre.find({});
            const showsToCreate = [];
            const today = new Date();
            
            for (const theatre of theatres) {
                for (let i = 0; i < 7; i++) {
                    const showDate = new Date(today);
                    showDate.setDate(today.getDate() + i);
                    showDate.setHours(0, 0, 0, 0);

                    const basePrice = theatre.basePrice || 250;
                    const format = parsedFormats && parsedFormats.length > 0 ? parsedFormats[0] : '2D';

                    showsToCreate.push({
                        movieId: movie._id,
                        theatreId: theatre._id,
                        date: showDate,
                        time: '10:00 AM',
                        format: format,
                        price: basePrice,
                        priceMultiplier: 1.0,
                        seatConfiguration: { rows: 10, columns: 10, bookedSeats: [] }
                    });
                    showsToCreate.push({
                        movieId: movie._id,
                        theatreId: theatre._id,
                        date: showDate,
                        time: '02:00 PM',
                        format: format,
                        price: basePrice,
                        priceMultiplier: 1.0,
                        seatConfiguration: { rows: 10, columns: 10, bookedSeats: [] }
                    });
                    showsToCreate.push({
                        movieId: movie._id,
                        theatreId: theatre._id,
                        date: showDate,
                        time: '06:00 PM',
                        format: format,
                        price: basePrice * 1.2,
                        priceMultiplier: 1.2,
                        seatConfiguration: { rows: 10, columns: 10, bookedSeats: [] }
                    });
                }
            }
            if (showsToCreate.length > 0) {
                await Show.insertMany(showsToCreate);
            }
        } catch (showError) {
            console.error('Error auto-creating shows:', showError);
        }

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

        const { title, description, duration, formats, cast, genre, releaseDate, rating, certificate, status } = req.body;

        let parsedFormats = formats;
        let parsedCast = cast;
        let parsedGenre = genre;

        if (formats) {
            try { parsedFormats = typeof formats === 'string' ? JSON.parse(formats) : formats; } 
            catch { parsedFormats = formats.split(',').map(f => f.trim()); }
        }
        if (cast) {
            try { parsedCast = typeof cast === 'string' ? JSON.parse(cast) : cast; }
            catch { parsedCast = cast.split(',').map(c => ({ name: c.trim(), role: 'Actor', image: '' })); }
        }
        if (genre) {
            try { parsedGenre = typeof genre === 'string' ? JSON.parse(genre) : genre; }
            catch { parsedGenre = genre.split(',').map(g => g.trim()); }
        }

        // Handle possible poster update
        if (req.files && req.files.poster) {
            // Delete old poster from Cloudinary
            if (movie.poster && movie.poster.publicId) {
                await cloudinary.uploader.destroy(movie.poster.publicId);
            }
            // Upload new poster
            const result = await streamUpload(req.files.poster[0]);
            movie.poster = {
                url: result.secure_url,
                publicId: result.public_id
            };
        }

        // Handle possible banner update
        if (req.files && req.files.banner) {
            // Delete old banner from Cloudinary
            if (movie.banner && movie.banner.publicId) {
                await cloudinary.uploader.destroy(movie.banner.publicId);
            }
            // Upload new banner
            const result = await streamUpload(req.files.banner[0]);
            movie.banner = {
                url: result.secure_url,
                publicId: result.public_id
            };
        }

        if (title) movie.title = title;
        if (description) movie.description = description;
        if (duration) movie.duration = duration;
        if (parsedFormats) movie.formats = parsedFormats;
        if (parsedCast) movie.cast = parsedCast;
        if (parsedGenre) movie.genre = parsedGenre;
        if (releaseDate) movie.releaseDate = releaseDate;
        if (rating !== undefined) movie.rating = Number(rating);
        if (certificate) movie.certificate = certificate;
        if (status) movie.status = status;

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
