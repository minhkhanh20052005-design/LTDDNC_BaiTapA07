import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const MAX_ITEMS = 10;

const recentlyViewedSlice = createSlice({
  name: 'recentlyViewed',
  initialState: {
    items: [] as any[],
  },
  reducers: {
    addRecentlyViewed: (state, action: PayloadAction<any>) => {
      const product = action.payload;
      // Nếu đã có thì không thêm
      const exists = state.items.some((p: any) => p._id === product._id);
      if (exists) return;
      // Thêm vào đầu danh sách
      state.items.unshift(product);
      // Giới hạn 10 sản phẩm, loại bỏ sản phẩm cuối nếu quá
      if (state.items.length > MAX_ITEMS) {
        state.items = state.items.slice(0, MAX_ITEMS);
      }
    },
    clearRecentlyViewed: (state) => {
      state.items = [];
    },
  },
});

export const { addRecentlyViewed, clearRecentlyViewed } = recentlyViewedSlice.actions;
export default recentlyViewedSlice.reducer;