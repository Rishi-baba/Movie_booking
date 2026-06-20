import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD || 'HOf8gd1k3Rz9fpjvp30zexysnf1fOUBh',
    socket: {
        host: process.env.REDIS_HOST || 'ultrasmooth-shadowless-kittens-73163.db.redis.io',
        port: process.env.REDIS_PORT || 15604
    }
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));
redisClient.on('reconnecting', () => console.log('Redis Client Reconnecting'));

export default redisClient;
