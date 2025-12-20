const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: false,
    default: 'anonymous'
  },
  name: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: true,
    match: [/.+\@.+\..+/, 'Please enter a valid email']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    enum: ['technical', 'billing', 'feature-request', 'bug', 'other'],
    default: 'technical'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  robotIP: {
    type: String,
    required: false
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: Date
  }],
  comments: [{
    userId: String,
    userName: String,
    message: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  resolutionNotes: {
    type: String,
    maxlength: [500, 'Resolution notes cannot exceed 500 characters']
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
supportTicketSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // If status changed to resolved, set resolvedAt
  if (this.isModified('status') && this.status === 'resolved') {
    this.resolvedAt = Date.now();
  }
  
  next();
});

module.exports = mongoose.model('SupportTicket', supportTicketSchema);