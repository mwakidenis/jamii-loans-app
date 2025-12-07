const mongoose = require('mongoose');

const connectDB = async () => {
  console.log('Attempting to connect to MongoDB...');
  console.log('MONGO_URI:', process.env.MONGO_URI);
  try {
    console.log('Full MONGO_URI:', process.env.MONGO_URI);
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
    process.exit(1);
  }
};

module.exports = connectDB;
