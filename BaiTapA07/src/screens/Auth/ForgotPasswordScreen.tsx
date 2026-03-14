import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import axiosClient from '../../api/axiosClient';
import { useNavigation } from '@react-navigation/native';

const ForgotPasswordScreen = () => {
  const navigation: any = useNavigation();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Pass
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // B1: Gửi OTP
  const handleSendOTP = async () => {
    try {
      await axiosClient.post('/auth/forgot-password', { email });
      setStep(2);
      Alert.alert('Đã gửi OTP', 'Kiểm tra email hoặc console server');
    } catch (err: any) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Lỗi hệ thống');
    }
  };

  // B2: Xác thực OTP
  const handleVerifyOTP = async () => {
    try {
      await axiosClient.post('/auth/verify-forgot-otp', { email, otp });
      setStep(3);
    } catch (err: any) {
      Alert.alert('Lỗi', 'OTP không đúng');
    }
  };

  // B3: Đổi mật khẩu
  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) return Alert.alert('Lỗi', 'Mật khẩu không khớp');
    try {
      await axiosClient.post('/auth/reset-password', { email, otp, newPassword });
      Alert.alert('Thành công', 'Đổi mật khẩu thành công. Vui lòng đăng nhập.');
      navigation.navigate('Login');
    } catch (err: any) {
      Alert.alert('Lỗi', err.response?.data?.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {step === 1 ? 'Quên Mật Khẩu' : step === 2 ? 'Nhập OTP' : 'Đổi Mật Khẩu'}
      </Text>

      {step === 1 && (
        <>
          <TextInput placeholder="Nhập Email" style={styles.input} onChangeText={setEmail} />
          <TouchableOpacity style={styles.button} onPress={handleSendOTP}><Text style={styles.textBtn}>Lấy Mã OTP</Text></TouchableOpacity>
        </>
      )}

      {step === 2 && (
        <>
          <TextInput placeholder="Nhập OTP" style={styles.input} onChangeText={setOtp} />
          <TouchableOpacity style={styles.button} onPress={handleVerifyOTP}><Text style={styles.textBtn}>Xác Nhận</Text></TouchableOpacity>
        </>
      )}

      {step === 3 && (
        <>
          <TextInput placeholder="Mật khẩu mới" secureTextEntry style={styles.input} onChangeText={setNewPassword} />
          <TextInput placeholder="Xác nhận mật khẩu" secureTextEntry style={styles.input} onChangeText={setConfirmPassword} />
          <TouchableOpacity style={styles.button} onPress={handleResetPassword}><Text style={styles.textBtn}>Đổi Mật Khẩu</Text></TouchableOpacity>
        </>
      )}

      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{marginTop: 20}}>
        <Text style={{color: 'blue', textAlign: 'center'}}>Quay lại Đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 15 },
  button: { backgroundColor: '#007BFF', padding: 15, borderRadius: 5, alignItems: 'center' },
  textBtn: { color: 'white', fontWeight: 'bold' }
});

export default ForgotPasswordScreen;