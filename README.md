# 📱 BaiTapA07 - Ứng dụng Mua Sắm Điện Thoại

> Ứng dụng thương mại điện tử mobile được xây dựng bằng **React Native** (frontend) và **Node.js + Express + MongoDB** (backend).

---

## 🚀 Tính Năng Chính

### 1. 💬 Bình luận, Đánh giá Sản phẩm & Tặng Điểm Tích Lũy

#### 🔧 API (Server)
- **Model `Review`**: Lưu các trường `userId`, `productId`, `orderId`, `rating`, `comment`, `pointsEarned` (mặc định 10 điểm/review)
- **Model `User`**: Bổ sung trường `points` để lưu điểm tích lũy

**Controller `reviewController.createReview`:**
- Nhận `productId`, `orderId`, `rating`, `comment` từ body
- Lấy `userId` từ token (`req.user.user.id`)
- Kiểm tra:
  - ✅ Đơn hàng tồn tại và thuộc về user
  - ✅ Trạng thái đơn phải là `4` – Giao thành công
  - ✅ Sản phẩm nằm trong `order.items`
  - ✅ User chưa đánh giá sản phẩm đó trong đơn đó
- Nếu hợp lệ:
  - Tạo document `Review` mới với `pointsEarned = 10`
  - Cộng điểm cho user: `User.findByIdAndUpdate(userId, { $inc: { points: 10 } })`

**Các API khác:**

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/reviews/product/:productId` | Trả về danh sách reviews, `avgRating`, `totalReviews` |
| `GET` | `/reviews/check/:productId/:orderId` | Kiểm tra user đã đánh giá chưa → `{ reviewed: boolean }` |

#### 📱 App (React Native)
**Màn hình `ReviewScreen`:**
- Người dùng chọn số sao (1–5) và nhập nội dung nhận xét
- Gọi `POST /reviews` khi bấm **"Gửi đánh giá"**
- Hiển thị Alert thông báo điểm thưởng sau khi thành công
- Giao diện nhấn mạnh: *"Đánh giá để nhận 10 điểm tích lũy!"*

---

### 2. ❤️ Sản phẩm Yêu thích, Tương tự, Đã xem & Thống kê

#### 2.1 Sản phẩm Yêu thích (Wishlist)

**API Server:**
- `GET /wishlist` → Lấy danh sách yêu thích (populate sản phẩm)
- `POST /wishlist/toggle` → Thêm/xóa sản phẩm khỏi wishlist, trả về `{ liked: boolean }`
- `GET /wishlist/check/:productId` → Kiểm tra trạng thái yêu thích

**Redux slice `wishlistSlice`:**
- `fetchWishlist`: Gọi `GET /wishlist`, lưu vào `state.items`
- `toggleWishlist`: Gọi `POST /wishlist/toggle`, nếu `liked === false` → xóa khỏi `state.items`

**Màn hình `WishlistScreen`:**
- Hiển thị danh sách sản phẩm yêu thích (ảnh, tên, hãng, giá, % giảm)
- Bấm sản phẩm → xem `ProductDetail`
- Bấm icon tim gạch → bỏ yêu thích (có confirm)
- Trống → hiện thông báo + nút **"Khám phá ngay"**

#### 2.2 Sản phẩm Tương tự (cùng hãng)

**API:** `GET /products/:id/similar?category=...`
- Tìm sản phẩm cùng `category`, loại trừ sản phẩm hiện tại
- Sắp xếp theo `soldCount` giảm dần, giới hạn 10 sản phẩm

**Trong `ProductDetailScreen`:**
- Gọi `fetchSimilarProducts()` khi mở màn hình
- Hiển thị section **"Sản phẩm {category} khác"** dạng `FlatList` 2 cột
- Bấm vào item → `navigation.push('ProductDetail', { product: item })`

#### 2.3 Sản phẩm Đã xem Gần đây

**Redux slice `recentlyViewedSlice`:**

| Action | Mô tả |
|--------|-------|
| `addRecentlyViewed(product)` | Thêm vào đầu mảng, bỏ qua nếu đã tồn tại, giới hạn tối đa **10** sản phẩm |
| `clearRecentlyViewed()` | Xóa toàn bộ lịch sử |

- Trong `ProductDetailScreen`: `useEffect` gọi `dispatch(addRecentlyViewed(product))` khi mở
- Dữ liệu được **persist** vĩnh viễn bằng `redux-persist` + `AsyncStorage`

**Màn hình `RecentlyViewedScreen`:**
- Hiển thị lưới 2 cột, bấm vào → xem lại chi tiết
- Nút **"Xóa tất cả"** ở header
- Trống → hiện thông báo *"Chưa có sản phẩm nào đã xem"*

#### 2.4 Thống kê lượt mua & lượt đánh giá

**Trong `ProductDetailScreen`**, thanh thống kê hiển thị ngay dưới ảnh sản phẩm:

| Bên trái | Bên phải |
|----------|----------|
| 🛍️ Đã bán (`soldCount`) | 💬 Bình luận, đánh giá (`totalReviews`) |

- Nếu `totalReviews > 0` → chữ **màu xanh**, có thể bấm để toggle khối đánh giá
- Khối **"Bình luận & Đánh giá"** hiển thị:
  - Badge điểm trung bình `avgRating / 5 ⭐`
  - Danh sách review: avatar, tên, số sao, bình luận, ngày tạo

---

### 3. 🎟️ Phiếu Giảm giá (Voucher) & Điểm Tích lũy khi Thanh toán

#### 3.1 Voucher Khuyến mãi

**20 Voucher được định nghĩa sẵn trong `VOUCHER_POOL`:**

| Loại | Ví dụ | Điều kiện |
|------|-------|-----------|
| Giảm % theo đơn | Giảm 10% – 50% | Đơn tối thiểu từ 200k – 10M |
| Giảm tiền cố định | Giảm 50k – 1.000.000đ | Đơn tối thiểu từ 300k – 8M |
| Theo hãng | Apple -10%, Samsung -15%... | Phải có SP của hãng trong đơn |
| Theo số lượng | Mua 2+ SP: -50k | Tổng số lượng ≥ minQty |
| Freeship | Giảm 30.000đ | Không điều kiện |

**Redux slice `voucherSlice`:**

| Action | Mô tả |
|--------|-------|
| `receiveRandomVoucher()` | Lấy ngẫu nhiên 1 voucher chưa sở hữu từ pool |
| `useVoucher(id)` | Xóa voucher khỏi `myVouchers` sau khi dùng |
| `clearVouchers()` | Xóa toàn bộ (khi logout) |

> 💾 Dữ liệu voucher được **persist** vĩnh viễn bằng `redux-persist`

**Màn hình `VoucherScreen`:**
- Hiển thị danh sách voucher đang sở hữu (mã, giá trị, điều kiện)
- Nút **"Lấy Voucher"** màu cam → nhận ngẫu nhiên 1 voucher mới
- Trống → hướng dẫn *"Nhấn Lấy Voucher để nhận ngay!"*

#### 3.2 Áp dụng Voucher tại CheckoutScreen

**Công thức tính tiền:**
```
Tổng = Tạm tính + Phí ship - Giảm từ điểm - Giảm từ voucher
```

**Logic kiểm tra voucher (`checkVoucherValid`):**
- `minOrder`: Tổng đơn phải ≥ giá trị tối thiểu
- `brand`: Phải có ít nhất 1 sản phẩm thuộc hãng đó
- `minQty`: Tổng số lượng sản phẩm phải ≥ `minQty`

**UI Checkout:**
- Mục **Điểm tích lũy**: Tick để dùng toàn bộ điểm → hiện số tiền giảm
- Mục **Voucher** (ẩn/hiện bằng nút ▼):
  - Voucher không hợp lệ → làm mờ + hiện lý do
  - Chọn 1 voucher bằng checkbox → giá tự động cập nhật

**Sau khi đặt hàng thành công:**
- `dispatch(fetchCart())` → làm mới giỏ hàng
- `dispatch(useVoucher(id))` → xóa voucher đã dùng
- Điều hướng về `Home`

#### 3.3 Xử lý Điểm tích lũy phía Server

Trong `orderController.createOrder`:
- Nhận `pointsUsed` từ body
- Nếu `pointsUsed > 0` → trừ điểm: `User.findByIdAndUpdate(userId, { $inc: { points: -pointsUsed } })`
- Điểm được **cộng** khi hoàn tất đánh giá sản phẩm (`+10 điểm/review`)

---

## 🛠️ Công nghệ sử dụng

| Phần | Công nghệ |
|------|-----------|
| Mobile | React Native, TypeScript |
| State Management | Redux Toolkit, redux-persist |
| Local Storage | AsyncStorage |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT |
| HTTP Client | Axios |
| Navigation | React Navigation (Native Stack) |


