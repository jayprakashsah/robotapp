// frontend/src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Package, Users, CreditCard, TrendingUp, AlertCircle,
  DollarSign, ShoppingCart, BarChart, Clock, CheckCircle,
  ArrowUp, ArrowDown, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import adminService from '../../services/adminService';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    pendingOrders: 0,
    todayOrders: 0,
    totalProducts: 0,
    avgOrderValue: 0
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('today');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsResponse = await adminService.getDashboardStats();
      if (statsResponse.success) {
        setStats(statsResponse.stats);
      }

      // Fetch recent orders
      const ordersResponse = await adminService.getAdminOrders({
        limit: 5,
        page: 1,
        sortBy: '-createdAt'
      });
      if (ordersResponse.success) {
        setRecentOrders(ordersResponse.orders);
      }

      // Fetch activities
      const activitiesResponse = await adminService.getActivities();
      if (activitiesResponse.success) {
        setRecentActivities(activitiesResponse.activities);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use mock data for now
      setStats({
        totalOrders: 124,
        totalRevenue: 245600,
        totalUsers: 89,
        pendingOrders: 8,
        todayOrders: 12,
        totalProducts: 15,
        avgOrderValue: 1980
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      title: 'Total Revenue', 
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
      change: '+12.5%',
      trend: 'up'
    },
    { 
      title: 'Total Orders', 
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'from-blue-500 to-cyan-600',
      change: '+8.2%',
      trend: 'up'
    },
    { 
      title: 'Registered Users', 
      value: stats.totalUsers,
      icon: Users,
      color: 'from-purple-500 to-pink-600',
      change: '+5.7%',
      trend: 'up'
    },
    { 
      title: 'Pending Orders', 
      value: stats.pendingOrders,
      icon: Clock,
      color: 'from-yellow-500 to-orange-600',
      change: '-3.1%',
      trend: 'down'
    }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Range */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['today', 'week', 'month', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm font-medium rounded-md capitalize ${
                  timeRange === range
                    ? 'bg-white shadow-sm text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <span className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full ${
                stat.trend === 'up' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {stat.trend === 'up' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-gray-600 text-sm">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Link 
              to="/admin/orders"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              View All
              <TrendingUp size={14} />
            </Link>
          </div>
          <div className="space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.slice(0, 5).map((order) => (
                <div key={order._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 group-hover:text-blue-600">
                        {order.orderNumber}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.shippingAddress?.fullName} • {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.orderStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.orderStatus === 'processing' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.orderStatus}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No recent orders</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Performance Metrics</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Order Completion Rate</span>
                <span className="font-semibold text-gray-900">94%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '94%' }}
                  className="h-full bg-green-500 rounded-full"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Customer Satisfaction</span>
                <span className="font-semibold text-gray-900">4.8/5</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '96%' }}
                  className="h-full bg-blue-500 rounded-full"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Average Order Value</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(stats.avgOrderValue)}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '75%' }}
                  className="h-full bg-purple-500 rounded-full"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Return Rate</span>
                <span className="font-semibold text-gray-900">2.3%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '2.3%' }}
                  className="h-full bg-red-500 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivities.length > 0 ? (
            recentActivities.slice(0, 8).map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-lg ${
                  activity.type === 'order' ? 'bg-blue-50' :
                  activity.type === 'user' ? 'bg-green-50' :
                  activity.type === 'product' ? 'bg-purple-50' : 'bg-yellow-50'
                }`}>
                  {activity.type === 'order' && <ShoppingCart className="h-5 w-5 text-blue-600" />}
                  {activity.type === 'user' && <Users className="h-5 w-5 text-green-600" />}
                  {activity.type === 'product' && <Package className="h-5 w-5 text-purple-600" />}
                  {activity.type === 'support' && <AlertCircle className="h-5 w-5 text-yellow-600" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">
                    {activity.details} • {formatDate(activity.time)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BarChart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No recent activities</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl text-blue-700 hover:from-blue-100 hover:to-blue-200 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Create Product</p>
              <p className="text-sm opacity-75">Add new item</p>
            </div>
            <Package size={20} />
          </div>
        </button>
        <button className="p-4 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl text-green-700 hover:from-green-100 hover:to-green-200 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Process Orders</p>
              <p className="text-sm opacity-75">{stats.pendingOrders} pending</p>
            </div>
            <ShoppingCart size={20} />
          </div>
        </button>
        <button className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl text-purple-700 hover:from-purple-100 hover:to-purple-200 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Manage Users</p>
              <p className="text-sm opacity-75">{stats.totalUsers} total</p>
            </div>
            <Users size={20} />
          </div>
        </button>
        <button className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl text-yellow-700 hover:from-yellow-100 hover:to-yellow-200 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">View Reports</p>
              <p className="text-sm opacity-75">Analytics</p>
            </div>
            <BarChart size={20} />
          </div>
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;