import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import axiosClient from '../../api/axiosClient';
import { useNavigation } from '@react-navigation/native';

const RegisterScreen = () => {
  const navigation: any = useNavigation();
  const [step, setStep] = useState(1); // 1: Info, 2: OTP
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [otp, setOtp] = useState('');

  // Bước 1: Gửi thông tin đăng ký
  const handleRegister = async () => {
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }
    try {
      await axiosClient.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      Alert.alert('Thành công', 'Mã OTP đã được gửi đến email/console của bạn');
      setStep(2); // Chuyển sang nhập OTP
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || error.response?.data?.errors[0]?.msg || 'Đăng ký thất bại');
    }
  };

  // Bước 2: Xác nhận OTP
  const handleVerifyOTP = async () => {
    try {
      await axiosClient.post('/auth/verify-otp', {
        email: formData.email,
        otp: otp
      });
      Alert.alert('Thành công', 'Đăng ký hoàn tất!');
      navigation.navigate('Login');
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'OTP sai');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{step === 1 ? 'Đăng Ký Tài Khoản' : 'Nhập Mã OTP'}</Text>
      
      {step === 1 ? (
        <>
          <TextInput placeholder="Họ tên" style={styles.input} onChangeText={t => setFormData({...formData, name: t})} />
          <TextInput placeholder="Email" style={styles.input} onChangeText={t => setFormData({...formData, email: t})} />
          <TextInput placeholder="Số điện thoại" style={styles.input} onChangeText={t => setFormData({...formData, phone: t})} />
          <TextInput placeholder="Mật khẩu" secureTextEntry style={styles.input} onChangeText={t => setFormData({...formData, password: t})} />
          <TextInput placeholder="Xác nhận mật khẩu" secureTextEntry style={styles.input} onChangeText={t => setFormData({...formData, confirmPassword: t})} />
          
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Đăng Ký</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
             <Text style={styles.link}>Quay lại Đăng nhập</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={{marginBottom: 20}}>Mã OTP đã gửi đến {formData.email}</Text>
          <TextInput placeholder="Nhập mã OTP (6 số)" style={styles.input} onChangeText={setOtp} keyboardType="numeric"/>
          <TouchableOpacity style={styles.button} onPress={handleVerifyOTP}>
            <Text style={styles.buttonText}>Xác Nhận OTP</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 15 },
  button: { backgroundColor: '#007BFF', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  link: { marginTop: 15, color: '#007BFF', textAlign: 'center' }
});

export default RegisterScreen;