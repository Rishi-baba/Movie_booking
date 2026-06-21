import mongoose from 'mongoose';

const showSchema = new mongoose.Schema(
    {
        movieId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Movie',
            required: true,
            index: true,
        },
        theatreId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Theatre',
            required: true,
            index: true,
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
        price: {
            type: Number,
            required: true,
        },
        priceMultiplier: {
            type: Number,
            default: 1.0,
        },
        seatConfiguration: {
            rows: { type: Number, default: 13 },
            columns: { type: Number, default: 12 },
            bookedSeats: { type: [String], default: [] }
        },
        screenType: {
            type: String,
            enum: ['Curved', 'Plain'],
            default: 'Curved'
        }
    },
    {
        timestamps: true,
    }
);

const Show = mongoose.model('Show', showSchema);

export default Show;
