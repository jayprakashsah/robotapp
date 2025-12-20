// src/services/authFallback.js
// Fallback authentication when backend is offline

export const fallbackAuth = {
  // Check if we should use fallback (backend offline)
  shouldUseFallback: async () => {
    try {
      console.log('🔍 Checking backend connectivity...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch('http://localhost:5001/api/health', {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      }).finally(() => clearTimeout(timeoutId));
      
      const data = await response.json();
      console.log('✅ Backend is online:', data);
      return false; // Backend is online, don't use fallback
    } catch (error) {
      console.log('❌ Backend is offline, will use fallback:', error.message);
      return true; // Use fallback if can't reach backend
    }
  },

  // Login with fallback
  login: async (email, password) => {
    console.warn('⚠️ Using fallback auth (backend offline)');
    
    if (!email || !password) {
      throw new Error('Email and password required');
    }
    
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    
    // Create mock user data
    const mockUser = {
      id: 'fallback_user_' + Date.now(),
      username: email.split('@')[0] || 'User',
      email: email,
      role: 'user',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    
    // Create mock token (not a real JWT)
    const mockToken = 'fallback_token_' + btoa(JSON.stringify(mockUser)) + '_' + Date.now();
    
    // Store in localStorage
    localStorage.setItem('auth_token', mockToken);
    localStorage.setItem('user_id', mockUser.id);
    localStorage.setItem('user_name', mockUser.username);
    localStorage.setItem('user_email', mockUser.email);
    localStorage.setItem('user_role', mockUser.role);
    localStorage.setItem('using_fallback', 'true');
    
    console.log('💾 Saved fallback auth to localStorage');
    
    return {
      success: true,
      message: 'Logged in (offline mode)',
      token: mockToken,
      user: mockUser
    };
  },

  // Register with fallback
  register: async (username, email, password) => {
    console.warn('⚠️ Using fallback registration (backend offline)');
    
    if (!username || !email || !password) {
      throw new Error('All fields required');
    }
    
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    
    if (username.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }
    
    // Create mock user
    const mockUser = {
      id: 'fallback_user_' + Date.now(),
      username: username,
      email: email,
      role: 'user',
      createdAt: new Date().toISOString()
    };
    
    const mockToken = 'fallback_token_' + btoa(JSON.stringify(mockUser)) + '_' + Date.now();
    
    // Store in localStorage
    localStorage.setItem('auth_token', mockToken);
    localStorage.setItem('user_id', mockUser.id);
    localStorage.setItem('user_name', mockUser.username);
    localStorage.setItem('user_email', mockUser.email);
    localStorage.setItem('user_role', mockUser.role);
    localStorage.setItem('using_fallback', 'true');
    
    // Save as pending registration
    const pendingRegistrations = JSON.parse(localStorage.getItem('pending_registrations') || '[]');
    pendingRegistrations.push({
      username,
      email,
      password, // Note: In real app, never store password like this!
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('pending_registrations', JSON.stringify(pendingRegistrations));
    
    console.log('💾 Saved pending registration for sync');
    
    return {
      success: true,
      message: 'Registered (offline mode - data will sync when backend is online)',
      token: mockToken,
      user: mockUser
    };
  },

  // Verify fallback token
  verify: (token) => {
    console.log('🔍 Verifying fallback token:', token?.substring(0, 30) + '...');
    
    if (!token || !token.startsWith('fallback_token_')) {
      console.log('❌ Invalid fallback token format');
      return { 
        success: false, 
        message: 'Invalid token',
        usingFallback: true 
      };
    }
    
    try {
      // Extract user data from token
      const userData = token.split('_')[2];
      const decoded = JSON.parse(atob(userData));
      
      console.log('✅ Fallback token verified successfully');
      
      return {
        success: true,
        user: decoded,
        usingFallback: true
      };
    } catch (error) {
      console.error('❌ Fallback token parsing failed:', error);
      return { 
        success: false, 
        message: 'Token verification failed',
        usingFallback: true 
      };
    }
  },

  // Save pending data for sync when backend comes online
  savePendingData: (dataType, data) => {
    const pendingKey = `pending_${dataType}`;
    const existing = JSON.parse(localStorage.getItem(pendingKey) || '[]');
    const newItem = {
      ...data,
      _id: `pending_${Date.now()}`,
      timestamp: new Date().toISOString(),
      synced: false
    };
    
    existing.push(newItem);
    localStorage.setItem(pendingKey, JSON.stringify(existing));
    
    console.log(`💾 Saved pending ${dataType} for sync:`, newItem);
    return newItem;
  },

  // Get pending data
  getPendingData: (dataType) => {
    const pendingKey = `pending_${dataType}`;
    const data = JSON.parse(localStorage.getItem(pendingKey) || '[]');
    console.log(`📋 Retrieved pending ${dataType}:`, data.length, 'items');
    return data;
  },

  // Clear pending data
  clearPendingData: (dataType) => {
    const pendingKey = `pending_${dataType}`;
    const data = JSON.parse(localStorage.getItem(pendingKey) || '[]');
    console.log(`🗑️  Clearing pending ${dataType}:`, data.length, 'items');
    localStorage.removeItem(pendingKey);
  },

  // Check if currently using fallback auth
  isUsingFallback: () => {
    return localStorage.getItem('using_fallback') === 'true';
  },

  // Switch to regular auth (when backend comes back online)
  switchToRegularAuth: (regularToken, user) => {
    console.log('🔄 Switching from fallback to regular auth');
    
    localStorage.setItem('auth_token', regularToken);
    localStorage.setItem('user_id', user.id);
    localStorage.setItem('user_name', user.username);
    localStorage.setItem('user_email', user.email);
    localStorage.setItem('user_role', user.role);
    localStorage.removeItem('using_fallback');
    
    console.log('✅ Switched to regular auth');
  }
};

export default fallbackAuth;