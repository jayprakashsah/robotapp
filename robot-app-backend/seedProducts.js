// robot-app-backend/seedProductsFixed.js
const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./src/models/Product');

const products = [
  {
    name: "SuperEmo Basic",
    variant: "Emo",
    description: "Your entry to emotional intelligence robotics",
    detailedDescription: "Perfect for home use and learning. Understands basic emotions and responds accordingly with 85% accuracy. Ideal for families, students, and beginners in emotional AI.",
    price: 29999,
    discountPrice: 24999,
    features: [
      {
        title: "Basic Emotion Recognition",
        description: "Identifies 5 core emotions (happy, sad, angry, surprised, neutral) with 85% accuracy",
        icon: "brain"
      },
      {
        title: "Voice Commands",
        description: "Responds to 50+ voice commands in multiple languages",
        icon: "mic"
      },
      {
        title: "Smart Home Integration",
        description: "Works with Alexa, Google Home, and Apple HomeKit",
        icon: "home"
      },
      {
        title: "Learning Mode",
        description: "Adapts to your preferences and routines over time",
        icon: "cpu"
      }
    ],
    specifications: {
      processor: "Quad-core 1.8GHz AI Chip",
      ram: "4GB LPDDR4",
      storage: "64GB eMMC + 100GB Cloud Storage",
      battery: "4000mAh Li-Po (8-10 hours active use)",
      camera: "5MP 1080p HD Camera with Night Vision",
      sensors: ["Emotion Sensor Array", "4-microphone Voice Array", "Motion Detector", "Temperature Sensor", "Light Sensor"],
      connectivity: ["Wi-Fi 5 (802.11ac)", "Bluetooth 5.0", "USB-C", "3.5mm Audio"],
      dimensions: "20 × 15 × 10 cm",
      weight: "1.5 kg",
      warranty: "1 Year Standard Warranty"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1589256469067-ea99122bbdc4?w=800&auto=format&fit=crop&q=60",
        alt: "SuperEmo Basic - Front View",
        isPrimary: true
      },
      {
        url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop&q=60",
        alt: "SuperEmo Basic - Side View"
      }
    ],
    stock: 50,
    tags: ["beginner", "home", "starter", "family", "student"],
    instructions: [
      {
        title: "Quick Start Guide",
        content: "1. Unbox your SuperEmo Basic\n2. Charge for 3 hours using included adapter\n3. Connect to WiFi using the mobile app\n4. Complete voice calibration\n5. Start interacting!",
        order: 1
      }
    ]
  },
  {
    name: "SuperEmo Pro",
    variant: "EmoPro",
    description: "Professional-grade emotional intelligence for serious users",
    detailedDescription: "Designed for psychologists, researchers, HR professionals, and educators. Advanced analytics, multi-user support, and professional reporting capabilities.",
    price: 59999,
    discountPrice: 54999,
    features: [
      {
        title: "Advanced Emotion Analytics",
        description: "Identifies 20+ nuanced emotions with 95% accuracy using deep learning",
        icon: "bar-chart"
      },
      {
        title: "Multi-User Support",
        description: "Tracks up to 5 individual users with separate profiles and histories",
        icon: "users"
      },
      {
        title: "Professional Reports",
        description: "Generate detailed PDF/Excel reports with graphs and insights",
        icon: "file-text"
      },
      {
        title: "API Access",
        description: "REST API for integrating with your own applications and databases",
        icon: "code"
      }
    ],
    specifications: {
      processor: "Octa-core 2.4GHz + Neural Processing Unit",
      ram: "8GB LPDDR4X",
      storage: "256GB NVMe SSD + 1TB Cloud Storage",
      battery: "6000mAh Fast Charging (12-14 hours active use)",
      camera: "12MP Dual Camera System (Wide + Telephoto)",
      sensors: ["Advanced Emotion Sensor Array", "8-microphone Voice Array", "3D Motion Sensor", "Environmental Sensor Suite", "Biometric Sensors"],
      connectivity: ["Wi-Fi 6 (802.11ax)", "Bluetooth 5.2", "Ethernet Port", "USB 3.0", "HDMI Output"],
      dimensions: "25 × 18 × 12 cm",
      weight: "2.2 kg",
      warranty: "2 Years Premium Warranty with Express Replacement"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop&q=60",
        alt: "SuperEmo Pro - Professional Setup",
        isPrimary: true
      },
      {
        url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop&q=60",
        alt: "SuperEmo Pro - Analytics Dashboard"
      }
    ],
    stock: 25,
    tags: ["professional", "research", "analytics", "multi-user", "therapy", "education"],
    instructions: [
      {
        title: "Professional Setup",
        content: "Complete advanced calibration for clinical accuracy",
        order: 1
      }
    ]
  },
  {
    name: "SuperEmo Pro Plus",
    variant: "ProPlus",
    description: "Enterprise-grade AI emotional intelligence platform",
    detailedDescription: "For corporations, research institutions, hospitals, and large organizations. Features custom AI models, real-time analytics, enterprise security, and 24/7 support.",
    price: 99999,
    discountPrice: 89999,
    features: [
      {
        title: "AI-Powered Predictive Analysis",
        description: "Deep learning models predict emotional states and trends",
        icon: "cpu"
      },
      {
        title: "Real-time Analytics Dashboard",
        description: "Live dashboard with real-time emotional tracking and alerts",
        icon: "activity"
      },
      {
        title: "Enterprise Security",
        description: "Bank-grade encryption, GDPR/HIPAA compliance, audit logs",
        icon: "shield"
      },
      {
        title: "Custom AI Model Training",
        description: "Train your own emotion recognition models with your data",
        icon: "git-branch"
      }
    ],
    specifications: {
      processor: "Dual-core 3.2GHz + Dedicated AI Processor (16 TOPS)",
      ram: "16GB LPDDR5",
      storage: "1TB NVMe SSD + Unlimited Enterprise Cloud",
      battery: "8000mAh with Hot-swappable Battery System (16-20 hours)",
      camera: "16MP Triple Camera System (Wide + Telephoto + IR)",
      sensors: ["AI Emotion Sensor Array", "Biometric Sensor Suite", "3D Spatial Sensor", "Advanced Environmental Suite", "Multi-spectral Sensors"],
      connectivity: ["Wi-Fi 6E", "5G Ready", "Bluetooth 5.3", "Dual Ethernet 10G", "Thunderbolt 4", "SDI Output"],
      dimensions: "30 × 22 × 15 cm",
      weight: "3.5 kg",
      warranty: "3 Years All-inclusive with On-site Support"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop&q=60",
        alt: "SuperEmo Pro Plus - Enterprise Setup",
        isPrimary: true
      },
      {
        url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop&q=60",
        alt: "SuperEmo Pro Plus - AI Dashboard"
      }
    ],
    stock: 10,
    tags: ["enterprise", "flagship", "ai", "research", "corporate", "hospital", "university"],
    instructions: [
      {
        title: "Enterprise Deployment",
        content: "IT team setup, network integration, and security protocols",
        order: 1
      }
    ]
  }
];

async function seedDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    
    // Drop the products collection to remove old indexes
    console.log('🗑️ Dropping products collection...');
    await mongoose.connection.db.dropCollection('products');
    console.log('✅ Dropped products collection');
    
    // Recreate collection
    await mongoose.connection.db.createCollection('products');
    console.log('✅ Created new products collection');
    
    // Insert products one by one to avoid bulk error
    console.log('📦 Inserting products...');
    const insertedProducts = [];
    
    for (const productData of products) {
      console.log(`  → Adding: ${productData.name}...`);
      const product = new Product(productData);
      await product.save();
      insertedProducts.push(product);
      console.log(`    ✅ Added: ${product.name} (Slug: ${product.slug})`);
    }
    
    console.log(`\n✅ Successfully seeded ${insertedProducts.length} products!`);
    
    // Verify in database
    const count = await Product.countDocuments();
    console.log(`📊 Total products in database: ${count}`);
    
    // Display all products
    const allProducts = await Product.find({});
    console.log('\n📋 All Products in Database:');
    console.log('='.repeat(50));
    allProducts.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} (${p.variant})`);
      console.log(`   Slug: ${p.slug}`);
      console.log(`   Price: ₹${p.price}`);
      console.log(`   Stock: ${p.stock}`);
      console.log(`   Features: ${p.features.length}`);
      console.log(`   Images: ${p.images.length}`);
    });
    
    console.log('\n✅ Database seeding completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();