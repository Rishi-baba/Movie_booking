import express from 'express';
import { createMovie, getMovies, updateMovie, deleteMovie } from '../controllers/adminMovie.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { adminOnly } from '../middleware/admin.middleware.js';
import { uploadMovieImages } from '../middleware/upload.middleware.js';

const router = express.Router();

router.route('/')
    .post(protect, adminOnly, uploadMovieImages, createMovie)
    .get(protect, adminOnly, getMovies);

router.route('/:id')
    .put(protect, adminOnly, uploadMovieImages, updateMovie)
    .delete(protect, adminOnly, deleteMovie);

export default router;
