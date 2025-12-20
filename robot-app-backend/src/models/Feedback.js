// robot-app-backend/src/models/Feedback.js
const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true,
        minlength: [1, 'Reply message is required'],
        maxlength: [500, 'Reply cannot exceed 500 characters']
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isSolution: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const feedbackSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    userName: {
        type: String,
        required: [true, 'User name is required']
    },
    userEmail: {
        type: String,
        required: [true, 'User email is required'],
        lowercase: true
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        minlength: [5, 'Title must be at least 5 characters'],
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        trim: true,
        minlength: [10, 'Message must be at least 10 characters'],
        maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    category: {
        type: String,
        enum: ['bug', 'feature', 'improvement', 'praise', 'question', 'other'],
        default: 'other',
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['open', 'in-progress', 'resolved', 'closed'],
        default: 'open'
    },
    upvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    downvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    tags: [{
        type: String,
        trim: true
    }],
    replies: [replySchema],
    isAnonymous: {
        type: Boolean,
        default: false
    },
    robotIp: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Add indexes
feedbackSchema.index({ userId: 1, createdAt: -1 });
feedbackSchema.index({ category: 1, status: 1 });
feedbackSchema.index({ upvotes: -1 });
feedbackSchema.index({ tags: 1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;