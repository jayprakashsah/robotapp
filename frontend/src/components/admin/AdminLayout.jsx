// frontend/src/components/admin/AdminLayout.jsx
import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Users, CreditCard, 
  MessageSquare, Settings, BarChart, Bell, 
  LogOut, Menu, X, Shield, ShoppingBag, 
  TrendingUp, FileText, Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-500' },
    { path: '/admin/orders', label: 'Orders', icon: Package, color: 'text-green-500' },
    { path: '/admin/products', label: 'Products', icon: ShoppingBag, color: 'text-purple-500' },
    { path: '/admin/users', label: 'Users', icon: Users, color: 'text-pink-500' },
    { path: '/admin/support', label: 'Support', icon: MessageSquare, color: 'text-yellow-500' },
    { path: '/admin/analytics', label: 'Analytics', icon: BarChart, color: 'text-cyan-500' },
    { path: '/admin/settings', label: 'Settings', icon: Settings, color: 'text-gray-500' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-white shadow-md border border-gray-200"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || window.innerWidth >= 1024) && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl lg:static lg:translate-x-0"
          >
            {/* Logo */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                  <Shield size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold">SuperEmo Admin</h1>
                  <p className="text-sm text-gray-400">Control Panel</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/10 text-white border-l-4 border-cyan-500'
                        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                    }`}
                    onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                  >
                    <item.icon size={20} className={item.color} />
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="ml-auto h-2 w-2 rounded-full bg-cyan-400"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Quick Stats */}
            <div className="p-4 mt-8 border-t border-gray-700">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Online Users</span>
                  <span className="text-green-400 font-bold">24</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Pending Orders</span>
                  <span className="text-yellow-400 font-bold">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Today's Revenue</span>
                  <span className="text-blue-400 font-bold">₹12,450</span>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`lg:pl-64 transition-all ${sidebarOpen ? 'blur-sm lg:blur-0' : ''}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
              </h2>
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                <Home size={14} />
                <span>Admin</span>
                <span>›</span>
                <span className="text-gray-800">
                  {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100">
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <span className="text-white font-bold">A</span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">Admin User</p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                </button>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                    >
                      <Link
                        to="/admin/settings"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Settings size={16} />
                        Settings
                      </Link>
                      <Link
                        to="/"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Home size={16} />
                        View Site
                      </Link>
                      <div className="border-t border-gray-200 my-2"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 px-6 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
            <div>
              <p>© 2024 SuperEmo Admin Panel. All rights reserved.</p>
            </div>
            <div className="flex items-center gap-4 mt-2 md:mt-0">
              <span className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                System Status: <span className="text-green-600 font-medium">Operational</span>
              </span>
              <span>v1.0.0</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && window.innerWidth < 1024 && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;