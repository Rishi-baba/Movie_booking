import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
    {
        bookingReference: {
            type: String,
            unique: true,
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
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
        showId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Show',
            required: true,
            index: true,
        },
        seats: {
            type: [String], // e.g., ["A1", "A2"]
            required: [true, 'Please provide seat numbers'],
        },
        ticketCost: {
            type: Number,
            required: true,
        },
        bookingFee: {
            type: Number,
            required: true,
            default: 20,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        bookingStatus: {
            type: String,
            enum: ['pending', 'confirmed', 'cancelled'],
            default: 'pending',
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'success', 'failed'],
            default: 'pending',
        },
        bookingReference: {
            type: String,
            unique: true,
        },
        bookingDate: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Auto-generate unique booking reference
bookingSchema.pre('save', function (next) {
    if (!this.bookingReference) {
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.bookingReference = `BK-${dateStr}-${randomStr}`;
    }
    next();
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
