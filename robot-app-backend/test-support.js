// debug-test.js - SUPER SIMPLE
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// 1. First test without MongoDB
app.post('/test1', (req, res) => {
  console.log('Test 1 - No mongoose');
  res.json({ success: true, message: 'Test 1 works' });
});

// 2. Test with mongoose but no model
mongoose.connect('mongodb://localhost:27017/sentientlabs')
  .then(() => {
    console.log('Mongoose connected');
    
    app.post('/test2', (req, res) => {
      console.log('Test 2 - With mongoose');
      res.json({ success: true, message: 'Test 2 works' });
    });
  })
  .catch(err => console.error('MongoDB error:', err));

// 3. Test with SIMPLE model
const simpleSchema = new mongoose.Schema({
  name: String,
  email: String
});
const SimpleModel = mongoose.model('SimpleTest', simpleSchema);

app.post('/test3', async (req, res) => {
  try {
    console.log('Test 3 - Simple model');
    const doc = new SimpleModel({ name: 'Test', email: 'test@test.com' });
    const saved = await doc.save();
    res.json({ success: true, id: saved._id });
  } catch (error) {
    console.error('Test 3 error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(5003, () => console.log('Debug server on port 5003'));