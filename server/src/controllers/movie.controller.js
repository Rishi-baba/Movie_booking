import Movie from '../models/Movie.js';

/**
 * @desc    Get all movies
 * @route   GET /api/movies
 * @access  Public
 */
export const getMovies = async (req, res) => {
    try {
        const { status, page = 1, limit = 5 } = req.query;

        const query = {};
        if (status === 'Now Showing') {
            query.$or = [{ status: 'Now Showing' }, { status: { $exists: false } }];
        } else if (status) {
            query.status = status;
        }

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        const totalMovies = await Movie.countDocuments(query);
        const movies = await Movie.find(query)
            .sort('-releaseDate')
            .skip(skip)
            .limit(limitNum);

        res.json({
            movies,
            totalMovies,
            currentPage: pageNum,
            totalPages: Math.ceil(totalMovies / limitNum)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get movie by ID
 * @route   GET /api/movies/:id
 * @access  Public
 */
export const getMovieById = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);

        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        res.json(movie);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
