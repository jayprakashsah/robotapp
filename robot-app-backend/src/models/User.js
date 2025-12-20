// robot-app-backend/src/models/User.js (SIMPLER VERSION)
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username cannot exceed 30 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// ✅ REMOVED the problematic pre-save hook for now
// We'll add proper password hashing later

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    console.log('🔐 Comparing password for:', this.email);
    
    // Simple comparison (store passwords securely in production!)
    const isMatch = this.password === candidatePassword;
    
    console.log('Password match:', isMatch);
    return isMatch;
};

// Static method to find user by credentials
userSchema.statics.findByCredentials = async function(email, password) {
    console.log('🔍 Finding user by credentials:', email);
    
    const user = await this.findOne({ email: email.toLowerCase() });
    
    if (!user) {
        console.log('❌ User not found');
        throw new Error('User not found');
    }
    
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
        console.log('❌ Password does not match');
        throw new Error('Invalid password');
    }
    
    console.log('✅ User authenticated:', user.email);
    return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;