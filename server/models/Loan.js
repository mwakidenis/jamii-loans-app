const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  amount: {
    type: Number,
    required: [true, 'Loan amount is required'],
    min: [1000, 'Minimum loan amount is 1000'],
    max: [500000, 'Maximum loan amount is 500000'],
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'paid', 'defaulted'],
    default: 'pending',
  },
  feePaid: {
    type: Boolean,
    default: false,
  },
  feeAmount: {
    type: Number,
    default: 0,
  },
  mpesaTransactionId: {
    type: String,
    default: null,
  },
  isAutoApproved: {
    type: Boolean,
    default: false,
  },
  autoApprovedAt: {
    type: Date,
    default: null,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  approvalDate: {
    type: Date,
    default: null,
  },
  rejectionReason: {
    type: String,
    default: null,
  },
  disbursementStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  disbursementTransactionId: {
    type: String,
    default: null,
  },
  disbursedAt: {
    type: Date,
    default: null,
  },
  description: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Index for better query performance
loanSchema.index({ userId: 1, status: 1 });
loanSchema.index({ status: 1 });

module.exports = mongoose.model('Loan', loanSchema);
