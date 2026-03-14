const rateLimit = require('express-rate-limit');

// Chống Spam OTP/Login (Lớp 2: Rate Limiting)
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 10, // Tối đa 10 request mỗi IP
  message: { message: "Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút" }
});