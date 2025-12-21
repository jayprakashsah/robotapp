// robot-app-backend/createAdmin.js - UPDATED
const mongoose = require('mongoose');
const User = require('./src/models/User');

const createAdminUser = async () => {
    try {
        // Connect to MongoDB - REMOVE old options
        await mongoose.connect('mongodb://localhost:27017/sentientlabs');
        
        console.log('✅ Connected to MongoDB');
        
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@superemo.com' });
        
        if (existingAdmin) {
            console.log('⚠️ Admin user already exists');
            console.log('Username:', existingAdmin.username);
            console.log('Email:', existingAdmin.email);
            console.log('Role:', existingAdmin.role);
            
            // Check if password needs update
            if (existingAdmin.password === 'Admin123!') {
                console.log('\n⚠️ WARNING: Using default password!');
                console.log('Please update password immediately.');
            }
            
            process.exit(0);
        }
        
        // Create admin user
        const adminUser = new User({
            username: 'superadmin',
            email: 'admin@superemo.com',
            password: 'Admin123!', // Simple password for demo
            role: 'admin',
            isActive: true
        });
        
        await adminUser.save();
        
        console.log('✅ Admin user created successfully!');
        console.log('==============================');
        console.log('ADMIN LOGIN CREDENTIALS:');
        console.log('Email: admin@superemo.com');
        console.log('Password: Admin123!');
        console.log('==============================');
        console.log('\n⚠️ IMPORTANT:');
        console.log('1. Change password after first login!');
        console.log('2. Keep these credentials secure!');
        console.log('==============================');
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
};

createAdminUser();