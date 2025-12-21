// frontend/src/services/adminService.js
import { WEB_API } from './api';

const adminService = {
  // Dashboard Stats
  getDashboardStats: async () => {
    try {
      const response = await WEB_API.get('/admin/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Orders
  getAdminOrders: async (params = {}) => {
    try {
      const response = await WEB_API.get('/admin/orders', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching admin orders:', error);
      throw error;
    }
  },

  getOrderDetails: async (orderId) => {
    try {
      const response = await WEB_API.get(`/admin/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  },

  updateOrderStatus: async (orderId, data) => {
    try {
      const response = await WEB_API.patch(`/admin/orders/${orderId}/status`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Users
  getUsers: async (params = {}) => {
    try {
      const response = await WEB_API.get('/admin/users', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },



 getAnalytics: async (params) => {
    const response = await api.get('/admin/analytics', { params });
    return response.data;
  },

  updateOrderStatus: async (orderId, status) => {
    const response = await api.put(`/admin/orders/${orderId}/status`, { status });
    return response.data;
  },

  getProducts: async (params) => {
    const response = await api.get('/admin/products', { params });
    return response.data;
  },

  deleteProduct: async (productId) => {
    const response = await api.delete(`/admin/products/${productId}`);
    return response.data;
  },

  updateTicketStatus: async (ticketId, status) => {
    const response = await api.put(`/admin/support/tickets/${ticketId}/status`, { status });
    return response.data;
  },







  updateUser: async (userId, data) => {
    try {
      const response = await WEB_API.patch(`/admin/users/${userId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Products
  getAdminProducts: async (params = {}) => {
    try {
      const response = await WEB_API.get('/admin/products', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching admin products:', error);
      throw error;
    }
  },

  deleteProduct: async (productId) => {
    try {
      const response = await WEB_API.delete(`/admin/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  saveProduct: async (productData) => {
    try {
      const response = await WEB_API.post('/admin/products', productData);
      return response.data;
    } catch (error) {
      console.error('Error saving product:', error);
      throw error;
    }
  },

  // Add this method right after saveProduct in adminService.js
updateProduct: async (productId, productData) => {
  try {
    const response = await WEB_API.put(`/admin/products/${productId}`, productData);
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
},

  toggleProductStatus: async (productId, isActive) => {
    try {
      const response = await WEB_API.patch(`/admin/products/${productId}/status`, { isActive });
      return response.data;
    } catch (error) {
      console.error('Error toggling product status:', error);
      throw error;
    }
  },

  // Support Tickets
  getSupportTickets: async (params = {}) => {
    try {
      const response = await WEB_API.get('/admin/support', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching support tickets:', error);
      throw error;
    }
  },

  getTicketDetails: async (ticketId) => {
    try {
      const response = await WEB_API.get(`/admin/support/${ticketId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      throw error;
    }
  },

  updateTicketStatus: async (ticketId, data) => {
    try {
      const response = await WEB_API.patch(`/admin/support/${ticketId}/status`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating ticket status:', error);
      throw error;
    }
  },

  // Activities
  getActivities: async () => {
    try {
      const response = await WEB_API.get('/admin/activities');
      return response.data;
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  }
};



export default adminService;