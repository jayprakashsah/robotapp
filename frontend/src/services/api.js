// src/services/api.js
import axios from 'axios';

// STATIC WEB BACKEND - For Support/Feedback (Always localhost:5001)
export const WEB_API = axios.create({
  baseURL: import.meta.env.VITE_WEB_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add token to all requests automatically
WEB_API.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  console.log('🔍 Request interceptor - Token from localStorage:', token);
  
  if (token && token !== 'null' && token !== 'undefined') {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('✅ Added Authorization header with token');
  } else {
    console.log('⚠️ No valid token found, skipping Authorization header');
  }
  
  // Add request ID for debugging
  config.headers['X-Request-ID'] = Date.now();
  
  console.log('Request headers:', config.headers);
  return config;
}, (error) => {
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
});

// Response interceptor for error handling
WEB_API.interceptors.response.use(
  (response) => {
    // Log successful API calls in development
    console.log(`✅ API ${response.config.method?.toUpperCase()} ${response.config.url}:`, response.status);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Log error details
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      response: error.response?.data
    });
    
    // Handle network errors
    if (!error.response) {
      console.error('🚫 Network error - Backend may be offline');
      return Promise.reject({
        ...error,
        message: 'Cannot connect to server. Please check if backend is running.',
        isNetworkError: true,
        code: error.code
      });
    }
    
    // Handle 401 Unauthorized (token expired/invalid)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      console.warn('🔒 Token expired or invalid, clearing auth data');
      
      // Clear all auth data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_name');
      localStorage.removeItem('user_email');
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_role');
      
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login' && 
          window.location.pathname !== '/' &&
          !window.location.pathname.includes('login')) {
        
        // Store current path to return after login
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        
        // Redirect to login with session expired message
        window.location.href = '/login?session=expired&message=' + 
          encodeURIComponent('Your session has expired. Please login again.');
      }
      
      return Promise.reject(error);
    }
    
    // Handle 403 Forbidden (no permission)
    if (error.response?.status === 403) {
      console.warn('🚫 Access forbidden');
    }
    
    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.warn('🔍 Endpoint not found:', error.config.url);
    }
    
    // Handle 500 Server Error
    if (error.response?.status >= 500) {
      console.error('💥 Server error:', error.response.data);
    }
    
    // Return a user-friendly error message
    const userMessage = error.response?.data?.message || 
                       error.message || 
                       'An error occurred. Please try again.';
    
    return Promise.reject({
      ...error,
      userMessage,
      status: error.response?.status
    });
  }
);

// DYNAMIC ROBOT API - Factory function to create instance for any IP
export const createRobotAPI = (baseURL) => {
  // Ensure URL has http:// and port
  let formattedURL = baseURL.trim();
  if (!formattedURL.startsWith('http')) {
    formattedURL = `http://${formattedURL}`;
  }
  
  return axios.create({
    baseURL: formattedURL,
    timeout: 8000, // 8 second timeout for robot
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// Helper to get current robot IP from localStorage
export const getCurrentRobotAPI = () => {
  const robotIP = localStorage.getItem('robot_ip');
  if (!robotIP) {
    console.warn('No robot IP found in localStorage');
    return null;
  }
  
  let formattedURL = robotIP.trim();
  if (!formattedURL.startsWith('http')) {
    formattedURL = `http://${formattedURL}`;
  }
  
  console.log(`🤖 Creating robot API for: ${formattedURL}`);
  
  return axios.create({
    baseURL: formattedURL,
    timeout: 8000,
    headers: {
      'Content-Type': 'application/json',
      'X-Robot-Request': 'true'
    },
  });
};

// ✅ FIXED: Helper to verify token on app start
export const verifyAuthToken = async () => {
  const token = localStorage.getItem('auth_token');
  
  if (!token || token === 'null' || token === 'undefined') {
    console.log('🔒 No valid auth token found');
    return false;
  }
  
  try {
    console.log('🔍 Verifying auth token...');
    
    // ✅ FIXED: Changed from '/auth/verify' to '/auth/verify' (WEB_API already has /api base)
    const response = await WEB_API.get('/auth/verify', {
      timeout: 5000
    });
    
    if (response.data.success) {
      console.log('✅ Token verified successfully');
      
      // Update user info in localStorage if available
      if (response.data.user) {
        localStorage.setItem('user_id', response.data.user.id || '');
        localStorage.setItem('user_name', response.data.user.username || '');
        localStorage.setItem('user_email', response.data.user.email || '');
        localStorage.setItem('user_role', response.data.user.role || 'user');
      }
      
      return true;
    }
    
    console.warn('⚠️ Token verification returned false');
    return false;
    
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    
    // If it's a network error, don't clear token (backend might be down)
    if (error.isNetworkError || error.code === 'ERR_NETWORK' || error.message.includes('Network')) {
      console.log('🌐 Backend may be offline, keeping token for now');
      return false; // Return false so fallback auth can be used
    }
    
    // Clear invalid token (401 or malformed JWT)
    if (error.response?.status === 401 || error.message.includes('jwt')) {
      console.log('🗑️ Clearing invalid token from localStorage');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_name');
      localStorage.removeItem('user_email');
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_role');
    }
    
    return false;
  }
};

// ✅ FIXED: Helper to check backend health
export const checkBackendHealth = async () => {
  try {
    const response = await axios.get(
      import.meta.env.VITE_WEB_API_URL?.replace('/api', '') || 'http://localhost:5001/api/health',
      { 
        timeout: 3000,
        headers: {
          'Cache-Control': 'no-cache'
        }
      }
    );
    
    return {
      status: 'connected',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Health check error:', error.message);
    
    // Try alternative endpoints
    try {
      const altResponse = await axios.get('http://localhost:5001/', {
        timeout: 3000
      });
      
      return {
        status: 'connected',
        data: altResponse.data,
        timestamp: new Date().toISOString(),
        note: 'Connected via root endpoint'
      };
    } catch (altError) {
      return {
        status: error.code === 'ECONNABORTED' ? 'timeout' : 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
};

// Helper to make authenticated requests with retry
export const authenticatedRequest = async (method, url, data = null, options = {}) => {
  const maxRetries = options.maxRetries || 2;
  const retryDelay = options.retryDelay || 1000;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const config = {
        method,
        url,
        ...options
      };
      
      if (data && (method === 'post' || method === 'put' || method === 'patch')) {
        config.data = data;
      }
      
      const response = await WEB_API(config);
      return response;
      
    } catch (error) {
      // Don't retry on 4xx errors (except 429 - too many requests)
      if (error.response && error.response.status < 500 && error.response.status !== 429) {
        throw error;
      }
      
      // Last attempt failed
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
      console.log(`🔄 Retrying ${method} ${url} (attempt ${attempt + 1}/${maxRetries})`);
    }
  }
};

// Export convenience methods
export const api = {
  get: (url, config) => authenticatedRequest('get', url, null, config),
  post: (url, data, config) => authenticatedRequest('post', url, data, config),
  put: (url, data, config) => authenticatedRequest('put', url, data, config),
  patch: (url, data, config) => authenticatedRequest('patch', url, data, config),
  delete: (url, config) => authenticatedRequest('delete', url, null, config),
  
  // Health check
  health: () => checkBackendHealth(),
  
  // Auth helpers
  verifyToken: verifyAuthToken,
  
  // Robot helpers
  createRobot: createRobotAPI,
  getRobot: getCurrentRobotAPI
};

export default WEB_API;