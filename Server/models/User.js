const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  avatar: { type: String, default: 'https://i.imgur.com/6VBx3io.png' }, // Ảnh mặc định
  role: { type: String, default: 'user' }, // Phân quyền admin/user
  isVerified: { type: Boolean, default: false }, // Trạng thái xác thực OTP
  otp: { type: String }, 
  otpExpires: { type: Date },
  points:     { type: Number, default: 0 }
});

module.exports = mongoose.model('User', UserSchema);