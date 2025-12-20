// frontend/src/pages/admin/AdminOrders.jsx
import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Download, Eye, Edit, Trash2, 
  Package, Truck, CheckCircle, XCircle, Clock, 
  ChevronDown, ChevronUp, MoreVertical, RefreshCw,
  ArrowUpDown, Printer, Mail, MessageSquare
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
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-purple-100 text-purple-800'
  };

  const orderStatusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-cyan-100 text-cyan-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAdminOrders(filters);
      if (response.success) {
        setOrders(response.orders);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Mock data for demonstration
      setOrders(generateMockOrders(15));
      setPagination({
        total: 15,
        pages: 1,
        page: 1,
        limit: 20
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMockOrders = (count) => {
    const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    const names = ['John Doe', 'Jane Smith', 'Robert Johnson', 'Sarah Williams', 'Mike Brown'];
    
    return Array.from({ length: count }, (_, i) => ({
      _id: `order-${i}`,
      orderNumber: `ORD-20251220-${(i + 1).toString().padStart(3, '0')}`,
      shippingAddress: {
        fullName: names[i % names.length],
        email: `user${i}@example.com`,
        phone: `98765${i.toString().padStart(5, '0')}`
      },
      totalAmount: 2999 + (i * 500),
      orderStatus: statuses[i % statuses.length],
      paymentStatus: i % 3 === 0 ? 'paid' : i % 3 === 1 ? 'pending' : 'processing',
      paymentMethod: i % 4 === 0 ? 'credit_card' : i % 4 === 1 ? 'upi' : i % 4 === 2 ? 'net_banking' : 'cod',
      createdAt: new Date(Date.now() - i * 3600000).toISOString(),
      items: [
        {
          productName: 'SuperEmo Pro',
          variant: 'Pro',
          quantity: 1,
          price: 2999
        }
      ]
    }));
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, { orderStatus: newStatus });
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update order status');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderOrderRow = (order) => (
    <motion.tr
      key={order._id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-b border-gray-200 hover:bg-gray-50"
    >
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            className="rounded border-gray-300"
            onChange={(e) => {
              if (e.target.checked) {
                setBulkActions([...bulkActions, order._id]);
              } else {
                setBulkActions(bulkActions.filter(id => id !== order._id));
              }
            }}
          />
          <div className="p-2 bg-blue-50 rounded-lg">
            <Package className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{order.orderNumber}</p>
            <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
          </div>
        </div>
      </td>
      
      <td className="py-4 px-4">
        <div>
          <p className="font-medium text-gray-900">{order.shippingAddress?.fullName}</p>
          <p className="text-sm text-gray-500">{order.shippingAddress?.email}</p>
        </div>
      </td>
      
      <td className="py-4 px-4">
        <span className="font-bold">{formatCurrency(order.totalAmount)}</span>
      </td>
      
      <td className="py-4 px-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${orderStatusColors[order.orderStatus]}`}>
          {order.orderStatus}
        </span>
      </td>
      
      <td className="py-4 px-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${paymentStatusColors[order.paymentStatus]}`}>
          {order.paymentStatus}
        </span>
      </td>
      
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedOrder(order._id === selectedOrder?._id ? null : order)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
            title="View Details"
          >
            <Eye size={18} />
          </button>
          
          <div className="relative">
            <select
              value={order.orderStatus}
              onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-blue-500"
            >
              {statusOptions.filter(s => s.value !== 'all').map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          
          <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg">
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </motion.tr>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600">Manage and track all customer orders</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search orders by ID, name, or email..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Filter size={16} />
              Filters
              {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="totalAmount">Price: Low to High</option>
              <option value="-totalAmount">Price: High to Low</option>
            </select>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200 space-y-4"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    {statusOptions.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">All Payments</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                    <option>All Time</option>
                    <option>Today</option>
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Items per page</label>
                  <select
                    value={filters.limit}
                    onChange={(e) => setFilters({ ...filters, limit: e.target.value, page: 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="10">10 per page</option>
                    <option value="20">20 per page</option>
                    <option value="50">50 per page</option>
                    <option value="100">100 per page</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setFilters({
                    status: 'all',
                    search: '',
                    sortBy: '-createdAt',
                    page: 1,
                    limit: 20
                  })}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Clear Filters
                </button>
                <button
                  onClick={fetchOrders}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bulk Actions */}
      {bulkActions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-medium text-blue-800">
                {bulkActions.length} order(s) selected
              </span>
              <select className="px-3 py-1 border border-blue-300 rounded-lg bg-white text-sm">
                <option>Bulk Actions</option>
                <option>Mark as Processing</option>
                <option>Mark as Shipped</option>
                <option>Mark as Delivered</option>
                <option>Cancel Orders</option>
                <option>Export Selected</option>
                <option>Send Email Notification</option>
              </select>
              <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                Apply
              </button>
            </div>
            <button
              onClick={() => setBulkActions([])}
              className="text-blue-600 hover:text-blue-800"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600">Loading orders...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Details
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.length > 0 ? (
                    orders.map(renderOrderRow)
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-4 py-16 text-center">
                        <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-500">No orders found</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Try adjusting your filters or search terms
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Order Details Panel */}
            <AnimatePresence>
              {selectedOrder && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-200"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order Details: {selectedOrder.orderNumber}
                      </h3>
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Customer Info */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-700">Customer Information</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="font-medium">{selectedOrder.shippingAddress.fullName}</p>
                          <p className="text-sm text-gray-600">{selectedOrder.shippingAddress.email}</p>
                          <p className="text-sm text-gray-600">{selectedOrder.shippingAddress.phone}</p>
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm">
                              {selectedOrder.shippingAddress.addressLine1}
                            </p>
                            <p className="text-sm">
                              {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}
                            </p>
                            <p className="text-sm">
                              {selectedOrder.shippingAddress.postalCode}, {selectedOrder.shippingAddress.country}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Order Summary */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-700">Order Summary</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="space-y-2">
                            {selectedOrder.items?.map((item, index) => (
                              <div key={index} className="flex justify-between">
                                <div>
                                  <p className="font-medium">{item.productName}</p>
                                  <p className="text-sm text-gray-600">
                                    {item.variant} × {item.quantity}
                                  </p>
                                </div>
                                <p className="font-medium">
                                  {formatCurrency(item.price * item.quantity)}
                                </p>
                              </div>
                            ))}
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Subtotal</span>
                              <span>{formatCurrency(selectedOrder.subtotal || selectedOrder.totalAmount * 0.85)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Shipping</span>
                              <span>{formatCurrency(selectedOrder.shippingCharge || 99)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tax</span>
                              <span>{formatCurrency(selectedOrder.tax || selectedOrder.totalAmount * 0.18)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                              <span>Total</span>
                              <span className="text-blue-600">
                                {formatCurrency(selectedOrder.totalAmount)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="mt-6 pt-6 border-t border-gray-200 flex gap-3">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                        <Truck size={16} />
                        Update Shipping
                      </button>
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                        <CheckCircle size={16} />
                        Mark as Delivered
                      </button>
                      <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2">
                        <Printer size={16} />
                        Print Invoice
                      </button>
                      <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2">
                        <Mail size={16} />
                        Send Email
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination */}
            {orders.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
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
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  
                  {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setFilters({ ...filters, page: pageNum })}
                        className={`px-3 py-1 border rounded-lg ${
                          pagination.page === pageNum
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  {pagination.pages > 5 && (
                    <span className="px-2">...</span>
                  )}
                  
                  <button
                    onClick={() => setFilters({ ...filters, page: pagination.page + 1 })}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-700">{pagination.total}</p>
              <p className="text-sm text-blue-600">Total Orders</p>
            </div>
            <Package className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-700">
                {orders.filter(o => o.orderStatus === 'delivered').length}
              </p>
              <p className="text-sm text-green-600">Delivered</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-yellow-700">
                {orders.filter(o => o.orderStatus === 'pending').length}
              </p>
              <p className="text-sm text-yellow-600">Pending</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-red-700">
                {orders.filter(o => o.orderStatus === 'cancelled').length}
              </p>
              <p className="text-sm text-red-600">Cancelled</p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;