import express from 'express';
import { createTheatre, getTheatres, updateTheatre, deleteTheatre } from '../controllers/adminTheatre.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { adminOnly } from '../middleware/admin.middleware.js';
import { upload } from '../config/multer.js';

const router = express.Router();

router.route('/')
    .post(protect, adminOnly, upload.single('logo'), createTheatre)
    .get(protect, adminOnly, getTheatres);

router.route('/:id')
    .put(protect, adminOnly, upload.single('logo'), updateTheatre)
    .delete(protect, adminOnly, deleteTheatre);

export default router;
