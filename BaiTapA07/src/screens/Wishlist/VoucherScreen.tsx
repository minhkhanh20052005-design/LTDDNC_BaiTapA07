import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { receiveRandomVoucher } from '../../store/slices/voucherSlice';

const VoucherScreen = () => {
  const dispatch    = useDispatch<any>();
  const navigation: any = useNavigation();
  const { myVouchers } = useSelector((state: any) => state.voucher);

  const handleGetVoucher = () => {
    dispatch(receiveRandomVoucher());
    Alert.alert('🎉 Thành công', 'Bạn đã nhận được 1 Voucher mới!');
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      {/* Dải màu trái */}
      <View style={[styles.cardAccent, { backgroundColor: item.type === 'percent' ? '#FF6B35' : '#007BFF' }]} />

      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={styles.cardCode}>{item.code}</Text>
          <View style={[styles.typeBadge, { backgroundColor: item.type === 'percent' ? '#FFF0E8' : '#E8F4FF' }]}>
            <Text style={[styles.typeText, { color: item.type === 'percent' ? '#FF6B35' : '#007BFF' }]}>
              {item.type === 'percent' ? `Giảm ${item.value}%` : `Giảm ${item.value.toLocaleString()}đ`}
            </Text>
          </View>
        </View>
        <Text style={styles.cardDesc}>{item.description}</Text>
        <Text style={styles.cardCond}>
          <Icon name="information-circle-outline" size={13} color="#999" /> {item.condition}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Voucher khuyến mãi</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Nút Lấy Voucher */}
      <TouchableOpacity style={styles.getBtn} onPress={handleGetVoucher}>
        <Icon name="gift-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.getBtnText}>Lấy Voucher</Text>
      </TouchableOpacity>

      {/* Danh sách */}
      {myVouchers.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="pricetag-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>Bạn chưa có Voucher nào</Text>
          <Text style={styles.emptyHint}>Nhấn "Lấy Voucher" để nhận ngay!</Text>
        </View>
      ) : (
        <FlatList
          data={myVouchers}
          renderItem={renderItem}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={{ padding: 15 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f5f5f5' },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#fff', elevation: 2 },
  headerTitle:  { fontSize: 18, fontWeight: 'bold' },
  getBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF6B35', margin: 15, padding: 14, borderRadius: 10, elevation: 3 },
  getBtnText:   { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  card:         { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 10, marginBottom: 12, overflow: 'hidden', elevation: 2 },
  cardAccent:   { width: 6 },
  cardBody:     { flex: 1, padding: 12 },
  cardTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardCode:     { fontSize: 15, fontWeight: 'bold', color: '#333' },
  typeBadge:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  typeText:     { fontSize: 12, fontWeight: 'bold' },
  cardDesc:     { fontSize: 13, color: '#555', marginBottom: 4 },
  cardCond:     { fontSize: 12, color: '#999' },
  empty:        { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText:    { fontSize: 16, color: '#999', marginTop: 12 },
  emptyHint:    { fontSize: 13, color: '#bbb', marginTop: 6 },
});

export default VoucherScreen;