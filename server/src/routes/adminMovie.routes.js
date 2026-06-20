import express from 'express';
import { createMovie, getMovies, updateMovie, deleteMovie } from '../controllers/adminMovie.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { adminOnly } from '../middleware/admin.middleware.js';
import { uploadPoster } from '../middleware/upload.middleware.js';

const router = express.Router();

router.route('/')
    .post(protect, adminOnly, uploadPoster, createMovie)
    .get(protect, adminOnly, getMovies);

router.route('/:id')
    .put(protect, adminOnly, uploadPoster, updateMovie)
    .delete(protect, adminOnly, deleteMovie);

export default router;
