// robot-app-backend/src/routes/productRoutes.js
const express = require('express');
const Product = require('../models/Product');
const { authenticate, checkDatabase } = require('../middleware/authMiddleware');
const router = express.Router();

// ✅ PUBLIC: GET ALL PRODUCTS (with filtering)
router.get('/', checkDatabase, async (req, res) => {
  try {
    const { 
      variant, 
      search, 
      sort = 'name', 
      limit = 10, 
      page = 1,
      minPrice,
      maxPrice
    } = req.query;
    
    // Build query
    const query = { isActive: true };
    
    if (variant && variant !== 'all') {
      query.variant = variant;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { detailedDescription: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    // Sort options
    const sortOptions = {
      'name': { name: 1 },
      'price-low': { price: 1 },
      'price-high': { price: -1 },
      'newest': { createdAt: -1 },
      'popular': { stock: -1 }
    };
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortBy = sortOptions[sort] || { name: 1 };
    
    // Execute query
    const products = await Product.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v -updatedAt');
    
    const total = await Product.countDocuments(query);
    
    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products'
    });
  }
});

// ✅ PUBLIC: GET SINGLE PRODUCT BY SLUG
router.get('/:slug', checkDatabase, async (req, res) => {
  try {
    const product = await Product.findOne({ 
      slug: req.params.slug,
      isActive: true 
    });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Get related products (same variant)
    const relatedProducts = await Product.find({
      variant: product.variant,
      _id: { $ne: product._id },
      isActive: true
    })
    .limit(3)
    .select('name slug variant price images stock');
    
    res.json({
      success: true,
      product,
      relatedProducts
    });
    
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product'
    });
  }
});

// ✅ PUBLIC: GET PRODUCT BY ID
router.get('/id/:id', checkDatabase, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      product
    });
    
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product'
    });
  }
});

// ✅ PUBLIC: GET PRODUCT VARIANTS STATS
router.get('/variants/stats', checkDatabase, async (req, res) => {
  try {
    const stats = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: {
        _id: '$variant',
        count: { $sum: 1 },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        avgPrice: { $avg: '$price' },
        totalStock: { $sum: '$stock' }
      }},
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error('Error fetching variant stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching variant stats'
    });
  }
});

// ✅ ADMIN: CREATE PRODUCT
router.post('/', authenticate, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can create products'
      });
    }
    
    const productData = req.body;
    
    // Validate required fields
    const requiredFields = ['name', 'variant', 'description', 'price'];
    for (const field of requiredFields) {
      if (!productData[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }
    
    // Create product
    const product = new Product(productData);
    await product.save();
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: {
        id: product._id,
        name: product.name,
        slug: product.slug,
        variant: product.variant,
        price: product.price
      }
    });
    
  } catch (error) {
    console.error('Error creating product:', error);
    
    // Handle duplicate slug
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Product with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ✅ ADMIN: UPDATE PRODUCT
router.put('/:id', authenticate, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update products'
      });
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body,
        updatedAt: Date.now()
      },
      { 
        new: true, 
        runValidators: true 
      }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    });
    
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product'
    });
  }
});

// ✅ ADMIN: DELETE PRODUCT (Soft delete)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete products'
      });
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { 
        isActive: false,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Product deactivated successfully'
    });
    
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product'
    });
  }
});

// ✅ ADMIN: GET ALL PRODUCTS (including inactive)
router.get('/admin/all', authenticate, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can view all products'
      });
    }
    
    const products = await Product.find({})
      .sort({ createdAt: -1 })
      .select('-__v');
    
    const total = await Product.countDocuments();
    const active = await Product.countDocuments({ isActive: true });
    
    res.json({
      success: true,
      products,
      stats: {
        total,
        active,
        inactive: total - active
      }
    });
    
  } catch (error) {
    console.error('Error fetching all products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products'
    });
  }
});

module.exports = router;