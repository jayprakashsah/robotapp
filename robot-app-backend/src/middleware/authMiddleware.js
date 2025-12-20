// robot-app-backend/src/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Middleware to verify JWT token
const authenticate = async (req, res, next) => {
    console.log('🔐 Authenticating request...');
    
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            console.log('❌ No authorization header');
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        
        if (!authHeader.startsWith('Bearer ')) {
            console.log('❌ Invalid authorization format');
            return res.status(401).json({
                success: false,
                message: 'Invalid authorization format'
            });
        }

        const token = authHeader.split(' ')[1];
        
        if (!token || token === 'null' || token === 'undefined') {
            console.log('❌ Token is empty');
            return res.status(401).json({
                success: false,
                message: 'Token is empty or invalid'
            });
        }

        const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
        
        // Verify JWT token
        const decoded = jwt.verify(token, jwtSecret);
        
        // ✅ CRITICAL FIX: Attach user info to request (adminMiddleware needs req.user)
        req.user = {
            userId: decoded.userId,
            username: decoded.username,
            email: decoded.email,
            role: decoded.role  // This contains 'admin' or 'user'
        };
        
        // ✅ Also keep these for backward compatibility
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        
        console.log('✅ Authentication successful for user:', decoded.email, 'Role:', decoded.role);
        next();
        
    } catch (error) {
        console.error('❌ Authentication failed:', error.message);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired'
            });
        }
        
        return res.status(401).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    console.log('👑 Checking admin access...');
    
    if (req.userRole !== 'admin') {
        console.log('❌ Admin access required');
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }
    
    console.log('✅ Admin access granted');
    next();
};

// Middleware to check database connection
const checkDatabase = (req, res, next) => {
    console.log('📊 Checking database connection...');
    
    if (mongoose.connection.readyState !== 1) {
        console.log('❌ Database not connected');
        return res.status(503).json({
            success: false,
            message: 'Database temporarily unavailable. Please try again later.',
            database: 'disconnected'
        });
    }
    
    console.log('✅ Database is connected');
    next();
};

module.exports = {
    authenticate,
    isAdmin,
    checkDatabase
};