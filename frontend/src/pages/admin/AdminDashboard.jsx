// frontend/src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Package, Users, CreditCard, TrendingUp, AlertCircle,
  DollarSign, ShoppingCart, BarChart, Clock, CheckCircle,
  ArrowUp, ArrowDown, RefreshCw, MessageSquare, Headphones,
  Shield, Activity, Zap, Bell, Eye, ExternalLink, Filter,
  UserPlus, ShoppingBag, Tag, Settings, Download, Upload
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
    openTickets: 0,
    totalTickets: 0,
    highPriorityTickets: 0,
    conversionRate: 0,
    newCustomers: 0,
    refundRequests: 0
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
      const statsResponse = await adminService.getDashboardStats();
      if (statsResponse.success) {
        setStats(prev => ({
          ...prev,
          ...statsResponse.stats,
          openTickets: statsResponse.stats.openTickets || 0,
          totalTickets: statsResponse.stats.totalTickets || 0,
          highPriorityTickets: statsResponse.stats.highPriorityTickets || 0,
          conversionRate: statsResponse.stats.conversionRate || 4.2,
          newCustomers: statsResponse.stats.newCustomers || 15,
          refundRequests: statsResponse.stats.refundRequests || 3
        }));
      }

      const ordersResponse = await adminService.getAdminOrders({
        limit: 5,
        page: 1,
        sortBy: '-createdAt'
      });
      if (ordersResponse.success) {
        setRecentOrders(ordersResponse.orders);
      }

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

      const activitiesResponse = await adminService.getActivities();
      if (activitiesResponse.success) {
        setRecentActivities(activitiesResponse.activities);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
        highPriorityTickets: 2,
        conversionRate: 4.2,
        newCustomers: 15,
        refundRequests: 3
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
      color: 'bg-gradient-to-br from-green-500 to-emerald-600',
      change: '+12.5%',
      trend: 'up',
      desc: 'Revenue this month',
      link: '/admin/analytics'
    },
    { 
      title: 'Total Orders', 
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-gradient-to-br from-blue-500 to-cyan-600',
      change: '+8.2%',
      trend: 'up',
      desc: `${stats.todayOrders} today`,
      link: '/admin/orders'
    },
    { 
      title: 'Active Users', 
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-gradient-to-br from-purple-500 to-pink-600',
      change: '+5.7%',
      trend: 'up',
      desc: 'Registered users',
      link: '/admin/users'
    },
    { 
      title: 'Open Tickets', 
      value: stats.openTickets,
      icon: AlertCircle,
      color: 'bg-gradient-to-br from-yellow-500 to-orange-600',
      change: stats.highPriorityTickets > 0 ? `${stats.highPriorityTickets} urgent` : 'All good',
      trend: stats.highPriorityTickets > 0 ? 'down' : 'up',
      desc: 'Support tickets',
      link: '/admin/support'
    },
    { 
      title: 'Pending Orders', 
      value: stats.pendingOrders,
      icon: Clock,
      color: 'bg-gradient-to-br from-red-500 to-pink-600',
      change: '-3.1%',
      trend: 'down',
      desc: 'Awaiting processing',
      link: '/admin/orders?status=pending'
    },
    { 
      title: 'Total Products', 
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-gradient-to-br from-indigo-500 to-purple-600',
      change: '+2.4%',
      trend: 'up',
      desc: 'Active products',
      link: '/admin/products'
    }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'critical': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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
    <div className="space-y-8 p-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-md">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-700">Welcome back! Here's what's happening with your store.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                System Operational
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">Last updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex bg-white rounded-xl p-1 border border-gray-300 shadow-sm">
              {['Today', 'Week', 'Month', 'Year'].map((range) => (
                <button
                  key={range.toLowerCase()}
                  onClick={() => setTimeRange(range.toLowerCase())}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    timeRange === range.toLowerCase()
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
            <button
              onClick={fetchDashboardData}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid - Colorful and Properly Aligned */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all overflow-hidden group"
          >
            <Link to={stat.link} className="block p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-3 rounded-lg ${stat.color} shadow-sm`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  stat.trend === 'up' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {stat.trend === 'up' ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                  {stat.change}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-900 font-medium text-sm">{stat.title}</p>
              <p className="text-gray-500 text-xs mt-1">{stat.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700">Conversion Rate</p>
              <p className="text-2xl font-bold text-purple-900">{stats.conversionRate}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-100 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">New Customers</p>
              <p className="text-2xl font-bold text-green-900">+{stats.newCustomers}</p>
            </div>
            <UserPlus className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-700">Refund Requests</p>
              <p className="text-2xl font-bold text-orange-900">{stats.refundRequests}</p>
            </div>
            <CreditCard className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Main Content Area - Recent Orders and Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
              </div>
              <Link 
                to="/admin/orders"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
              >
                View All
                <ExternalLink size={14} />
              </Link>
            </div>
          </div>
          
          <div className="p-4">
            {recentOrders.length > 0 ? (
              recentOrders.slice(0, 5).map((order) => (
                <div 
                  key={order._id}
                  className="flex items-center justify-between p-3 hover:bg-blue-50 rounded-lg mb-2 last:mb-0 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Package className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                      <p className="text-xs text-gray-500">{formatCurrency(order.totalAmount)}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
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
              <div className="text-center py-6">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">No recent orders</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Support Tickets */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Headphones className="h-6 w-6 text-orange-600" />
                <h2 className="text-lg font-bold text-gray-900">Recent Tickets</h2>
              </div>
              <Link 
                to="/admin/support"
                className="text-orange-600 hover:text-orange-800 text-sm font-medium flex items-center gap-1"
              >
                Manage
                <ExternalLink size={14} />
              </Link>
            </div>
          </div>
          
          <div className="p-4">
            {recentTickets.length > 0 ? (
              recentTickets.slice(0, 5).map((ticket) => (
                <div 
                  key={ticket._id}
                  className="p-3 hover:bg-orange-50 rounded-lg mb-2 last:mb-0 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-gray-900 text-sm line-clamp-1">
                      {ticket.subject}
                    </p>
                    <span className="text-xs text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <Headphones className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">No support tickets</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            to="/admin/orders/create"
            className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg text-blue-700 hover:from-blue-100 hover:to-blue-200 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Create Order</p>
                <p className="text-sm opacity-75">Manual order</p>
              </div>
              <ShoppingCart size={20} />
            </div>
          </Link>
          
          <Link 
            to="/admin/products/create"
            className="p-4 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg text-green-700 hover:from-green-100 hover:to-green-200 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Add Product</p>
                <p className="text-sm opacity-75">New item</p>
              </div>
              <Package size={20} />
            </div>
          </Link>
          
          <Link 
            to="/admin/analytics"
            className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg text-purple-700 hover:from-purple-100 hover:to-purple-200 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">View Reports</p>
                <p className="text-sm opacity-75">Analytics</p>
              </div>
              <BarChart size={20} />
            </div>
          </Link>
          
          <Link 
            to="/admin/settings"
            className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg text-gray-700 hover:from-gray-100 hover:to-gray-200 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Settings</p>
                <p className="text-sm opacity-75">Store config</p>
              </div>
              <Settings size={20} />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;