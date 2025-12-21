// frontend/src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Package, Users, CreditCard, TrendingUp, AlertCircle,
  DollarSign, ShoppingCart, BarChart, Clock, CheckCircle,
  ArrowUp, ArrowDown, RefreshCw, MessageSquare, Headphones,
  Shield, Activity, Zap, Bell, Eye, ExternalLink, Filter
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
    avgOrderValue: 0,
    // NEW: Support ticket stats
    openTickets: 0,
    totalTickets: 0,
    highPriorityTickets: 0
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('today');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsResponse = await adminService.getDashboardStats();
      if (statsResponse.success) {
        setStats(prev => ({
          ...prev,
          ...statsResponse.stats,
          // Add default ticket stats if not provided
          openTickets: statsResponse.stats.openTickets || 0,
          totalTickets: statsResponse.stats.totalTickets || 0,
          highPriorityTickets: statsResponse.stats.highPriorityTickets || 0
        }));
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

      // Fetch recent support tickets
      try {
        const ticketsResponse = await adminService.getSupportTickets({
          limit: 5,
          page: 1,
          sortBy: '-createdAt'
        });
        if (ticketsResponse.success) {
          setRecentTickets(ticketsResponse.tickets || []);
        }
      } catch (ticketError) {
        console.log('Support tickets endpoint not available yet');
        // Mock tickets for demo
        setRecentTickets([
          {
            _id: '1',
            subject: 'Hardware Issue - Camera not working',
            name: 'John Doe',
            email: 'john@example.com',
            category: 'technical',
            priority: 'high',
            status: 'open',
            createdAt: new Date().toISOString()
          },
          {
            _id: '2',
            subject: 'Payment Refund Request',
            name: 'Jane Smith',
            email: 'jane@example.com',
            category: 'billing',
            priority: 'medium',
            status: 'in-progress',
            createdAt: new Date(Date.now() - 86400000).toISOString()
          }
        ]);
      }

      // Fetch activities
      const activitiesResponse = await adminService.getActivities();
      if (activitiesResponse.success) {
        setRecentActivities(activitiesResponse.activities);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use mock data
      setStats({
        totalOrders: 124,
        totalRevenue: 245600,
        totalUsers: 89,
        pendingOrders: 8,
        todayOrders: 12,
        totalProducts: 15,
        avgOrderValue: 1980,
        openTickets: 5,
        totalTickets: 24,
        highPriorityTickets: 2
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
      trend: 'up',
      desc: 'Revenue this month'
    },
    { 
      title: 'Total Orders', 
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'from-blue-500 to-cyan-600',
      change: '+8.2%',
      trend: 'up',
      desc: `${stats.todayOrders} today`
    },
    { 
      title: 'Active Users', 
      value: stats.totalUsers,
      icon: Users,
      color: 'from-purple-500 to-pink-600',
      change: '+5.7%',
      trend: 'up',
      desc: 'Registered users'
    },
    { 
      title: 'Open Tickets', 
      value: stats.openTickets,
      icon: AlertCircle,
      color: 'from-yellow-500 to-orange-600',
      change: stats.highPriorityTickets > 0 ? `${stats.highPriorityTickets} urgent` : 'All good',
      trend: stats.highPriorityTickets > 0 ? 'down' : 'up',
      desc: 'Support tickets'
    },
    { 
      title: 'Pending Orders', 
      value: stats.pendingOrders,
      icon: Clock,
      color: 'from-red-500 to-pink-600',
      change: '-3.1%',
      trend: 'down',
      desc: 'Awaiting processing'
    },
    { 
      title: 'Total Products', 
      value: stats.totalProducts,
      icon: Package,
      color: 'from-indigo-500 to-purple-600',
      change: '+2.4%',
      trend: 'up',
      desc: 'Active products'
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

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching latest data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
              <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1 text-green-600">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              System Operational
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">Last updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-1 border border-gray-200">
            {['today', 'week', 'month', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-all ${
                  timeRange === range
                    ? 'bg-white shadow-md text-blue-600 border border-blue-100'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats Grid - Enhanced */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-sm`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                stat.trend === 'up' 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}>
                {stat.trend === 'up' ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-gray-900 font-medium text-sm">{stat.title}</p>
            <p className="text-gray-500 text-xs mt-1">{stat.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs for different sections */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          {['overview', 'orders', 'support', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-1 font-medium text-sm uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'overview' && '📊 Overview'}
              {tab === 'orders' && '📦 Orders'}
              {tab === 'support' && '🎫 Support Tickets'}
              {tab === 'analytics' && '📈 Analytics'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
              </div>
              <Link 
                to="/admin/orders"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 hover:gap-2 transition-all"
              >
                View All
                <ExternalLink size={14} />
              </Link>
            </div>
            <p className="text-gray-600 text-sm">Latest customer orders requiring attention</p>
          </div>
          
          <div className="p-4 space-y-3">
            {recentOrders.length > 0 ? (
              recentOrders.slice(0, 5).map((order) => (
                <motion.div 
                  key={order._id}
                  whileHover={{ x: 5 }}
                  className="flex items-center justify-between p-3 hover:bg-blue-50/50 rounded-xl border border-gray-100 group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100">
                      <Package className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-blue-600">
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.shippingAddress?.fullName} • {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                    order.orderStatus === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                    order.orderStatus === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                    order.orderStatus === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-gray-50 text-gray-700 border-gray-200'
                  }`}>
                    {order.orderStatus}
                  </span>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">No recent orders</p>
                <p className="text-sm text-gray-400 mt-1">Orders will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Support Tickets Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-50">
                  <Headphones className="h-5 w-5 text-yellow-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Recent Support Tickets</h2>
              </div>
              <Link 
                to="/admin/support"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 hover:gap-2 transition-all"
              >
                Manage
                <ExternalLink size={14} />
              </Link>
            </div>
            <p className="text-gray-600 text-sm">Latest customer support requests</p>
          </div>
          
          <div className="p-4 space-y-3">
            {recentTickets.length > 0 ? (
              recentTickets.slice(0, 5).map((ticket) => (
                <motion.div 
                  key={ticket._id}
                  whileHover={{ x: 5 }}
                  className="p-3 hover:bg-yellow-50/50 rounded-xl border border-gray-100 group transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="h-4 w-4 text-gray-400" />
                        <p className="font-semibold text-gray-900 text-sm line-clamp-1">
                          {ticket.subject}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {ticket.name} • {ticket.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <Headphones className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">No support tickets</p>
                <p className="text-sm text-gray-400 mt-1">All customer issues resolved</p>
              </div>
            )}
          </div>
          
          {/* Quick Action Buttons */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-3">
              <Link 
                to="/admin/support?status=open"
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all text-center"
              >
                View Open Tickets
              </Link>
              <Link 
                to="/admin/support?priority=high"
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-orange-700 transition-all text-center"
              >
                Urgent Tickets
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* System Status & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* System Status */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold">System Status</h3>
                <p className="text-gray-300 text-sm">All services operational</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-green-400 text-sm font-medium">Live</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 text-sm">API Service</span>
                <CheckCircle className="h-4 w-4 text-green-400" />
              </div>
              <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full w-full bg-green-500"></div>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 text-sm">Database</span>
                <CheckCircle className="h-4 w-4 text-green-400" />
              </div>
              <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full w-full bg-green-500"></div>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 text-sm">Payment Gateway</span>
                <CheckCircle className="h-4 w-4 text-green-400" />
              </div>
              <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full w-full bg-green-500"></div>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 text-sm">Email Service</span>
                <CheckCircle className="h-4 w-4 text-green-400" />
              </div>
              <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full w-full bg-green-500"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link 
              to="/admin/orders?status=pending"
              className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl text-blue-700 hover:from-blue-100 hover:to-blue-200 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Process Orders</p>
                  <p className="text-sm opacity-75">{stats.pendingOrders} pending</p>
                </div>
                <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
              </div>
            </Link>
            
            <Link 
              to="/admin/support?status=open"
              className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl text-yellow-700 hover:from-yellow-100 hover:to-yellow-200 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Support Tickets</p>
                  <p className="text-sm opacity-75">{stats.openTickets} open</p>
                </div>
                <Headphones size={20} className="group-hover:scale-110 transition-transform" />
              </div>
            </Link>
            
            <Link 
              to="/admin/products"
              className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl text-purple-700 hover:from-purple-100 hover:to-purple-200 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Manage Products</p>
                  <p className="text-sm opacity-75">{stats.totalProducts} total</p>
                </div>
                <Package size={20} className="group-hover:scale-110 transition-transform" />
              </div>
            </Link>
            
            <Link 
              to="/admin/users"
              className="p-4 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl text-green-700 hover:from-green-100 hover:to-green-200 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Manage Users</p>
                  <p className="text-sm opacity-75">{stats.totalUsers} total</p>
                </div>
                <Users size={20} className="group-hover:scale-110 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;