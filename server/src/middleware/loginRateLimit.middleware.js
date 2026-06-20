import { checkRateLimit } from '../utils/redisUtils.js';

export const loginRateLimit = async (req, res, next) => {
    const { email } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    if (!email) {
        return next(); // Let validation in controller handle missing email
    }

    try {
        const isBlocked = await checkRateLimit(ip, email);

        if (isBlocked) {
            return res.status(429).json({
                message: 'Too many failed login attempts. Please try again after 5 minutes.'
            });
        }

        next();
    } catch (error) {
        console.error('Login Rate Limit Error:', error);
        next(); // Proceed even if Redis fails
    }
};
