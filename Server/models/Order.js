const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      name: String,   // Lưu tên sản phẩm tại thời điểm mua
      image: String   // Lưu ảnh sản phẩm
    }
  ],
  totalPrice: { type: Number, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  receiverName: { type: String }, // Tên người nhận
  paymentMethod: { type: String, default: 'COD' },
  status: { type: Number, default: 1 }, // 1: Mới, 2: Đã xác nhận, 3: Đang giao, 4: Thành công, 5: Hủy
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);