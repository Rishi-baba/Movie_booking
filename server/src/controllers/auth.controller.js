import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { 
    resetFailedLogin, 
    addToBlacklist, 
    incrementFailedLogin,
    storeRefreshToken,
    getStoredRefreshToken,
    deleteRefreshToken
} from '../utils/redisUtils.js';

// Generate Access Token (short-lived)
const generateAccessToken = (id) => {
    return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '15m', // 15 minutes
    });
};

// Generate Refresh Token (long-lived)
const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '7d', // 7 days
    });
};

// Helper function to set refresh token in cookie
const setRefreshTokenCookie = (res, token) => {
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
        sameSite: 'strict', // Prevent CSRF attacks
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        if (user) {
            const accessToken = generateAccessToken(user._id);
            const refreshToken = generateRefreshToken(user._id);

            await storeRefreshToken(user._id, refreshToken, 7);
            setRefreshTokenCookie(res, refreshToken);

            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                accessToken,
            });
        } else {
            return res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Authenticate a user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
    const ip = req.ip || req.connection.remoteAddress;
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        // Check for user email
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            // Reset failed login attempts counter on success
            await resetFailedLogin(ip, email);

            const accessToken = generateAccessToken(user._id);
            const refreshToken = generateRefreshToken(user._id);

            await storeRefreshToken(user._id, refreshToken, 7);
            setRefreshTokenCookie(res, refreshToken);

            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                accessToken,
            });
        } else {
            // Increment failed login attempt on invalid credentials
            await incrementFailedLogin(ip, email);
            return res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
export const refreshAccessToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.jwt;

        if (!refreshToken) {
            return res.status(401).json({ message: 'Not authorized, no refresh token' });
        }

        // Verify refresh token
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        } catch (err) {
            return res.status(401).json({ message: 'Not authorized, token expired or invalid' });
        }

        // Check if token exists in Redis (to prevent using a revoked refresh token)
        const storedToken = await getStoredRefreshToken(decoded.id);
        if (!storedToken || storedToken !== refreshToken) {
            return res.status(401).json({ message: 'Not authorized, token revoked' });
        }

        // Find user
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'Not authorized, invalid user' });
        }

        // Generate new access and refresh tokens (Rotation)
        const accessToken = generateAccessToken(user._id);
        const newRefreshToken = generateRefreshToken(user._id);

        await storeRefreshToken(user._id, newRefreshToken, 7);
        setRefreshTokenCookie(res, newRefreshToken);

        res.json({ accessToken });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Logout user / clear cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
export const logoutUser = async (req, res) => {
    try {
        let token;
        
        // Extract access token from Authorization header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            // Decode token expiration
            const decoded = jwt.decode(token);
            if (decoded && decoded.exp) {
                const currentUnixTime = Math.floor(Date.now() / 1000);
                const remainingLifetime = decoded.exp - currentUnixTime;

                if (remainingLifetime > 0) {
                    // Store token in Redis blacklist
                    await addToBlacklist(token, remainingLifetime);
                }
            }
        }

        // Delete refresh token from Redis if present in cookie
        const refreshToken = req.cookies.jwt;
        if (refreshToken) {
            const decodedRefresh = jwt.decode(refreshToken);
            if (decodedRefresh && decodedRefresh.id) {
                await deleteRefreshToken(decodedRefresh.id);
            }
        }

        res.cookie('jwt', '', {
            httpOnly: true,
            expires: new Date(0),
        });

        res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
