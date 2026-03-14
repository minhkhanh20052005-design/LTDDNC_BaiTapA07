import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import axiosClient from '../../api/axiosClient';
import { fetchCart } from '../../store/slices/cartSlice';
import { useVoucher } from '../../store/slices/voucherSlice';

const POINTS_TO_VND = 100;

// Kiểm tra voucher có áp dụng được cho đơn hàng không
const checkVoucherValid = (voucher: any, subTotal: number, items: any[]) => {
  if (!voucher) return { valid: false, reason: '' };

  // Kiểm tra đơn tối thiểu
  if (voucher.minOrder && subTotal < voucher.minOrder) {
    return { valid: false, reason: `Đơn tối thiểu ${voucher.minOrder.toLocaleString()}đ` };
  }

  // Kiểm tra hãng
  if (voucher.brand) {
    const hasBrand = items.some((item: any) => item.product.category === voucher.brand);
    if (!hasBrand) return { valid: false, reason: `Chỉ áp dụng cho sản phẩm ${voucher.brand}` };
  }

  // Kiểm tra số lượng sản phẩm
  if (voucher.minQty) {
    const totalQty = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
    if (totalQty < voucher.minQty) {
      return { valid: false, reason: `Cần mua tối thiểu ${voucher.minQty} sản phẩm` };
    }
  }

  return { valid: true, reason: '' };
};

// Tính tiền giảm từ voucher
const calcVoucherDiscount = (voucher: any, subTotal: number) => {
  if (!voucher) return 0;
  if (voucher.type === 'percent') return Math.round(subTotal * voucher.value / 100);
  return voucher.value;
};

const CheckoutScreen = () => {
  const route: any      = useRoute();
  const navigation: any = useNavigation();
  const dispatch        = useDispatch<any>();
  const { selectedProducts } = route.params;
  const { user }        = useSelector((state: any) => state.auth);
  const { myVouchers }  = useSelector((state: any) => state.voucher);

  const [name,           setName]           = useState(user?.name  || '');
  const [phone,          setPhone]          = useState(user?.phone || '');
  const [address,        setAddress]        = useState('');
  const [loading,        setLoading]        = useState(false);
  const [usePoints,      setUsePoints]      = useState(false);
  const [showVouchers,   setShowVouchers]   = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);

  const availablePoints = user?.points || 0;
  const pointsDiscount  = usePoints ? availablePoints * POINTS_TO_VND : 0;
  const subTotal        = selectedProducts.reduce(
    (sum: number, item: any) => sum + item.product.price * item.quantity, 0
  );
  const shippingFee     = 30000;

  // Tính giảm giá voucher
  const voucherDiscount = useMemo(
    () => calcVoucherDiscount(selectedVoucher, subTotal),
    [selectedVoucher, subTotal]
  );

  const total = Math.max(0, subTotal + shippingFee - pointsDiscount - voucherDiscount);

  // Lọc voucher hợp lệ cho đơn hiện tại
  const validVouchers = useMemo(
    () => myVouchers.filter((v: any) => checkVoucherValid(v, subTotal, selectedProducts).valid),
    [myVouchers, subTotal, selectedProducts]
  );

  const handleSelectVoucher = (voucher: any) => {
    if (selectedVoucher?.id === voucher.id) {
      setSelectedVoucher(null); // Bỏ chọn nếu bấm lại
    } else {
      setSelectedVoucher(voucher);
    }
  };

  const handleOrder = async () => {
    if (!name || !phone || !address)
      return Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin nhận hàng');
    try {
      setLoading(true);
      const payload = {
        name, phone, address,
        items: selectedProducts.map((item: any) => ({
          product:  item.product._id,
          name:     item.product.name,
          image:    item.product.image,
          quantity: item.quantity,
          price:    item.product.price,
        })),
        totalPrice:     total,
        paymentMethod:  'COD',
        pointsUsed:     usePoints ? availablePoints : 0,
        voucherCode:    selectedVoucher?.code || null,
        voucherDiscount: voucherDiscount,
      };

      await axiosClient.post('/orders', payload);
      dispatch(fetchCart());

      // Xóa voucher đã dùng khỏi danh sách
      if (selectedVoucher) {
        dispatch(useVoucher(selectedVoucher.id));
      }

      Alert.alert('Thành công', 'Đặt hàng thành công!', [
        { text: 'OK', onPress: () => navigation.navigate('Home') }
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Đặt hàng thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh Toán</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 15 }}>
        {/* 1. Địa chỉ */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Icon name="location" size={20} color="#007BFF" />
            <Text style={styles.sectionTitle}>Địa chỉ nhận hàng</Text>
          </View>
          <TextInput placeholder="Họ và tên"      style={styles.input} value={name}    onChangeText={setName} />
          <TextInput placeholder="Số điện thoại"  style={styles.input} value={phone}   onChangeText={setPhone} keyboardType="phone-pad" />
          <TextInput placeholder="Địa chỉ"        style={styles.input} value={address} onChangeText={setAddress} />
        </View>

        {/* 2. Sản phẩm */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danh sách sản phẩm</Text>
          {selectedProducts.map((item: any) => (
            <View key={item.product._id} style={styles.productItem}>
              <Image source={{ uri: item.product.image }} style={styles.img} />
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={{ fontWeight: 'bold' }}>{item.product.name}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                  <Text style={{ color: 'red' }}>{item.product.price.toLocaleString()}đ</Text>
                  <Text>x{item.quantity}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* 3. Điểm tích lũy */}
        {availablePoints > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Điểm tích lũy</Text>
            <TouchableOpacity
              style={[styles.pointsRow, usePoints && styles.pointsRowActive]}
              onPress={() => setUsePoints(!usePoints)}
            >
              <Icon name={usePoints ? 'checkbox' : 'square-outline'} size={22} color={usePoints ? '#007BFF' : '#888'} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={{ fontWeight: 'bold' }}>Dùng {availablePoints} điểm tích lũy</Text>
                <Text style={{ color: '#666', fontSize: 12 }}>Giảm {pointsDiscount.toLocaleString()}đ cho đơn hàng này</Text>
              </View>
              <Icon name="gift" size={20} color="#FF6B35" />
            </TouchableOpacity>
          </View>
        )}

        {/* 4. VOUCHER */}
        <View style={styles.section}>
          {/* Header ẩn/hiện */}
          <TouchableOpacity style={styles.voucherHeader} onPress={() => setShowVouchers(!showVouchers)}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="pricetag-outline" size={20} color="#FF6B35" />
              <Text style={styles.sectionTitle}>
                Voucher{selectedVoucher ? ` (Đã chọn: ${selectedVoucher.code})` : ''}
              </Text>
            </View>
            <Icon name={showVouchers ? 'chevron-up' : 'chevron-down'} size={22} color="#555" />
          </TouchableOpacity>

          {/* Panel voucher */}
          {showVouchers && (
            <View style={{ marginTop: 10 }}>
              {myVouchers.length === 0 ? (
                <Text style={styles.noVoucherText}>Bạn chưa có Voucher nào</Text>
              ) : (
                myVouchers.map((voucher: any) => {
                  const { valid, reason } = checkVoucherValid(voucher, subTotal, selectedProducts);
                  const isSelected = selectedVoucher?.id === voucher.id;
                  return (
                    <TouchableOpacity
                      key={voucher.id}
                      style={[
                        styles.voucherItem,
                        isSelected && styles.voucherItemSelected,
                        !valid && styles.voucherItemDisabled,
                      ]}
                      onPress={() => valid && handleSelectVoucher(voucher)}
                      activeOpacity={valid ? 0.7 : 1}
                    >
                      <Icon
                        name={isSelected ? 'checkbox' : 'square-outline'}
                        size={22}
                        color={isSelected ? '#007BFF' : valid ? '#888' : '#ccc'}
                        style={{ marginRight: 10 }}
                      />
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={[styles.voucherCode, !valid && { color: '#bbb' }]}>{voucher.code}</Text>
                          <Text style={[styles.voucherValue, !valid && { color: '#bbb' }]}>
                            {voucher.type === 'percent'
                              ? `Giảm ${voucher.value}%`
                              : `Giảm ${voucher.value.toLocaleString()}đ`}
                          </Text>
                        </View>
                        <Text style={[styles.voucherCond, !valid && { color: '#ccc' }]}>
                          {valid ? voucher.condition : `Không áp dụng: ${reason}`}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          )}
        </View>

        {/* 5. Phương thức thanh toán */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          <TouchableOpacity style={styles.methodActive}>
            <Icon name="radio-button-on" size={20} color="#007BFF" />
            <View style={{ marginLeft: 10 }}>
              <Text style={{ fontWeight: 'bold' }}>Thanh toán khi nhận hàng (COD)</Text>
              <Text style={{ fontSize: 12, color: '#666' }}>Thanh toán bằng tiền mặt khi nhận hàng</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 6. Tóm tắt chi phí */}
        <View style={styles.section}>
          <View style={styles.row}><Text>Tạm tính</Text><Text>{subTotal.toLocaleString()}đ</Text></View>
          <View style={styles.row}><Text>Phí vận chuyển</Text><Text>{shippingFee.toLocaleString()}đ</Text></View>
          {usePoints && (
            <View style={styles.row}>
              <Text style={{ color: 'green' }}>Giảm từ điểm</Text>
              <Text style={{ color: 'green' }}>-{pointsDiscount.toLocaleString()}đ</Text>
            </View>
          )}
          {selectedVoucher && voucherDiscount > 0 && (
            <View style={styles.row}>
              <Text style={{ color: '#FF6B35' }}>Voucher ({selectedVoucher.code})</Text>
              <Text style={{ color: '#FF6B35' }}>-{voucherDiscount.toLocaleString()}đ</Text>
            </View>
          )}
          <View style={[styles.row, { marginTop: 10, borderTopWidth: 1, borderColor: '#eee', paddingTop: 10 }]}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Tổng cộng</Text>
            <Text style={{ fontWeight: 'bold', fontSize: 18, color: 'red' }}>{total.toLocaleString()}đ</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.btnOrder} onPress={handleOrder} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>ĐẶT HÀNG</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: '#f5f5f5' },
  header:              { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', alignItems: 'center' },
  headerTitle:         { fontSize: 18, fontWeight: 'bold' },
  section:             { backgroundColor: '#fff', padding: 15, marginBottom: 10 },
  sectionTitle:        { fontWeight: 'bold', marginBottom: 0, marginLeft: 5, fontSize: 15 },
  input:               { borderWidth: 1, borderColor: '#ddd', borderRadius: 5, padding: 10, marginBottom: 10 },
  productItem:         { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  img:                 { width: 50, height: 50, borderRadius: 5, marginRight: 10 },
  pointsRow:           { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8 },
  pointsRowActive:     { borderColor: '#007BFF', backgroundColor: '#e6f2ff' },
  methodActive:        { flexDirection: 'row', alignItems: 'center', padding: 10, borderWidth: 1, borderColor: '#007BFF', borderRadius: 5, backgroundColor: '#e6f2ff' },
  row:                 { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  footer:              { padding: 15, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee' },
  btnOrder:            { backgroundColor: '#FF5722', padding: 15, borderRadius: 5, alignItems: 'center' },
  btnText:             { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // Voucher
  voucherHeader:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  noVoucherText:       { textAlign: 'center', color: '#999', paddingVertical: 12, fontSize: 13 },
  voucherItem:         { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 8 },
  voucherItemSelected: { borderColor: '#007BFF', backgroundColor: '#e6f2ff' },
  voucherItemDisabled: { backgroundColor: '#fafafa' },
  voucherCode:         { fontSize: 14, fontWeight: 'bold', color: '#333' },
  voucherValue:        { fontSize: 13, fontWeight: 'bold', color: '#FF6B35' },
  voucherCond:         { fontSize: 12, color: '#888', marginTop: 2 },
});

export default CheckoutScreen;