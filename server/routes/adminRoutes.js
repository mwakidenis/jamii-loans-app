const express = require('express');
const {
  getAllLoans,
  approveLoan,
  rejectLoan,
  autoApproveLoan,
  getLoanQueue,
  initiateLoanDisbursement,
  getAdminStats,
  sendApprovalNotification,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/loans
router.get('/loans', getAllLoans);

// @route   PATCH /api/admin/loan/:id/approve
router.patch('/loan/:id/approve', approveLoan);

// @route   PATCH /api/admin/loan/:id/reject
router.patch('/loan/:id/reject', rejectLoan);

// @route   PATCH /api/admin/loan/:id/auto-approve
router.patch('/loan/:id/auto-approve', autoApproveLoan);

// @route   GET /api/admin/loan-queue
router.get('/loan-queue', getLoanQueue);

// @route   POST /api/admin/loan/:id/disbursement
router.post('/loan/:id/disbursement', initiateLoanDisbursement);

// @route   GET /api/admin/stats
router.get('/stats', getAdminStats);

// @route   POST /api/admin/loan/:id/notify-approval
router.post('/loan/:id/notify-approval', sendApprovalNotification);

module.exports = router;
