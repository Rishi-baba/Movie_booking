import express from 'express';
import { getShows, getShowById, getShowSeats } from '../controllers/show.controller.js';

const router = express.Router();

router.route('/')
    .get(getShows);

router.route('/:id/seats')
    .get(getShowSeats);

router.route('/:id')
    .get(getShowById);

export default router;
