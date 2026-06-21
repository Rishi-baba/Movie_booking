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
        banner: {
            url: { type: String },
            publicId: { type: String }
        },
        formats: {
            type: [String], // e.g., ['2D', '3D', 'IMAX']
            required: true,
            default: ['2D'],
        },
        genre: {
            type: [String],
            default: [],
        },
        releaseDate: {
            type: Date,
        },
        rating: {
            type: Number,
            default: 0,
        },
        certificate: {
            type: String,
            default: 'U/A',
        },
        status: {
            type: String,
            enum: ['Now Showing', 'Coming Soon'],
            default: 'Now Showing',
        },
        cast: {
            type: [{
                name: String,
                role: String,
                image: String
            }],
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
