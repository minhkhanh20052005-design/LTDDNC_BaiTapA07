import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 20 Voucher quy định sẵn
export const VOUCHER_POOL = [
  { id: 'V01', code: 'GIAM10%',      type: 'percent', value: 10, minOrder: 200000,  condition: 'Đơn tối thiểu 200.000đ',                    description: 'Giảm 10% đơn hàng' },
  { id: 'V02', code: 'GIAM15%',      type: 'percent', value: 15, minOrder: 500000,  condition: 'Đơn tối thiểu 500.000đ',                    description: 'Giảm 15% đơn hàng' },
  { id: 'V03', code: 'GIAM20%',      type: 'percent', value: 20, minOrder: 1000000, condition: 'Đơn tối thiểu 1.000.000đ',                  description: 'Giảm 20% đơn hàng' },
  { id: 'V04', code: 'GIAM25%',      type: 'percent', value: 25, minOrder: 2000000, condition: 'Đơn tối thiểu 2.000.000đ',                  description: 'Giảm 25% đơn hàng' },
  { id: 'V05', code: 'GIAM30%',      type: 'percent', value: 30, minOrder: 5000000, condition: 'Đơn tối thiểu 5.000.000đ',                  description: 'Giảm 30% đơn hàng' },
  { id: 'V06', code: 'FIXED50K',     type: 'fixed',   value: 50000,   minOrder: 300000,  condition: 'Đơn tối thiểu 300.000đ',             description: 'Giảm 50.000đ' },
  { id: 'V07', code: 'FIXED100K',    type: 'fixed',   value: 100000,  minOrder: 500000,  condition: 'Đơn tối thiểu 500.000đ',             description: 'Giảm 100.000đ' },
  { id: 'V08', code: 'FIXED200K',    type: 'fixed',   value: 200000,  minOrder: 1000000, condition: 'Đơn tối thiểu 1.000.000đ',           description: 'Giảm 200.000đ' },
  { id: 'V09', code: 'FIXED500K',    type: 'fixed',   value: 500000,  minOrder: 3000000, condition: 'Đơn tối thiểu 3.000.000đ',           description: 'Giảm 500.000đ' },
  { id: 'V10', code: 'FIXED1M',      type: 'fixed',   value: 1000000, minOrder: 8000000, condition: 'Đơn tối thiểu 8.000.000đ',           description: 'Giảm 1.000.000đ' },
  { id: 'V11', code: 'APPLE10%',     type: 'percent', value: 10, minOrder: 0,       brand: 'Apple',   condition: 'Chỉ áp dụng cho sản phẩm Apple',   description: 'Giảm 10% cho hãng Apple' },
  { id: 'V12', code: 'SAMSUNG15%',   type: 'percent', value: 15, minOrder: 0,       brand: 'Samsung', condition: 'Chỉ áp dụng cho sản phẩm Samsung', description: 'Giảm 15% cho hãng Samsung' },
  { id: 'V13', code: 'XIAOMI20%',    type: 'percent', value: 20, minOrder: 0,       brand: 'Xiaomi',  condition: 'Chỉ áp dụng cho sản phẩm Xiaomi',  description: 'Giảm 20% cho hãng Xiaomi' },
  { id: 'V14', code: 'OPPO20%',      type: 'percent', value: 20, minOrder: 0,       brand: 'OPPO',    condition: 'Chỉ áp dụng cho sản phẩm OPPO',    description: 'Giảm 20% cho hãng OPPO' },
  { id: 'V15', code: 'REALME25%',    type: 'percent', value: 25, minOrder: 0,       brand: 'Realme',  condition: 'Chỉ áp dụng cho sản phẩm Realme',  description: 'Giảm 25% cho hãng Realme' },
  { id: 'V16', code: 'BUY2GIAM50K',  type: 'fixed',   value: 50000,  minOrder: 0, minQty: 2, condition: 'Mua từ 2 sản phẩm cùng đơn',            description: 'Mua 2+ SP: Giảm 50.000đ' },
  { id: 'V17', code: 'BUY3GIAM150K', type: 'fixed',   value: 150000, minOrder: 0, minQty: 3, condition: 'Mua từ 3 sản phẩm cùng đơn',            description: 'Mua 3+ SP: Giảm 150.000đ' },
  { id: 'V18', code: 'BUY4GIAM300K', type: 'fixed',   value: 300000, minOrder: 0, minQty: 4, condition: 'Mua từ 4 sản phẩm cùng đơn',            description: 'Mua 4+ SP: Giảm 300.000đ' },
  { id: 'V19', code: 'FREESHIP',     type: 'fixed',   value: 30000,  minOrder: 0,            condition: 'Miễn phí vận chuyển',                   description: 'Miễn phí vận chuyển (Giảm 30.000đ)' },
  { id: 'V20', code: 'MEGASALE',     type: 'percent', value: 50, minOrder: 10000000, condition: 'Đơn tối thiểu 10.000.000đ',                   description: 'Giảm sốc 50% đơn hàng' },
];

const voucherSlice = createSlice({
  name: 'voucher',
  initialState: {
    myVouchers: [] as any[], // Voucher người dùng đang sở hữu
  },
  reducers: {
    // Nhận 1 voucher ngẫu nhiên
    receiveRandomVoucher: (state) => {
      // Lấy những voucher trong pool mà user chưa có
      const ownedIds = state.myVouchers.map((v: any) => v.id);
      const available = VOUCHER_POOL.filter(v => !ownedIds.includes(v.id));

      if (available.length === 0) {
        // Nếu đã có hết 20 voucher thì lấy lại từ toàn bộ pool
        const randomIndex = Math.floor(Math.random() * VOUCHER_POOL.length);
        const picked = VOUCHER_POOL[randomIndex];
        // Chỉ thêm nếu chưa có
        if (!ownedIds.includes(picked.id)) {
          state.myVouchers.push(picked);
        }
      } else {
        const randomIndex = Math.floor(Math.random() * available.length);
        state.myVouchers.push(available[randomIndex]);
      }
    },

    // Xóa voucher sau khi dùng
    useVoucher: (state, action: PayloadAction<string>) => {
      state.myVouchers = state.myVouchers.filter((v: any) => v.id !== action.payload);
    },

    // Xóa tất cả (dùng khi logout)
    clearVouchers: (state) => {
      state.myVouchers = [];
    },
  },
});

export const { receiveRandomVoucher, useVoucher, clearVouchers } = voucherSlice.actions;
export default voucherSlice.reducer;