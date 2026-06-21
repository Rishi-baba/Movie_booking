import express from 'express';
import { 
    createBooking,
    lockSeats,
    getUserBookings, 
    getBookingById, 
    cancelBooking 
} from '../controllers/booking.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/lock', protect, lockSeats);

router.route('/')
    .post(protect, createBooking)
    .get(protect, getUserBookings);

router.route('/:id')
    .get(protect, getBookingById);

router.route('/:id/cancel')
    .put(protect, cancelBooking);

export default router;
