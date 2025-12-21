// frontend/src/pages/admin/AdminOrders.jsx
import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Download, Eye, Edit, Trash2, 
  Package, Truck, CheckCircle, XCircle, Clock, 
  ChevronDown, ChevronUp, MoreVertical, RefreshCw,
  ArrowUpDown, Printer, Mail, MessageSquare,
  DollarSign, User, MapPin, Phone, ExternalLink,
  ShoppingBag, Calendar, Shield, CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import adminService from '../../services/adminService';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    sortBy: '-createdAt',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    page: 1,
    limit: 20
  });
  const [bulkActions, setBulkActions] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    delivered: 0,
    cancelled: 0,
    revenue: 0
  });

  const statusOptions = [
    { value: 'all', label: 'All Status', color: 'gray' },
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'confirmed', label: 'Confirmed', color: 'blue' },
    { value: 'processing', label: 'Processing', color: 'purple' },
    { value: 'shipped', label: 'Shipped', color: 'cyan' },
    { value: 'delivered', label: 'Delivered', color: 'green' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' }
  ];

  const paymentStatusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    processing: 'bg-blue-100 text-blue-800 border-blue-200',
    paid: 'bg-green-100 text-green-800 border-green-200',
    failed: 'bg-red-100 text-red-800 border-red-200',
    refunded: 'bg-purple-100 text-purple-800 border-purple-200'
  };

  const orderStatusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
    processing: 'bg-purple-100 text-purple-800 border-purple-200',
    shipped: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    delivered: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200'
  };

  useEffect(() => {
    fetchOrders();
    calculateStats();
  }, [filters]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page: filters.page,
        limit: filters.limit,
        sortBy: filters.sortBy
      };
      
      if (filters.status !== 'all') {
        params.status = filters.status;
      }
      
      if (filters.search) {
        params.search = filters.search;
      }
      
      console.log('📦 Fetching orders with params:', params);
      
      const response = await adminService.getAdminOrders(params);
      
      if (response.success) {
        console.log('✅ Orders fetched:', response.orders.length);
        setOrders(response.orders);
        setPagination(response.pagination);
      } else {
        console.error('❌ Failed to fetch orders:', response.message);
      }
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const total = orders.length;
    const pending = orders.filter(o => o.orderStatus === 'pending').length;
    const delivered = orders.filter(o => o.orderStatus === 'delivered').length;
    const cancelled = orders.filter(o => o.orderStatus === 'cancelled').length;
    const revenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    setStats({ total, pending, delivered, cancelled, revenue });
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      console.log('🔄 Updating order status:', orderId, newStatus);
      const response = await adminService.updateOrderStatus(orderId, { status: newStatus });
      
      if (response.success) {
        // Update local state
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, orderStatus: newStatus } : order
        ));
        
        if (selectedOrder?._id === orderId) {
          setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
        }
        
        alert(`✅ Order status updated to ${newStatus}`);
        fetchOrders(); // Refresh the list
      } else {
        alert(`❌ Failed to update status: ${response.message}`);
      }
    } catch (error) {
      console.error('❌ Error updating status:', error);
      alert('❌ Failed to update order status. Please try again.');
    }
  };

  const handleViewDetails = async (order) => {
    try {
      console.log('🔍 Fetching order details for:', order._id);
      const response = await adminService.getOrderDetails(order._id);
      
      if (response.success) {
        setSelectedOrder(response.order);
        setShowDetails(true);
      } else {
        // If API fails, show basic details
        setSelectedOrder(order);
        setShowDetails(true);
      }
    } catch (error) {
      console.error('❌ Error fetching order details:', error);
      setSelectedOrder(order);
      setShowDetails(true);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderOrderRow = (order) => (
    <motion.tr
      key={order._id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-b border-gray-200 hover:bg-blue-50/30 transition-colors group"
    >
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg">
            <Package className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 group-hover:text-blue-600">
              {order.orderNumber || `ORD-${order._id.substring(0, 8)}`}
            </p>
            <p className="text-sm text-gray-500">
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
      </td>
      
      <td className="py-4 px-4">
        <div>
          <p className="font-medium text-gray-900">
            {order.shippingAddress?.fullName || 'N/A'}
          </p>
          <p className="text-sm text-gray-500">
            {order.shippingAddress?.email || 'No email'}
          </p>
        </div>
      </td>
      
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="font-bold text-gray-900">
            {formatCurrency(order.totalAmount)}
          </span>
        </div>
      </td>
      
      <td className="py-4 px-4">
        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${orderStatusColors[order.orderStatus] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
          {order.orderStatus || 'pending'}
        </span>
      </td>
      
      <td className="py-4 px-4">
        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${paymentStatusColors[order.paymentStatus] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
          {order.paymentStatus || 'pending'}
        </span>
      </td>
      
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleViewDetails(order)}
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye size={18} />
          </button>
          
          <select
            value={order.orderStatus || 'pending'}
            onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            {statusOptions.filter(s => s.value !== 'all').map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          
          <button 
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this order?')) {
                // Add delete functionality here
                alert('Delete functionality would be implemented here');
              }
            }}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </motion.tr>
  );

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
              <p className="text-gray-600">Manage and track all customer orders</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
              <Package className="h-3 w-3" />
              {stats.total} Total Orders
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">Revenue: {formatCurrency(stats.revenue)}</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <button
            onClick={() => {
              // Export functionality
              alert('Export functionality would be implemented here');
            }}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 flex items-center gap-2 transition-all"
          >
            <Download size={18} />
            Export
          </button>
          <button
            onClick={fetchOrders}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
              <p className="text-sm text-blue-600">Total Orders</p>
            </div>
            <Package className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-700">{stats.delivered}</p>
              <p className="text-sm text-green-600">Delivered</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
              <p className="text-sm text-yellow-600">Pending</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-red-700">{stats.cancelled}</p>
              <p className="text-sm text-red-600">Cancelled</p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-purple-700">{formatCurrency(stats.revenue)}</p>
              <p className="text-sm text-purple-600">Revenue</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID, customer name, or email..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          
          {/* Status Filter */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Order Status</span>
            </div>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Sort & Limit */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpDown className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Sort By</span>
              </div>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="-createdAt">Newest First</option>
                <option value="createdAt">Oldest First</option>
                <option value="totalAmount">Price: Low to High</option>
                <option value="-totalAmount">Price: High to Low</option>
              </select>
            </div>
            
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700 mb-2">Items per page</div>
              <select
                value={filters.limit}
                onChange={(e) => setFilters({ ...filters, limit: e.target.value, page: 1 })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Advanced Filters Toggle */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            Advanced Filters
          </button>
          
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                    <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="all">All Payments</option>
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                    <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="all">All Methods</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="debit_card">Debit Card</option>
                      <option value="upi">UPI</option>
                      <option value="cod">Cash on Delivery</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                    <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">Last 7 Days</option>
                      <option value="month">Last 30 Days</option>
                      <option value="quarter">Last 3 Months</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setFilters({
                        status: 'all',
                        search: '',
                        sortBy: '-createdAt',
                        page: 1,
                        limit: 20
                      });
                      setShowFilters(false);
                    }}
                    className="px-4 py-2.5 text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={fetchOrders}
                    className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all"
                  >
                    Apply Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bulk Actions */}
      {bulkActions.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-blue-800">
                {bulkActions.length} order(s) selected
              </span>
              <select className="px-4 py-2 border border-blue-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>Bulk Actions</option>
                <option>Mark as Processing</option>
                <option>Mark as Shipped</option>
                <option>Mark as Delivered</option>
                <option>Cancel Orders</option>
                <option>Export Selected</option>
                <option>Send Email Notification</option>
              </select>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all">
                Apply
              </button>
            </div>
            <button
              onClick={() => setBulkActions([])}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <RefreshCw className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Loading orders...</p>
              <p className="text-sm text-gray-500 mt-2">Fetching data from server</p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Order Details</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Customer</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Amount</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Order Status</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Payment</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.length > 0 ? (
                    orders.map(renderOrderRow)
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-16 text-center">
                        <div className="space-y-3">
                          <Package className="h-16 w-16 mx-auto text-gray-300" />
                          <p className="text-gray-500 font-medium">No orders found</p>
                          <p className="text-sm text-gray-400">
                            Try adjusting your filters or search terms
                          </p>
                          <button
                            onClick={fetchOrders}
                            className="px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            Refresh
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {orders.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> orders
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFilters({ ...filters, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                      pagination.page === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    <ChevronUp className="h-4 w-4 rotate-90" />
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      let pageNum;
                      if (pagination.pages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.pages - 2) {
                        pageNum = pagination.pages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setFilters({ ...filters, page: pageNum })}
                          className={`w-10 h-10 rounded-lg text-sm font-medium ${
                            pagination.page === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100 border border-gray-300'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    {pagination.pages > 5 && (
                      <span className="px-2 text-gray-500">...</span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setFilters({ ...filters, page: pagination.page + 1 })}
                    disabled={pagination.page === pagination.pages}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                      pagination.page === pagination.pages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    Next
                    <ChevronUp className="h-4 w-4 -rotate-90" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Enhanced Order Details Modal */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
                  <ShoppingBag className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Order #{selectedOrder.orderNumber}</h2>
                  <p className="text-sm text-gray-600">Placed on {formatDate(selectedOrder.createdAt)}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Status and Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${orderStatusColors[selectedOrder.orderStatus] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                        {selectedOrder.orderStatus?.toUpperCase() || 'PENDING'}
                      </span>
                      <span className="text-gray-700">
                        Total: <span className="font-bold text-lg text-blue-600">{formatCurrency(selectedOrder.totalAmount)}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className={`px-3 py-1 rounded-full ${paymentStatusColors[selectedOrder.paymentStatus] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                        Payment: {selectedOrder.paymentStatus || 'pending'}
                      </span>
                      <span className="text-gray-600">
                        Method: <span className="font-medium">{selectedOrder.paymentMethod || 'N/A'}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <select
                      value={selectedOrder.orderStatus}
                      onChange={(e) => handleStatusUpdate(selectedOrder._id, e.target.value)}
                      className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {statusOptions.filter(s => s.value !== 'all').map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                    <button className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700">
                      <Truck className="h-4 w-4 mr-2 inline" />
                      Update Shipping
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Customer & Shipping Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {selectedOrder.shippingAddress?.fullName?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{selectedOrder.shippingAddress?.fullName || 'N/A'}</p>
                        <p className="text-sm text-gray-600">{selectedOrder.shippingAddress?.email || 'No email'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{selectedOrder.shippingAddress?.phone || 'No phone'}</span>
                    </div>
                    {selectedOrder.userId?.email && (
                      <div className="text-sm text-gray-600">
                        Registered Email: {selectedOrder.userId.email}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </h3>
                  <div className="space-y-2 text-gray-700">
                    <p className="font-medium">{selectedOrder.shippingAddress?.addressLine1}</p>
                    {selectedOrder.shippingAddress?.addressLine2 && (
                      <p>{selectedOrder.shippingAddress.addressLine2}</p>
                    )}
                    <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                    <p>{selectedOrder.shippingAddress?.postalCode}, {selectedOrder.shippingAddress?.country}</p>
                    {selectedOrder.shippingAddress?.landmark && (
                      <p className="text-sm text-gray-600">Landmark: {selectedOrder.shippingAddress.landmark}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Order Items */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Order Items ({selectedOrder.items?.length || 0})</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center">
                            <Package className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{item.productName || 'Product'}</p>
                            <p className="text-sm text-gray-600">
                              {item.variant && `Variant: ${item.variant}`}
                            </p>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            <p className="text-sm text-gray-600">Price: {formatCurrency(item.price)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Order Summary */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="max-w-md ml-auto space-y-3">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>{formatCurrency(selectedOrder.subtotal || 0)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Shipping</span>
                        <span>{formatCurrency(selectedOrder.shippingCharge || 0)}</span>
                      </div>
                      {selectedOrder.tax > 0 && (
                        <div className="flex justify-between text-gray-600">
                          <span>Tax</span>
                          <span>{formatCurrency(selectedOrder.tax || 0)}</span>
                        </div>
                      )}
                      {selectedOrder.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount</span>
                          <span>-{formatCurrency(selectedOrder.discount || 0)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                        <span>Total Amount</span>
                        <span className="text-blue-600">{formatCurrency(selectedOrder.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowDetails(false)}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all"
              >
                <Printer className="h-4 w-4 mr-2 inline" />
                Print Invoice
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;