import React from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, Dimensions,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { clearRecentlyViewed } from '../../store/slices/recentlyViewedSlice';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 45) / 2;

const RecentlyViewedScreen = () => {
  const dispatch    = useDispatch<any>();
  const navigation: any = useNavigation();
  const { items }   = useSelector((state: any) => state.recentlyViewed);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
      activeOpacity={0.85}
    >
      <Image source={{ uri: item.image }} style={styles.image} resizeMode="contain" />
      <Text numberOfLines={2} style={styles.name}>{item.name}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.price}>{item.price.toLocaleString()}đ</Text>
        {item.discount > 0 && (
          <Text style={styles.discount}>-{item.discount}%</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đã xem gần đây</Text>
        {items.length > 0 ? (
          <TouchableOpacity onPress={() => dispatch(clearRecentlyViewed())}>
            <Text style={styles.clearText}>Xóa tất cả</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="eye-off-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>Chưa có sản phẩm nào đã xem</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.shopBtnText}>Khám phá ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item: any) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={{ padding: 15 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#f5f5f5' },
  header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#fff', elevation: 2 },
  headerTitle:   { fontSize: 18, fontWeight: 'bold' },
  clearText:     { fontSize: 13, color: '#007BFF', fontWeight: '600' },
  columnWrapper: { justifyContent: 'space-between', marginBottom: 12 },
  card:          { width: CARD_WIDTH, backgroundColor: '#fff', borderRadius: 10, padding: 10, elevation: 2 },
  image:         { width: '100%', height: 130, borderRadius: 6, marginBottom: 8 },
  name:          { fontSize: 13, fontWeight: '500', color: '#333', marginBottom: 5 },
  priceRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price:         { fontSize: 13, color: 'red', fontWeight: 'bold' },
  discount:      { fontSize: 11, color: '#fff', backgroundColor: '#d32f2f', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  empty:         { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText:     { fontSize: 16, color: '#999', marginTop: 12, marginBottom: 20 },
  shopBtn:       { backgroundColor: '#007BFF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  shopBtnText:   { color: '#fff', fontWeight: 'bold' },
});

export default RecentlyViewedScreen;