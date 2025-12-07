const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  nationalId: {
    type: String,
    required: [true, 'National ID is required'],
    unique: true,
    match: [/^\d+$/, 'National ID must be numeric'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  isCitizen: {
    type: Boolean,
    required: [true, 'Citizenship status is required'],
  },
  creditScore: {
    type: Number,
    default: 500,
    min: 0,
    max: 1000,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  totalLoansApplied: {
    type: Number,
    default: 0,
  },
  totalLoansApproved: {
    type: Number,
    default: 0,
  },
  loanLimit: {
    type: Number,
    default: 50000,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
}, {
  timestamps: true,
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ nationalId: 1 });
userSchema.index({ phone: 1 }, { unique: true, sparse: true });

const User = mongoose.model('User', userSchema);

// Drop the old phone index if it exists
User.collection.dropIndex('phone_1').then(() => {
  console.log('Dropped old phone index');
}).catch(err => {
  console.log('Old phone index not found or error:', err.message);
});

module.exports = User;
