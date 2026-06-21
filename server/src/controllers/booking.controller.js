import Booking from '../models/Booking.js';
import Show from '../models/Show.js';
import redisClient from '../config/redis.js';

/**
 * @desc    Lock seats temporarily during selection
 * @route   POST /api/bookings/lock
 * @access  Private
 */
export const lockSeats = async (req, res) => {
    let lockedSeats = [];
    const { showId, seats } = req.body;

    try {
        if (!showId || !seats || !Array.isArray(seats) || seats.length === 0) {
            return res.status(400).json({ message: 'Please provide a valid show ID and an array of seats' });
        }

        const show = await Show.findById(showId);
        if (!show) {
            return res.status(404).json({ message: 'Show not found' });
        }

        // Check if already booked
        const alreadyBooked = seats.some((seat) => show.seatConfiguration.bookedSeats.includes(seat));
        if (alreadyBooked) {
            return res.status(400).json({ message: 'One or more selected seats are already booked' });
        }

        // --- REDIS SEAT LOCKING (120s) ---
        const LOCK_TTL = 120;
        for (const seat of seats) {
            const lockKey = `seat_lock:${showId}:${seat}`;
            const lockData = JSON.stringify({ userId: req.user._id, lockedAt: new Date().toISOString() });
            
            const acquired = await redisClient.set(lockKey, lockData, {
                NX: true,
                EX: LOCK_TTL
            });
            
            if (!acquired) {
                throw new Error('SeatLockConflict');
            }
            lockedSeats.push(lockKey);
        }

        res.status(200).json({ message: 'Seats locked successfully' });
    } catch (error) {
        if (error.message === 'SeatLockConflict') {
            // Rollback any seats we managed to lock in this partial attempt
            for (const lockKey of lockedSeats) {
                try {
                    await redisClient.del(lockKey);
                } catch (err) {
                    console.error(`Failed to release lock for ${lockKey}`, err);
                }
            }
            res.status(409).json({ message: 'One or more seats have just been taken by someone else.' });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
};

/**
 * @desc    Create a new booking
 * @route   POST /api/bookings
 * @access  Private
 */
export const createBooking = async (req, res) => {
    const { showId, seats, cardNumber } = req.body;

    try {
        if (!showId || !seats || !Array.isArray(seats) || seats.length === 0) {
            return res.status(400).json({ message: 'Please provide a valid show ID and an array of seats' });
        }

        const show = await Show.findById(showId);

        if (!show) {
            return res.status(404).json({ message: 'Show not found' });
        }

        // Validate seat format strictly (e.g. A1, B12)
        const seatRegex = /^[A-Z][0-9]{1,2}$/;
        for (const seat of seats) {
            if (!seatRegex.test(seat)) {
                return res.status(400).json({ message: `Invalid seat format: ${seat}` });
            }
        }

        // Check for duplicates in the request array
        const uniqueSeats = [...new Set(seats)];
        if (uniqueSeats.length !== seats.length) {
            return res.status(400).json({ message: 'Duplicate seats found in request' });
        }

        // Check if seats are already booked in DB
        const alreadyBooked = seats.some((seat) => show.seatConfiguration.bookedSeats.includes(seat));
        if (alreadyBooked) {
            return res.status(400).json({ message: 'One or more selected seats are already booked' });
        }

        // --- VERIFY REDIS LOCKS ---
        // Ensure the current user holds the lock for these seats
        for (const seat of seats) {
            const lockKey = `seat_lock:${showId}:${seat}`;
            const lockDataStr = await redisClient.get(lockKey);
            
            if (lockDataStr) {
                const lockData = JSON.parse(lockDataStr);
                if (lockData.userId !== req.user._id.toString()) {
                    throw new Error('SeatLockConflict'); // Locked by someone else
                }
            } else {
                // Lock expired or never existed. We'll attempt a late SETNX lock just to be safe.
                const lockData = JSON.stringify({ userId: req.user._id, lockedAt: new Date().toISOString() });
                const acquired = await redisClient.set(lockKey, lockData, { NX: true, EX: 120 });
                if (!acquired) {
                    throw new Error('SeatLockConflict');
                }
            }
        }

        // --- MOCK PAYMENT PROCESSING ---
        if (!cardNumber) {
            throw new Error('PaymentFailed'); // Requires card number
        }
        if (cardNumber.endsWith('0000')) {
            throw new Error('PaymentRejected'); // Simulate rejection
        }

        // Calculate total price on the server
        const ticketCost = show.price * seats.length;
        const bookingFee = 20; // Fixed booking fee
        const totalAmount = ticketCost + bookingFee;

        // Generate Booking Reference
        const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, '');
        const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
        const bookingReference = `BK-${dateStr}-${randomStr}`;

        // Add seats to show
        show.seatConfiguration.bookedSeats.push(...seats);
        await show.save();

        // Create booking
        const booking = await Booking.create({
            bookingReference,
            userId: req.user._id,
            movieId: show.movieId,
            theatreId: show.theatreId,
            showId: show._id,
            seats,
            ticketCost,
            bookingFee,
            totalAmount,
            bookingStatus: 'confirmed',
        });

        res.status(201).json(booking);
        
        // --- CLEANUP LOCKS AFTER SUCCESS ---
        for (const seat of seats) {
            try {
                await redisClient.del(`seat_lock:${showId}:${seat}`);
            } catch (err) {
                console.error(`Failed to release lock after booking for seat_lock:${showId}:${seat}`, err);
            }
        }
    } catch (error) {
        if (error.message === 'SeatLockConflict') {
            res.status(409).json({ message: 'One or more seats are currently locked by another user. Please try again.' });
        } else if (error.message === 'PaymentFailed') {
            res.status(400).json({ message: 'Payment failed: Missing payment details.' });
        } else if (error.message === 'PaymentRejected') {
            res.status(400).json({ message: 'Payment rejected by gateway.' });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
};

/**
 * @desc    Get user bookings
 * @route   GET /api/bookings
 * @access  Private
 */
export const getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user._id })
            .populate('movieId', 'title poster format')
            .populate('theatreId', 'name location')
            .populate('showId', 'date time format')
            .sort('-createdAt');

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get single booking
 * @route   GET /api/bookings/:id
 * @access  Private
 */
export const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('movieId', 'title poster format')
            .populate('theatreId', 'name location')
            .populate('showId', 'date time format');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Verify booking belongs to user
        if (booking.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to access this booking' });
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Cancel booking
 * @route   PUT /api/bookings/:id/cancel
 * @access  Private
 */
export const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Verify booking belongs to user
        if (booking.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to modify this booking' });
        }

        if (booking.bookingStatus === 'cancelled') {
            return res.status(400).json({ message: 'Booking is already cancelled' });
        }

        // Remove seats from show.bookedSeats
        const show = await Show.findById(booking.showId);
        if (show) {
            show.seatConfiguration.bookedSeats = show.seatConfiguration.bookedSeats.filter(
                (seat) => !booking.seats.includes(seat)
            );
            await show.save();
        }

        booking.bookingStatus = 'cancelled';
        await booking.save();

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
