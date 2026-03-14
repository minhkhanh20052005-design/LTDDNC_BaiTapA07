import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, 
  ActivityIndicator, Dimensions 
} from 'react-native';
import axiosClient from '../../api/axiosClient';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../store/slices/authSlice';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // State cho hiệu ứng loading và màn hình chờ
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(false);

  const dispatch = useDispatch<any>();
  const navigation: any = useNavigation();

  const handleLogin = async () => {
    if (!email || !password) {
        Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin');
        return;
    }

    try {
      setLoading(true); // Bắt đầu loading

      // 1. Gọi API đăng nhập
      const res = await axiosClient.post('/auth/login', { email, password });
      
      // 2. Nếu thành công: Tắt loading, Bật Splash Screen
      setLoading(false);
      setShowSplash(true);

      // 3. Đợi 10 giây (10000ms) rồi mới lưu Redux -> Chuyển trang
      setTimeout(() => {
        dispatch(loginSuccess({ user: res.data.user, token: res.data.token }));
      }, 10000);

    } catch (error: any) {
      setLoading(false);
      Alert.alert('Lỗi Đăng nhập', error.response?.data?.message || 'Vui lòng kiểm tra lại thông tin');
    }
  };

  // --- MÀN HÌNH CHỜ (LOGO 10 GIÂY) ---
  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        {/* Icon Logo (Có thể thay bằng Image logo của bạn) */}
        <Icon name="logo-react" size={100} color="#007BFF" />
        <Text style={styles.splashText}>My App Store</Text>
        
        <View style={{marginTop: 50, alignItems: 'center'}}>
           <ActivityIndicator size="large" color="#007BFF" />
           <Text style={{marginTop: 10, color: '#666'}}>Đang đăng nhập...</Text>
        </View>
      </View>
    );
  }

  // --- MÀN HÌNH FORM ĐĂNG NHẬP ---
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng Nhập</Text>
      
      <View style={styles.inputContainer}>
        <Icon name="mail-outline" size={20} color="#666" style={{marginRight: 10}}/>
        <TextInput 
            placeholder="Email" 
            style={styles.input} 
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="lock-closed-outline" size={20} color="#666" style={{marginRight: 10}}/>
        <TextInput 
            placeholder="Mật khẩu" 
            secureTextEntry 
            style={styles.input}
            value={password}
            onChangeText={setPassword} 
        />
      </View>
      
      <TouchableOpacity 
        style={[styles.button, loading && { opacity: 0.7 }]} 
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
            <ActivityIndicator color="#fff" />
        ) : (
            <Text style={styles.buttonText}>Đăng Nhập</Text>
        )}
      </TouchableOpacity>

      <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 20}}>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Chưa có tài khoản? <Text style={{fontWeight: 'bold'}}>Đăng ký</Text></Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.link}>Quên mật khẩu?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', color: '#333' },
  
  inputContainer: { 
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, 
    borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 15, 
    marginBottom: 15, height: 50, backgroundColor: '#f9f9f9'
  },
  input: { flex: 1 },
  
  button: { backgroundColor: '#007BFF', padding: 15, borderRadius: 8, alignItems: 'center', height: 50, justifyContent: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { color: '#007BFF' },

  splashContainer: { 
    flex: 1, backgroundColor: '#fff', 
    justifyContent: 'center', alignItems: 'center',
    width: width, height: height 
  },
  splashText: {
    fontSize: 24, fontWeight: 'bold', color: '#007BFF',
    marginTop: 20, letterSpacing: 1
  }
});

export default LoginScreen;