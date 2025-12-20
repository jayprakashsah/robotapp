// robot-app-backend/src/routes/orderRoutes.js - FIXED VERSION
const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { authenticate, checkDatabase } = require('../middleware/authMiddleware');
const router = express.Router();

// ✅ CREATE ORDER - ULTRA SIMPLE VERSION
router.post('/', checkDatabase, async (req, res) => {
    console.log('🛒 ORDER CREATION - SIMPLE VERSION');
    
    try {
        // Generate order number BEFORE creating the order
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const orderNumber = `ORD${year}${month}${day}${random}`;
        
        console.log('✅ Generated order number:', orderNumber);
        
        // Create simple order data
        const orderData = {
            orderNumber: orderNumber,
            userId: req.body.userId || null,
            items: req.body.items || [],
            shippingAddress: req.body.shippingAddress || {},
            paymentMethod: req.body.paymentMethod || 'cod',
            paymentStatus: 'pending',
            orderStatus: 'pending',
            subtotal: req.body.subtotal || 0,
            shippingCharge: req.body.shippingCharge || 0,
            tax: req.body.tax || 0,
            discount: req.body.discount || 0,
            totalAmount: req.body.totalAmount || 0,
            notes: req.body.notes || '',
            giftWrap: req.body.giftWrap || false,
            giftMessage: req.body.giftMessage || '',
            shippingSpeed: req.body.shippingSpeed || 'standard'
        };
        
        console.log('📦 Order data prepared');
        
        // Create and save order WITHOUT any middleware issues
        const order = new Order(orderData);
        const savedOrder = await order.save();
        
        console.log('✅ Order saved successfully! ID:', savedOrder._id);
        console.log('✅ Order Number:', savedOrder.orderNumber);
        
        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order: {
                id: savedOrder._id,
                orderNumber: savedOrder.orderNumber,
                totalAmount: savedOrder.totalAmount,
                orderStatus: savedOrder.orderStatus,
                paymentStatus: savedOrder.paymentStatus,
                createdAt: savedOrder.createdAt
            }
        });
        
    } catch (error) {
        console.error('💥 ORDER CREATION FAILED:', error.message);
        console.error('💥 Error stack:', error.stack);
        
        // Check if it's a validation error
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Order creation failed: ' + error.message,
            error: error.message
        });
    }
});


// ✅ GET USER ORDERS
router.get('/my-orders', authenticate, checkDatabase, async (req, res) => {
    try {
        console.log('📋 Fetching orders for user:', req.userId);
        
        const orders = await Order.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .select('-__v -updatedAt');
        
        console.log(`✅ Found ${orders.length} orders`);
        
        res.json({
            success: true,
            orders: orders.map(order => ({
                id: order._id,
                orderNumber: order.orderNumber,
                items: order.items,
                shippingAddress: order.shippingAddress,
                totalAmount: order.totalAmount,
                orderStatus: order.orderStatus,
                paymentStatus: order.paymentStatus,
                paymentMethod: order.paymentMethod,
                createdAt: order.createdAt
            }))
        });
        
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders'
        });
    }
});

// ✅ GET ORDER BY ID
router.get('/:id', checkDatabase, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        // Check authorization
        if (req.userId && order.userId && order.userId.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }
        
        res.json({
            success: true,
            order: {
                id: order._id,
                orderNumber: order.orderNumber,
                items: order.items,
                shippingAddress: order.shippingAddress,
                paymentMethod: order.paymentMethod,
                subtotal: order.subtotal,
                shippingCharge: order.shippingCharge,
                tax: order.tax,
                totalAmount: order.totalAmount,
                orderStatus: order.orderStatus,
                paymentStatus: order.paymentStatus,
                notes: order.notes,
                createdAt: order.createdAt
            }
        });
        
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching order'
        });
    }
});

// ✅ UPDATE ORDER STATUS (Admin)
router.patch('/:id/status', authenticate, async (req, res) => {
    try {
        // Check if user is admin
        const user = req.user;
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin only'
            });
        }
        
        const { orderStatus, trackingNumber, estimatedDelivery } = req.body;
        
        const updateData = {};
        if (orderStatus) updateData.orderStatus = orderStatus;
        if (trackingNumber) updateData.trackingNumber = trackingNumber;
        if (estimatedDelivery) updateData.estimatedDelivery = estimatedDelivery;
        
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            updateData,
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
            message: 'Order status updated',
            order
        });
        
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating order'
        });
    }
});

// ✅ UPDATE PAYMENT STATUS
router.patch('/:id/payment', checkDatabase, async (req, res) => {
    try {
        const { paymentStatus, transactionId } = req.body;
        
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { 
                paymentStatus,
                ...(transactionId && { transactionId })
            },
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
            message: 'Payment status updated',
            order
        });
        
    } catch (error) {
        console.error('Error updating payment:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating payment'
        });
    }
});

// ✅ CANCEL ORDER
router.post('/:id/cancel', authenticate, checkDatabase, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        // Check ownership
        if (order.userId.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }
        
        // Check if can be cancelled
        if (!['pending', 'confirmed'].includes(order.orderStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel at this stage'
            });
        }
        
        order.orderStatus = 'cancelled';
        order.cancelledAt = new Date();
        
        await order.save();
        
        res.json({
            success: true,
            message: 'Order cancelled'
        });
        
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling order'
        });
    }
});

// ✅ TEST ENDPOINTS
router.get('/test/health', (req, res) => {
    res.json({
        success: true,
        message: 'Order API is working',
        timestamp: new Date().toISOString()
    });
});

router.post('/test/create', async (req, res) => {
    try {
        console.log('🧪 Creating test order...');
        
        const orderNumber = 'TEST-' + Date.now().toString().slice(-6);
        
        const testOrder = new Order({
            orderNumber: orderNumber,
            userId: 'test-user',
            items: [{
                productId: 'test-product',
                productName: 'Test Product',
                variant: 'Test',
                quantity: 1,
                price: 1000,
                total: 1000
            }],
            shippingAddress: {
                fullName: 'Test User',
                email: 'test@example.com',
                phone: '1234567890',
                addressLine1: '123 Test St',
                city: 'Test City',
                state: 'TS',
                postalCode: '400001',
                country: 'India',
                type: 'home'
            },
            paymentMethod: 'cod',
            paymentStatus: 'pending',
            orderStatus: 'pending',
            subtotal: 1000,
            shippingCharge: 0,
            tax: 180,
            discount: 0,
            totalAmount: 1180
        });
        
        await testOrder.save();
        
        res.json({
            success: true,
            message: 'Test order created',
            orderId: testOrder._id,
            orderNumber: testOrder.orderNumber
        });
        
    } catch (error) {
        console.error('Test failed:', error);
        res.status(500).json({
            success: false,
            message: 'Test failed: ' + error.message
        });
    }
});

module.exports = router;