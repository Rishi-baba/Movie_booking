import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please add a movie title'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Please add a description'],
        },
        poster: {
            url: { type: String, required: true },
            publicId: { type: String, required: true }
        },
        formats: {
            type: [String], // e.g., ['2D', '3D', 'IMAX']
            required: true,
            default: ['2D'],
        },
        cast: {
            type: [String], // Array of actor names
            default: [],
        },
        duration: {
            type: Number, // duration in minutes
            required: [true, 'Please add movie duration in minutes'],
        },
    },
    {
        timestamps: true,
    }
);

const Movie = mongoose.model('Movie', movieSchema);

export default Movie;
