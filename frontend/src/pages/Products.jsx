// frontend/src/pages/Products.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, Cpu, Camera, Zap, Shield, Brain, 
  Users, Cloud, Wifi, Battery, ChevronRight, 
  Star, CheckCircle, ShoppingCart, Tag,
  Filter, Search, TrendingUp, ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import productService from '../services/productService';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  
  const variants = [
    { id: 'all', name: 'All Variants', color: 'bg-gray-500' },
    { id: 'Emo', name: 'Emo', color: 'bg-blue-500' },
    { id: 'EmoPro', name: 'Emo Pro', color: 'bg-purple-500' },
    { id: 'ProPlus', name: 'Pro Plus', color: 'bg-cyan-500' }
  ];

  useEffect(() => {
    fetchProducts();
  }, [selectedVariant, sortBy]);

 // In your Products.jsx, replace the fetchProducts function with:
const fetchProducts = async () => {
  setLoading(true);
  try {
    console.log('🔄 Fetching products...');
    const response = await productService.getProducts();
    console.log('📦 Products API Response:', response);
    
    if (response.success) {
      console.log('✅ Found products:', response.products);
      // Log all product IDs
      response.products.forEach(product => {
        console.log(`📝 Product: ${product.name}, ID: ${product._id}`);
      });
      setProducts(response.products);
    } else {
      console.log('⚠️ Using fallback data');
      setProducts([
        {
          _id: 'sample-emo',
          name: 'Emo Basic',
          variant: 'Emo',
          price: 27999,
          discountPrice: 24999,
          description: 'Basic emotional intelligence robot',
          stock: 10,
          features: [
            { title: '5 Basic Emotions' },
            { title: '8 Hours Battery' },
            { title: '5MP Camera' }
          ]
        },
        {
          _id: 'sample-pro',
          name: 'Emo Pro',
          variant: 'EmoPro',
          price: 54999,
          discountPrice: 49999,
          description: 'Professional emotional robot',
          stock: 5,
          features: [
            { title: '20+ Advanced Emotions' },
            { title: '12 Hours Battery' },
            { title: '12MP Dual Camera' }
          ]
        }
      ]);
    }
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    setProducts([]); // Empty array to avoid errors
  } finally {
    setLoading(false);
  }
};
  const getVariantColor = (variant) => {
    switch(variant) {
      case 'Emo': return 'border-blue-500/30 bg-blue-500/10 text-blue-400';
      case 'EmoPro': return 'border-purple-500/30 bg-purple-500/10 text-purple-400';
      case 'ProPlus': return 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400';
      default: return 'border-gray-500/30 bg-gray-500/10 text-gray-400';
    }
  };

  const getVariantIcon = (variant) => {
    switch(variant) {
      case 'Emo': return <Cpu className="text-blue-400" size={20} />;
      case 'EmoPro': return <Brain className="text-purple-400" size={20} />;
      case 'ProPlus': return <Zap className="text-cyan-400" size={20} />;
      default: return <Package className="text-gray-400" size={20} />;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050b16] via-[#0a1122] to-[#050b16] text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Our Robot Products
          </h1>
          <p className="text-slate-400 mt-2">
            Choose from our range of emotional intelligence robots
          </p>
        </div>

        {/* Variant Filter */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Filter size={20} className="text-slate-400" />
            <span className="text-slate-300 font-medium">Filter by Variant:</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                  selectedVariant === variant.id
                    ? 'border-cyan-500/50 bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-white'
                    : 'border-slate-800/50 bg-slate-900/50 text-slate-400 hover:text-white hover:border-slate-700/70'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${variant.color}`}></div>
                {variant.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Search size={20} className="text-slate-400" />
            <span className="text-slate-300">{products.length} products found</span>
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 rounded-xl bg-slate-900/50 border border-slate-800/50 text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="name">Sort by Name</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-900/50 animate-pulse rounded-2xl p-6 h-96"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-slate-900/50 to-slate-900/30 rounded-2xl border border-slate-800/50 p-6 hover:border-cyan-500/30 transition-all group"
              >
                {/* Product Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl border ${getVariantColor(product.variant)}`}>
                      {getVariantIcon(product.variant)}
                    </div>
                    <div>
                      <span className={`text-xs px-2 py-1 rounded-full border ${getVariantColor(product.variant)}`}>
                        {product.variant}
                      </span>
                    </div>
                  </div>
                  
                  {product.stock < 5 && (
                    <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                      Low Stock
                    </span>
                  )}
                </div>

                {/* Product Image Placeholder */}
                <div className="mb-4 h-48 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <Cpu size={48} className="mx-auto text-slate-600 mb-2" />
                    <p className="text-slate-500 text-sm">{product.name} Image</p>
                  </div>
                </div>

                {/* Product Info */}
                <h3 className="text-xl font-semibold mb-2 group-hover:text-cyan-400 transition-colors">
                  {product.name}
                </h3>
                
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>

                {/* Features */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Key Features:</h4>
                  <ul className="space-y-1">
                    {product.features?.slice(0, 3).map((feature, index) => (
                      <li key={index} className="text-sm text-slate-400 flex items-center gap-2">
                        <CheckCircle size={12} className="text-green-500" />
                        {feature.title}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {formatPrice(product.discountPrice || product.price)}
                    </div>
                    {product.discountPrice && (
                      <div className="text-sm text-slate-500 line-through">
                        {formatPrice(product.price)}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-slate-400">
                    {product.stock > 0 ? (
                      <span className="text-green-400">In Stock ({product.stock})</span>
                    ) : (
                      <span className="text-red-400">Out of Stock</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Link
                    to={`/product/${product.slug || product._id}`}
                    className="flex-1 text-center px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:text-white hover:border-slate-600/70 hover:bg-slate-800/70 transition-all flex items-center justify-center gap-2"
                  >
                    View Details
                    <ChevronRight size={16} />
                  </Link>
                  
                 <Link
  to={`/order/${product._id}`}
  className="flex-1 text-center px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium hover:brightness-110 transition-all flex items-center justify-center gap-2"
>
  <ShoppingCart size={16} />
  Order Now
</Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        

        {/* Comparison Section */}
        <div className="mt-12 bg-gradient-to-br from-slate-900/50 to-slate-900/30 rounded-2xl border border-slate-800/50 p-6">
          <h2 className="text-2xl font-bold mb-6">Compare Variants</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800/50">
                  <th className="text-left p-3 text-slate-300">Feature</th>
                  <th className="text-center p-3">
                    <div className="inline-flex flex-col items-center">
                      <span className="text-blue-400 font-medium">Emo</span>
                      <span className="text-xs text-slate-500">Basic</span>
                    </div>
                  </th>
                  <th className="text-center p-3">
                    <div className="inline-flex flex-col items-center">
                      <span className="text-purple-400 font-medium">Emo Pro</span>
                      <span className="text-xs text-slate-500">Professional</span>
                    </div>
                  </th>
                  <th className="text-center p-3">
                    <div className="inline-flex flex-col items-center">
                      <span className="text-cyan-400 font-medium">Pro Plus</span>
                      <span className="text-xs text-slate-500">Enterprise</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Price', '₹27,999', '₹54,999', '₹89,999'],
                  ['Emotion Recognition', '5 Basic', '20+ Advanced', 'AI-Powered'],
                  ['Battery Life', '8 Hours', '12 Hours', '16 Hours'],
                  ['Camera', '5MP', '12MP Dual', '16MP Triple'],
                  ['Storage', '64GB', '256GB SSD', '1TB NVMe'],
                  ['Warranty', '1 Year', '2 Years', '3 Years Premium'],
                  ['Support', 'Basic', 'Priority', '24/7 Enterprise']
                ].map(([feature, emo, emoPro, proPlus], index) => (
                  <tr key={index} className="border-b border-slate-800/30">
                    <td className="p-3 text-slate-400">{feature}</td>
                    <td className="p-3 text-center text-blue-400">{emo}</td>
                    <td className="p-3 text-center text-purple-400">{emoPro}</td>
                    <td className="p-3 text-center text-cyan-400">{proPlus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;