const Wishlist = require('../models/Wishlist');

// 1. Lấy danh sách yêu thích
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.user.id;
    let wishlist = await Wishlist.findOne({ userId }).populate('products');
    if (!wishlist) return res.json({ products: [] });
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// 2. Thêm/Xóa yêu thích (Toggle)
exports.toggleWishlist = async (req, res) => {
  try {
    const userId    = req.user.user.id;
    const { productId } = req.body;

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      // Chưa có wishlist -> tạo mới và thêm sản phẩm
      wishlist = new Wishlist({ userId, products: [productId] });
      await wishlist.save();
      return res.json({ message: 'Đã thêm vào yêu thích', liked: true });
    }

    const index = wishlist.products.indexOf(productId);
    if (index === -1) {
      // Chưa có -> thêm vào
      wishlist.products.push(productId);
      await wishlist.save();
      return res.json({ message: 'Đã thêm vào yêu thích', liked: true });
    } else {
      // Đã có -> xóa đi
      wishlist.products.splice(index, 1);
      await wishlist.save();
      return res.json({ message: 'Đã xóa khỏi yêu thích', liked: false });
    }
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// 3. Kiểm tra 1 sản phẩm có trong wishlist không
exports.checkWishlist = async (req, res) => {
  try {
    const userId    = req.user.user.id;
    const { productId } = req.params;
    const wishlist  = await Wishlist.findOne({ userId });
    if (!wishlist) return res.json({ liked: false });
    const liked = wishlist.products.map(p => p.toString()).includes(productId);
    res.json({ liked });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};