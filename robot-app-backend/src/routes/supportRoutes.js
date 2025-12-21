const express = require('express');
const SupportTicket = require('../models/SupportTicket');
const mongoose = require('mongoose');
const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Support API is working!',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// ✅ POST /api/support - Create new support ticket (ACTUALLY SAVES TO DB)
router.post('/', async (req, res) => {
  try {
    console.log('📦 Request body:', req.body);
    
    const { name, email, subject, description, category, priority, userId, robotIP } = req.body;
    
    // Validation
    if (!email || !subject || !description) {
      return res.status(400).json({
        success: false,
        message: 'Email, subject and description are required'
      });
    }
    
    // Validate category against enum values
    const validCategories = ['technical', 'billing', 'feature-request', 'bug', 'other'];
    const validatedCategory = validCategories.includes(category) ? category : 'other';
    
    // Validate priority against enum values  
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    const validatedPriority = validPriorities.includes(priority) ? priority : 'medium';
    
    console.log('📝 Creating ticket with:', {
      name: name || 'Anonymous',
      email,
      subject,
      description: description.substring(0, 50) + '...',
      category: validatedCategory,
      priority: validatedPriority
    });
    
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ MongoDB not connected!');
      return res.status(503).json({
        success: false,
        message: 'Database temporarily unavailable'
      });
    }
    
    // Create and save the ticket
    const newTicket = new SupportTicket({
      userId: userId || 'anonymous',
      name: name || 'Anonymous',
      email,
      subject,
      description,
      category: validatedCategory,
      priority: validatedPriority,
      robotIP: robotIP || 'not_connected',
      status: 'open'
    });
    
    console.log('💾 Saving to database...');
    const savedTicket = await newTicket.save();
    
    console.log('✅ Ticket saved to MongoDB:', {
      id: savedTicket._id,
      email: savedTicket.email,
      subject: savedTicket.subject,
      createdAt: savedTicket.createdAt
    });
    
    // Verify it was saved
    const verify = await SupportTicket.findById(savedTicket._id);
    console.log('🔍 Verification:', verify ? 'Found in DB' : 'NOT FOUND in DB');
    
    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      ticketId: savedTicket._id,
      data: {
        id: savedTicket._id,
        name: savedTicket.name,
        email: savedTicket.email,
        subject: savedTicket.subject,
        category: savedTicket.category,
        priority: savedTicket.priority,
        createdAt: savedTicket.createdAt
      }
    });
    
  } catch (error) {
    console.error('❌ Error creating ticket:', error.message);
    console.error('Error details:', {
      name: error.name,
      code: error.code,
      errors: error.errors
    });
    
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
      message: 'Error creating support ticket',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ✅ GET /api/support - Get all support tickets
router.get('/', async (req, res) => {
  try {
    console.log('📊 Fetching all support tickets...');
    
    const tickets = await SupportTicket.find().sort({ createdAt: -1 });
    const count = await SupportTicket.countDocuments();
    
    console.log(`✅ Found ${tickets.length} tickets in database`);
    
    res.json({
      success: true,
      count: tickets.length,
      total: count,
      data: tickets
    });
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching support tickets',
      error: error.message
    });
  }
});

// ✅ GET /api/support/:id - Get single ticket by ID
router.get('/:id', async (req, res) => {
  try {
    console.log('🔍 Fetching ticket:', req.params.id);
    
    const ticket = await SupportTicket.findById(req.params.id);
    
    if (!ticket) {
      console.log('❌ Ticket not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }
    
    console.log('✅ Ticket found:', ticket._id);
    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Error fetching support ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching support ticket',
      error: error.message
    });
  }
});

// ✅ PUT /api/support/:id - Update ticket
router.put('/:id', async (req, res) => {
  try {
    const { status, subject, description, priority, category, resolutionNotes } = req.body;
    
    const updateData = {};
    if (status) updateData.status = status;
    if (subject) updateData.subject = subject;
    if (description) updateData.description = description;
    if (priority) updateData.priority = priority;
    if (category) updateData.category = category;
    if (resolutionNotes) updateData.resolutionNotes = resolutionNotes;
    
    updateData.updatedAt = Date.now();
    
    const updatedTicket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedTicket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Support ticket updated successfully',
      data: updatedTicket
    });
  } catch (error) {
    console.error('Error updating support ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating support ticket',
      error: error.message
    });
  }
});

// ✅ PATCH /api/support/:id/status - Update only ticket status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    const validStatuses = ['open', 'in-progress', 'resolved', 'closed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required (open, in-progress, resolved, or closed)'
      });
    }
    
    const updatedTicket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      {
        status,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (!updatedTicket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }
    
    res.json({
      success: true,
      message: `Ticket status updated to "${status}"`,
      data: updatedTicket
    });
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating ticket status',
      error: error.message
    });
  }
});

// ✅ DELETE /api/support/:id - Delete ticket
router.delete('/:id', async (req, res) => {
  try {
    const deletedTicket = await SupportTicket.findByIdAndDelete(req.params.id);
    
    if (!deletedTicket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Support ticket deleted successfully',
      data: { id: req.params.id }
    });
  } catch (error) {
    console.error('Error deleting support ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting support ticket',
      error: error.message
    });
  }
});

// ✅ GET /api/support/user/:userId - Get all tickets for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user tickets',
      error: error.message
    });
  }
});

// ✅ GET /api/support/stats/dashboard - Get statistics for dashboard
router.get('/stats/dashboard', async (req, res) => {
  try {
    const totalTickets = await SupportTicket.countDocuments();
    const openTickets = await SupportTicket.countDocuments({ status: 'open' });
    const inProgressTickets = await SupportTicket.countDocuments({ status: 'in-progress' });
    const resolvedTickets = await SupportTicket.countDocuments({ status: 'resolved' });
    const closedTickets = await SupportTicket.countDocuments({ status: 'closed' });
    
    const priorityStats = await SupportTicket.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } }
    ]);
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentTickets = await SupportTicket.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        total: totalTickets,
        byStatus: {
          open: openTickets,
          inProgress: inProgressTickets,
          resolved: resolvedTickets,
          closed: closedTickets
        },
        byPriority: priorityStats,
        recentActivity: recentTickets
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
});

module.exports = router;