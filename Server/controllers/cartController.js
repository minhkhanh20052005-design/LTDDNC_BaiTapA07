const Cart = require('../models/Cart');

exports.getCart = async (req, res) => {
  try {
    const userId = req.user.user.id;
    let cart = await Cart.findOne({ userId }).populate('products.product');
    if (!cart) return res.json({ products: [] });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.user.id;
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, products: [{ product: productId, quantity }] });
    } else {
      const itemIndex = cart.products.findIndex(p => p.product.toString() === productId);
      if (itemIndex > -1) {
        cart.products[itemIndex].quantity += quantity;
      } else {
        cart.products.push({ product: productId, quantity });
      }
    }
    await cart.save();
    const newCart = await Cart.findOne({ userId }).populate('products.product');
    res.json(newCart);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.user.id;
    let cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Giỏ hàng trống' });

    cart.products = cart.products.filter(p => p.product.toString() !== productId);
    await cart.save();
    const newCart = await Cart.findOne({ userId }).populate('products.product');
    res.json(newCart);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};