const express = require('express');
const {
  getProfile,
  checkEligibility,
  getLoanHistory,
  getNotifications,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/user/profile
router.get('/profile', getProfile);

// @route   GET /api/user/eligibility
router.get('/eligibility', checkEligibility);

// @route   GET /api/user/loans
router.get('/loans', getLoanHistory);

// @route   GET /api/user/notifications
router.get('/notifications', getNotifications);

module.exports = router;
