import React, { useState, useEffect } from 'react';
import { 
  BarChart, LineChart, PieChart, TrendingUp, TrendingDown,
  Users, ShoppingCart, DollarSign, Package, Download, Filter,
  Calendar, Target, RefreshCw
} from 'lucide-react';
import adminService from '../../services/adminService';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [analyticsData, setAnalyticsData] = useState({
    revenue: { current: 245600, previous: 218400, change: 12.5 },
    orders: { current: 124, previous: 114, change: 8.8 },
    users: { current: 89, previous: 78, change: 14.1 },
    conversion: { current: 4.2, previous: 3.8, change: 10.5 }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAnalytics({ timeRange });
      if (response.success) {
        setAnalyticsData(response.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Track and analyze store performance</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 flex items-center gap-2"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Updating...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-green-100 to-green-200">
              <DollarSign className="h-6 w-6 text-green-700" />
            </div>
            <span className={`flex items-center gap-1 text-sm font-semibold ${
              analyticsData.revenue.change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {analyticsData.revenue.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {analyticsData.revenue.change}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">₹{analyticsData.revenue.current.toLocaleString()}</h3>
          <p className="text-gray-600">Total Revenue</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200">
              <ShoppingCart className="h-6 w-6 text-blue-700" />
            </div>
            <span className={`flex items-center gap-1 text-sm font-semibold ${
              analyticsData.orders.change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {analyticsData.orders.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {analyticsData.orders.change}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{analyticsData.orders.current}</h3>
          <p className="text-gray-600">Total Orders</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200">
              <Users className="h-6 w-6 text-purple-700" />
            </div>
            <span className={`flex items-center gap-1 text-sm font-semibold ${
              analyticsData.users.change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {analyticsData.users.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {analyticsData.users.change}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{analyticsData.users.current}</h3>
          <p className="text-gray-600">Active Users</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200">
              <Target className="h-6 w-6 text-orange-700" />
            </div>
            <span className={`flex items-center gap-1 text-sm font-semibold ${
              analyticsData.conversion.change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {analyticsData.conversion.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {analyticsData.conversion.change}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{analyticsData.conversion.current}%</h3>
          <p className="text-gray-600">Conversion Rate</p>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Revenue Trend</h3>
            <BarChart className="h-5 w-5 text-gray-500" />
          </div>
          <div className="h-64 bg-gradient-to-b from-gray-50 to-white rounded-lg flex items-center justify-center">
            <div className="text-center">
              <LineChart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Revenue chart will appear here</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Top Products</h3>
            <PieChart className="h-5 w-5 text-gray-500" />
          </div>
          <div className="h-64 bg-gradient-to-b from-gray-50 to-white rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Product performance chart</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;