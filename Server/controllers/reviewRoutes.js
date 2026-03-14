const express = require('express');
const router  = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { createReview, getReviewsByProduct, checkReviewed } = require('../controllers/reviewController');

router.post('/',                                        verifyToken, createReview);
router.get('/product/:productId',                       getReviewsByProduct);
router.get('/check/:productId/:orderId',                verifyToken, checkReviewed);

module.exports = router;