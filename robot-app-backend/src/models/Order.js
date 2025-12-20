// robot-app-backend/src/models/Order.js - FIXED WITH WALLET
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  productName: String,
  variant: String,
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  price: Number,
  total: Number
});

const addressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  addressLine1: {
    type: String,
    required: [true, 'Address line 1 is required'],
    trim: true
  },
  addressLine2: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  postalCode: {
    type: String,
    required: [true, 'Postal code is required']
  },
  country: {
    type: String,
    default: 'India'
  },
  landmark: String,
  type: {
    type: String,
    enum: ['home', 'office', 'other'],
    default: 'home'
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  items: [orderItemSchema],
  shippingAddress: addressSchema,
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'upi', 'net_banking', 'cod', 'wallet'], // ✅ ADDED WALLET
    default: 'cod'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  subtotal: Number,
  shippingCharge: {
    type: Number,
    default: 0
  },
  tax: Number,
  discount: {
    type: Number,
    default: 0
  },
  totalAmount: Number,
  notes: String,
  giftWrap: {
    type: Boolean,
    default: false
  },
  giftMessage: String,
  shippingSpeed: {
    type: String,
    enum: ['standard', 'express', 'next_day'],
    default: 'standard'
  },
  trackingNumber: String,
  estimatedDelivery: Date,
  transactionId: String,
  paymentDetails: {
    upiId: String,
    cardLastFour: String,
    bankName: String
  },
  deliveredAt: Date,
  cancelledAt: Date
}, {
  timestamps: true
});

// ✅ NO PRE-SAVE HOOKS to avoid "next is not a function"
module.exports = mongoose.model('Order', orderSchema);