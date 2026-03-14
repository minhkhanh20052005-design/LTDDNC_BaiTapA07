import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const axiosClient = axios.create({
  baseURL: 'http://192.168.100.182:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

axiosClient.interceptors.request.use(async (config) => {
  // Lấy token từ bộ nhớ máy
  const token = await AsyncStorage.getItem('token');
  
  if (token) {
    // Nếu có token, gắn vào Header theo chuẩn: Bearer <token>
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosClient;