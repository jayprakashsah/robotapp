// /Users/prakashsah/Desktop/Robot-app/robot-app-backend/simpleSeed.js
const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

const products = [
  {
    name: "SuperEmo Basic",
    variant: "Emo",
    description: "Your entry to emotional intelligence robotics",
    price: 27999,
    discountPrice: 24999,
    stock: 25,
    isActive: true,
    createdAt: new Date()
  },
  {
    name: "SuperEmo Pro",
    variant: "EmoPro",
    description: "Professional-grade emotional intelligence for serious users",
    price: 59999,
    discountPrice: 54999,
    stock: 12,
    isActive: true,
    createdAt: new Date()
  },
  {
    name: "SuperEmo Pro Plus",
    variant: "ProPlus",
    description: "Enterprise-grade AI emotional intelligence platform",
    price: 99999,
    discountPrice: 89999,
    stock: 8,
    isActive: true,
    createdAt: new Date()
  }
];

async function run() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const database = client.db();
    const collection = database.collection('products');
    
    // Delete existing
    await collection.deleteMany({});
    console.log('🗑️ Cleared existing products');
    
    // Insert new
    const result = await collection.insertMany(products);
    console.log(`✅ Inserted ${result.insertedCount} products`);
    
    // Verify
    const count = await collection.countDocuments();
    console.log(`📊 Total products: ${count}`);
    
    const allProducts = await collection.find({}).toArray();
    console.log('\n📋 Products in database:');
    allProducts.forEach(p => {
      console.log(`- ${p.name} (${p.variant}): ₹${p.price} | Stock: ${p.stock}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    process.exit(0);
  }
}

run();