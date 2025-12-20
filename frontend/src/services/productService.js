// frontend/src/services/productService.js
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const productService = {
  // Get all products
  getProducts: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/products`, {
        params: {
          variant: params.variant,
          search: params.search,
          sort: params.sort,
          minPrice: params.minPrice,
          maxPrice: params.maxPrice,
          limit: params.limit || 10,
          page: params.page || 1
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      // Return fallback data if API fails
      return {
        success: false,
        products: [],
        pagination: { total: 0, page: 1, pages: 1, limit: 10 }
      };
    }
  },

  // Get single product by slug
  getProductBySlug: async (slug) => {
    try {
      const response = await axios.get(`${API_URL}/products/${slug}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Get single product by ID
  getProductById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/products/id/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Get variant statistics
  getVariantStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/products/variants/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching variant stats:', error);
      return { success: false, stats: [] };
    }
  },

  // ADMIN: Create product
  createProduct: async (productData) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.post(`${API_URL}/products`, productData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // ADMIN: Update product
  updateProduct: async (id, productData) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.put(`${API_URL}/products/${id}`, productData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // ADMIN: Delete product
  deleteProduct: async (id) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.delete(`${API_URL}/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // ADMIN: Get all products (including inactive)
  getAllProductsAdmin: async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.get(`${API_URL}/products/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching admin products:', error);
      throw error;
    }
  }
};

export default productService;