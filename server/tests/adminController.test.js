const mongoose = require('mongoose');
const User = require('../models/User');
const Loan = require('../models/Loan');
const Notification = require('../models/Notification');
const { autoApproveLoan, getLoanQueue, getAdminStats } = require('../controllers/adminController');

require('dotenv').config({ path: '.env.test' });

describe('Admin Controller Tests', () => {
  let testUser;
  let testLoan;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGO_URI);

    // Create test user
    testUser = await User.create({
      fullName: 'Test User',
      email: 'user@test.com',
      password: 'password123',
      role: 'user',
      isCitizen: true,
      nationalId: '87654321',
      creditScore: 700,
    });

    // Create test loan
    testLoan = await Loan.create({
      userId: testUser._id,
      amount: 50000,
      status: 'pending',
      feePaid: true,
      feeAmount: 500,
    });
  }, 10000);

  afterAll(async () => {
    // Clean up
    await User.deleteMany({});
    await Loan.deleteMany({});
    await Notification.deleteMany({});
    await mongoose.connection.close();
  });

  describe('Auto-approve loan', () => {
    it('should auto-approve loan with valid criteria', async () => {
      // Mock request and response objects
      const req = {
        params: { id: testLoan._id },
        user: { _id: 'admin-id' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await autoApproveLoan(req, res, jest.fn());

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: expect.stringContaining('auto-approved')
        })
      );

      // Verify loan status
      const updatedLoan = await Loan.findById(testLoan._id);
      expect(updatedLoan.status).toBe('approved');
      expect(updatedLoan.isAutoApproved).toBe(true);

      // Verify notification created
      const notification = await Notification.findOne({
        userId: testUser._id,
        type: 'loan_approved'
      });
      expect(notification).toBeTruthy();
      expect(notification.title).toBe('Loan Auto-Approved');
    });

    it('should reject auto-approval if criteria not met', async () => {
      // Create loan with unpaid fee
      const badLoan = await Loan.create({
        userId: testUser._id,
        amount: 50000,
        status: 'pending',
        feePaid: false,
      });

      const req = {
        params: { id: badLoan._id },
        user: { _id: 'admin-id' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await autoApproveLoan(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('does not meet auto-approval criteria')
        })
      );
    });
  });

  describe('Get loan queue', () => {
    it('should return pending loans for queue', async () => {
      const req = {};
      const res = {
        json: jest.fn()
      };

      await getLoanQueue(req, res, jest.fn());

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.any(Array)
        })
      );
    });
  });

  describe('Get admin stats', () => {
    it('should return admin dashboard statistics', async () => {
      const req = {};
      const res = {
        json: jest.fn()
      };

      await getAdminStats(req, res, jest.fn());

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            loans: expect.any(Object),
            users: expect.any(Object),
            disbursements: expect.any(Object)
          })
        })
      );
    });
  });
});
