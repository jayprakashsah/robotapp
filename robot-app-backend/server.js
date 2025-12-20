require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const feedbackRoutes = require('./src/routes/feedbackRoutes');
const supportRoutes = require('./src/routes/supportRoutes');
const authRoutes = require('./src/routes/authRoutes');
const communityRoutes = require('./src/routes/communityRoutes');
const productRoutes = require('./src/routes/productRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const adminRoutes = require('./src/routes/adminRoutes');



const app = express();
const PORT = process.env.PORT || 5001;

// ✅ SIMPLE CORS Configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With', 'Cache-Control', 'x-request-id']
}));

app.use(express.json());
app.use('/api/community', communityRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);



// ✅ UPDATED MONGODB CONNECTION (without deprecated options)
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI is not defined in .env file');
      return false;
    }

    console.log('🔄 Connecting to MongoDB...');
    
    // Simple connection without deprecated options
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log(`✅ MongoDB Connected`);
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
    return true;
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    return false;
  }
};

// Connect to database and start server
const startServer = async () => {
  const dbConnected = await connectDB();
  
  if (!dbConnected) {
    console.log('\n⚠️  Starting server WITHOUT database...');
  } else {
    console.log('✅ Database ready');
  }

  // Request logging
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url} - Origin: ${req.headers.origin || 'none'}`);
    next();
  });

  // Routes
  app.use('/api/feedback', feedbackRoutes);
  app.use('/api/support', supportRoutes);
  app.use('/api/auth', authRoutes);

  // Health endpoints
  app.get('/', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    res.json({ 
      message: 'Robot App Backend is running!',
      status: 'running',
      database: dbStatus,
      timestamp: new Date().toISOString()
    });
  });

  // In server.js, update the health endpoint:
app.get('/api/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    res.json({ 
        status: 'running',
        timestamp: new Date().toISOString(),
        database: dbStatus,
        version: '1.0.0',
        mongooseState: mongoose.connection.readyState,
        dbName: mongoose.connection.name
    });
});



// Add this to server.js before routes
app.get('/api/test-db-connection', async (req, res) => {
    try {
        const state = mongoose.connection.readyState;
        let stateName = '';
        
        switch(state) {
            case 0: stateName = 'disconnected'; break;
            case 1: stateName = 'connected'; break;
            case 2: stateName = 'connecting'; break;
            case 3: stateName = 'disconnecting'; break;
            default: stateName = 'unknown';
        }
        
        // Try to access database
        const dbName = mongoose.connection.db?.databaseName || 'unknown';
        const collections = await mongoose.connection.db?.listCollections().toArray() || [];
        
        res.json({
            success: true,
            database: {
                state: state,
                stateName: stateName,
                name: dbName,
                collections: collections.map(c => c.name),
                collectionsCount: collections.length
            },
            mongooseVersion: mongoose.version,
            connectionString: process.env.MONGODB_URI ? 'Set (hidden)' : 'Not set'
        });
    } catch (error) {
        res.json({
            success: false,
            error: error.message,
            mongooseState: mongoose.connection.readyState
        });
    }
});

  // Simple test endpoint
  app.get('/api/test', (req, res) => {
    res.json({ 
      message: 'Test endpoint working',
      timestamp: new Date().toISOString()
    });
  });

  // Error handling
  app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Cannot ${req.method} ${req.url}`
    });
  });

  // Start server
  app.listen(PORT, () => {
    console.log(`\n🚀 Backend server running on: http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔗 Database: ${mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected'}`);
    console.log(`🌐 CORS enabled for: http://localhost:5173, http://localhost:3000`);
  });
};

startServer();