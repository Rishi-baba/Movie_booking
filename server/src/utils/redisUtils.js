import redisClient from '../config/redis.js';

/**
 * Normalizes email by making it lowercase and trimming whitespace.
 */
const normalizeEmail = (email) => {
    return email ? email.toLowerCase().trim() : '';
};

/**
 * Stores an access token in the Redis blacklist.
 * @param {string} token - The access token to blacklist.
 * @param {number} ttl - Time to live in seconds.
 */
export const addToBlacklist = async (token, ttl) => {
    const key = `blacklist:${token}`;
    await redisClient.setEx(key, ttl, 'true');
};

/**
 * Checks if an access token is blacklisted.
 */
export const isBlacklisted = async (token) => {
    const key = `blacklist:${token}`;
    const exists = await redisClient.get(key);
    return exists !== null;
};

/**
 * Checks if the given IP or Email has reached the login rate limit.
 * Returns true if blocked, false otherwise.
 */
export const checkRateLimit = async (ip, email) => {
    const normalizedEmail = normalizeEmail(email);
    const ipKey = `failed_login_ip:${ip}`;
    const userKey = `failed_login_user:${normalizedEmail}`;

    const [ipAttempts, userAttempts] = await Promise.all([
        redisClient.get(ipKey),
        redisClient.get(userKey)
    ]);

    return (ipAttempts && parseInt(ipAttempts) >= 10) || (userAttempts && parseInt(userAttempts) >= 10);
};

/**
 * Increments the failed login attempts for both IP and Email.
 * Sets a 5-minute TTL on the first attempt.
 */
export const incrementFailedLogin = async (ip, email) => {
    const normalizedEmail = normalizeEmail(email);
    const ipKey = `failed_login_ip:${ip}`;
    const userKey = `failed_login_user:${normalizedEmail}`;

    const ipAttempts = await redisClient.incr(ipKey);
    if (ipAttempts === 1) {
        await redisClient.expire(ipKey, 300);
    }

    const userAttempts = await redisClient.incr(userKey);
    if (userAttempts === 1) {
        await redisClient.expire(userKey, 300);
    }
};

/**
 * Resets the failed login counter for IP and Email on success.
 */
export const resetFailedLogin = async (ip, email) => {
    const normalizedEmail = normalizeEmail(email);
    const ipKey = `failed_login_ip:${ip}`;
    const userKey = `failed_login_user:${normalizedEmail}`;

    await redisClient.del([ipKey, userKey]);
};

/**
 * Stores a refresh token in Redis for a specific user.
 * Overwrites any existing token, ensuring single active session.
 */
export const storeRefreshToken = async (userId, token, ttlDays) => {
    const key = `refresh:user:${userId}`;
    const ttlSeconds = ttlDays * 24 * 60 * 60;
    await redisClient.setEx(key, ttlSeconds, token);
};

/**
 * Gets the stored refresh token for a user.
 */
export const getStoredRefreshToken = async (userId) => {
    const key = `refresh:user:${userId}`;
    return await redisClient.get(key);
};

/**
 * Deletes the stored refresh token for a user (on logout).
 */
export const deleteRefreshToken = async (userId) => {
    const key = `refresh:user:${userId}`;
    await redisClient.del(key);
};

