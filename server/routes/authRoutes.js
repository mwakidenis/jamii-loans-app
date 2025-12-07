const express = require('express');
const { register, login } = require('../controllers/authController');
const { validateRegister } = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/auth/register
router.post('/register', validateRegister, register);

// @route   POST /api/auth/login
router.post('/login', login);

module.exports = router;
