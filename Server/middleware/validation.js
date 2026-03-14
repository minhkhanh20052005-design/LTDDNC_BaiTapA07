const { check, validationResult } = require('express-validator');

// Validate Đăng ký
exports.validateRegister = [
  check('name', 'Họ tên không được để trống').not().isEmpty(),
  check('email', 'Email không hợp lệ').isEmail(),
  check('phone', 'Số điện thoại không hợp lệ').isMobilePhone(),
  check('password', 'Mật khẩu phải từ 6 ký tự trở lên').isLength({ min: 6 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  }
];

// Validate Đăng nhập
exports.validateLogin = [
  check('email', 'Email không hợp lệ').isEmail(),
  check('password', 'Mật khẩu không được để trống').exists(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  }
];