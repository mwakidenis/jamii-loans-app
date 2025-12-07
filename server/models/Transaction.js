const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  loanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan',
    required: [true, 'Loan ID is required'],
  },
  amount: {
    type: Number,
    required: [true, 'Transaction amount is required'],
  },
  mpesaResponse: {
    merchantRequestID: String,
    checkoutRequestID: String,
    responseCode: String,
    responseDescription: String,
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
  },
}, {
  timestamps: true,
});

// Index for better query performance
transactionSchema.index({ userId: 1 });
transactionSchema.index({ loanId: 1 });
transactionSchema.index({ status: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
