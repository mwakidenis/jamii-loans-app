const Loan = require('../models/Loan');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const { initiateB2CDisbursement } = require('../utils/mpesa');
const { sendLoanApprovalEmail, sendLoanRejectionEmail, sendLoanDisbursementEmail } = require('../utils/email');

// @desc    Get all loans with filter
// @route   GET /api/admin/loans
// @access  Private/Admin
const getAllLoans = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let filter = {};
    if (status) {
      filter.status = status;
    }

    const loans = await Loan.find(filter)
      .populate('userId', 'fullName email nationalId')
      .populate('approvedBy', 'fullName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Loan.countDocuments(filter);

    res.json({
      success: true,
      data: loans,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve loan
// @route   PATCH /api/admin/loan/:id/approve
// @access  Private/Admin
const approveLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id).populate('userId');

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found',
      });
    }

    if (loan.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Loan is not in pending status',
      });
    }

    // Check if fee is paid - temporarily bypass for testing
    // if (!loan.feePaid) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Loan fee must be paid before approval',
    //   });
    // }

    // Update loan status
    loan.status = 'approved';
    loan.approvedBy = req.user._id;
    loan.approvalDate = new Date();
    await loan.save();

    // Update user credit score and approved loans count
    const user = loan.userId;
    user.creditScore = Math.min(user.creditScore + 50, 1000); // Increase by 50, max 1000
    user.totalLoansApproved += 1;
    await user.save();

    // Send approval email asynchronously
    sendLoanApprovalEmail(user, loan).catch(emailError => {
      console.error('Failed to send loan approval email:', emailError);
    });

    res.json({
      success: true,
      message: 'Loan approved successfully',
      data: loan,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject loan
// @route   PATCH /api/admin/loan/:id/reject
// @access  Private/Admin
const rejectLoan = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required',
      });
    }

    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found',
      });
    }

    if (loan.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Loan is not in pending status',
      });
    }

    // Update loan status
    loan.status = 'rejected';
    loan.rejectionReason = rejectionReason;
    await loan.save();

    // Send rejection email asynchronously
    const user = await User.findById(loan.userId);
    if (user) {
      sendLoanRejectionEmail(user, loan).catch(emailError => {
        console.error('Failed to send loan rejection email:', emailError);
      });
    }

    res.json({
      success: true,
      message: 'Loan rejected successfully',
      data: loan,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Auto-approve loan based on criteria
// @route   PATCH /api/admin/loan/:id/auto-approve
// @access  Private/Admin
const autoApproveLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id).populate('userId');

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found',
      });
    }

    if (loan.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Loan is not in pending status',
      });
    }

    // Auto-approval criteria
    const user = loan.userId;
    const hasPaidFee = loan.feePaid;
    const hasValidId = user.isCitizen && user.nationalId;
    const hasGoodCredit = user.creditScore >= 600;
    const hasNoPendingLoans = await Loan.countDocuments({
      userId: user._id,
      status: 'pending'
    }) === 1; // Only this loan should be pending

    if (!hasPaidFee || !hasValidId || !hasGoodCredit || !hasNoPendingLoans) {
      return res.status(400).json({
        success: false,
        message: 'Loan does not meet auto-approval criteria',
        criteria: {
          feePaid: hasPaidFee,
          validId: hasValidId,
          goodCredit: hasGoodCredit,
          noPendingLoans: hasNoPendingLoans,
        },
      });
    }

    // Auto-approve the loan
    loan.status = 'approved';
    loan.isAutoApproved = true;
    loan.autoApprovedAt = new Date();
    await loan.save();

    // Update user credit score
    user.creditScore = Math.min(user.creditScore + 25, 1000); // Smaller increase for auto-approval
    user.totalLoansApproved += 1;
    await user.save();

    // Send notification
    await Notification.create({
      userId: user._id,
      loanId: loan._id,
      type: 'loan_approved',
      title: 'Loan Auto-Approved',
      message: `Your loan of KSh ${loan.amount.toLocaleString()} has been automatically approved. Funds will be disbursed shortly.`,
      metadata: {
        amount: loan.amount,
        autoApproved: true,
      },
    });

    res.json({
      success: true,
      message: 'Loan auto-approved successfully',
      data: loan,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get loan queue for real-time updates
// @route   GET /api/admin/loan-queue
// @access  Private/Admin
const getLoanQueue = async (req, res, next) => {
  try {
    const loans = await Loan.find({ status: 'pending' })
      .populate('userId', 'fullName email nationalId creditScore')
      .sort({ createdAt: 1 }) // FIFO order
      .limit(50); // Limit to prevent overload

    res.json({
      success: true,
      data: loans,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Initiate loan disbursement
// @route   POST /api/admin/loan/:id/disbursement
// @access  Private/Admin
const initiateLoanDisbursement = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id).populate('userId');

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found',
      });
    }

    if (loan.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Loan must be approved before disbursement',
      });
    }

    if (loan.disbursementStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Disbursement already initiated or completed',
      });
    }

    // Update disbursement status
    loan.disbursementStatus = 'processing';
    await loan.save();

    // Initiate M-PESA B2C disbursement
    try {
      const disbursementResult = await initiateB2CDisbursement(
        loan.userId.nationalId, // Using nationalId as phone number for demo
        loan.amount,
        loan._id
      );

      loan.disbursementTransactionId = disbursementResult.transactionId;
      await loan.save();

      // Send notification
      await Notification.create({
        userId: loan.userId._id,
        loanId: loan._id,
        type: 'loan_disbursed',
        title: 'Loan Disbursed',
        message: `Your loan of KSh ${loan.amount.toLocaleString()} has been disbursed to your M-PESA account.`,
        metadata: {
          amount: loan.amount,
          transactionId: disbursementResult.transactionId,
        },
      });

      // Send disbursement email asynchronously
      sendLoanDisbursementEmail(loan.userId, loan).catch(emailError => {
        console.error('Failed to send loan disbursement email:', emailError);
      });

      res.json({
        success: true,
        message: 'Loan disbursement initiated successfully',
        data: {
          loan,
          transactionId: disbursementResult.transactionId,
        },
      });
    } catch (disbursementError) {
      // Revert status on failure
      loan.disbursementStatus = 'failed';
      await loan.save();

      throw disbursementError;
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalLoans,
      pendingLoans,
      approvedLoans,
      rejectedLoans,
      totalUsers,
      activeUsers,
      totalDisbursed,
      recentLoans,
    ] = await Promise.all([
      Loan.countDocuments(),
      Loan.countDocuments({ status: 'pending' }),
      Loan.countDocuments({ status: 'approved' }),
      Loan.countDocuments({ status: 'rejected' }),
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Loan.aggregate([
        { $match: { status: 'approved', disbursementStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Loan.find({ status: 'pending' })
        .populate('userId', 'fullName')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const disbursedAmount = totalDisbursed.length > 0 ? totalDisbursed[0].total : 0;

    res.json({
      success: true,
      data: {
        loans: {
          total: totalLoans,
          pending: pendingLoans,
          approved: approvedLoans,
          rejected: rejectedLoans,
        },
        users: {
          total: totalUsers,
          active: activeUsers,
        },
        disbursements: {
          totalAmount: disbursedAmount,
        },
        recentPendingLoans: recentLoans,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send approval notification
// @route   POST /api/admin/loan/:id/notify-approval
// @access  Private/Admin
const sendApprovalNotification = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id).populate('userId');

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found',
      });
    }

    if (loan.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Loan must be approved to send notification',
      });
    }

    // Check if notification already exists
    const existingNotification = await Notification.findOne({
      userId: loan.userId._id,
      loanId: loan._id,
      type: 'loan_approved',
    });

    if (existingNotification) {
      return res.status(400).json({
        success: false,
        message: 'Approval notification already sent',
      });
    }

    // Send notification
    const notification = await Notification.create({
      userId: loan.userId._id,
      loanId: loan._id,
      type: 'loan_approved',
      title: 'Loan Approved',
      message: `Congratulations! Your loan application for KSh ${loan.amount.toLocaleString()} has been approved. ${loan.isAutoApproved ? 'This was automatically approved based on your eligibility.' : 'Please wait for disbursement.'}`,
      metadata: {
        amount: loan.amount,
        autoApproved: loan.isAutoApproved,
      },
    });

    res.json({
      success: true,
      message: 'Approval notification sent successfully',
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllLoans,
  approveLoan,
  rejectLoan,
  autoApproveLoan,
  getLoanQueue,
  initiateLoanDisbursement,
  getAdminStats,
  sendApprovalNotification,
};
