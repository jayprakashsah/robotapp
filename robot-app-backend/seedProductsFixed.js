// Create this file at: /Users/prakashsah/Desktop/Robot-app/robot-app-backend/seedProductsFixed.js
const mongoose = require('mongoose');
require('dotenv').config();

// Define Product schema directly (temporary)
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true
  },
  variant: {
    type: String,
    enum: ['Emo', 'EmoPro', 'ProPlus'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  detailedDescription: {
    type: String,
    required: true
  },
  features: [{
    title: String,
    description: String,
    icon: String
  }],
  specifications: {
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
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discountPrice: {
    type: Number,
    min: 0
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: Boolean
  }],
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String],
  instructions: [{
    title: String,
    content: String,
    videoUrl: String,
    order: Number
  }]
}, {
  timestamps: true
});

// Generate slug before saving
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

const Product = mongoose.model('Product', productSchema);

// Products data
const products = [
  {
    name: "SuperEmo Basic",
    variant: "Emo",
    description: "Your entry to emotional intelligence robotics",
    detailedDescription: "Perfect for home use and learning. Understands basic emotions and responds accordingly with 85% accuracy. Ideal for families, students, and beginners in emotional AI.",
    price: 27999,
    discountPrice: 24999,
    features: [
      {
        title: "Basic Emotion Recognition",
        description: "Identifies 5 core emotions with 85% accuracy",
        icon: "brain"
      },
      {
        title: "Voice Commands",
        description: "Responds to 50+ voice commands",
        icon: "mic"
      },
      {
        title: "Smart Home Integration",
        description: "Works with Alexa, Google Home",
        icon: "home"
      },
      {
        title: "Learning Mode",
        description: "Adapts to your preferences over time",
        icon: "cpu"
      }
    ],
    specifications: {
      processor: "Quad-core 1.8GHz AI Chip",
      ram: "4GB LPDDR4",
      storage: "64GB eMMC + Cloud",
      battery: "4000mAh (8-10 hours)",
      camera: "5MP 1080p HD Camera",
      sensors: ["Emotion Sensor", "Voice Array", "Motion Detector", "Temperature"],
      connectivity: ["Wi-Fi 5", "Bluetooth 5.0", "USB-C"],
      dimensions: "20 × 15 × 10 cm",
      weight: "1.5 kg",
      warranty: "1 Year Standard"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1589256469067-ea99122bbdc4?w=800&auto=format&fit=crop",
        alt: "SuperEmo Basic Front",
        isPrimary: true
      }
    ],
    stock: 25,
    tags: ["beginner", "home", "starter", "family"],
    instructions: [
      {
        title: "Quick Start Guide",
        content: "Unbox, charge, connect to WiFi, and start interacting!",
        order: 1
      }
    ]
  },
  {
    name: "SuperEmo Pro",
    variant: "EmoPro",
    description: "Professional-grade emotional intelligence for serious users",
    detailedDescription: "Designed for psychologists, researchers, and professionals needing advanced emotional analytics.",
    price: 59999,
    discountPrice: 54999,
    features: [
      {
        title: "Advanced Analytics",
        description: "20+ emotions with 95% accuracy and detailed reports",
        icon: "bar-chart"
      },
      {
        title: "Multi-User Support",
        description: "Tracks up to 5 individual users",
        icon: "users"
      },
      {
        title: "Professional Reports",
        description: "Generate PDF/Excel reports of emotional data",
        icon: "file-text"
      },
      {
        title: "API Access",
        description: "Integrate with your own applications",
        icon: "code"
      }
    ],
    specifications: {
      processor: "Octa-core 2.4GHz + NPU",
      ram: "8GB LPDDR4X",
      storage: "256GB NVMe SSD",
      battery: "6000mAh (12-14 hours)",
      camera: "12MP Dual Camera System",
      sensors: ["Advanced Emotion Array", "3D Motion", "Voice Recognition", "Environmental"],
      connectivity: ["Wi-Fi 6", "Bluetooth 5.2", "Ethernet", "USB 3.0"],
      dimensions: "25 × 18 × 12 cm",
      weight: "2.2 kg",
      warranty: "2 Years Premium"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop",
        alt: "SuperEmo Pro Front",
        isPrimary: true
      }
    ],
    stock: 12,
    tags: ["professional", "research", "analytics", "multi-user"],
    instructions: [
      {
        title: "Professional Setup",
        content: "Complete the advanced calibration process",
        order: 1
      }
    ]
  },
  {
    name: "SuperEmo Pro Plus",
    variant: "ProPlus",
    description: "Enterprise-grade AI emotional intelligence platform",
    detailedDescription: "For corporations, research institutions, and enterprises requiring the most advanced emotional AI capabilities.",
    price: 99999,
    discountPrice: 89999,
    features: [
      {
        title: "AI-Powered Analysis",
        description: "Deep learning models for predictive emotional intelligence",
        icon: "cpu"
      },
      {
        title: "Real-time Analytics",
        description: "Live dashboard with real-time emotional tracking",
        icon: "activity"
      },
      {
        title: "Enterprise Security",
        description: "Bank-grade encryption and compliance",
        icon: "shield"
      },
      {
        title: "Custom AI Models",
        description: "Train your own emotion recognition models",
        icon: "git-branch"
      }
    ],
    specifications: {
      processor: "Dual-core 3.2GHz + Dedicated AI Processor",
      ram: "16GB LPDDR5",
      storage: "1TB NVMe SSD + Unlimited Cloud",
      battery: "8000mAh (16-20 hours) + Hot-swappable",
      camera: "16MP Triple Camera System with IR",
      sensors: ["AI Emotion Array", "Biometric Sensors", "3D Spatial", "Environmental Suite"],
      connectivity: ["Wi-Fi 6E", "5G Ready", "Bluetooth 5.3", "Dual Ethernet", "Thunderbolt 4"],
      dimensions: "30 × 22 × 15 cm",
      weight: "3.5 kg",
      warranty: "3 Years All-inclusive"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop",
        alt: "SuperEmo Pro Plus Front",
        isPrimary: true
      }
    ],
    stock: 8,
    tags: ["enterprise", "flagship", "ai", "research", "corporate"],
    instructions: [
      {
        title: "Enterprise Deployment",
        content: "IT team setup and network integration",
        order: 1
      }
    ]
  }
];

async function seedDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    
    // Load environment variables
    require('dotenv').config();
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI not found in .env file');
    }
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    
    // Drop existing products collection
    console.log('🗑️ Clearing existing products...');
    try {
      await mongoose.connection.db.collection('products').drop();
      console.log('✅ Dropped products collection');
    } catch (dropError) {
      console.log('ℹ️ Collection might not exist, creating new...');
    }
    
    // Insert products one by one
    console.log('\n📦 Inserting products...');
    const insertedProducts = [];
    
    for (let i = 0; i < products.length; i++) {
      const productData = products[i];
      console.log(`\n${i + 1}. Adding: ${productData.name} (${productData.variant})`);
      
      const product = new Product(productData);
      await product.save();
      insertedProducts.push(product);
      
      console.log(`   ✅ Added: ${product.name}`);
      console.log(`   💰 Price: ₹${product.price} (Discounted: ₹${product.discountPrice})`);
      console.log(`   📦 Stock: ${product.stock} units`);
      console.log(`   🔗 Slug: ${product.slug}`);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`✅ SUCCESS: Added ${insertedProducts.length} products to database!`);
    console.log('='.repeat(50));
    
    // Verify count
    const count = await Product.countDocuments();
    console.log(`📊 Total products in database: ${count}`);
    
    // Display all products
    console.log('\n📋 ALL PRODUCTS IN DATABASE:');
    console.log('='.repeat(50));
    
    const allProducts = await Product.find({}).sort({ variant: 1 });
    allProducts.forEach((p, index) => {
      console.log(`${index + 1}. ${p.name} (${p.variant})`);
      console.log(`   Slug: ${p.slug}`);
      console.log(`   Price: ₹${p.price} → ₹${p.discountPrice}`);
      console.log(`   Stock: ${p.stock} units`);
      console.log(`   Features: ${p.features.length}`);
      console.log(`   Tags: ${p.tags.join(', ')}`);
      console.log('   ──────────────────────');
    });
    
    console.log('\n🌐 TEST API ENDPOINTS:');
    console.log('1. GET http://localhost:5001/api/products');
    console.log('2. GET http://localhost:5001/api/products/superemo-basic');
    console.log('3. GET http://localhost:5001/api/products/superemo-pro');
    console.log('4. GET http://localhost:5001/api/products/superemo-pro-plus');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the seeding
seedDatabase();