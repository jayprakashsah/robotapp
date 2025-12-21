// SupportTicketFixed.js - No middleware issues
const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  userId: String,
  name: String,
  email: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'technical'
  },
  priority: {
    type: String,
    default: 'medium'
  },
  status: {
    type: String,
    default: 'open'
  },
  robotIP: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// NO pre-save middleware at all
const SupportTicketFixed = mongoose.model('SupportTicketFixed', supportTicketSchema);

module.exports = SupportTicketFixed;