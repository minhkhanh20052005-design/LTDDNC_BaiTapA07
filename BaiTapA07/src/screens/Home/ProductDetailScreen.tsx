import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  StyleSheet, Alert, FlatList, Dimensions, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { toggleWishlist, fetchWishlist } from '../../store/slices/wishlistSlice';
import { addRecentlyViewed } from '../../store/slices/recentlyViewedSlice'; 
import axiosClient from '../../api/axiosClient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 50) / 2;

const ProductDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route: any = useRoute();
  const { product } = route.params;
  const dispatch = useDispatch<any>();

  const { items: wishlistItems } = useSelector((state: any) => state.wishlist);
  const isLiked = wishlistItems.some((p: any) => p._id === product._id);

  const [similarProducts,  setSimilarProducts]  = useState<any[]>([]);
  const [loadingSimilar,   setLoadingSimilar]   = useState(false);
  const [reviews,          setReviews]          = useState<any[]>([]);
  const [avgRating,        setAvgRating]        = useState(0);
  const [totalReviews,     setTotalReviews]     = useState(0);
  const [soldCount,        setSoldCount]        = useState(product.soldCount || 0);
  const [showReviews,      setShowReviews]      = useState(false); //Ẩn/hiện đánh giá
  const [loadingReviews,   setLoadingReviews]   = useState(false);

  useEffect(() => {
    //Lưu vào đã xem khi mở màn hình
    dispatch(addRecentlyViewed(product));
    dispatch(fetchWishlist());
    fetchSimilarProducts();
    fetchReviewSummary(); // Chỉ lấy tổng số, không lấy chi tiết ngay
  }, [product._id]);

  const fetchSimilarProducts = async () => {
    try {
      setLoadingSimilar(true);
      const res = await axiosClient.get(
        `/products/${product._id}/similar?category=${encodeURIComponent(product.category)}`
      );
      setSimilarProducts(res.data);
    } catch (error) {
      console.error('Lỗi lấy sản phẩm tương tự:', error);
    } finally {
      setLoadingSimilar(false);
    }
  };

  // Chỉ lấy tổng số đánh giá để hiển thị badge
  const fetchReviewSummary = async () => {
    try {
      const res = await axiosClient.get(`/reviews/product/${product._id}`);
      setAvgRating(res.data.avgRating);
      setTotalReviews(res.data.totalReviews);
      setReviews(res.data.reviews);
    } catch (error) {
      console.error('Lỗi lấy đánh giá:', error);
    }
  };

  // Bấm vào "Bình luận, đánh giá" → toggle hiển thị
  const handleToggleReviews = async () => {
    setShowReviews(prev => !prev);
  };

  const handleAddToCart = async () => {
    try {
      await dispatch(addToCart({ productId: product._id, quantity: 1 })).unwrap();
      Alert.alert('Thành công', 'Đã thêm sản phẩm vào giỏ hàng');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thêm vào giỏ hàng');
    }
  };

  const handleToggleWishlist = async () => {
    await dispatch(toggleWishlist(product._id));
    dispatch(fetchWishlist());
  };

  const handleSimilarProductPress = useCallback((item: any) => {
    navigation.push('ProductDetail', { product: item });
  }, [navigation]);

  const renderSimilarItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.similarCard}
      onPress={() => handleSimilarProductPress(item)}
      activeOpacity={0.85}
    >
      <Image source={{ uri: item.image }} style={styles.similarImage} resizeMode="contain" />
      <Text numberOfLines={2} style={styles.similarName}>{item.name}</Text>
      <View style={styles.similarPriceRow}>
        <Text style={styles.similarPrice}>{item.price.toLocaleString()}đ</Text>
        {item.discount > 0 && (
          <Text style={styles.similarDiscount}>-{item.discount}%</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  // Render 1 dòng đánh giá
  const renderReviewItem = (review: any, index: number) => (
    <View key={index} style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <Image
          source={{ uri: review.userId?.avatar || 'https://via.placeholder.com/40' }}
          style={styles.reviewAvatar}
        />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.reviewUser}>{review.userId?.name || 'Người dùng'}</Text>
          <View style={styles.starsRow}>
            {[1,2,3,4,5].map(s => (
              <Icon
                key={s}
                name={s <= review.rating ? 'star' : 'star-outline'}
                size={14}
                color="#FFC107"
              />
            ))}
          </View>
        </View>
        <Text style={styles.reviewDate}>
          {new Date(review.createdAt).toLocaleDateString('vi-VN')}
        </Text>
      </View>
      {review.comment ? (
        <Text style={styles.reviewComment}>{review.comment}</Text>
      ) : null}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết sản phẩm</Text>
        <TouchableOpacity onPress={handleToggleWishlist} style={styles.heartBtn}>
          <Icon
            name={isLiked ? 'heart' : 'heart-outline'}
            size={26}
            color={isLiked ? 'red' : '#333'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Ảnh sản phẩm */}
        <Image source={{ uri: product.image }} style={styles.image} resizeMode="contain" />

        {/*Thanh thống kê: Đã bán | Bình luận đánh giá */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Icon name="bag-check-outline" size={16} color="#555" />
            <Text style={styles.statText}>Đã bán ({soldCount})</Text>
          </View>

          <View style={styles.statDivider} />

          <TouchableOpacity
            style={styles.statItem}
            onPress={handleToggleReviews}
            disabled={totalReviews === 0}
          >
            <Icon
              name={showReviews ? 'chatbubbles' : 'chatbubbles-outline'}
              size={16}
              color={totalReviews > 0 ? '#007BFF' : '#555'}
            />
            <Text style={[
              styles.statText,
              totalReviews > 0 && styles.statTextActive
            ]}>
              Bình luận, đánh giá ({totalReviews})
            </Text>
            {totalReviews > 0 && (
              <Icon
                name={showReviews ? 'chevron-up' : 'chevron-down'}
                size={14}
                color="#007BFF"
                style={{ marginLeft: 3 }}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Thông tin sản phẩm */}
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{product.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{product.price.toLocaleString()} đ</Text>
            {product.discount > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{product.discount}%</Text>
              </View>
            )}
          </View>

          <Text style={styles.sectionTitle}>Mô tả</Text>
          <Text style={styles.description}>{product.description || 'Chưa có mô tả.'}</Text>

          <Text style={styles.sectionTitle}>Hãng sản xuất</Text>
          <Text style={styles.subInfo}>{product.category}</Text>
        </View>

        {/* PHẦN BÌNH LUẬN ĐÁNH GIÁ (ẩn/hiện) */}
        {showReviews && (
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsTitleRow}>
              <Text style={styles.reviewsTitle}>Bình luận & Đánh giá</Text>
              <View style={styles.avgRatingBadge}>
                <Icon name="star" size={14} color="#FFC107" />
                <Text style={styles.avgRatingText}>{avgRating} / 5</Text>
              </View>
            </View>

            {reviews.length === 0 ? (
              <Text style={styles.noReviewText}>Chưa có đánh giá nào.</Text>
            ) : (
              reviews.map((r, i) => renderReviewItem(r, i))
            )}
          </View>
        )}

        {/* ===== GỢI Ý SẢN PHẨM TƯƠNG TỰ ===== */}
        <View style={styles.similarSection}>
          <Text style={styles.similarTitle}>Sản phẩm {product.category} khác</Text>

          {loadingSimilar ? (
            <ActivityIndicator size="small" color="#007BFF" style={{ marginVertical: 20 }} />
          ) : similarProducts.length === 0 ? (
            <Text style={styles.emptyText}>Không có sản phẩm tương tự.</Text>
          ) : (
            <FlatList
              data={similarProducts}
              renderItem={renderSimilarItem}
              keyExtractor={(item) => item._id}
              numColumns={2}
              columnWrapperStyle={styles.similarColumnWrapper}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.buyButton} onPress={handleAddToCart}>
          <Icon name="cart-outline" size={24} color="#fff" style={{ marginRight: 10 }} />
          <Text style={styles.buyText}>Thêm vào giỏ hàng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header:            { flexDirection: 'row', justifyContent: 'space-between', padding: 15, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle:       { fontSize: 18, fontWeight: 'bold' },
  heartBtn:          { padding: 4 },
  image:             { width: '100%', height: 300, backgroundColor: '#f9f9f9' },

  // Stats row
  statsRow:          { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#eee', paddingVertical: 10, paddingHorizontal: 15 },
  statItem:          { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  statDivider:       { width: 1, height: 20, backgroundColor: '#ddd' },
  statText:          { fontSize: 13, color: '#555', marginLeft: 5 },
  statTextActive:    { color: '#007BFF', fontWeight: '600' },

  // Info
  infoContainer:     { padding: 20 },
  name:              { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  priceRow:          { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  price:             { fontSize: 22, color: 'red', fontWeight: 'bold', marginRight: 10 },
  discountBadge:     { backgroundColor: 'red', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  discountText:      { color: 'white', fontWeight: 'bold', fontSize: 12 },
  sectionTitle:      { fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 5 },
  description:       { fontSize: 14, color: '#555', lineHeight: 22, marginBottom: 10 },
  subInfo:           { fontSize: 16, color: '#333' },

  // Reviews
  reviewsSection:    { marginHorizontal: 15, marginBottom: 5, backgroundColor: '#fff', borderRadius: 10, padding: 15, elevation: 1, borderWidth: 1, borderColor: '#eee' },
  reviewsTitleRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  reviewsTitle:      { fontSize: 16, fontWeight: 'bold', color: '#333' },
  avgRatingBadge:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF8E1', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  avgRatingText:     { fontSize: 13, fontWeight: 'bold', color: '#F57F17', marginLeft: 3 },
  noReviewText:      { textAlign: 'center', color: '#999', paddingVertical: 15 },
  reviewItem:        { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  reviewHeader:      { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  reviewAvatar:      { width: 36, height: 36, borderRadius: 18, backgroundColor: '#ddd' },
  reviewUser:        { fontSize: 13, fontWeight: 'bold', color: '#333' },
  starsRow:          { flexDirection: 'row', marginTop: 2 },
  reviewDate:        { fontSize: 11, color: '#aaa' },
  reviewComment:     { fontSize: 13, color: '#555', lineHeight: 20, marginTop: 4 },

  // Similar
  similarSection:       { paddingHorizontal: 15, paddingTop: 15, paddingBottom: 10, backgroundColor: '#f5f5f5', marginTop: 10 },
  similarTitle:         { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  similarColumnWrapper: { justifyContent: 'space-between', marginBottom: 12 },
  similarCard:          { width: CARD_WIDTH, backgroundColor: '#fff', borderRadius: 10, padding: 10, elevation: 2 },
  similarImage:         { width: '100%', height: 120, borderRadius: 6, marginBottom: 8 },
  similarName:          { fontSize: 13, fontWeight: '500', color: '#333', marginBottom: 5 },
  similarPriceRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  similarPrice:         { fontSize: 13, color: 'red', fontWeight: 'bold' },
  similarDiscount:      { fontSize: 11, color: '#fff', backgroundColor: '#d32f2f', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  emptyText:            { textAlign: 'center', color: '#888', marginVertical: 20 },

  // Footer
  footer:            { padding: 15, borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: '#fff' },
  buyButton:         { flexDirection: 'row', backgroundColor: '#007BFF', padding: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  buyText:           { color: 'white', fontWeight: 'bold', fontSize: 16 },
});

export default ProductDetailScreen;