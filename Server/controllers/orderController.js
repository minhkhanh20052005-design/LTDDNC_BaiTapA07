const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');

// 1. TẠO ĐƠN HÀNG
exports.createOrder = async (req, res) => {
  try {
    const { address, phone, paymentMethod, items, totalPrice, name, pointsUsed } = req.body;
    const userId = req.user.user.id;

    const newOrder = new Order({
      userId, items, totalPrice,
      address, phone,
      receiverName: name,
      paymentMethod,
      status: 1
    });
    await newOrder.save();

    // Xóa sản phẩm đã mua khỏi giỏ hàng
    const productIdsBought = items.map(item => item.product);
    await Cart.findOneAndUpdate(
      { userId },
      { $pull: { products: { product: { $in: productIdsBought } } } }
    );

    // Trừ điểm nếu user dùng điểm tích lũy
    if (pointsUsed && pointsUsed > 0) {
      await User.findByIdAndUpdate(userId, { $inc: { points: -pointsUsed } });
    }

    res.json({ message: 'Đặt hàng thành công', orderId: newOrder._id });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Lỗi server khi đặt hàng' });
  }
};

// 2. LẤY DANH SÁCH ĐƠN HÀNG (Tự động cập nhật trạng thái sau 30p)
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user.user.id;
    let orders = await Order.find({ userId }).populate('items.product').sort({ createdAt: -1 });

    const now = new Date();
    const updatePromises = orders.map(async (order) => {
      // Logic: Nếu đang là Mới (1) và quá 30 phút -> Chuyển sang Đã xác nhận (2)
      if (order.status === 1) {
        const diffMinutes = (now - new Date(order.createdAt)) / 60000;
        if (diffMinutes >= 30) { 
          order.status = 2; 
          await order.save();
        }
      }
      return order;
    });

    await Promise.all(updatePromises);
    
    // Lấy lại danh sách mới nhất sau khi update
    orders = await Order.find({ userId }).populate('items.product').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// 3. HỦY ĐƠN HÀNG
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    
    // Chỉ cho hủy khi status = 1 (Mới)
    if (order.status !== 1) {
      return res.status(400).json({ message: 'Không thể hủy đơn hàng này (đã xác nhận hoặc đang giao)' });
    }

    order.status = 5; // 5: Đã hủy
    await order.save();
    res.json({ message: 'Đã hủy đơn hàng' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// 4. API TẠO DỮ LIỆU DEMO
exports.seedDemoOrders = async (req, res) => {
  try {
    const userId = req.user.user.id;

    // Lấy 2 sản phẩm bất kỳ từ DB để tạo đơn mẫu
    const products = await require('../models/Product').find().limit(2);

    const demoOrders = [
      // Đơn đang giao
      {
        userId, status: 3, totalPrice: 500000,
        address: "Demo Address", phone: "0999999999",
        items: [], createdAt: new Date(Date.now() - 86400000)
      },
      // Đơn giao thành công - CÓ SẢN PHẨM THẬT để test đánh giá
      {
        userId, status: 4,
        totalPrice: products.reduce((s, p) => s + p.price, 0),
        address: "Demo Address", phone: "0999999999",
        items: products.map((p) => ({
          product:  p._id,
          name:     p.name,
          image:    p.image,
          quantity: 1,
          price:    p.price,
        })),
        createdAt: new Date(Date.now() - 172800000)
      }
    ];

    await Order.insertMany(demoOrders);
    res.json({ message: "Đã tạo đơn hàng demo" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};