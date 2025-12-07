const validateRegister = (req, res, next) => {
  const { fullName, email, nationalId, password, isCitizen } = req.body;

  const errors = [];

  // Validate fullName
  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    errors.push('Full name must be at least 2 characters long');
  }

  // Validate email
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('Please provide a valid email address');
  }

  // Validate nationalId
  const nationalIdRegex = /^\d+$/;
  if (!nationalId || !nationalIdRegex.test(nationalId) || nationalId.length !== 8) {
    errors.push('National ID must be exactly 8 digits');
  }

  // Validate password
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  // Validate isCitizen
  if (typeof isCitizen !== 'boolean') {
    errors.push('Citizenship status must be specified');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

const validateLoanApplication = (req, res, next) => {
  const { amount, phoneNumber, description } = req.body;

  const errors = [];

  // Validate amount
  if (!amount || typeof amount !== 'number' || amount < 1000 || amount > 500000) {
    errors.push('Loan amount must be between 1000 and 500000');
  }

  // Validate phone number (Kenyan format: 254xxxxxxxxx)
  const phoneRegex = /^254\d{9}$/;
  if (!phoneNumber || !phoneRegex.test(phoneNumber)) {
    errors.push('Phone number must be in format 254xxxxxxxxx');
  }

  // Validate description (optional but if provided, not empty)
  if (description && typeof description !== 'string') {
    errors.push('Description must be a string');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

module.exports = { validateRegister, validateLoanApplication };
