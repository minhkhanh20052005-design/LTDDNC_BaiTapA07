const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { getCart, addToCart, removeFromCart } = require('../controllers/cartController');

// Tất cả các route này đều yêu cầu phải có Token (Đăng nhập rồi mới được dùng)
// 1. Lấy thông tin giỏ hàng hiện tại
router.get('/', verifyToken, getCart);
// 2. Thêm sản phẩm vào giỏ hàng
router.post('/add', verifyToken, addToCart);
// 3. Xóa sản phẩm khỏi giỏ hàng
router.delete('/remove/:productId', verifyToken, removeFromCart);

module.exports = router;