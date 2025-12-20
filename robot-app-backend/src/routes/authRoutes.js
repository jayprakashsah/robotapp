// robot-app-backend/src/routes/authRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateRegister, validateLogin } = require('../middleware/authValidation');
const { checkDatabase } = require('../middleware/authMiddleware');

const router = express.Router();

// ✅ REGISTER USER
router.post('/register', validateRegister, checkDatabase, async (req, res) => {
    console.log('📝 REGISTRATION PROCESS STARTED');
    
    try {
        const { username, email, password } = req.body;

        console.log('🔍 Checking if user already exists...');
        
        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [
                { email: email.toLowerCase() }, 
                { username: username }
            ] 
        });

        if (existingUser) {
            console.log('❌ User already exists');
            const field = existingUser.email === email.toLowerCase() ? 'email' : 'username';
            return res.status(409).json({
                success: false,
                message: `User with this ${field} already exists`
            });
        }

        console.log('✅ Creating new user...');
        
        // Create new user
        const user = new User({ 
            username: username.trim(),
            email: email.toLowerCase().trim(), 
            password: password // Note: In production, this should be hashed!
        });

        console.log('💾 Saving user to database...');
        await user.save();
        
        console.log('✅ User saved successfully:', user.email);

        // Create JWT token
        const token = jwt.sign(
            { 
                userId: user._id, 
                username: user.username, 
                email: user.email,
                role: user.role 
            },
            process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
            { expiresIn: '7d' }
        );

        console.log('✅ Token generated');
        
        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            }
        });

        console.log('🎉 Registration completed successfully!');

    } catch (error) {
        console.error('❌ REGISTRATION ERROR:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: messages
            });
        }
        
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'User already exists with this email or username'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// ✅ LOGIN USER
router.post('/login', validateLogin, checkDatabase, async (req, res) => {
    console.log('🔐 LOGIN PROCESS STARTED');
    
    try {
        const { email, password } = req.body;

        console.log('🔍 Finding user...');
        
        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) {
            console.log('❌ User not found');
            return res.status(401).json({
                success: false,
                message: 'No account found with this email'
            });
        }

        console.log('✅ User found, checking password...');
        
        // Check if account is active
        if (!user.isActive) {
            console.log('❌ Account is deactivated');
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Compare password
        const isPasswordValid = await user.comparePassword(password);
        
        if (!isPasswordValid) {
            console.log('❌ Invalid password');
            return res.status(401).json({
                success: false,
                message: 'Incorrect password'
            });
        }

        console.log('✅ Password valid, updating last login...');
        
        // Update last login
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        // Create JWT token
        const token = jwt.sign(
            { 
                userId: user._id, 
                username: user.username, 
                email: user.email,
                role: user.role 
            },
            process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
            { expiresIn: '7d' }
        );

        console.log('✅ Login successful for:', user.email);
        
        res.json({
            success: true,
            message: 'Login successful!',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        console.error('❌ LOGIN ERROR:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// ✅ VERIFY TOKEN (uses authenticate middleware)
router.get('/verify', async (req, res) => {
    console.log('🔍 VERIFY TOKEN REQUESTED');
    
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const token = authHeader.split(' ')[1];
        const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
        
        const decoded = jwt.verify(token, jwtSecret);
        
        // Find user in database
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User no longer exists'
            });
        }
        
        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        console.error('❌ VERIFY ERROR:', error.message);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Token verification failed'
        });
    }
});

// ✅ TEST ENDPOINT
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Auth API is working!',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;