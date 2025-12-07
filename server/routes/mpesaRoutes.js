const express = require('express');
const Transaction = require('../models/Transaction');
const Loan = require('../models/Loan');
const { handleMpesaCallback } = require('../utils/mpesa');

const router = express.Router();

// @desc    Handle M-PESA callback
// @route   POST /api/mpesa/callback
// @access  Public (called by M-PESA)
const mpesaCallback = async (req, res) => {
  try {
    const callbackData = req.body;

    console.log('M-PESA Callback received:', JSON.stringify(callbackData, null, 2));

    const result = handleMpesaCallback(callbackData);

    if (result.success) {
      // Find transaction by CheckoutRequestID
      const transaction = await Transaction.findOne({
        'mpesaResponse.checkoutRequestID': result.checkoutRequestID,
      });

      if (transaction) {
        // Update transaction status
        transaction.status = 'success';
        transaction.mpesaResponse = {
          ...transaction.mpesaResponse,
          ...result,
        };
        await transaction.save();

        // Update loan fee status
        const loan = await Loan.findById(transaction.loanId);
        if (loan) {
          loan.feePaid = true;
          await loan.save();
        }

        console.log('Payment processed successfully for loan:', loan._id);
      }
    } else {
      // Find transaction and update status to failed
      const transaction = await Transaction.findOne({
        'mpesaResponse.checkoutRequestID': result.checkoutRequestID,
      });

      if (transaction) {
        transaction.status = 'failed';
        transaction.mpesaResponse = {
          ...transaction.mpesaResponse,
          ...result,
        };
        await transaction.save();

        console.log('Payment failed for transaction:', transaction._id);
      }
    }

    // Always respond with success to M-PESA
    res.json({ success: true });
  } catch (error) {
    console.error('Error processing M-PESA callback:', error);
    // Still respond with success to avoid retries
    res.json({ success: true });
  }
};

router.post('/callback', mpesaCallback);

module.exports = router;
