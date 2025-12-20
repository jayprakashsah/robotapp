// robot-app-backend/src/routes/communityRoutes.js
const express = require('express');
const Feedback = require('../models/Feedback');
const Question = require('../models/Question');
const User = require('../models/User');
const { authenticate, checkDatabase } = require('../middleware/authMiddleware');
const router = express.Router();

// ✅ GET ALL PUBLIC FEEDBACK (with pagination)
router.get('/feedback', checkDatabase, async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            category, 
            sort = 'newest',
            search = '' 
        } = req.query;
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Build query
        let query = {};
        
        if (category && category !== 'all') {
            query.category = category;
        }
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Build sort
        let sortOption = {};
        switch(sort) {
            case 'newest':
                sortOption.createdAt = -1;
                break;
            case 'oldest':
                sortOption.createdAt = 1;
                break;
            case 'most-voted':
                sortOption.upvotes = -1;
                break;
            case 'most-replies':
                // Sort by replies length
                break;
        }
        
        const feedback = await Feedback.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit))
            .select('-userEmail -robotIp');
        
        const total = await Feedback.countDocuments(query);
        
        res.json({
            success: true,
            feedback,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                limit: parseInt(limit)
            }
        });
        
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching feedback'
        });
    }
});

// ✅ SUBMIT NEW FEEDBACK
router.post('/feedback', authenticate, checkDatabase, async (req, res) => {
    try {
        const { title, message, category = 'other', priority = 'medium', tags = [], isAnonymous = false } = req.body;
        
        // Validation
        if (!title || !message) {
            return res.status(400).json({
                success: false,
                message: 'Title and message are required'
            });
        }
        
        // Get user info
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Create feedback
        const feedback = new Feedback({
            userId: req.userId,
            userName: isAnonymous ? 'Anonymous User' : user.username,
            userEmail: user.email,
            title,
            message,
            category,
            priority,
            tags,
            isAnonymous
        });
        
        await feedback.save();
        
        res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully!',
            feedback: {
                id: feedback._id,
                title: feedback.title,
                category: feedback.category,
                userName: feedback.userName,
                createdAt: feedback.createdAt
            }
        });
        
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting feedback'
        });
    }
});

// ✅ ADD REPLY TO FEEDBACK
router.post('/feedback/:id/reply', authenticate, checkDatabase, async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Reply message is required'
            });
        }
        
        // Get user info
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Find feedback
        const feedback = await Feedback.findById(req.params.id);
        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: 'Feedback not found'
            });
        }
        
        // Add reply
        feedback.replies.push({
            userId: req.userId,
            userName: user.username,
            userEmail: user.email,
            message: message.trim()
        });
        
        await feedback.save();
        
        res.json({
            success: true,
            message: 'Reply added successfully',
            reply: feedback.replies[feedback.replies.length - 1]
        });
        
    } catch (error) {
        console.error('Error adding reply:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding reply'
        });
    }
});

// ✅ VOTE ON FEEDBACK
router.post('/feedback/:id/vote', authenticate, checkDatabase, async (req, res) => {
    try {
        const { voteType } = req.body; // 'upvote' or 'downvote'
        
        if (!['upvote', 'downvote'].includes(voteType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid vote type'
            });
        }
        
        const feedback = await Feedback.findById(req.params.id);
        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: 'Feedback not found'
            });
        }
        
        // Remove existing votes
        feedback.upvotes = feedback.upvotes.filter(id => id.toString() !== req.userId);
        feedback.downvotes = feedback.downvotes.filter(id => id.toString() !== req.userId);
        
        // Add new vote
        if (voteType === 'upvote') {
            feedback.upvotes.push(req.userId);
        } else {
            feedback.downvotes.push(req.userId);
        }
        
        await feedback.save();
        
        res.json({
            success: true,
            message: `Feedback ${voteType}d successfully`,
            upvotes: feedback.upvotes.length,
            downvotes: feedback.downvotes.length
        });
        
    } catch (error) {
        console.error('Error voting:', error);
        res.status(500).json({
            success: false,
            message: 'Error voting on feedback'
        });
    }
});

// ✅ GET ALL QUESTIONS (with pagination)
router.get('/questions', checkDatabase, async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            category, 
            sort = 'newest',
            solved = 'all',
            search = '' 
        } = req.query;
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Build query
        let query = {};
        
        if (category && category !== 'all') {
            query.category = category;
        }
        
        if (solved === 'solved') {
            query.isSolved = true;
        } else if (solved === 'unsolved') {
            query.isSolved = false;
        }
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Build sort
        let sortOption = {};
        switch(sort) {
            case 'newest':
                sortOption.createdAt = -1;
                break;
            case 'oldest':
                sortOption.createdAt = 1;
                break;
            case 'most-voted':
                sortOption.upvotes = -1;
                break;
            case 'most-viewed':
                sortOption.views = -1;
                break;
            case 'most-answered':
                // Sort by answers length
                break;
        }
        
        const questions = await Question.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit))
            .select('-userEmail');
        
        // Increment views (simulate)
        await Promise.all(questions.map(q => 
            Question.findByIdAndUpdate(q._id, { $inc: { views: 1 } })
        ));
        
        const total = await Question.countDocuments(query);
        
        res.json({
            success: true,
            questions,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                limit: parseInt(limit)
            }
        });
        
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching questions'
        });
    }
});

// ✅ ASK NEW QUESTION
router.post('/questions', authenticate, checkDatabase, async (req, res) => {
    try {
        const { title, description, category = 'general', tags = [] } = req.body;
        
        // Validation
        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: 'Title and description are required'
            });
        }
        
        if (title.length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Title must be at least 10 characters'
            });
        }
        
        if (description.length < 20) {
            return res.status(400).json({
                success: false,
                message: 'Description must be at least 20 characters'
            });
        }
        
        // Get user info
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Create question
        const question = new Question({
            userId: req.userId,
            userName: user.username,
            userEmail: user.email,
            title,
            description,
            category,
            tags: tags.slice(0, 5) // Limit to 5 tags
        });
        
        await question.save();
        
        res.status(201).json({
            success: true,
            message: 'Question posted successfully!',
            question: {
                id: question._id,
                title: question.title,
                userName: question.userName,
                tags: question.tags,
                createdAt: question.createdAt
            }
        });
        
    } catch (error) {
        console.error('Error posting question:', error);
        res.status(500).json({
            success: false,
            message: 'Error posting question'
        });
    }
});

// ✅ ANSWER A QUESTION
router.post('/questions/:id/answers', authenticate, checkDatabase, async (req, res) => {
    try {
        const { answer } = req.body;
        
        if (!answer || answer.trim().length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Answer must be at least 10 characters'
            });
        }
        
        // Get user info
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Find question
        const question = await Question.findById(req.params.id);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }
        
        // Add answer
        question.answers.push({
            userId: req.userId,
            userName: user.username,
            userEmail: user.email,
            answer: answer.trim()
        });
        
        await question.save();
        
        res.json({
            success: true,
            message: 'Answer added successfully',
            answer: question.answers[question.answers.length - 1]
        });
        
    } catch (error) {
        console.error('Error adding answer:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding answer'
        });
    }
});

// ✅ ACCEPT ANSWER
router.patch('/questions/:questionId/answers/:answerId/accept', authenticate, checkDatabase, async (req, res) => {
    try {
        const question = await Question.findById(req.params.questionId);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }
        
        // Check if user owns the question
        if (question.userId.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'Only the question owner can accept answers'
            });
        }
        
        // Find and update answer
        const answerIndex = question.answers.findIndex(
            a => a._id.toString() === req.params.answerId
        );
        
        if (answerIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Answer not found'
            });
        }
        
        // Reset all answers to not accepted
        question.answers.forEach(answer => {
            answer.isAccepted = false;
        });
        
        // Accept this answer
        question.answers[answerIndex].isAccepted = true;
        question.isSolved = true;
        
        await question.save();
        
        res.json({
            success: true,
            message: 'Answer accepted as solution',
            isSolved: question.isSolved
        });
        
    } catch (error) {
        console.error('Error accepting answer:', error);
        res.status(500).json({
            success: false,
            message: 'Error accepting answer'
        });
    }
});

// ✅ VOTE ON QUESTION/ANSWER
router.post('/:type/:id/vote', authenticate, checkDatabase, async (req, res) => {
    try {
        const { type, id } = req.params;
        const { voteType } = req.body; // 'upvote' or 'downvote' for questions
        
        if (type === 'question') {
            const question = await Question.findById(id);
            if (!question) {
                return res.status(404).json({
                    success: false,
                    message: 'Question not found'
                });
            }
            
            // Remove existing vote
            question.upvotes = question.upvotes.filter(
                userId => userId.toString() !== req.userId
            );
            
            // Add new vote
            if (voteType === 'upvote') {
                question.upvotes.push(req.userId);
            }
            
            await question.save();
            
            res.json({
                success: true,
                message: 'Question voted successfully',
                upvotes: question.upvotes.length
            });
            
        } else if (type === 'answer') {
            // Find the question containing this answer
            const question = await Question.findOne({ 'answers._id': id });
            if (!question) {
                return res.status(404).json({
                    success: false,
                    message: 'Answer not found'
                });
            }
            
            const answer = question.answers.id(id);
            if (!answer) {
                return res.status(404).json({
                    success: false,
                    message: 'Answer not found'
                });
            }
            
            // Remove existing vote
            answer.upvotes = answer.upvotes.filter(
                userId => userId.toString() !== req.userId
            );
            
            // Add new vote
            if (voteType === 'upvote') {
                answer.upvotes.push(req.userId);
            }
            
            await question.save();
            
            res.json({
                success: true,
                message: 'Answer voted successfully',
                upvotes: answer.upvotes.length
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid type'
            });
        }
        
    } catch (error) {
        console.error('Error voting:', error);
        res.status(500).json({
            success: false,
            message: 'Error voting'
        });
    }
});

// ✅ GET FEEDBACK/QUESTION STATISTICS
router.get('/stats', checkDatabase, async (req, res) => {
    try {
        const feedbackStats = await Feedback.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    avgReplies: { $avg: { $size: { $ifNull: ['$replies', []] } } }
                }
            }
        ]);
        
        const questionStats = await Question.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    solvedCount: {
                        $sum: { $cond: [{ $eq: ['$isSolved', true] }, 1, 0] }
                    }
                }
            }
        ]);
        
        const totalFeedback = await Feedback.countDocuments();
        const totalQuestions = await Question.countDocuments();
       const totalReplies = await Feedback.aggregate([
    { 
        $project: { 
            replyCount: { $size: { $ifNull: ['$replies', []] } } 
        } 
    },
    { 
        $group: { 
            _id: null, 
            total: { $sum: '$replyCount' } 
        } 
    }
]);
        
        const totalAnswers = await Question.aggregate([
    { 
        $project: { 
            answerCount: { $size: { $ifNull: ['$answers', []] } } 
        } 
    },
    { 
        $group: { 
            _id: null, 
            total: { $sum: '$answerCount' } 
        } 
    }
]);
        
        res.json({
            success: true,
            stats: {
                feedback: {
                    total: totalFeedback,
                    byCategory: feedbackStats,
                    totalReplies: totalReplies[0]?.total || 0
                },
                questions: {
                    total: totalQuestions,
                    byCategory: questionStats,
                    totalAnswers: totalAnswers[0]?.total || 0
                },
                community: {
                    totalPosts: totalFeedback + totalQuestions,
                    totalInteractions: (totalReplies[0]?.total || 0) + (totalAnswers[0]?.total || 0)
                }
            }
        });
        
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics'
        });
    }
});

module.exports = router;