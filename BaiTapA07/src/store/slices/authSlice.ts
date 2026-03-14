import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: any | null;
  token: string | null;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthData: (state, action: PayloadAction<{ user: any; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isLoading = false;
    },
    clearAuthData: (state) => {
      state.user = null;
      state.token = null;
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    updateUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload;
    },
  },
});

const { setAuthData, clearAuthData } = authSlice.actions;
export const { setLoading, updateUser } = authSlice.actions;

// --- THUNK ACTIONS ---
export const loginSuccess = (payload: { user: any; token: string }) => async (dispatch: any) => {
  try {
    await AsyncStorage.setItem('token', payload.token);
    dispatch(setAuthData(payload));
  } catch (error) {
    console.error("Lỗi lưu token:", error);
  }
};

export const logout = () => async (dispatch: any) => {
  try {
    await AsyncStorage.removeItem('token');
    dispatch(clearAuthData());
  } catch (error) {
    console.error("Lỗi xóa token:", error);
  }
};

export default authSlice.reducer;