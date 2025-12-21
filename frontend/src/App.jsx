import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Support from "./pages/Support";
import WifiQRGenerator from './components/WifiQRGenerator';
import Feedback from "./pages/Feedback";
import FeedbackCommunity from "./pages/FeedbackCommunity";
import Products from "./pages/Products";
import OrderForm from "./pages/OrderForm";
import MyOrders from "./pages/MyOrders";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminUsers from "./pages/admin/AdminUsers";
import OrdersAdmin from './pages/admin/Orders'; // Renamed to avoid conflict
import ProductsAdmin from './pages/admin/Products'; // Renamed to avoid conflict
import SupportTickets from './pages/admin/SupportTickets';
import Analytics from './pages/admin/Analytics';
import Settings from './pages/admin/Settings';


const AdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          console.log('🔒 No token found for admin check');
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        // ✅ FIXED: Better token decoding with error handling
        try {
          // Decode token to check role
          const decoded = JSON.parse(atob(token.split('.')[1]));
          const userRole = decoded.role;
          
          console.log('🔍 Admin check - Decoded role:', userRole);
          setIsAdmin(userRole === 'admin');
        } catch (decodeError) {
          console.error('❌ Token decode error:', decodeError);
          
          // Fallback: Check via API
          const response = await fetch('http://localhost:5001/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setIsAdmin(data.user?.role === 'admin');
          } else {
            setIsAdmin(false);
          }
        }
      } catch (error) {
        console.error('Admin check error:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdmin();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#050b16] via-[#0a1122] to-[#050b16] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          <p className="mt-4 text-slate-300">Checking admin privileges...</p>
        </div>
      </div>
    );
  }

  // ✅ Debug info
  console.log('🚀 Admin route check result:', { isAdmin, isLoading });
  
  return isAdmin ? children : <Navigate to="/dashboard" replace />;
};

// Auth verification utility
const verifyToken = async () => {
  const token = localStorage.getItem('auth_token');
  if (!token || token === 'null' || token === 'undefined') {
    console.log('🔒 No valid token found');
    return false;
  }
  
  try {
    console.log('🔍 Verifying token...');
    const response = await fetch('http://localhost:5001/api/auth/verify', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Token verified:', data.success);
      return data.success;
    }
    console.log('❌ Token verification failed:', response.status);
    return false;
  } catch (error) {
    console.error('Token verification error:', error.message);
    return false;
  }
};

// Protected Route Component with token verification
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (!token || token === 'null' || token === 'undefined') {
        console.log('🔒 No token found');
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      
      try {
        // Verify token with backend
        const isValid = await verifyToken();
        console.log('🔐 Auth check result:', isValid);
        setIsAuthenticated(isValid);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#050b16] via-[#0a1122] to-[#050b16] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          <p className="mt-4 text-slate-300">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (!token || token === 'null' || token === 'undefined') {
        console.log('🔒 No token for redirect check');
        setShouldRedirect(false);
        setIsChecking(false);
        return;
      }
      
      try {
        const isValid = await verifyToken();
        console.log('🔐 Public route auth check:', isValid);
        setShouldRedirect(isValid);
      } catch (error) {
        console.error('Public route auth error:', error);
        setShouldRedirect(false);
      } finally {
        setIsChecking(false);
      }
    };
    
    checkAuth();
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#050b16] via-[#0a1122] to-[#050b16] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  return shouldRedirect ? <Navigate to="/dashboard" replace /> : children;
};

// Wrapper to handle scroll restoration
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

function App() {
  const [backendStatus, setBackendStatus] = useState('checking');
  
  useEffect(() => {
    // Check if backend is running
    const checkBackend = async () => {
      try {
        console.log('🔄 Checking backend health...');
        const response = await fetch('http://localhost:5001/api/health', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Health check response:', data);
          
          if (data.database === 'connected') {
            setBackendStatus('connected');
            console.log('✅ Backend and database connected');
          } else {
            setBackendStatus('db_error');
            console.warn('⚠️ Backend running but database disconnected');
          }
        } else {
          setBackendStatus('disconnected');
          console.warn('❌ Backend not responding');
        }
      } catch (error) {
        console.error('❌ Cannot reach backend:', error.message);
        setBackendStatus('error');
      }
    };
    
    checkBackend();
    // Check every 30 seconds
    const interval = setInterval(checkBackend, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Navbar />
      
      {/* Backend Status Indicator (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 z-50">
          <div className={`px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm ${
            backendStatus === 'connected' 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : backendStatus === 'disconnected' || backendStatus === 'error'
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : backendStatus === 'db_error'
              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
          }`}>
            {backendStatus === 'connected' && '✅ Backend Connected'}
            {backendStatus === 'disconnected' && '❌ Backend Offline'}
            {backendStatus === 'error' && '❌ Network Error'}
            {backendStatus === 'db_error' && '⚠️ DB Disconnected'}
            {backendStatus === 'checking' && '🔄 Checking...'}
          </div>
        </div>
      )}
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={
          <PublicRoute>
            <Login backendStatus={backendStatus} />
          </PublicRoute>
        } />

        {/* Admin Routes - Using AdminLayout for old routes */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>

        {/* New Admin Routes - Separate routes for new admin pages */}
        <Route path="/admin/dashboard" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        <Route path="/admin/orders-new" element={
          <AdminRoute>
            <OrdersAdmin />
          </AdminRoute>
        } />
        <Route path="/admin/products-new" element={
          <AdminRoute>
            <ProductsAdmin />
          </AdminRoute>
        } />
        <Route path="/admin/support" element={
          <AdminRoute>
            <SupportTickets />
          </AdminRoute>
        } />
        <Route path="/admin/analytics" element={
          <AdminRoute>
            <Analytics />
          </AdminRoute>
        } />
        <Route path="/admin/settings" element={
          <AdminRoute>
            <Settings />
          </AdminRoute>
        } />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/support" element={
          <ProtectedRoute>
            <Support />
          </ProtectedRoute>
        } />
        
        <Route path="/my-orders" element={
          <ProtectedRoute>
            <MyOrders />
          </ProtectedRoute>
        } />

        <Route path="/order/:productId?" element={
          <ProtectedRoute>
            <OrderForm />
          </ProtectedRoute>
        } />
        
        <Route path="/setup" element={
          <ProtectedRoute>
            <WifiQRGenerator />
          </ProtectedRoute>
        } />

        <Route path="/feedback" element={
          <ProtectedRoute>
            <Feedback />
          </ProtectedRoute>
        } />
        
        <Route path="/community" element={
          <ProtectedRoute>
            <FeedbackCommunity />
          </ProtectedRoute>
        } />
        
        <Route path="/products" element={
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        } />

        {/* Catch All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Offline Mode Warning */}
      {backendStatus === 'disconnected' || backendStatus === 'error' ? (
        <div className="fixed bottom-4 right-4 z-50 animate-pulse">
          <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-red-500/20 to-red-600/10 border border-red-500/30 backdrop-blur-sm">
            <p className="text-xs text-red-300 font-medium">
              ⚠️ Backend offline. Some features may not work.
            </p>
            <p className="text-xs text-red-400/70 mt-1">
              Run: <code className="bg-black/30 px-1 rounded">cd robot-app-backend && npm run dev</code>
            </p>
          </div>
        </div>
      ) : null}
    </Router>
  );
}

export default App;