const express = require('express');
const SupportTicket = require('../models/SupportTicket');
const router = express.Router();

// ✅ POST /api/support - Create new support ticket
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, description, category, priority, userId, robotIP } = req.body;
    
    // Validation
    if (!email || !subject || !description) {
      return res.status(400).json({
        success: false,
        message: 'Email, subject and description are required'
      });
    }
    
    const newTicket = new SupportTicket({
      userId: userId || 'anonymous',
      name: name || 'Anonymous',
      email,
      subject,
      description,
      category: category || 'technical',
      priority: priority || 'medium',
      robotIP: robotIP || 'not_connected',
      status: 'open'
    });
    
    const savedTicket = await newTicket.save();
    
    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      data: savedTicket,
      ticketId: savedTicket._id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating support ticket',
      error: error.message
    });
  }
});

// ✅ GET /api/support - Get all support tickets (with optional filtering)
router.get('/', async (req, res) => {
  try {
    const { status, userId, priority, category, sort = 'createdAt', order = 'desc' } = req.query;
    
    // Build query filter
    const filter = {};
    if (status) filter.status = status;
    if (userId) filter.userId = userId;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    
    // Build sort object
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObject = { [sort]: sortOrder };
    
    const tickets = await SupportTicket.find(filter).sort(sortObject);
    res.json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
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
    const ticket = await SupportTicket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }
    
    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching support ticket',
      error: error.message
    });
  }
});

// ✅ PUT /api/support/:id - Update ticket (admin/owner only)
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
    
    // Always update the 'updatedAt' timestamp
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
    
    // Validate status
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
    res.status(500).json({
      success: false,
      message: 'Error updating ticket status',
      error: error.message
    });
  }
});

// ✅ DELETE /api/support/:id - Delete ticket (admin only)
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
    
    // Get tickets by priority
    const priorityStats = await SupportTicket.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } }
    ]);
    
    // Get tickets created in last 7 days for chart
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
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
});

module.exports = router;