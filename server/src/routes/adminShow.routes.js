import express from 'express';
import { createShow, getShows, updateShow, deleteShow } from '../controllers/adminShow.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { adminOnly } from '../middleware/admin.middleware.js';

const router = express.Router();

router.route('/')
    .post(protect, adminOnly, createShow)
    .get(protect, adminOnly, getShows);

router.route('/:id')
    .put(protect, adminOnly, updateShow)
    .delete(protect, adminOnly, deleteShow);

export default router;
