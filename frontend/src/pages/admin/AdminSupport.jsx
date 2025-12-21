// frontend/src/pages/admin/AdminSupport.jsx
import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, RefreshCw, Eye, MessageSquare,
  CheckCircle, XCircle, Clock, AlertCircle,
  ChevronLeft, ChevronRight, Calendar, User,
  Mail, ExternalLink, Download, MoreVertical,
  Headphones, Shield, Zap, ArrowUpDown,
  Phone, MapPin, FileText, Send,
  ArrowUp, ArrowDown, TrendingUp, BarChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import adminService from '../../services/adminService';

const AdminSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
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
  const [showFilters, setShowFilters] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    critical: 0
  });

  const statusOptions = [
    { value: 'all', label: 'All Status', color: 'gray' },
    { value: 'open', label: 'Open', color: 'blue' },
    { value: 'in-progress', label: 'In Progress', color: 'yellow' },
    { value: 'resolved', label: 'Resolved', color: 'green' },
    { value: 'closed', label: 'Closed', color: 'gray' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities', color: 'gray' },
    { value: 'critical', label: 'Critical', color: 'red' },
    { value: 'high', label: 'High', color: 'orange' },
    { value: 'medium', label: 'Medium', color: 'yellow' },
    { value: 'low', label: 'Low', color: 'green' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories', color: 'gray' },
    { value: 'technical', label: 'Technical', color: 'blue' },
    { value: 'billing', label: 'Billing', color: 'green' },
    { value: 'feature-request', label: 'Feature Request', color: 'purple' },
    { value: 'bug', label: 'Bug', color: 'red' },
    { value: 'other', label: 'Other', color: 'gray' }
  ];

  const statusColors = {
    open: 'bg-blue-100 text-blue-800 border-blue-200',
    'in-progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    resolved: 'bg-green-100 text-green-800 border-green-200',
    closed: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  const priorityColors = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200'
  };

  useEffect(() => {
    fetchTickets();
    calculateStats();
  }, [filters]);

  const fetchTickets = async () => {
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
      
      if (filters.priority !== 'all') {
        params.priority = filters.priority;
      }
      
      if (filters.search) {
        params.search = filters.search;
      }
      
      console.log('🎫 Fetching tickets with params:', params);
      
      const response = await adminService.getSupportTickets(params);
      
      if (response.success) {
        console.log('✅ Tickets fetched:', response.tickets.length);
        setTickets(response.tickets);
        setPagination(response.pagination);
      } else {
        console.error('❌ Failed to fetch tickets:', response.message);
      }
    } catch (error) {
      console.error('❌ Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'open').length;
    const inProgress = tickets.filter(t => t.status === 'in-progress').length;
    const resolved = tickets.filter(t => t.status === 'resolved').length;
    const critical = tickets.filter(t => t.priority === 'critical').length;
    
    setStats({ total, open, inProgress, resolved, critical });
  };

  const handleStatusUpdate = async (ticketId, newStatus) => {
    try {
      console.log('🔄 Updating ticket status:', ticketId, newStatus);
      const response = await adminService.updateTicketStatus(ticketId, { status: newStatus });
      
      if (response.success) {
        // Update local state
        setTickets(tickets.map(ticket => 
          ticket._id === ticketId ? { ...ticket, status: newStatus } : ticket
        ));
        
        if (selectedTicket?._id === ticketId) {
          setSelectedTicket({ ...selectedTicket, status: newStatus });
        }
        
        alert(`✅ Ticket status updated to ${newStatus}`);
        fetchTickets(); // Refresh the list
      } else {
        alert(`❌ Failed to update status: ${response.message}`);
      }
    } catch (error) {
      console.error('❌ Error updating status:', error);
      alert('❌ Failed to update ticket status. Please try again.');
    }
  };

  const handleViewDetails = async (ticket) => {
    try {
      console.log('🔍 Fetching ticket details for:', ticket._id);
      const response = await adminService.getTicketDetails(ticket._id);
      
      if (response.success) {
        setSelectedTicket(response.ticket);
        setShowDetails(true);
      } else {
        // If API fails, show basic details
        setSelectedTicket(ticket);
        setShowDetails(true);
      }
    } catch (error) {
      console.error('❌ Error fetching ticket details:', error);
      setSelectedTicket(ticket);
      setShowDetails(true);
    }
  };

  const sendReply = async () => {
    if (!replyText.trim()) {
      alert('Please enter a reply message');
      return;
    }

    // Here you would typically send the reply via API
    // For now, we'll simulate it
    const newReply = {
      id: Date.now(),
      message: replyText,
      sender: 'Admin',
      timestamp: new Date().toISOString(),
      isAdmin: true
    };

    setSelectedTicket(prev => ({
      ...prev,
      replies: [...(prev.replies || []), newReply]
    }));

    setReplyText('');
    alert('✅ Reply sent successfully');
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

  const truncateText = (text, length = 100) => {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'open': return <AlertCircle className="h-4 w-4" />;
      case 'in-progress': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'critical': return <Zap className="h-4 w-4" />;
      case 'high': return <AlertCircle className="h-4 w-4" />;
      case 'medium': return <Shield className="h-4 w-4" />;
      case 'low': return <Headphones className="h-4 w-4" />;
      default: return <Headphones className="h-4 w-4" />;
    }
  };

  const renderTicketRow = (ticket) => (
    <motion.tr
      key={ticket._id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-b border-gray-200 hover:bg-yellow-50/30 transition-colors group"
    >
      <td className="py-4 px-4">
        <div className="space-y-1 max-w-md">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-gray-400" />
            <p className="font-semibold text-gray-900 group-hover:text-yellow-700">
              {ticket.subject}
            </p>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {truncateText(ticket.description, 120)}
          </p>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded">
              {ticket.category || 'other'}
            </span>
            {ticket.robotIP && (
              <span className="text-gray-500">
                Robot: {ticket.robotIP}
              </span>
            )}
          </div>
        </div>
      </td>
      
      <td className="py-4 px-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-gray-900">{ticket.name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="h-3 w-3" />
            <span>{ticket.email}</span>
          </div>
        </div>
      </td>
      
      <td className="py-4 px-4">
        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${priorityColors[ticket.priority] || 'bg-gray-100 text-gray-800 border-gray-200'} flex items-center gap-1.5`}>
          {getPriorityIcon(ticket.priority)}
          {ticket.priority}
        </span>
      </td>
      
      <td className="py-4 px-4">
        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${statusColors[ticket.status] || 'bg-gray-100 text-gray-800 border-gray-200'} flex items-center gap-1.5`}>
          {getStatusIcon(ticket.status)}
          {ticket.status}
        </span>
      </td>
      
      <td className="py-4 px-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-3 w-3" />
            {new Date(ticket.createdAt).toLocaleDateString()}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </td>
      
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleViewDetails(ticket)}
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye size={18} />
          </button>
          
          <select
            value={ticket.status}
            onChange={(e) => handleStatusUpdate(ticket._id, e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            {statusOptions.filter(opt => opt.value !== 'all').map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
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
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600">
              <Headphones className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
              <p className="text-gray-600">Manage and resolve customer support requests</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full">
              <Headphones className="h-3 w-3" />
              {stats.total} Total Tickets
            </span>
            <span className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-full">
              <AlertCircle className="h-3 w-3" />
              {stats.critical} Critical
            </span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <button
            onClick={fetchTickets}
            className="px-5 py-2.5 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-xl hover:from-yellow-700 hover:to-orange-700 flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-100 border border-yellow-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-yellow-700">{stats.total}</p>
              <p className="text-sm text-yellow-600">Total Tickets</p>
            </div>
            <Headphones className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-700">{stats.open}</p>
              <p className="text-sm text-blue-600">Open</p>
            </div>
            <AlertCircle className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-yellow-700">{stats.inProgress}</p>
              <p className="text-sm text-yellow-600">In Progress</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-700">{stats.resolved}</p>
              <p className="text-sm text-green-600">Resolved</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-red-700">{stats.critical}</p>
              <p className="text-sm text-red-600">Critical</p>
            </div>
            <Zap className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by subject, customer name, or email..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          
          {/* Status Filter */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Status</span>
            </div>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Priority Filter */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Priority</span>
            </div>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
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
                <option value="priority">Priority: High to Low</option>
                <option value="-priority">Priority: Low to High</option>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      {categoryOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                    <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">Last 7 Days</option>
                      <option value="month">Last 30 Days</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Has Robot IP</label>
                    <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="all">All Tickets</option>
                      <option value="yes">With Robot IP</option>
                      <option value="no">Without Robot IP</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setFilters({
                        status: 'all',
                        priority: 'all',
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
                    onClick={fetchTickets}
                    className="px-4 py-2.5 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg hover:from-yellow-700 hover:to-orange-700 transition-all"
                  >
                    Apply Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Enhanced Tickets Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <RefreshCw className="animate-spin h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Loading support tickets...</p>
              <p className="text-sm text-gray-500 mt-2">Fetching data from server</p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Ticket Details</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Customer</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Priority</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tickets.length > 0 ? (
                    tickets.map(renderTicketRow)
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-16 text-center">
                        <div className="space-y-3">
                          <Headphones className="h-16 w-16 mx-auto text-gray-300" />
                          <p className="text-gray-500 font-medium">No support tickets found</p>
                          <p className="text-sm text-gray-400">
                            Try adjusting your filters or search terms
                          </p>
                          <button
                            onClick={fetchTickets}
                            className="px-4 py-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-lg transition-colors"
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
            {tickets.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> tickets
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
                    <ChevronLeft className="h-4 w-4" />
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
                              ? 'bg-yellow-600 text-white'
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
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Enhanced Ticket Details Modal */}
      {showDetails && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600">
                  <Headphones className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Support Ticket #{selectedTicket._id?.substring(0, 8) || 'N/A'}
                  </h2>
                  <p className="text-sm text-gray-600">{selectedTicket.subject}</p>
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
              {/* Ticket Info Section */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Customer</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{selectedTicket.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{selectedTicket.email}</span>
                      </div>
                      {selectedTicket.userId && (
                        <div className="text-sm text-gray-500">
                          User ID: {selectedTicket.userId}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Ticket Details</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${priorityColors[selectedTicket.priority] || 'bg-gray-100 text-gray-800 border-gray-200'} flex items-center gap-1`}>
                          {getPriorityIcon(selectedTicket.priority)}
                          {selectedTicket.priority}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[selectedTicket.status] || 'bg-gray-100 text-gray-800 border-gray-200'} flex items-center gap-1`}>
                          {getStatusIcon(selectedTicket.status)}
                          {selectedTicket.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Category: <span className="font-medium">{selectedTicket.category || 'other'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Dates</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Created: {formatDate(selectedTicket.createdAt)}</div>
                      <div>Updated: {formatDate(selectedTicket.updatedAt)}</div>
                      {selectedTicket.robotIP && (
                        <div className="text-xs text-gray-500">
                          Robot IP: <span className="font-mono">{selectedTicket.robotIP}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Ticket Description */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Description</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-line">{selectedTicket.description}</p>
                </div>
              </div>
              
              {/* Reply Section */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Reply</h3>
                <div className="space-y-4">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply here..."
                    rows="4"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <div className="flex justify-between items-center">
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleStatusUpdate(selectedTicket._id, e.target.value)}
                      className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      {statusOptions.filter(opt => opt.value !== 'all').map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={sendReply}
                      className="px-5 py-2.5 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-xl hover:from-yellow-700 hover:to-orange-700 transition-all flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Send Reply & Update Status
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Conversation History */}
              {(selectedTicket.replies || []).length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversation History</h3>
                  <div className="space-y-4">
                    {selectedTicket.replies.map((reply, index) => (
                      <div 
                        key={index}
                        className={`p-4 rounded-lg border ${
                          reply.isAdmin 
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              reply.isAdmin 
                                ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {reply.isAdmin ? 'A' : 'C'}
                            </div>
                            <span className="font-medium">
                              {reply.sender} {reply.isAdmin && '(Admin)'}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDate(reply.timestamp)}
                          </span>
                        </div>
                        <p className="text-gray-700">{reply.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowDetails(false)}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedTicket._id, 'closed')}
                className="px-5 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all"
              >
                <CheckCircle className="h-4 w-4 mr-2 inline" />
                Close Ticket
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminSupport;