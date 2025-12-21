// frontend/src/utils/formatUtils.js

// Format currency in INR
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

// Format date
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format status with colors
export const getStatusColor = (status) => {
  switch(status?.toLowerCase()) {
    case 'pending': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
    case 'confirmed': return 'text-blue-700 bg-blue-100 border-blue-200';
    case 'processing': return 'text-indigo-700 bg-indigo-100 border-indigo-200';
    case 'shipped': return 'text-purple-700 bg-purple-100 border-purple-200';
    case 'delivered': return 'text-green-700 bg-green-100 border-green-200';
    case 'cancelled': return 'text-red-700 bg-red-100 border-red-200';
    case 'open': return 'text-blue-700 bg-blue-100 border-blue-200';
    case 'in-progress': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
    case 'resolved': return 'text-green-700 bg-green-100 border-green-200';
    case 'closed': return 'text-gray-700 bg-gray-100 border-gray-200';
    default: return 'text-gray-700 bg-gray-100 border-gray-200';
  }
};

// Truncate text
export const truncateText = (text, length = 50) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

// Get priority color
export const getPriorityColor = (priority) => {
  switch(priority?.toLowerCase()) {
    case 'critical': return 'text-red-700 bg-red-100 border-red-200';
    case 'high': return 'text-orange-700 bg-orange-100 border-orange-200';
    case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
    case 'low': return 'text-green-700 bg-green-100 border-green-200';
    default: return 'text-gray-700 bg-gray-100 border-gray-200';
  }
};