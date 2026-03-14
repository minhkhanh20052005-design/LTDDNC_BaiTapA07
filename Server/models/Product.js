const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  originalPrice: { type: Number }, // Giá gốc để tính giảm giá
  discount: { type: Number, default: 0 }, // % giảm giá
  image: { type: String, required: true },
  category: { type: String, required: true },
  soldCount: { type: Number, default: 0 }, // Số lượng đã bán (để tìm Best Seller)
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);