import React, { useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchWishlist, toggleWishlist } from '../../store/slices/wishlistSlice';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const WishlistScreen = () => {
  const dispatch    = useDispatch<any>();
  const navigation: any = useNavigation();
  const { items, status } = useSelector((state: any) => state.wishlist);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, []);

  const handleRemove = (productId: string, productName: string) => {
    Alert.alert(
      'Xóa yêu thích',
      `Bỏ "${productName}" khỏi danh sách yêu thích?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa', style: 'destructive',
          onPress: () => dispatch(toggleWishlist(productId))
        }
      ]
    );
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.image} resizeMode="contain" />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.category}>{item.category}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{item.price.toLocaleString()}đ</Text>
          {item.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{item.discount}%</Text>
            </View>
          )}
        </View>
      </View>
      {/* Nút xóa */}
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => handleRemove(item._id, item.name)}
      >
        <Icon name="heart-dislike-outline" size={22} color="red" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sản phẩm yêu thích</Text>
        <View style={{ width: 24 }} />
      </View>

      {status === 'idle' || status === 'loading' ? (
        <ActivityIndicator size="large" color="#007BFF" style={{ marginTop: 30 }} />
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="heart-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>Chưa có sản phẩm yêu thích</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.shopBtnText}>Khám phá ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item: any) => item._id}
          contentContainerStyle={{ padding: 15 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f5f5f5' },
  header:       { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', alignItems: 'center', elevation: 2 },
  headerTitle:  { fontSize: 18, fontWeight: 'bold' },
  card:         { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 10, marginBottom: 12, padding: 10, alignItems: 'center', elevation: 2 },
  image:        { width: 80, height: 80, borderRadius: 8, backgroundColor: '#f9f9f9' },
  info:         { flex: 1, marginLeft: 12 },
  name:         { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  category:     { fontSize: 12, color: '#888', marginBottom: 6 },
  priceRow:     { flexDirection: 'row', alignItems: 'center' },
  price:        { fontSize: 15, color: 'red', fontWeight: 'bold', marginRight: 8 },
  discountBadge:{ backgroundColor: 'red', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  discountText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  removeBtn:    { padding: 8 },
  empty:        { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText:    { fontSize: 16, color: '#999', marginTop: 12, marginBottom: 20 },
  shopBtn:      { backgroundColor: '#007BFF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  shopBtnText:  { color: '#fff', fontWeight: 'bold' },
});

export default WishlistScreen;