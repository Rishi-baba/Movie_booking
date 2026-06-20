import express from 'express';
import { registerUser, loginUser, refreshAccessToken, logoutUser } from '../controllers/auth.controller.js';
import { loginRateLimit } from '../middleware/loginRateLimit.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginRateLimit, loginUser);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logoutUser);

export default router;
