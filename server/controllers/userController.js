const User = require('../models/User');
const Loan = require('../models/Loan');
const Notification = require('../models/Notification');

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        nationalId: user.nationalId,
        isCitizen: user.isCitizen,
        creditScore: user.creditScore,
        role: user.role,
        totalLoansApplied: user.totalLoansApplied,
        totalLoansApproved: user.totalLoansApproved,
        loanLimit: user.loanLimit,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check loan eligibility
// @route   GET /api/user/eligibility
// @access  Private
// @desc    Check loan eligibility
// @route   GET /api/user/eligibility
// @access  Private
const checkEligibility = async (req, res, next) => {
  try {
    console.log('Checking eligibility for user:', req.user._id);
    const user = await User.findById(req.user._id);
    console.log('User found:', user ? user.fullName : 'null');

    // Check if user is Kenyan citizen
    if (!user.isCitizen) {
      return res.json({
        success: true,
        data: {
          eligible: false,
          reason: 'Only Kenyan citizens are eligible for loans',
          creditScore: user.creditScore,
          maxAmount: 0,
        },
      });
    }

    // Check for pending or approved loans
    const activeLoans = await Loan.find({
      userId: user._id,
      status: { $in: ['pending', 'approved'] },
    });

    if (activeLoans.length > 0) {
      return res.json({
        success: true,
        data: {
          eligible: false,
          reason: 'You have pending or approved loans. Please settle them first.',
          creditScore: user.creditScore,
          maxAmount: 0,
        },
      });
    }

    // Calculate max amount based on credit score
    let maxAmount = user.loanLimit;

    if (user.creditScore < 300) {
      maxAmount = Math.min(maxAmount, 10000);
    } else if (user.creditScore < 500) {
      maxAmount = Math.min(maxAmount, 25000);
    } else if (user.creditScore < 700) {
      maxAmount = Math.min(maxAmount, 50000);
    } else if (user.totalLoansApplied === 0) {
      // New users get up to 30,000 KSh
      maxAmount = Math.min(maxAmount, 30000);
    }
    // For credit score >= 700 and existing users, use full loan limit

    res.json({
      success: true,
      data: {
        eligible: true,
        creditScore: user.creditScore,
        maxAmount,
        loanLimit: user.loanLimit,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get loan history
// @route   GET /api/user/loans
// @access  Private
const getLoanHistory = async (req, res, next) => {
  try {
    const loans = await Loan.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('approvedBy', 'fullName');

    res.json({
      success: true,
      data: loans,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user notifications
// @route   GET /api/user/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('loanId', 'amount status');

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  checkEligibility,
  getLoanHistory,
  getNotifications,
};
