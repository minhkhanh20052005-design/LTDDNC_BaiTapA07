const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { createOrder, getMyOrders, cancelOrder, seedDemoOrders } = require('../controllers/orderController');

router.post('/', verifyToken, createOrder);
router.get('/', verifyToken, getMyOrders);
router.put('/cancel/:orderId', verifyToken, cancelOrder);
router.post('/seed', verifyToken, seedDemoOrders);

module.exports = router;