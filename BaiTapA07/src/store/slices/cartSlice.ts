import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

// --- THUNK (GỌI API) ---

// 1. Lấy danh sách giỏ hàng
export const fetchCart = createAsyncThunk('cart/fetchCart', async () => {
  const res = await axiosClient.get('/cart');
  return res.data;
});

// 2. Thêm vào giỏ hàng
export const addToCart = createAsyncThunk('cart/addToCart', async (item: { productId: string; quantity: number }) => {
  const res = await axiosClient.post('/cart/add', item);
  return res.data;
});

// 3. Xóa khỏi giỏ hàng
export const removeFromCart = createAsyncThunk('cart/removeFromCart', async (productId: string) => {
  const res = await axiosClient.delete(`/cart/remove/${productId}`);
  return res.data;
});

// --- SLICE (QUẢN LÝ STATE) ---

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [], // Danh sách sản phẩm trong giỏ
    totalQuantity: 0,
    totalPrice: 0,
    status: 'idle', // Trạng thái: idle | loading | succeeded | failed
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Xử lý khi lấy giỏ hàng (fetchCart)
      .addCase(fetchCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.products || [];
        
        // Tính toán lại tổng số lượng và tổng tiền
        state.totalQuantity = state.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
        state.totalPrice = state.items.reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0);
      })
      .addCase(fetchCart.rejected, (state) => {
        state.status = 'failed';
      })

      // Xử lý khi thêm vào giỏ (addToCart)
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload.products;
        state.totalQuantity = state.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
        state.totalPrice = state.items.reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0);
      })

      // Xử lý khi xóa khỏi giỏ (removeFromCart)
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = action.payload.products;
        state.totalQuantity = state.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
        state.totalPrice = state.items.reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0);
      });
  },
});

export default cartSlice.reducer;