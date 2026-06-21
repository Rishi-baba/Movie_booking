import express from 'express';
import { getTheatres, getTheatreById } from '../controllers/theatre.controller.js';

const router = express.Router();

router.route('/')
    .get(getTheatres);

router.route('/:id')
    .get(getTheatreById);

export default router;
