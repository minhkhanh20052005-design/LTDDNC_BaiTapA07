const jwt = require('jsonwebtoken');

// Lớp 3: Xác thực (Authentication)
exports.verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: "Không có quyền truy cập (No Token)" });

  try {
    // Tách "Bearer <token>"
    const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: "Token không hợp lệ" });
  }
};

// Lớp 4: Phân quyền (Authorization)
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Bạn không có quyền thực hiện chức năng này" });
  }
  next();
};