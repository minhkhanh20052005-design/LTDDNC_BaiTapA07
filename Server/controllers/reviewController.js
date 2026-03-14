const Review  = require('../models/Review');
const Order   = require('../models/Order');
const User    = require('../models/User');

const POINTS_PER_REVIEW = 10; // Số điểm tặng mỗi lần đánh giá

// 1. Gửi đánh giá
exports.createReview = async (req, res) => {
  try {
    const { productId, orderId, rating, comment } = req.body;
    const userId = req.user.user.id;

    // Kiểm tra đơn hàng có tồn tại và đã giao thành công chưa (status = 4)
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    if (order.status !== 4) return res.status(400).json({ message: 'Chỉ đánh giá được đơn hàng đã giao thành công' });

    // Kiểm tra sản phẩm có trong đơn hàng không
    const itemInOrder = order.items.find(
      item => item.product && item.product.toString() === productId
    );
    if (!itemInOrder) return res.status(400).json({ message: 'Sản phẩm không có trong đơn hàng này' });

    // Kiểm tra đã đánh giá sản phẩm này trong đơn này chưa
    const existed = await Review.findOne({ userId, productId, orderId });
    if (existed) return res.status(400).json({ message: 'Bạn đã đánh giá sản phẩm này rồi' });

    // Tạo đánh giá
    const review = new Review({ userId, productId, orderId, rating, comment, pointsEarned: POINTS_PER_REVIEW });
    await review.save();

    // Cộng điểm cho user
    await User.findByIdAndUpdate(userId, { $inc: { points: POINTS_PER_REVIEW } });

    res.json({ message: `Đánh giá thành công! Bạn nhận được ${POINTS_PER_REVIEW} điểm tích lũy`, review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// 2. Lấy danh sách đánh giá của 1 sản phẩm
exports.getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId })
      .populate('userId', 'name avatar') // Lấy tên + avatar người đánh giá
      .sort({ createdAt: -1 });

    // Tính điểm trung bình
    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    res.json({ avgRating, totalReviews: reviews.length, reviews });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// 3. Kiểm tra user đã đánh giá sản phẩm trong đơn này chưa
exports.checkReviewed = async (req, res) => {
  try {
    const { productId, orderId } = req.params;
    const userId = req.user.user.id;
    const existed = await Review.findOne({ userId, productId, orderId });
    res.json({ reviewed: !!existed });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};