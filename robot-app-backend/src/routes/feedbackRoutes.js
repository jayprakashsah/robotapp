// src/routes/feedbackRoutes.js
const express = require('express');
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const router = express.Router();

// Middleware to verify authentication
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const token = authHeader.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// ✅ SUBMIT FEEDBACK
router.post('/submit', authenticate, async (req, res) => {
  try {
    const { type, title, message, priority = 'medium', robotIp = '' } = req.body;

    console.log(`📝 Feedback submission from user: ${req.userId}`);

    // Validation
    if (!type || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Type, title, and message are required'
      });
    }

    // Get user details
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
      userEmail: user.email,
      userName: user.username,
      type,
      title,
      message,
      priority,
      robotIp,
      status: 'pending'
    });

    await feedback.save();
    
    console.log(`✅ Feedback submitted: ${feedback.title} (ID: ${feedback._id})`);

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback: {
        id: feedback._id,
        type: feedback.type,
        title: feedback.title,
        status: feedback.status,
        createdAt: feedback.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Feedback submission error:', error.message);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during feedback submission',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ✅ GET USER'S FEEDBACK (Own feedback only)
router.get('/my-feedback', authenticate, async (req, res) => {
  try {
    console.log(`📋 Fetching feedback for user: ${req.userId}`);
    
    const feedback = await Feedback.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select('-adminNotes -resolvedBy');
    
    console.log(`✅ Found ${feedback.length} feedback items for user`);

    res.json({
      success: true,
      count: feedback.length,
      feedback
    });

  } catch (error) {
    console.error('❌ Error fetching user feedback:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching feedback'
    });
  }
});

// ✅ GET SINGLE FEEDBACK DETAIL
router.get('/:id', authenticate, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Check if user owns this feedback or is admin
    if (feedback.userId.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this feedback'
      });
    }

    console.log(`🔍 Viewing feedback: ${feedback.title}`);

    res.json({
      success: true,
      feedback
    });

  } catch (error) {
    console.error('❌ Error fetching feedback details:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching feedback details'
    });
  }
});

// ✅ ADMIN: GET ALL FEEDBACK
router.get('/admin/all', authenticate, isAdmin, async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    
    console.log(`👑 Admin fetching all feedback`);
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const feedback = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'username email')
      .populate('resolvedBy', 'username');
    
    const total = await Feedback.countDocuments(query);
    
    console.log(`✅ Admin retrieved ${feedback.length} feedback items`);

    res.json({
      success: true,
      count: feedback.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      feedback
    });

  } catch (error) {
    console.error('❌ Admin error fetching feedback:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching feedback'
    });
  }
});

// ✅ ADMIN: UPDATE FEEDBACK STATUS
router.patch('/admin/:id/status', authenticate, isAdmin, async (req, res) => {
  try {
    const { status, note } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Update status
    feedback.status = status;
    
    if (status === 'resolved') {
      feedback.resolvedAt = new Date();
      feedback.resolvedBy = req.userId;
    }
    
    // Add admin note if provided
    if (note) {
      const user = await User.findById(req.userId);
      feedback.adminNotes.push({
        note,
        adminName: user.username
      });
    }

    await feedback.save();
    
    console.log(`✅ Feedback ${feedback._id} status updated to: ${status}`);

    res.json({
      success: true,
      message: `Feedback status updated to ${status}`,
      feedback: {
        id: feedback._id,
        status: feedback.status,
        resolvedAt: feedback.resolvedAt,
        adminNotes: feedback.adminNotes
      }
    });

  } catch (error) {
    console.error('❌ Admin error updating feedback status:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error updating feedback status'
    });
  }
});

// ✅ ADMIN: ADD NOTE TO FEEDBACK
router.post('/admin/:id/note', authenticate, isAdmin, async (req, res) => {
  try {
    const { note } = req.body;
    
    if (!note) {
      return res.status(400).json({
        success: false,
        message: 'Note is required'
      });
    }

    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    const user = await User.findById(req.userId);
    
    feedback.adminNotes.push({
      note,
      adminName: user.username
    });

    await feedback.save();
    
    console.log(`✅ Note added to feedback ${feedback._id}`);

    res.json({
      success: true,
      message: 'Note added successfully',
      note: feedback.adminNotes[feedback.adminNotes.length - 1]
    });

  } catch (error) {
    console.error('❌ Admin error adding note:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error adding note'
    });
  }
});

// ✅ GET FEEDBACK STATISTICS
router.get('/stats/summary', authenticate, isAdmin, async (req, res) => {
  try {
    console.log('📊 Generating feedback statistics');
    
    const stats = await Feedback.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const typeStats = await Feedback.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const priorityStats = await Feedback.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const total = await Feedback.countDocuments();
    const pending = await Feedback.countDocuments({ status: 'pending' });
    
    console.log(`✅ Statistics generated: ${total} total feedback`);

    res.json({
      success: true,
      stats: {
        total,
        pending,
        byStatus: stats,
        byType: typeStats,
        byPriority: priorityStats,
        last24Hours: await Feedback.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        })
      }
    });

  } catch (error) {
    console.error('❌ Error generating statistics:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error generating statistics'
    });
  }
});

module.exports = router;