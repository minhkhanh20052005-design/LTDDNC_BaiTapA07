import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

// Lấy danh sách wishlist
export const fetchWishlist = createAsyncThunk('wishlist/fetch', async () => {
  const res = await axiosClient.get('/wishlist');
  return res.data.products || [];
});

// Toggle yêu thích
export const toggleWishlist = createAsyncThunk('wishlist/toggle', async (productId: string) => {
  const res = await axiosClient.post('/wishlist/toggle', { productId });
  return { productId, liked: res.data.liked };
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [] as any[],   // Danh sách sản phẩm yêu thích
    status: 'idle',
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.items  = action.payload;
        state.status = 'succeeded';
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        const { productId, liked } = action.payload;
        if (liked) {
          // Không cần thêm vào items vì chưa có đủ thông tin sản phẩm
          // fetchWishlist sẽ được gọi lại để lấy đầy đủ
        } else {
          // Xóa khỏi danh sách
          state.items = state.items.filter((p: any) => p._id !== productId);
        }
      });
  },
});

export default wishlistSlice.reducer;