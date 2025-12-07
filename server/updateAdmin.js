const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const updateAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Hash a new password, e.g., 'password123'
    const newPassword = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const result = await User.updateOne(
      { email: 'admin@jamii.com' },
      {
        role: 'admin',
        creditScore: 1000,
        loanLimit: 1000000,
        password: hashedPassword
      }
    );

    if (result.modifiedCount > 0) {
      console.log('Admin user updated successfully with new password');
    } else {
      console.log('No user found or already updated');
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error updating admin:', error);
  }
};

updateAdmin();
