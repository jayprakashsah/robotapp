// robot-app-backend/src/middleware/authValidation.js

const validateRegister = (req, res, next) => {
    console.log('🔍 Validating registration data...');
    
    const { username, email, password } = req.body;

    // Check for missing fields
    if (!username || !email || !password) {
        console.log('❌ Validation failed: Missing fields');
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }
    
    // Validate username
    if (username.length < 3) {
        console.log('❌ Validation failed: Username too short');
        return res.status(400).json({
            success: false,
            message: 'Username must be at least 3 characters'
        });
    }
    
    if (username.length > 30) {
        console.log('❌ Validation failed: Username too long');
        return res.status(400).json({
            success: false,
            message: 'Username cannot exceed 30 characters'
        });
    }
    
    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
        console.log('❌ Validation failed: Invalid email format');
        return res.status(400).json({
            success: false,
            message: 'Please enter a valid email address'
        });
    }
    
    // Validate password
    if (password.length < 6) {
        console.log('❌ Validation failed: Password too short');
        return res.status(400).json({
            success: false,
            message: 'Password must be at least 6 characters'
        });
    }
    
    console.log('✅ Validation passed');
    next();
};

const validateLogin = (req, res, next) => {
    console.log('🔍 Validating login data...');
    
    const { email, password } = req.body;

    if (!email || !password) {
        console.log('❌ Validation failed: Missing email or password');
        return res.status(400).json({
            success: false,
            message: 'Email and password are required'
        });
    }
    
    console.log('✅ Validation passed');
    next();
};

module.exports = {
    validateRegister,
    validateLogin
};