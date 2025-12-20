// frontend/src/services/orderService.js - UPDATED VERSION
import { WEB_API } from './api';

const orderService = {
  // Create a new order
  createOrder: async (orderData) => {
    try {
      console.log('🛒 Creating order with data:', orderData);
      
      // Get auth token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // Ensure all required fields are present
      const completeOrderData = {
        ...orderData,
        userId: localStorage.getItem('user_id'),
        timestamp: new Date().toISOString()
      };

      console.log('📤 Sending to backend:', completeOrderData);

      const response = await WEB_API.post('/orders', completeOrderData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Backend response:', response.data);

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Order creation failed');
      }

    } catch (error) {
      console.error('❌ Error creating order:', error);
      
      // Return error details
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Order creation failed',
        error: error.response?.data
      };
    }
  },

  // Get user's orders
  getMyOrders: async () => {
    try {
      console.log('📋 Fetching user orders...');
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await WEB_API.get('/orders/my-orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✅ Orders fetched:', response.data);
      return response.data;

    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch orders',
        orders: []
      };
    }
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await WEB_API.get(`/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  // Update OrderForm.jsx submit function
  handleSubmitOrder: async (formData, product) => {
    try {
      const orderSummary = calculateOrderSummary(product, formData);
      
      const orderData = {
        items: [{
          productId: product._id,
          productName: product.name,
          variant: product.variant,
          quantity: 1,
          price: product.discountPrice || product.price,
          total: orderSummary.subtotal
        }],
        shippingAddress: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2 || '',
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          landmark: formData.landmark || '',
          type: formData.addressType
        },
        billingAddress: formData.useSameAddress ? undefined : {
          // Add billing address if different
        },
        paymentMethod: formData.paymentMethod,
        paymentStatus: 'pending',
        orderStatus: 'pending',
        subtotal: orderSummary.subtotal,
        shippingCharge: orderSummary.shipping,
        tax: orderSummary.tax,
        discount: 0,
        totalAmount: orderSummary.total,
        notes: formData.notes || '',
        giftWrap: formData.giftWrap || false,
        giftMessage: formData.giftMessage || '',
        shippingSpeed: formData.shippingSpeed
      };

      // Add payment details if available
      if (formData.paymentMethod === 'credit_card' || formData.paymentMethod === 'debit_card') {
        orderData.paymentDetails = {
          cardLastFour: formData.cardNumber?.slice(-4) || '',
          cardHolderName: formData.cardHolderName || ''
        };
      }

      console.log('📦 Final order data for DB:', orderData);
      return await orderService.createOrder(orderData);

    } catch (error) {
      console.error('Error preparing order:', error);
      throw error;
    }
  },

  // Calculate order summary
  calculateOrderSummary: (product, formData) => {
    const subtotal = (product.discountPrice || product.price) * (formData.quantity || 1);
    const shipping = {
      standard: 99,
      express: 199,
      next_day: 499
    }[formData.shippingSpeed] || 99;
    
    const tax = subtotal * 0.18;
    const giftWrapCharge = formData.giftWrap ? 149 : 0;
    const total = subtotal + shipping + tax + giftWrapCharge;
    
    return { subtotal, shipping, tax, giftWrapCharge, total };
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await WEB_API.post(`/orders/${orderId}/cancel`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  },

  // Sync local orders with backend
  syncLocalOrders: async () => {
    const localOrders = JSON.parse(localStorage.getItem('pending_orders') || '[]');
    if (localOrders.length === 0) return { success: true, synced: 0 };

    const results = [];
    for (const order of localOrders) {
      try {
        const result = await orderService.createOrder(order);
        results.push({ success: true, orderId: order._id, result });
      } catch (error) {
        results.push({ success: false, orderId: order._id, error });
      }
    }

    // Remove synced orders
    const failedOrders = localOrders.filter(order => 
      results.find(r => !r.success && r.orderId === order._id)
    );
    localStorage.setItem('pending_orders', JSON.stringify(failedOrders));

    return {
      success: true,
      total: localOrders.length,
      synced: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  }
};

export default orderService;