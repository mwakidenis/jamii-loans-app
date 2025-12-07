const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - require authentication
const protect = async (req, res, next) => {
  let token;

  console.log('Auth Middleware - Protect: Checking authentication for path:', req.path);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log('Auth Middleware - Protect: Token found:', token.substring(0, 20) + '...');

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Auth Middleware - Protect: Token decoded, user ID:', decoded.id);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');
      console.log('Auth Middleware - Protect: User fetched:', req.user ? req.user.email : 'null', 'Role:', req.user ? req.user.role : 'null');

      next();
    } catch (error) {
      console.error('Auth Middleware - Protect: Token verification failed:', error.message);
      res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
      });
    }
  }

  if (!token) {
    console.log('Auth Middleware - Protect: No token provided');
    res.status(401).json({
      success: false,
      message: 'Not authorized, no token',
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('Auth Middleware - Authorize: Required roles:', roles);
    console.log('Auth Middleware - Authorize: User role:', req.user ? req.user.role : 'null');
    if (!roles.includes(req.user.role)) {
      console.log('Auth Middleware - Authorize: Access denied for role:', req.user.role);
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    console.log('Auth Middleware - Authorize: Access granted');
    next();
  };
};

module.exports = { protect, authorize };
