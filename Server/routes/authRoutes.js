const express = require('express');
const router = express.Router();
const { 
  register, verifyOTP, login, 
  forgotPassword, verifyForgotOTP, resetPassword, 
  getProfile, updateProfile 
} = require('../controllers/authController');

const { validateRegister, validateLogin } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimit');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/register', authLimiter, validateRegister, register);
router.post('/verify-otp', authLimiter, verifyOTP);
router.post('/login', authLimiter, validateLogin, login);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/verify-forgot-otp', authLimiter, verifyForgotOTP);
router.post('/reset-password', authLimiter, resetPassword);
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

module.exports = router;