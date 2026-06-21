import mongoose from 'mongoose';

const theatreSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a theatre name'],
            trim: true,
        },
        location: {
            type: String,
            required: [true, 'Please add a location'],
            trim: true,
        },
        basePrice: {
            type: Number,
            required: [true, 'Please add a base ticket price'],
        },
        screens: {
            type: Number,
            default: 1,
        },
        logo: {
            url: { type: String },
            publicId: { type: String }
        },
    },
    {
        timestamps: true,
    }
);

const Theatre = mongoose.model('Theatre', theatreSchema);

export default Theatre;
