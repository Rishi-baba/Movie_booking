import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

export const seedAdmin = async () => {
    try {
        const adminEmail = 'admin@movie.com';
        
        // Check if admin already exists
        const adminExists = await User.findOne({ email: adminEmail });
        if (adminExists) {
            console.log('Admin user already exists');
            return;
        }

        // Create admin
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        await User.create({
            name: 'Admin',
            email: adminEmail,
            password: hashedPassword,
            role: 'admin'
        });

        console.log('Default admin user successfully seeded');
    } catch (error) {
        console.error('Error seeding admin user:', error);
    }
};
