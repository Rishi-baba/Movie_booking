import mongoose from 'mongoose';

const showSchema = new mongoose.Schema(
    {
        movieId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Movie',
            required: true,
        },
        theatreId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Theatre',
            required: true,
        },
        date: {
            type: Date,
            required: [true, 'Please add a show date'],
        },
        time: {
            type: String, 
            required: [true, 'Please add a show time'],
        },
        format: {
            type: String,
            required: true,
            default: '2D',
        },
        priceMultiplier: {
            type: Number,
            default: 1.0,
        },
        seatConfiguration: {
            rows: { type: Number, default: 10 },
            columns: { type: Number, default: 10 },
            bookedSeats: { type: [String], default: [] }
        }
    },
    {
        timestamps: true,
    }
);

const Show = mongoose.model('Show', showSchema);

export default Show;
