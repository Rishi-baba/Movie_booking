import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from '../src/models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup environment variables path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedAdmin = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB successfully.');

        const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
        const adminName = process.env.ADMIN_NAME || 'Admin User';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin_secret123';

        // Check if any admin already exists
        const existingAdmin = await User.findOne({ role: 'admin' });
        
        if (existingAdmin) {
            console.log(`An admin user already exists: ${existingAdmin.email}`);
            console.log('Duplicate admin creation prevented.');
            process.exit(0);
        }

        // Check if user with that exact email exists to prevent duplicate key errors
        const existingUser = await User.findOne({ email: adminEmail });
        
        if (existingUser) {
            console.log(`User with email ${adminEmail} already exists. Elevating to admin...`);
            existingUser.role = 'admin';
            await existingUser.save();
            console.log('User role updated to admin successfully.');
            process.exit(0);
        }

        console.log('Creating new admin user...');
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        const adminUser = new User({
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            role: 'admin'
        });

        await adminUser.save();
        
        console.log('Admin user created successfully.');
        console.log(`Admin Email: ${adminEmail}`);
        
        process.exit(0);
    } catch (error) {
        console.error(`Error seeding admin: ${error.message}`);
        process.exit(1);
    }
};

seedAdmin();
