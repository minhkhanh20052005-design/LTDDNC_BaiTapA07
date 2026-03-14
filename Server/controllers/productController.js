const Product = require('../models/Product');

// API tạo dữ liệu mẫu (Chạy 1 lần để có data test)
exports.seedProducts = async (req, res) => {
  try {
    await Product.deleteMany(); 

    const products = [
      // --- APPLE (iPhone) ---
      { 
        name: "iPhone 15 Pro Max 256GB", 
        category: "Apple", 
        price: 34990000, 
        discount: 10, 
        soldCount: 1200, 
        image: "https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-blue-thumbnew-600x600.jpg", 
        description: "iPhone 15 Pro Max thiết kế khung titan chuẩn hàng không vũ trụ, bền bỉ và nhẹ hơn. Chip A17 Pro mang lại hiệu năng đồ họa đỉnh cao." 
      },
      { 
        name: "iPhone 14 Plus 128GB", 
        category: "Apple", 
        price: 21990000, 
        discount: 15, 
        soldCount: 450, 
        image: "https://cdn.tgdd.vn/Products/Images/42/245545/iphone-14-plus-gold-thumbnew-600x600.jpg", 
        description: "Màn hình lớn, thời lượng pin cả ngày dài và hệ thống camera kép tiên tiến." 
      },
      { 
        name: "iPhone 13 128GB", 
        category: "Apple", 
        price: 13990000, 
        discount: 25, 
        soldCount: 890, 
        image: "https://cdn.tgdd.vn/Products/Images/42/223602/iphone-13-pink-thumbnew-600x600.jpg", 
        description: "Giá siêu tốt. Chip A15 Bionic vẫn rất mạnh mẽ trong tầm giá." 
      },

      // --- SAMSUNG ---
      { 
        name: "Samsung Galaxy S24 Ultra 5G", 
        category: "Samsung", 
        price: 29990000, 
        discount: 5, 
        soldCount: 950, 
        image: "https://cdn.tgdd.vn/Products/Images/42/307174/samsung-galaxy-s24-ultra-grey-thumbnew-600x600.jpg", 
        description: "Quyền năng Galaxy AI. Camera mắt thần bóng đêm 200MP. Khung Titan đẳng cấp." 
      },
      { 
        name: "Samsung Galaxy Z Flip5", 
        category: "Samsung", 
        price: 16990000, 
        discount: 30, 
        soldCount: 300, 
        image: "https://cdn.tgdd.vn/Products/Images/42/299250/samsung-galaxy-z-flip5-mint-thumbnew-600x600.jpg", 
        description: "Gập nhỏ gọn, màn hình ngoài Flex Window lớn đa năng." 
      },
      { 
        name: "Samsung Galaxy A54 5G", 
        category: "Samsung", 
        price: 8490000, 
        discount: 10, 
        soldCount: 2000, 
        image: "https://cdn.tgdd.vn/Products/Images/42/251356/samsung-galaxy-a54-5g-purple-thumbnew-600x600.jpg", 
        description: "Thiết kế mặt lưng kính sang trọng, kháng nước IP67." 
      },

      // --- XIAOMI ---
      { 
        name: "Xiaomi 14 5G", 
        category: "Xiaomi", 
        price: 22990000, 
        discount: 0, 
        soldCount: 150, 
        image: "https://cdn.tgdd.vn/Products/Images/42/316002/xiaomi-14-black-thumb-600x600.jpg", 
        description: "Thấu kính Leica thế hệ mới. Hiệu năng Snapdragon 8 Gen 3 vô địch." 
      },
      { 
        name: "Xiaomi Redmi Note 13 Pro", 
        category: "Xiaomi", 
        price: 7290000, 
        discount: 5, 
        soldCount: 1100, 
        image: "https://cdn.tgdd.vn/Products/Images/42/309834/xiaomi-redmi-note-13-pro-black-thumb-600x600.jpg", 
        description: "Camera 200MP, sạc siêu nhanh 67W, màn hình AMOLED 120Hz." 
      },

      // --- OPPO ---
      { 
        name: "OPPO Reno11 F 5G", 
        category: "OPPO", 
        price: 8990000, 
        discount: 0, 
        soldCount: 400, 
        image: "https://cdn.tgdd.vn/Products/Images/42/313264/oppo-reno11-f-green-thumb-600x600.jpg", 
        description: "Chuyên gia chân dung. Thiết kế vân đá tự nhiên độc đáo." 
      },
      { 
        name: "OPPO Find N3 Flip", 
        category: "OPPO", 
        price: 22990000, 
        discount: 20, 
        soldCount: 80, 
        image: "https://cdn.tgdd.vn/Products/Images/42/306995/oppo-find-n3-flip-pink-thumbnew-600x600.jpg", 
        description: "Camera Hasselblad chuyên nghiệp. Màn hình gập không nếp gấp." 
      },

      // --- REALME ---
      ...Array.from({ length: 10 }).map((_, i) => ({
        name: `Realme C${50 + i}`,
        category: "Realme",
        price: 3000000 + i * 500000,
        discount: Math.floor(Math.random() * 20),
        soldCount: Math.floor(Math.random() * 100),
        image: "https://cdn.tgdd.vn/Products/Images/42/306786/realme-c53-black-thumbnew-600x600.jpg",
        description: "Điện thoại giá rẻ, pin trâu, cấu hình ổn định cho học sinh sinh viên."
      }))
    ];

    await Product.insertMany(products);
    res.json({ message: "Đã tạo dữ liệu ĐIỆN THOẠI mẫu thành công!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách sản phẩm
exports.getProducts = async (req, res) => {
  try {
    const { keyword, type, limit, page, category } = req.query;
    
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    let query = {};

    if (keyword) {
      query.name = { $regex: keyword, $options: 'i' };
    }

    if (category) {
      query.category = category;
    }

    let sort = {};
    
    if (type === 'best-seller') {
      sort.soldCount = -1;
    } else if (type === 'discount') {
      sort.discount = -1;
    } else if (type === 'promotion') {
      query.discount = { $gt: 0 };
      sort.createdAt = -1;
    } else {
      sort.createdAt = -1;
    }

    const products = await Product.find(query).sort(sort).skip(skip).limit(limitNumber);
    res.json(products);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// Lấy danh sách Hãng (Category)
exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// Chi tiết sản phẩm
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    res.json(product);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

//Gợi ý sản phẩm tương tự cùng hãng
exports.getSimilarProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { category } = req.query;

    if (!category) {
      return res.status(400).json({ message: "Thiếu thông tin hãng (category)" });
    }

    const similarProducts = await Product.find({
      category: category,
      _id: { $ne: id }, // Loại trừ sản phẩm hiện tại
    })
      .sort({ soldCount: -1 }) // Ưu tiên bán chạy
      .limit(10);

    res.json(similarProducts);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};