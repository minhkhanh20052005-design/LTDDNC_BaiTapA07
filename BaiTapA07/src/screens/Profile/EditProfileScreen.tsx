import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, Image } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import axiosClient from '../../api/axiosClient';
import { updateUser as updateUserAction } from '../../store/slices/authSlice';
import { launchImageLibrary } from 'react-native-image-picker';

const EditProfileScreen = () => {
  const { user, token } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  
  // State
  const [name, setName] = useState(user?.name);
  const [phone, setPhone] = useState(user?.phone);
  const [avatar, setAvatar] = useState(user?.avatar); // Lưu chuỗi Base64 hoặc URL
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [otp, setOtp] = useState(''); 
  const [requireOtp, setRequireOtp] = useState(false);

  // Hàm chọn ảnh từ máy
  const handleChoosePhoto = () => {
    const options: any = {
      mediaType: 'photo',
      quality: 0.5,
      includeBase64: true, // <---Lấy chuỗi mã hóa ảnh để gửi lên server
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        // Lấy ảnh đầu tiên chọn được
        const selectedImage = response.assets[0];
        // Tạo chuỗi Base64 đầy đủ
        const source = `data:${selectedImage.type};base64,${selectedImage.base64}`;
        setAvatar(source); // Cập nhật hiển thị và biến avatar để gửi đi
      }
    });
  };

  const handleUpdate = async () => {
    if (password && password !== confirmPassword) {
      return Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
    }

    try {
      const payload: any = { name, phone, avatar };
      if (password) payload.password = password;
      if (otp) payload.otp = otp;

      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const res = await axiosClient.put('/auth/profile', payload, config);

      if (res.status === 202 && res.data.requireOtp) {
        setRequireOtp(true);
        Alert.alert('Xác thực', res.data.message);
      } else {
        dispatch(updateUserAction(res.data.user));
        Alert.alert('Thành công', 'Cập nhật hồ sơ hoàn tất');
        setRequireOtp(false);
        setPassword('');
        setConfirmPassword('');
        setOtp('');
      }
    } catch (error: any) {
      // Log lỗi chi tiết nếu ảnh quá lớn hoặc server lỗi
      console.log(error.response || error); 
      Alert.alert('Lỗi', error.response?.data?.message || 'Cập nhật thất bại (Ảnh có thể quá lớn)');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* KHU VỰC CHỌN ẢNH */}
      <View style={{alignItems: 'center', marginBottom: 20}}>
        <Text style={styles.label}>Ảnh đại diện:</Text>
        <Image 
            source={{ uri: avatar || 'https://via.placeholder.com/150' }} 
            style={styles.avatarPreview} 
        />
        <TouchableOpacity style={styles.photoBtn} onPress={handleChoosePhoto}>
            <Text style={styles.photoBtnText}>📷 Chọn ảnh từ thư viện</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Họ tên:</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Số điện thoại:</Text>
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

      <Text style={styles.header}>Đổi mật khẩu (Bỏ trống nếu không đổi)</Text>
      <TextInput 
        placeholder="Mật khẩu mới" 
        secureTextEntry 
        style={styles.input} 
        value={password}
        onChangeText={setPassword} 
      />
      <TextInput 
        placeholder="Xác nhận mật khẩu" 
        secureTextEntry 
        style={styles.input} 
        value={confirmPassword}
        onChangeText={setConfirmPassword} 
      />

      {requireOtp && (
        <View style={{marginTop: 10, borderColor: 'orange', borderWidth: 1, padding: 10, borderRadius: 5}}>
          <Text style={{color: 'orange', fontWeight: 'bold'}}>Nhập mã OTP vừa gửi về email:</Text>
          <TextInput 
            placeholder="Nhập OTP" 
            style={[styles.input, {borderColor: 'orange'}]} 
            value={otp}
            onChangeText={setOtp} 
          />
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.btnText}>{requireOtp ? "Xác nhận OTP & Cập nhật" : "Cập nhật Hồ Sơ"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  label: { fontWeight: 'bold', marginTop: 10 },
  header: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: '#007BFF' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginTop: 5 },
  button: { backgroundColor: '#007BFF', padding: 15, borderRadius: 5, marginTop: 30, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  // Style mới cho ảnh
  avatarPreview: { width: 100, height: 100, borderRadius: 50, marginVertical: 10, borderWidth: 1, borderColor: '#ddd' },
  photoBtn: { backgroundColor: '#eee', padding: 10, borderRadius: 5 },
  photoBtnText: { color: '#333' }
});

export default EditProfileScreen;