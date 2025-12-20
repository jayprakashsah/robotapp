// robot-app-backend/src/models/Question.js
const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
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
    answer: {
        type: String,
        required: true,
        minlength: [10, 'Answer must be at least 10 characters'],
        maxlength: [2000, 'Answer cannot exceed 2000 characters']
    },
    upvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isAccepted: {
        type: Boolean,
        default: false
    },
    attachments: [{
        type: String // URLs to files/images
    }]
}, {
    timestamps: true
});

const questionSchema = new mongoose.Schema({
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
        required: true,
        lowercase: true
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        minlength: [10, 'Title must be at least 10 characters'],
        maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        minlength: [20, 'Description must be at least 20 characters'],
        maxlength: [5000, 'Description cannot exceed 5000 characters']
    },
    tags: [{
        type: String,
        trim: true
    }],
    category: {
        type: String,
        enum: ['technical', 'usage', 'troubleshooting', 'feature', 'general', 'installation'],
        default: 'general'
    },
    answers: [answerSchema],
    views: {
        type: Number,
        default: 0
    },
    upvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isSolved: {
        type: Boolean,
        default: false
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    attachments: [{
        type: String // URLs to files/images
    }]
}, {
    timestamps: true
});

// Add indexes
questionSchema.index({ userId: 1, createdAt: -1 });
questionSchema.index({ category: 1, isSolved: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ upvotes: -1 });
questionSchema.index({ views: -1 });

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;