// robot-app-backend/src/models/Product.js
const mongoose = require('mongoose');

const featureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: 'star'
  }
});

const instructionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  videoUrl: String,
  order: {
    type: Number,
    default: 1
  }
});

const imageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: 'Product Image'
  },
  isPrimary: {
    type: Boolean,
    default: false
  }
});

const specificationsSchema = new mongoose.Schema({
  processor: String,
  ram: String,
  storage: String,
  battery: String,
  camera: String,
  sensors: [String],
  connectivity: [String],
  dimensions: String,
  weight: String,
  warranty: String
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    sparse: true,  // ✅ ADD THIS - allows null values for uniqueness
    lowercase: true
  },
  variant: {
    type: String,
    enum: ['Emo', 'EmoPro', 'ProPlus'],
    required: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
 detailedDescription: {
  type: String,
  default: ''
},
  features: [featureSchema],
  specifications: specificationsSchema,
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  discountPrice: {
    type: Number,
    min: [0, 'Discount price cannot be negative']
  },
  images: [imageSchema],
  stock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String],
  instructions: [instructionSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// ✅ FIXED: Generate slug before saving
productSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  }
  next();
});

// ✅ REMOVE duplicate index definition - keep only one
// Remove any other index definitions for slug

const Product = mongoose.model('Product', productSchema);

module.exports = Product;