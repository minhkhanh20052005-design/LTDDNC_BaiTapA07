import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import axiosClient from '../../api/axiosClient';

const ReviewScreen = () => {
  const navigation: any = useNavigation();
  const route: any = useRoute();
  const { product, orderId } = route.params;

  const [rating, setRating]   = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.post('/reviews', {
        productId: product.product._id,
        orderId,
        rating,
        comment,
      });
      Alert.alert('🎉 Thành công', res.data.message, [
        { 
          text: 'OK', 
          onPress: () => {
            // Gọi callback refresh nếu có
            if (route.params?.onReviewDone) route.params.onReviewDone();
            navigation.goBack();
          }
        }
      ]);
    } catch (err: any) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể gửi đánh giá');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đánh giá sản phẩm</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.body}>
        {/* Thông tin sản phẩm */}
        <View style={styles.productRow}>
          <Image source={{ uri: product.image }} style={styles.productImg} />
          <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        </View>

        {/* Chọn số sao */}
        <Text style={styles.label}>Chất lượng sản phẩm:</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map(star => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Icon
                name={star <= rating ? 'star' : 'star-outline'}
                size={40}
                color={star <= rating ? '#FFC107' : '#ccc'}
                style={{ marginHorizontal: 5 }}
              />
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.ratingText}>
          {rating === 1 ? 'Rất tệ' : rating === 2 ? 'Tệ' : rating === 3 ? 'Bình thường' : rating === 4 ? 'Tốt' : 'Xuất sắc'}
        </Text>

        {/* Nhập bình luận */}
        <Text style={styles.label}>Nhận xét của bạn:</Text>
        <TextInput
          style={styles.input}
          placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
          multiline
          numberOfLines={4}
          value={comment}
          onChangeText={setComment}
        />

        {/* Thông báo điểm thưởng */}
        <View style={styles.rewardBox}>
          <Icon name="gift-outline" size={20} color="#FF6B35" />
          <Text style={styles.rewardText}>Đánh giá để nhận <Text style={{ fontWeight: 'bold', color: '#FF6B35' }}>10 điểm</Text> tích lũy!</Text>
        </View>

        {/* Nút gửi */}
        <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Đang gửi...' : 'Gửi đánh giá'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#f5f5f5' },
  header:      { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  body:        { padding: 15 },
  productRow:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 10, borderRadius: 8, marginBottom: 20 },
  productImg:  { width: 60, height: 60, borderRadius: 5, marginRight: 10 },
  productName: { flex: 1, fontWeight: 'bold', fontSize: 14 },
  label:       { fontWeight: 'bold', fontSize: 15, marginBottom: 10, marginTop: 10 },
  starsRow:    { flexDirection: 'row', justifyContent: 'center', marginBottom: 8 },
  ratingText:  { textAlign: 'center', color: '#FFC107', fontWeight: 'bold', fontSize: 16, marginBottom: 15 },
  input:       { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, textAlignVertical: 'top', minHeight: 100, marginBottom: 15 },
  rewardBox:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF3EE', padding: 12, borderRadius: 8, marginBottom: 20, borderWidth: 1, borderColor: '#FF6B35' },
  rewardText:  { marginLeft: 8, color: '#333', fontSize: 14 },
  btn:         { backgroundColor: '#007BFF', padding: 15, borderRadius: 8, alignItems: 'center' },
  btnText:     { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default ReviewScreen;