// robot-app-backend/src/routes/adminRoutes.js
const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { authenticate } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const router = express.Router();

// Apply admin middleware to all routes
router.use(authenticate);
router.use(adminMiddleware);
// In adminRoutes.js
router.get('/support', async (req, res) => { /* get all tickets */ });
router.patch('/support/:id/status', async (req, res) => { /* update status */ });


// ✅ ADMIN DASHBOARD STATS
router.get('/dashboard/stats', async (req, res) => {
    try {
        console.log('📊 Fetching admin dashboard stats');
        
        const [
            totalOrders,
            totalRevenue,
            totalUsers,
            pendingOrders,
            todayOrders,
            totalProducts
        ] = await Promise.all([
            Order.countDocuments(),
            Order.aggregate([
                { $match: { paymentStatus: 'paid' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            User.countDocuments({ isActive: true }),
            Order.countDocuments({ orderStatus: 'pending' }),
            Order.countDocuments({
                createdAt: { 
                    $gte: new Date(new Date().setHours(0, 0, 0, 0)) 
                }
            }),
            Product.countDocuments({ isActive: true })
        ]);
        
        const revenue = totalRevenue[0]?.total || 0;
        
        res.json({
            success: true,
            stats: {
                totalOrders,
                totalRevenue: revenue,
                totalUsers,
                pendingOrders,
                todayOrders,
                totalProducts,
                avgOrderValue: totalOrders > 0 ? revenue / totalOrders : 0
            }
        });
        
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard stats'
        });
    }
});

// ✅ GET ALL ORDERS (Admin)
router.get('/orders', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            status, 
            sortBy = '-createdAt',
            search 
        } = req.query;
        
        const query = {};
        
        if (status && status !== 'all') {
            query.orderStatus = status;
        }
        
        if (search) {
            query.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
                { 'shippingAddress.email': { $regex: search, $options: 'i' } }
            ];
        }
        
        const orders = await Order.find(query)
            .sort(sortBy)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .populate('userId', 'username email')
            .select('-__v');
        
        const total = await Order.countDocuments(query);
        
        res.json({
            success: true,
            orders,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                limit: parseInt(limit)
            }
        });
        
    } catch (error) {
        console.error('Error fetching admin orders:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders'
        });
    }
});

// ✅ GET ORDER DETAILS
router.get('/orders/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('userId', 'username email')
            .populate('items.productId', 'name variant images price');
        
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
            message: 'Error fetching order details'
        });
    }
});

// ✅ UPDATE ORDER STATUS
router.patch('/orders/:id/status', async (req, res) => {
    try {
        const { orderStatus, trackingNumber, estimatedDelivery, notes } = req.body;
        
        const updateData = {};
        if (orderStatus) updateData.orderStatus = orderStatus;
        if (trackingNumber) updateData.trackingNumber = trackingNumber;
        if (estimatedDelivery) updateData.estimatedDelivery = estimatedDelivery;
        if (notes !== undefined) updateData.notes = notes;
        
        // Add timestamps for certain status changes
        if (orderStatus === 'delivered') {
            updateData.deliveredAt = new Date();
        } else if (orderStatus === 'cancelled') {
            updateData.cancelledAt = new Date();
        }
        
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate('userId', 'username email');
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        // Send email notification if status changed (optional)
        if (orderStatus) {
            console.log(`📧 Order ${order.orderNumber} status changed to ${orderStatus}`);
            // Here you would add email sending logic
        }
        
        res.json({
            success: true,
            message: 'Order status updated successfully',
            order
        });
        
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating order status'
        });
    }
});

// ✅ GET ALL USERS
router.get('/users', async (req, res) => {
    try {
        const { page = 1, limit = 20, search, role } = req.query;
        
        const query = { isActive: true };
        
        if (role && role !== 'all') {
            query.role = role;
        }
        
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        
        const users = await User.find(query)
            .select('-password -__v')
            .sort('-createdAt')
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));
        
        const total = await User.countDocuments(query);
        
        res.json({
            success: true,
            users,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                limit: parseInt(limit)
            }
        });
        
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users'
        });
    }
});

// ✅ UPDATE USER
router.patch('/users/:id', async (req, res) => {
    try {
        const { role, isActive } = req.body;
        
        const updateData = {};
        if (role) updateData.role = role;
        if (isActive !== undefined) updateData.isActive = isActive;
        
        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).select('-password -__v');
        
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
            message: 'Error updating user'
        });
    }
});

// ✅ GET PRODUCTS (Admin)
router.get('/products', async (req, res) => {
    try {
        const { page = 1, limit = 20, search, variant, isActive } = req.query;
        
        const query = {};
        
        if (variant && variant !== 'all') {
            query.variant = variant;
        }
        
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        const products = await Product.find(query)
            .sort('-createdAt')
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));
        
        const total = await Product.countDocuments(query);
        
        res.json({
            success: true,
            products,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                limit: parseInt(limit)
            }
        });
        
    } catch (error) {
        console.error('Error fetching admin products:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products'
        });
    }
});

// ✅ CREATE/UPDATE PRODUCT
router.post('/products', async (req, res) => {
    try {
        const productData = req.body;
        
        let product;
        if (productData._id) {
            // Update existing product
            product = await Product.findByIdAndUpdate(
                productData._id,
                productData,
                { new: true }
            );
        } else {
            // Create new product
            product = new Product(productData);
            await product.save();
        }
        
        res.json({
            success: true,
            message: productData._id ? 'Product updated' : 'Product created',
            product
        });
        
    } catch (error) {
        console.error('Error saving product:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving product'
        });
    }
});

// ✅ TOGGLE PRODUCT STATUS
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
            message: 'Error toggling product status'
        });
    }
});

// ✅ GET RECENT ACTIVITIES
router.get('/activities', async (req, res) => {
    try {
        const activities = [];
        
        // Get recent orders
        const recentOrders = await Order.find()
            .sort('-createdAt')
            .limit(10)
            .select('orderNumber shippingAddress.fullName createdAt orderStatus')
            .populate('userId', 'username');
        
        recentOrders.forEach(order => {
            activities.push({
                type: 'order',
                action: 'New order placed',
                user: order.shippingAddress.fullName,
                details: order.orderNumber,
                time: order.createdAt
            });
        });


        // ✅ DELETE PRODUCT (Hard delete - Admin only)
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
            message: 'Product deleted permanently'
        });
        
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting product'
        });
    }
});
        
        // Get recent users
        const recentUsers = await User.find()
            .sort('-createdAt')
            .limit(5)
            .select('username email createdAt');
        
        recentUsers.forEach(user => {
            activities.push({
                type: 'user',
                action: 'New user registered',
                user: user.username,
                details: user.email,
                time: user.createdAt
            });
        });
        
        // Sort by time
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));
        
        res.json({
            success: true,
            activities: activities.slice(0, 15) // Return top 15
        });
        
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching activities'
        });
    }
});

module.exports = router;