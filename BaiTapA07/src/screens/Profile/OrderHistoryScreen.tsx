import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import axiosClient from '../../api/axiosClient';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  const day     = d.getDate().toString().padStart(2, '0');
  const month   = (d.getMonth() + 1).toString().padStart(2, '0');
  const hours   = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `Ngày ${day}/${month} lúc ${hours}:${minutes}`;
};

const getStatusInfo = (status: number) => {
  switch (status) {
    case 1: return { text: 'Mới',                              color: '#007BFF' };
    case 2: return { text: 'Đã xác nhận. Shop đang chuẩn bị', color: 'orange'  };
    case 3: return { text: 'Đang giao hàng',                  color: '#17a2b8' };
    case 4: return { text: 'Giao hàng thành công',            color: 'green'   };
    case 5: return { text: 'Đã hủy',                          color: 'red'     };
    default: return { text: 'Không xác định',                 color: '#666'    };
  }
};

const OrderHistoryScreen = () => {
  const navigation: any = useNavigation();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  // Lưu danh sách đã review: key = "productId_orderId"
  const [reviewed, setReviewed] = useState<Record<string, boolean>>({});

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/orders');
      setOrders(res.data);
      // Kiểm tra review cho từng sản phẩm trong đơn thành công
      checkReviewed(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra hàng loạt các sản phẩm đã review chưa
  const checkReviewed = async (orderList: any[]) => {
    const successOrders = orderList.filter(o => o.status === 4);
    const results: Record<string, boolean> = {};
    for (const order of successOrders) {
      for (const item of order.items) {
        const productId = item.product?._id;
        if (!productId) continue;
        try {
          const res = await axiosClient.get(`/reviews/check/${productId}/${order._id}`);
          results[`${productId}_${order._id}`] = res.data.reviewed;
        } catch {}
      }
    }
    setReviewed(results);
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleCancel = async (orderId: string) => {
    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn hủy đơn hàng này?', [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Hủy Đơn', style: 'destructive',
        onPress: async () => {
          try {
            await axiosClient.put(`/orders/cancel/${orderId}`);
            Alert.alert('Thành công', 'Đã hủy đơn hàng');
            fetchOrders();
          } catch (error: any) {
            Alert.alert('Lỗi', error.response?.data?.message || 'Không thể hủy');
          }
        }
      }
    ]);
  };

  const handleSeedDemo = async () => {
    try {
      await axiosClient.post('/orders/seed');
      Alert.alert('Demo', 'Đã tạo thêm đơn hàng mẫu');
      fetchOrders();
    } catch (error) { console.log(error); }
  };

  const renderItem = ({ item }: any) => {
    const statusInfo = getStatusInfo(item.status);
    const canCancel  = item.status === 1;
    const isSuccess  = item.status === 4;

    return (
      <View style={styles.card}>
        {/* Header Card */}
        <View style={styles.cardHeader}>
          <Text style={{ fontWeight: 'bold' }}>Đơn {formatDate(item.createdAt)}</Text>
          <Text style={{ color: statusInfo.color, fontWeight: 'bold' }}>{statusInfo.text}</Text>
        </View>

        {/* List sản phẩm */}
        {item.items.map((prod: any, index: number) => {
          const productId  = prod.product?._id;
          const reviewKey  = `${productId}_${item._id}`;
          const isReviewed = reviewed[reviewKey];

          return (
            <View key={index}>
              <View style={styles.productRow}>
                <View style={styles.productInfoLeft}>
                  <Text style={styles.prodName}>
                    {prod.product ? prod.product.name : 'Sản phẩm đã bị xóa'}
                  </Text>
                  <Text style={styles.quantityText}>x{prod.quantity}</Text>
                </View>
                <Text style={styles.priceText}>{(prod.price * prod.quantity).toLocaleString()}đ</Text>
              </View>

              {/* Nút đánh giá — chỉ hiện khi đơn thành công và chưa đánh giá */}
              {isSuccess && productId && (
                isReviewed ? (
                  <View style={styles.reviewedBadge}>
                    <Icon name="checkmark-circle" size={14} color="green" />
                    <Text style={styles.reviewedText}>Đã đánh giá</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.reviewBtn}
                    onPress={() => navigation.navigate('Review', { product: prod, orderId: item._id, onReviewDone: fetchOrders })}
                  >
                    <Icon name="star-outline" size={14} color="#fff" />
                    <Text style={styles.reviewBtnText}>Đánh giá • Nhận 10 điểm</Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          );
        })}

        <View style={styles.divider} />

        {/* Tổng kết */}
        <View style={styles.footerRow}>
          <Text style={{ color: '#666' }}>Thanh toán: {item.paymentMethod}</Text>
          <Text style={styles.totalPrice}>Tổng: {item.totalPrice.toLocaleString()}đ</Text>
        </View>

        {/* Nút Hủy */}
        {canCancel && (
          <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancel(item._id)}>
            <Text style={{ color: '#fff' }}>Hủy đơn hàng</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử mua hàng</Text>
        <TouchableOpacity onPress={handleSeedDemo}>
          <Icon name="flask-outline" size={24} color="#007BFF" />
        </TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#007BFF" /> : (
        <FlatList
          data={orders}
          renderItem={renderItem}
          keyExtractor={(item: any) => item._id}
          contentContainerStyle={{ padding: 15 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchOrders} />}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Chưa có đơn hàng nào</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#f5f5f5' },
  header:          { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', alignItems: 'center' },
  headerTitle:     { fontSize: 18, fontWeight: 'bold' },
  card:            { backgroundColor: '#fff', marginBottom: 15, padding: 15, borderRadius: 8 },
  cardHeader:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 10 },
  productRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  productInfoLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 10, flexWrap: 'wrap' },
  prodName:        { fontWeight: '500', color: '#333' },
  quantityText:    { fontWeight: 'bold', color: '#007BFF', marginLeft: 8 },
  priceText:       { color: '#666', minWidth: 80, textAlign: 'right' },
  reviewBtn:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFC107', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 5, alignSelf: 'flex-start', marginBottom: 8, gap: 5 },
  reviewBtnText:   { color: '#fff', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  reviewedBadge:   { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 4 },
  reviewedText:    { color: 'green', fontSize: 12, marginLeft: 4 },
  divider:         { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  footerRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalPrice:      { color: 'red', fontWeight: 'bold', fontSize: 16 },
  cancelBtn:       { marginTop: 15, backgroundColor: 'red', padding: 10, borderRadius: 5, alignItems: 'center', alignSelf: 'flex-end' },
});

export default OrderHistoryScreen;