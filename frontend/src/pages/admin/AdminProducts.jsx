// frontend/src/pages/admin/AdminProducts.jsx
import React, { useState, useEffect } from 'react';
import { 
  Package, Search, Filter, Plus, Edit, Trash2, Eye,
  RefreshCw, TrendingUp, DollarSign, BarChart,
  CheckCircle, XCircle, ChevronDown, MoreVertical,
  Download, Upload, Tag, Shield, Star, Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import adminService from '../../services/adminService';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [imageUrls, setImageUrls] = useState(['', '', '', '']);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    variant: 'Emo',
    price: 0,
    discountPrice: '',
    stock: 10,
    description: '', // This will be short description
    detailedDescription: '', // This will be long description
    features: [{ title: '', description: '' }],
    specifications: {
      processor: '',
      ram: '',
      storage: '',
      battery: '',
      camera: '',
      sensors: '',
      connectivity: '',
      dimensions: '',
      weight: '',
      warranty: '1 Year'
    },
    images: [],
    tags: ['Robot', 'AI', 'Smart'],
    isActive: true
  });

  const variants = ['All', 'Emo', 'EmoPro', 'ProPlus'];
  const sortOptions = [
    { value: '-createdAt', label: 'Newest First' },
    { value: 'createdAt', label: 'Oldest First' },
    { value: 'price', label: 'Price: Low to High' },
    { value: '-price', label: 'Price: High to Low' },
    { value: 'stock', label: 'Stock: Low to High' },
    { value: '-stock', label: 'Stock: High to Low' },
    { value: 'name', label: 'Name: A to Z' },
    { value: '-name', label: 'Name: Z to A' }
  ];

  useEffect(() => {
    fetchProducts();
  }, [pagination.page, filter, sortBy, searchTerm]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        search: searchTerm || undefined,
        variant: filter !== 'all' ? filter : undefined
      };

      const response = await adminService.getAdminProducts(params);
      if (response.success) {
        setProducts(response.products);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setPagination({ page: 1, limit: 10, total: 0, pages: 1 });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async () => {
    try {
      // Validate required fields
      if (!newProduct.name || !newProduct.price || newProduct.price <= 0) {
        alert('Please fill in all required fields (Name and Price)');
        return;
      }

      // Prepare data for backend - map frontend fields to backend fields
      const productData = {
        ...newProduct,
        // Map description fields correctly
        description: newProduct.description, // Short description
        detailedDescription: newProduct.detailedDescription, // Long description
        // Ensure numbers are numbers
        price: Number(newProduct.price),
        discountPrice: newProduct.discountPrice ? Number(newProduct.discountPrice) : undefined,
        stock: Number(newProduct.stock),
        // Process images from URLs
        images: imageUrls
          .filter(url => url.trim() !== '')
          .map((url, index) => ({
            url: url.trim(),
            alt: `${newProduct.name} - Image ${index + 1}`,
            isPrimary: index === 0
          })),
        // Process features - remove empty ones
        features: newProduct.features.filter(f => f.title.trim() !== '' && f.description.trim() !== '')
      };

      // Remove _id if it's empty (for new products)
      if (!productData._id) {
        delete productData._id;
      }

      const response = await adminService.saveProduct(productData);
      if (response.success) {
        alert(newProduct._id ? '✅ Product updated successfully!' : '✅ Product created successfully!');
        setShowAddModal(false);
        resetNewProductForm();
        fetchProducts();
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('❌ Failed to save product: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleToggleStatus = async (productId, currentStatus) => {
    try {
      const response = await adminService.toggleProductStatus(productId, !currentStatus);
      if (response.success) {
        alert(`Product ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
        fetchProducts();
      }
    } catch (error) {
      console.error('Error toggling product status:', error);
      alert('Failed to update product status');
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    
    try {
      // Call actual API
      const response = await adminService.deleteProduct(productToDelete._id);
      
      if (response.success) {
        alert(`✅ Product "${productToDelete.name}" deleted successfully!`);
        setShowDeleteModal(false);
        setProductToDelete(null);
        fetchProducts(); // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('❌ Failed to delete product: ' + (error.response?.data?.message || error.message));
    }
  };

  const resetNewProductForm = () => {
    setNewProduct({
      name: '',
      variant: 'Emo',
      price: 0,
      discountPrice: '',
      stock: 10,
      description: '',
      detailedDescription: '',
      features: [{ title: '', description: '' }],
      specifications: {
        processor: '',
        ram: '',
        storage: '',
        battery: '',
        camera: '',
        sensors: '',
        connectivity: '',
        dimensions: '',
        weight: '',
        warranty: '1 Year'
      },
      images: [],
      tags: ['Robot', 'AI', 'Smart'],
      isActive: true
    });
    setImageUrls(['', '', '', '']);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getVariantColor = (variant) => {
    switch(variant) {
      case 'Emo': return 'bg-blue-100 text-blue-800';
      case 'EmoPro': return 'bg-purple-100 text-purple-800';
      case 'ProPlus': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Load product data for editing
  const loadProductForEdit = (product) => {
    setNewProduct({
      ...product,
      description: product.description || '', // Map from backend
      detailedDescription: product.detailedDescription || '', // Map from backend
      features: product.features?.length > 0 ? product.features : [{ title: '', description: '' }],
      specifications: product.specifications || {
        processor: '',
        ram: '',
        storage: '',
        battery: '',
        camera: '',
        sensors: '',
        connectivity: '',
        dimensions: '',
        weight: '',
        warranty: '1 Year'
      },
      tags: product.tags || ['Robot', 'AI', 'Smart']
    });
    
    // Load images
    if (product.images?.length > 0) {
      const urls = product.images.map(img => img.url);
      setImageUrls([...urls, ...Array(4 - urls.length).fill('')]);
    } else {
      setImageUrls(['', '', '', '']);
    }
    
    setShowAddModal(true);
  };

  const handleImageUrlChange = (index, value) => {
    const newImageUrls = [...imageUrls];
    newImageUrls[index] = value;
    setImageUrls(newImageUrls);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600">Manage your product catalog and inventory</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchProducts}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 flex items-center gap-2"
          >
            <Plus size={16} />
            Add Product
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold">{pagination.total}</p>
            </div>
            <Package className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock (&lt;10)</p>
              <p className="text-2xl font-bold text-yellow-600">
                {products.filter(p => p.stock < 10 && p.stock > 0).length}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">
                {products.filter(p => p.stock === 0).length}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Products</p>
              <p className="text-2xl font-bold text-green-600">
                {products.filter(p => p.isActive).length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Variants</option>
              {variants.filter(v => v !== 'All').map(variant => (
                <option key={variant} value={variant}>{variant}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No products found</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Your First Product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center">
                          {product.images?.length > 0 ? (
                            <img 
                              src={product.images[0].url} 
                              alt={product.name}
                              className="h-8 w-8 rounded object-cover"
                            />
                          ) : (
                            <Package className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">ID: {product._id?.slice(-6) || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getVariantColor(product.variant)}`}>
                        {product.variant}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{formatCurrency(product.discountPrice || product.price)}</p>
                        {product.discountPrice && product.discountPrice < product.price && (
                          <p className="text-sm text-gray-500 line-through">
                            {formatCurrency(product.price)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              product.stock > 10 ? 'bg-green-500' :
                              product.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(100, (product.stock / 20) * 100)}%` }}
                          />
                        </div>
                        <span className={`font-medium ${
                          product.stock > 10 ? 'text-green-600' :
                          product.stock > 0 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {product.stock}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${product.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className={product.isActive ? 'text-green-700' : 'text-red-700'}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedProduct(selectedProduct?._id === product._id ? null : product)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => loadProductForEdit(product)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg"
                          title="Edit Product"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(product._id, product.isActive)}
                          className={`p-2 rounded-lg ${
                            product.isActive 
                              ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50'
                              : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                          }`}
                          title={product.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {product.isActive ? <Shield size={16} /> : <CheckCircle size={16} />}
                        </button>
                        <button
                          onClick={() => {
                            setProductToDelete(product);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                <span className="font-medium">{pagination.total}</span> products
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                      className={`px-3 py-1 rounded-lg ${
                        pagination.page === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">
                    {newProduct._id ? '✏️ Edit Product' : '➕ Add New Product'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      resetNewProductForm();
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="SuperEmo Basic"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Variant *
                      </label>
                      <select
                        value={newProduct.variant}
                        onChange={(e) => setNewProduct({...newProduct, variant: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {variants.filter(v => v !== 'All').map(variant => (
                          <option key={variant} value={variant}>{variant}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="27999"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discount Price (₹)
                      </label>
                      <input
                        type="number"
                        value={newProduct.discountPrice}
                        onChange={(e) => setNewProduct({...newProduct, discountPrice: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="24999"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Stock & Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock Quantity *
                      </label>
                      <input
                        type="number"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="10"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={newProduct.isActive}
                        onChange={(e) => setNewProduct({...newProduct, isActive: e.target.value === 'true'})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>

                  {/* Image URLs */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <ImageIcon size={16} className="inline mr-1" />
                      Image URLs (up to 4)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="space-y-1">
                          <label className="text-xs text-gray-500">Image {index + 1}</label>
                          <input
                            type="url"
                            value={url}
                            onChange={(e) => handleImageUrlChange(index, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder={`https://example.com/image${index + 1}.jpg`}
                          />
                          {url && (
                            <div className="text-xs text-green-600">
                              ✓ URL added
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Short Description *
                    </label>
                    <textarea
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Brief description for product cards (max 150 characters)"
                      maxLength="150"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Detailed Description *
                    </label>
                    <textarea
                      value={newProduct.detailedDescription}
                      onChange={(e) => setNewProduct({...newProduct, detailedDescription: e.target.value})}
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Detailed product description with features, benefits, etc."
                      required
                    />
                  </div>

                  {/* Features */}
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-medium mb-3">Features</h3>
                    {newProduct.features.map((feature, index) => (
                      <div key={index} className="flex gap-2 mb-3">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={feature.title}
                            onChange={(e) => {
                              const newFeatures = [...newProduct.features];
                              newFeatures[index].title = e.target.value;
                              setNewProduct({...newProduct, features: newFeatures});
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="Feature title"
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={feature.description}
                            onChange={(e) => {
                              const newFeatures = [...newProduct.features];
                              newFeatures[index].description = e.target.value;
                              setNewProduct({...newProduct, features: newFeatures});
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="Feature description"
                          />
                        </div>
                        <button
                          onClick={() => {
                            const newFeatures = newProduct.features.filter((_, i) => i !== index);
                            setNewProduct({...newProduct, features: newFeatures});
                          }}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setNewProduct({
                        ...newProduct,
                        features: [...newProduct.features, { title: '', description: '' }]
                      })}
                      className="mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                    >
                      + Add Feature
                    </button>
                  </div>

                  {/* Specifications */}
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-medium mb-3">Specifications</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Processor</label>
                        <input
                          type="text"
                          value={newProduct.specifications.processor}
                          onChange={(e) => setNewProduct({
                            ...newProduct,
                            specifications: { ...newProduct.specifications, processor: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Intel Core i5"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">RAM</label>
                        <input
                          type="text"
                          value={newProduct.specifications.ram}
                          onChange={(e) => setNewProduct({
                            ...newProduct,
                            specifications: { ...newProduct.specifications, ram: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="8GB DDR4"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Storage</label>
                        <input
                          type="text"
                          value={newProduct.specifications.storage}
                          onChange={(e) => setNewProduct({
                            ...newProduct,
                            specifications: { ...newProduct.specifications, storage: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="256GB SSD"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Battery</label>
                        <input
                          type="text"
                          value={newProduct.specifications.battery}
                          onChange={(e) => setNewProduct({
                            ...newProduct,
                            specifications: { ...newProduct.specifications, battery: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="5000mAh"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      resetNewProductForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProduct}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-colors font-medium"
                  >
                    {newProduct._id ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && productToDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl max-w-md w-full p-6"
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Delete Product
                </h3>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete <span className="font-semibold">{productToDelete.name}</span>?
                </p>
                <p className="text-sm text-red-600 mb-6">
                  ⚠️ This action cannot be undone and will permanently remove the product.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setProductToDelete(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteProduct}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete Product
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;