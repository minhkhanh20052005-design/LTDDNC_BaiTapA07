const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Thay 'mongodb://localhost:27017/ShoppingApp' bằng connection string của bạn nếu dùng Atlas
    await mongoose.connect('mongodb://localhost:27017/ShoppingApp');
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};
module.exports = connectDB;