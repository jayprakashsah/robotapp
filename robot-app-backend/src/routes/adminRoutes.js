const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/authMiddleware'); // Import auth middleware

const SupportTicket = require('../models/SupportTicket');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// ✅ Apply authentication middleware to ALL admin routes
router.use(authenticate);
// ✅ Apply admin check middleware to ALL admin routes
router.use(isAdmin);

// GET /admin/dashboard/stats - Dashboard statistics
router.get('/dashboard/stats', async (req, res) => {
  try {
    console.log('📊 Fetching dashboard stats for admin:', req.user.email);
    
    // Get total counts
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    
    // Get revenue (sum of all order totals)
    const revenueResult = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" }
        }
      }
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;
    
    // Get pending orders
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
    
    // Get today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today }
    });
    
    // Get average order value
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Get support ticket stats
    const totalTickets = await SupportTicket.countDocuments();
    const openTickets = await SupportTicket.countDocuments({ status: 'open' });
    const highPriorityTickets = await SupportTicket.countDocuments({ 
      priority: { $in: ['high', 'critical'] } 
    });

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue,
        totalUsers,
        pendingOrders,
        todayOrders,
        totalProducts,
        avgOrderValue: Math.round(avgOrderValue),
        totalTickets,
        openTickets,
        highPriorityTickets
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
});

// GET /admin/orders - Get all orders with filters
router.get('/orders', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      sortBy = '-createdAt',
      search 
    } = req.query;
    
    const query = {};
    
    if (status) {
      query.orderStatus = status;
    }
    
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
        { 'shippingAddress.email': { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const orders = await Order.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'name email')
      .lean();
    
    const total = await Order.countDocuments(query);
    
    res.json({
      success: true,
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

// GET /admin/orders/:id - Get order details
router.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('items.productId', 'name price images')
      .lean();
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order details',
      error: error.message
    });
  }
});

// PATCH /admin/orders/:id/status - Update order status
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: status, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
});

// GET /admin/users - Get all users
router.get('/users', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search,
      sortBy = '-createdAt' 
    } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Note: Your User model uses 'username' field, not 'name'
    const users = await User.find(query, { password: 0 })
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// PATCH /admin/users/:id - Update user
router.patch('/users/:id', async (req, res) => {
  try {
    const { isActive, role, ...otherUpdates } = req.body;
    
    const updateData = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (role) updateData.role = role;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, select: '-password' }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
});

// GET /admin/products - Get all products
router.get('/products', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search,
      category,
      sortBy = '-createdAt' 
    } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const products = await Product.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const total = await Product.countDocuments(query);
    
    res.json({
      success: true,
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching admin products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

// DELETE /admin/products/:id - Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
});

// POST /admin/products - Create product
router.post('/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
});


// PUT /admin/products/:id - Update product
router.put('/products/:id', async (req, res) => {
  try {
    console.log(`🔄 Updating product ${req.params.id}`);
    console.log('Update data:', req.body);
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    console.log('✅ Product updated:', product._id);
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('❌ Error updating product:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
});


// PATCH /admin/products/:id/status - Toggle product status
router.patch('/products/:id/status', async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      message: `Product ${isActive ? 'activated' : 'deactivated'}`,
      product
    });
  } catch (error) {
    console.error('Error toggling product status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product status',
      error: error.message
    });
  }
});

// GET /admin/support - Get all support tickets (admin view)
router.get('/support', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      priority,
      category,
      sortBy = '-createdAt',
      search 
    } = req.query;
    
    const query = {};
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const tickets = await SupportTicket.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const total = await SupportTicket.countDocuments(query);
    
    res.json({
      success: true,
      tickets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
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

// GET /admin/support/:id - Get ticket details
router.get('/support/:id', async (req, res) => {
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
      ticket
    });
  } catch (error) {
    console.error('Error fetching ticket details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ticket details',
      error: error.message
    });
  }
});

// PATCH /admin/support/:id/status - Update ticket status
router.patch('/support/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    const validStatuses = ['open', 'in-progress', 'resolved', 'closed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required (open, in-progress, resolved, or closed)'
      });
    }
    
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }
    
    res.json({
      success: true,
      message: `Ticket status updated to "${status}"`,
      ticket
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

// GET /admin/activities - Get recent activities
router.get('/activities', async (req, res) => {
  try {
    console.log('📋 Fetching recent activities for admin:', req.user.email);
    
    // Get recent orders
    const recentOrders = await Order.find()
      .sort('-createdAt')
      .limit(5)
      .select('orderNumber orderStatus totalAmount createdAt shippingAddress.fullName')
      .lean();
    
    // Get recent support tickets
    const recentTickets = await SupportTicket.find()
      .sort('-createdAt')
      .limit(5)
      .select('subject status priority createdAt name email')
      .lean();
    
    // Get recent users
    const recentUsers = await User.find()
      .sort('-createdAt')
      .limit(5)
      .select('username email createdAt role')
      .lean();
    
    // Format activities
    const activities = [
      ...recentOrders.map(order => ({
        type: 'order',
        title: `New order #${order.orderNumber}`,
        description: `${order.shippingAddress?.fullName || 'Customer'} placed an order`,
        amount: order.totalAmount,
        status: order.orderStatus,
        timestamp: order.createdAt,
        user: order.shippingAddress?.fullName || 'Customer'
      })),
      ...recentTickets.map(ticket => ({
        type: 'ticket',
        title: `Support ticket: ${ticket.subject}`,
        description: `${ticket.name} submitted a support request`,
        priority: ticket.priority,
        status: ticket.status,
        timestamp: ticket.createdAt,
        user: ticket.name
      })),
      ...recentUsers.map(user => ({
        type: 'user',
        title: `New ${user.role} registered`,
        description: `${user.username} joined the platform`,
        role: user.role,
        timestamp: user.createdAt,
        user: user.username
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
     .slice(0, 10); // Get top 10 recent activities
    
    res.json({
      success: true,
      activities
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activities',
      error: error.message
    });
  }
});

module.exports = router;