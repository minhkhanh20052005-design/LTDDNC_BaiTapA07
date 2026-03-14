import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import axiosClient from '../../api/axiosClient';
import { updateUser } from '../../store/slices/authSlice';

const ProfileScreen = () => {
  const { user } = useSelector((state: any) => state.auth);
  const navigation: any = useNavigation();
  const dispatch = useDispatch<any>();

  // Fetch lại profile mỗi khi mở màn hình để cập nhật điểm mới nhất
  useEffect(() => {
    const refreshProfile = async () => {
      try {
        const res = await axiosClient.get('/auth/profile');
        dispatch(updateUser(res.data));
      } catch (err) {
        console.log(err);
      }
    };
    refreshProfile();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header với nút Back */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <Image source={{ uri: user?.avatar }} style={styles.avatar} />
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.info}>{user?.email}</Text>
        <Text style={styles.info}>{user?.phone || 'Chưa cập nhật SĐT'}</Text>
      </View>

      {/* Điểm tích lũy */}
      <View style={styles.pointsBadge}>
        <Icon name="star" size={18} color="#FFC107" />
        <Text style={styles.pointsText}>
          Điểm tích lũy:{' '}
          <Text style={{ fontWeight: 'bold', color: '#FF6B35' }}>
            {user?.points || 0} điểm
          </Text>
        </Text>
        <Text style={styles.pointsNote}>(100 điểm = 10.000đ)</Text>
      </View>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate('EditProfile')}
      >
        <Text style={styles.btnText}>Cập nhật hồ sơ</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container:     { flex: 1, padding: 20, alignItems: 'center', backgroundColor: '#fff' },
  backBtn:       { alignSelf: 'flex-start', marginBottom: 10 },
  infoContainer: { alignItems: 'center', marginBottom: 20, marginTop: 20 },
  avatar:        { width: 100, height: 100, borderRadius: 50, marginBottom: 15, borderWidth: 2, borderColor: '#eee' },
  name:          { fontSize: 22, fontWeight: 'bold', marginBottom: 5 },
  info:          { fontSize: 16, color: '#555', marginBottom: 5 },
  pointsBadge:   {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF3EE', padding: 12,
    borderRadius: 8, marginBottom: 20, width: '100%',
    borderWidth: 1, borderColor: '#FF6B35'
  },
  pointsText:    { marginLeft: 8, fontSize: 15, color: '#333', flex: 1 },
  pointsNote:    { fontSize: 11, color: '#999' },
  btn:           { width: '100%', padding: 15, backgroundColor: '#007BFF', borderRadius: 10, alignItems: 'center' },
  btnText:       { color: '#fff', fontWeight: 'bold' }
});

export default ProfileScreen;