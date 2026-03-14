import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';

import authReducer           from './slices/authSlice';
import cartReducer           from './slices/cartSlice';
import wishlistReducer       from './slices/wishlistSlice';
import recentlyViewedReducer from './slices/recentlyViewedSlice';
import voucherReducer        from './slices/voucherSlice';

const recentlyViewedPersistConfig = { key: 'recentlyViewed', storage: AsyncStorage };
const voucherPersistConfig        = { key: 'voucher',        storage: AsyncStorage };

const rootReducer = combineReducers({
  auth:           authReducer,
  cart:           cartReducer,
  wishlist:       wishlistReducer,
  recentlyViewed: persistReducer(recentlyViewedPersistConfig, recentlyViewedReducer),
  voucher:        persistReducer(voucherPersistConfig, voucherReducer),
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;