import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, Truck, CheckCircle, XCircle, Clock, 
  AlertCircle, Search, Filter, Calendar, DollarSign,
  MapPin, CreditCard, RefreshCw, ExternalLink, Eye,
  Download, ChevronRight, ChevronDown, Star, MessageSquare
} from 'lucide-react';
import orderService from '../services/orderService';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [syncing, setSyncing] = useState(false);

  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    processing: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    shipped: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  const statusIcons = {
    pending: Clock,
    confirmed: CheckCircle,
    processing: Package,
    shipped: Truck,
    delivered: CheckCircle,
    cancelled: XCircle
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await orderService.getMyOrders();
      if (response.success) {
        setOrders(response.orders || []);
      } else {
        console.error('Failed to fetch orders:', response.message);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncLocalOrders = async () => {
    setSyncing(true);
    try {
      const response = await orderService.syncLocalOrders();
      if (response.success && response.synced > 0) {
        alert(`Synced ${response.synced} orders from local storage`);
        fetchOrders(); // Refresh the list
      }
    } catch (error) {
      console.error('Error syncing orders:', error);
    } finally {
      setSyncing(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredOrders = orders.filter(order => {
    if (filter !== 'all' && order.orderStatus !== filter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        order.orderNumber?.toLowerCase().includes(term) ||
        order.shippingAddress?.fullName?.toLowerCase().includes(term) ||
        order.items?.some(item => 
          item.productName?.toLowerCase().includes(term)
        )
      );
    }
    return true;
  });

  const getStatusBadge = (status) => {
    const StatusIcon = statusIcons[status] || AlertCircle;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusColors[status] || 'bg-gray-500/20 text-gray-400'}`}>
        <StatusIcon size={12} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const renderOrderCard = (order) => (
    <motion.div
      key={order._id || order.localId}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-900/50 to-slate-900/30 rounded-2xl border border-white/10 p-6 hover:border-cyan-500/30 transition-all cursor-pointer"
      onClick={() => setSelectedOrder(selectedOrder?._id === order._id ? null : order)}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
              <Package className="text-cyan-400" size={20} />
            </div>
            <div>
              <h3 className="font-semibold">{order.orderNumber || order.localId}</h3>
              <p className="text-sm text-slate-400">{formatDate(order.createdAt || order.timestamp)}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {getStatusBadge(order.orderStatus || 'pending')}
          <div className="text-xl font-bold text-cyan-400">
            {formatCurrency(order.totalAmount || 0)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-1">
          <p className="text-sm text-slate-400">Payment</p>
          <div className="flex items-center gap-2">
            <CreditCard size={14} className="text-slate-500" />
            <span className="text-sm capitalize">{order.paymentMethod?.replace('_', ' ') || 'N/A'}</span>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-slate-400">Items</p>
          <div className="flex items-center gap-2">
            <Package size={14} className="text-slate-500" />
            <span className="text-sm">{order.items?.length || 0} item(s)</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <MapPin size={14} />
          <span className="truncate max-w-[200px]">
            {order.shippingAddress?.city || 'Address not available'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
            View Details
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {selectedOrder?._id === order._id && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-6 pt-6 border-t border-white/10"
        >
          <h4 className="font-semibold mb-4">Order Details</h4>
          
          <div className="space-y-4">
            {/* Shipping Address */}
            <div>
              <h5 className="text-sm font-medium text-slate-400 mb-2">Shipping Address</h5>
              <div className="p-3 bg-slate-900/30 rounded-lg">
                <p className="font-medium">{order.shippingAddress?.fullName}</p>
                <p className="text-sm text-slate-400">{order.shippingAddress?.addressLine1}</p>
                {order.shippingAddress?.addressLine2 && (
                  <p className="text-sm text-slate-400">{order.shippingAddress.addressLine2}</p>
                )}
                <p className="text-sm text-slate-400">
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
                </p>
                <p className="text-sm text-slate-400">Phone: {order.shippingAddress?.phone}</p>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h5 className="text-sm font-medium text-slate-400 mb-2">Order Items</h5>
              <div className="space-y-2">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-slate-400">{item.variant} × {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                      <p className="text-sm text-slate-400">{formatCurrency(item.price)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Subtotal</span>
                  <span>{formatCurrency(order.subtotal || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Shipping</span>
                  <span>{formatCurrency(order.shippingCharge || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Tax</span>
                  <span>{formatCurrency(order.tax || 0)}</span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-br from-slate-900/50 to-slate-900/30 rounded-lg border border-white/10">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-cyan-400">
                    {formatCurrency(order.totalAmount || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              {order.orderStatus === 'pending' && (
                <button className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors text-sm">
                  Cancel Order
                </button>
              )}
              <button className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg hover:bg-slate-800/70 transition-colors text-sm">
                Download Invoice
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/30 transition-colors text-sm">
                Track Order
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#050b16] to-[#0a1120] text-white p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
              <p className="mt-4 text-slate-300">Loading your orders...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050b16] to-[#0a1120] text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                My Orders
              </h1>
              <p className="text-slate-400 mt-2">Track and manage all your orders in one place</p>
            </div>
            <button
              onClick={syncLocalOrders}
              disabled={syncing}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl hover:bg-cyan-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={18} className={`${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Orders'}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-gradient-to-br from-slate-900/50 to-slate-900/30 rounded-2xl border border-white/10">
              <p className="text-2xl font-bold">{orders.length}</p>
              <p className="text-sm text-slate-400">Total Orders</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-slate-900/50 to-slate-900/30 rounded-2xl border border-white/10">
              <p className="text-2xl font-bold text-green-400">
                {orders.filter(o => o.orderStatus === 'delivered').length}
              </p>
              <p className="text-sm text-slate-400">Delivered</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-slate-900/50 to-slate-900/30 rounded-2xl border border-white/10">
              <p className="text-2xl font-bold text-blue-400">
                {orders.filter(o => ['pending', 'confirmed', 'processing'].includes(o.orderStatus)).length}
              </p>
              <p className="text-sm text-slate-400">In Progress</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-slate-900/50 to-slate-900/30 rounded-2xl border border-white/10">
              <p className="text-2xl font-bold">
                ₹{orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0).toLocaleString()}
              </p>
              <p className="text-sm text-slate-400">Total Spent</p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500" size={20} />
                <input
                  type="text"
                  placeholder="Search by order number, product, or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 transition-all"
                />
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                    filter === status
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-slate-900/50 to-slate-900/30 border border-white/10 mb-6">
              <Package className="text-slate-500" size={40} />
            </div>
            <h3 className="text-xl font-semibold mb-2">No orders found</h3>
            <p className="text-slate-400 mb-6">
              {searchTerm || filter !== 'all' 
                ? 'Try changing your search or filter'
                : 'You haven\'t placed any orders yet'
              }
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilter('all');
              }}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map(renderOrderCard)}
          </div>
        )}

        {/* Local Storage Notice */}
        {localStorage.getItem('pending_orders') && (
          <div className="mt-8 p-4 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-2xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-yellow-400" size={20} />
              <div>
                <p className="text-yellow-400 font-medium">Orders Pending Sync</p>
                <p className="text-yellow-500/70 text-sm">
                  You have orders saved locally that need to be synced with the server.
                  Click "Sync Orders" to save them to your account.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;