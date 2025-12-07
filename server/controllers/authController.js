const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendWelcomeEmail } = require('../utils/email');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    console.log('Registration attempt:', { fullName: req.body.fullName, email: req.body.email, nationalId: req.body.nationalId });
    const { fullName, email, nationalId, password, isCitizen } = req.body;

    // Check if user exists
    const userExists = await User.findOne({
      $or: [{ email }, { nationalId }],
    });

    if (userExists) {
      console.log('User already exists:', userExists.email, userExists.nationalId);
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or national ID',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('Creating user with data:', {
      fullName,
      email,
      nationalId,
      isCitizen,
      hashedPassword: hashedPassword ? 'hashed' : 'null'
    });

    // Create user - check if admin email
    const isAdmin = email === 'admin@jamii.com' || email === 'newadmin@jamii.com';
    const user = await User.create({
      fullName,
      email,
      nationalId,
      password: hashedPassword,
      isCitizen,
      role: isAdmin ? 'admin' : 'user',
      creditScore: isAdmin ? 1000 : 500,
      loanLimit: isAdmin ? 1000000 : 50000,
      phone: null,
    });

    console.log('User created successfully:', user._id);

    if (user) {
      // Send welcome email asynchronously (don't wait for it to complete)
      sendWelcomeEmail(user).catch(emailError => {
        console.error('Failed to send welcome email:', emailError);
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          nationalId: user.nationalId,
          isCitizen: user.isCitizen,
          creditScore: user.creditScore,
          role: user.role,
          loanLimit: user.loanLimit,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid user data',
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    console.log('Login attempt for email:', req.body.email);
    const { email, password } = req.body;

    console.log('Attempting to find user in DB for email:', email);
    // Check for user email
    const user = await User.findOne({ email }).select('+password');
    console.log('User found:', user ? user._id : 'null');

    if (user && (await bcrypt.compare(password, user.password))) {
      console.log('Password match successful for user:', user._id);
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          nationalId: user.nationalId,
          isCitizen: user.isCitizen,
          creditScore: user.creditScore,
          role: user.role,
          loanLimit: user.loanLimit,
          token: generateToken(user._id),
        },
      });
    } else {
      console.log('Login failed: invalid credentials for email:', email);
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
};
