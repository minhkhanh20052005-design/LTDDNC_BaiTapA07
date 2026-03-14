const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Hàm gửi OTP
const sendOTP = async (email, otp) => {
  // 1. Log ra console để test
  console.log(`=== OTP gửi đến ${email}: ${otp} ===`);

  // 2. Gửi qua email thật 
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
    await transporter.sendMail({
      from: '"App Di Động" <no-reply@example.com>',
      to: email,
      subject: 'Mã xác thực đăng ký',
      text: `Mã OTP của bạn là: ${otp}. Mã hết hạn trong 5 phút.`
    });
  } catch (error) {
    console.log("Không thể gửi email (kiểm tra lại cấu hình .env), nhưng OTP đã hiện ở console.");
  }
};

// ĐĂNG KÝ (Bước 1: Nhập thông tin -> Gửi OTP)
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    let user = await User.findOne({ email });
    if (user && user.isVerified) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    // Nếu user tồn tại nhưng chưa verify thì cập nhật lại, nếu không thì tạo mới
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 5 * 60 * 1000; // 5 phút

    // Hash mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (user && !user.isVerified) {
      user.name = name;
      user.phone = phone;
      user.password = hashedPassword;
      user.otp = otp;
      user.otpExpires = otpExpires;
    } else {
      user = new User({ name, email, phone, password: hashedPassword, otp, otpExpires });
    }

    await user.save();
    await sendOTP(email, otp);

    res.json({ message: 'Mã OTP đã được gửi đến email', email });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// XÁC THỰC OTP (Bước 2: Hoàn tất đăng ký)
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    let user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: 'Người dùng không tồn tại' });
    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP không đúng hoặc đã hết hạn' });
    }

    user.isVerified = true;
    user.otp = undefined; // Xóa OTP sau khi dùng
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: 'Đăng ký thành công! Bạn có thể đăng nhập ngay.' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// ĐĂNG NHẬP
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Kiểm tra user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
    if (!user.isVerified) return res.status(400).json({ message: 'Tài khoản chưa được xác thực OTP' });

    // Kiểm tra pass
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });

    // Tạo Token
    const payload = { user: { id: user.id, role: user.role } };
    
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
      if (err) throw err;
      res.json({ 
        token, 
        user: { id: user.id, name: user.name, email: user.email, phone: user.phone, avatar: user.avatar, role: user.role } 
      });
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// QUÊN MẬT KHẨU

// Bước 1: Yêu cầu đặt lại mật khẩu (Gửi OTP)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Email không tồn tại trong hệ thống' });

    // Tạo OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 phút
    await user.save();

    // Gửi OTP
    await sendOTP(email, otp);

    res.json({ message: 'Mã OTP đã được gửi đến email của bạn' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// Bước 2: Xác nhận OTP Quên mật khẩu
exports.verifyForgotOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP không đúng hoặc đã hết hạn' });
    }

    // OTP đúng -> Cho phép client chuyển sang màn hình đổi pass
    res.json({ message: 'OTP hợp lệ' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// Bước 3: Đặt lại mật khẩu mới
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp) {
      return res.status(400).json({ message: 'Yêu cầu không hợp lệ (OTP sai)' });
    }

    // Hash mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Xóa OTP
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: 'Đổi mật khẩu thành công! Hãy đăng nhập lại.' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// PROFILE
// Lấy thông tin Profile (cần Token)
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.user.id).select('-password -otp'); 
    res.json(user);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// Cập nhật Profile 
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar, password, otp } = req.body;
    const user = await User.findById(req.user.user.id);

    // Cập nhật thông tin thường
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;

    // Logic đổi mật khẩu 
    if (password) {
      // Nếu chưa có OTP gửi lên -> Tạo OTP và yêu cầu xác nhận
      if (!otp) {
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = newOtp;
        user.otpExpires = Date.now() + 5 * 60 * 1000;
        await user.save();
        await sendOTP(user.email, newOtp);
        
        return res.status(202).json({ 
          requireOtp: true, 
          message: 'Đang đổi mật khẩu. Vui lòng nhập OTP vừa gửi về email để xác nhận.' 
        });
      }

      // Nếu đã có OTP gửi kèm -> Kiểm tra
      if (user.otp !== otp || user.otpExpires < Date.now()) {
        return res.status(400).json({ message: 'OTP xác nhận mật khẩu sai hoặc hết hạn' });
      }

      // OTP đúng -> Đổi pass
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      user.otp = undefined;
      user.otpExpires = undefined;
    }

    await user.save();
    res.json({ message: 'Cập nhật hồ sơ thành công', user: { 
      id: user.id, name: user.name, email: user.email, phone: user.phone, avatar: user.avatar 
    }});

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};