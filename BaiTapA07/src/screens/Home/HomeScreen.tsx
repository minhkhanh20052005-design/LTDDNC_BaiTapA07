import React, { useEffect, useState, memo } from 'react';
import { 
  View, Text, TextInput, Image, StyleSheet, FlatList, 
  TouchableOpacity, ActivityIndicator, Dimensions, Modal, Alert 
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import axiosClient from '../../api/axiosClient';
import { logout } from '../../store/slices/authSlice';
import { toggleWishlist, fetchWishlist } from '../../store/slices/wishlistSlice';

const { width } = Dimensions.get('window');

// --- COMPONENT HEADER ---
const HomeHeader = memo(({ 
  user, searchText, setSearchText, handleClearSearch,
  categories, selectedCategory, setSelectedCategory,
  bestSellers, activeSearch, handleAvatarPress,
  handleProductPress
}: any) => {
  return (
    <View>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Xin chào,</Text>
          <Text style={styles.username}>{user?.name || 'Khách'}</Text>
        </View>
        <TouchableOpacity onPress={handleAvatarPress}>
          <Image 
            source={{ uri: user?.avatar || 'https://via.placeholder.com/150' }} 
            style={styles.avatar} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#888" />
        <TextInput 
          placeholder="Tìm kiếm sản phẩm..." 
          style={styles.searchInput} 
          value={searchText}
          onChangeText={setSearchText} 
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch}>
            <Icon name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        horizontal
        data={categories}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ paddingRight: 15, marginBottom: 15 }}
        renderItem={({ item }) => {
          const isSelected = activeSearch ? item === 'Tất cả' : selectedCategory === item;
          return (
            <TouchableOpacity 
              style={[styles.categoryItem, isSelected && styles.categoryItemActive]}
              onPress={() => {
                setSelectedCategory(item);
                if (activeSearch) handleClearSearch(); 
              }}
            >
              <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>{item}</Text>
            </TouchableOpacity>
          );
        }}
      />

      {selectedCategory === 'Tất cả' && !activeSearch && bestSellers.length > 0 ? (
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.sectionTitle}>Bán chạy nhất (Top 10)</Text>
          <FlatList
            horizontal
            data={bestSellers}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item: any) => item._id}
            contentContainerStyle={{ paddingRight: 15 }}
            renderItem={({ item }: any) => (
              <TouchableOpacity 
                style={styles.productCardHorizontal}
                onPress={() => handleProductPress(item)}
              >
                <Image source={{ uri: item.image }} style={styles.productImageHorizontal} />
                <Text numberOfLines={1} style={styles.productName}>{item.name}</Text>
                <Text style={styles.price}>{item.price.toLocaleString()}đ</Text>
                <Text style={styles.soldText}>Đã bán: {item.soldCount}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>
        {activeSearch ? `Kết quả cho "${activeSearch}"` : 
         selectedCategory === 'Tất cả' ? 'Gợi ý cho bạn' : 
         selectedCategory === 'Đang khuyến mãi' ? 'Săn Sale Giá Sốc' : 
         `Điện thoại ${selectedCategory}`}
      </Text>
    </View>
  );
});

// --- MAIN SCREEN ---
const HomeScreen = () => {
  const { user }  = useSelector((state: any) => state.auth);
  const { items: wishlistItems } = useSelector((state: any) => state.wishlist);
  const navigation: any = useNavigation();
  const dispatch = useDispatch<any>(); 

  const [categories,   setCategories]   = useState<string[]>([]);
  const [bestSellers,  setBestSellers]  = useState<any[]>([]);
  const [products,     setProducts]     = useState<any[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [loadingMore,  setLoadingMore]  = useState(false);
  const [page,         setPage]         = useState(1);
  const [hasMore,      setHasMore]      = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [searchText,   setSearchText]   = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [menuVisible,  setMenuVisible]  = useState(false);

  // Debounce tìm kiếm
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setActiveSearch(searchText);
    }, 800);
    return () => clearTimeout(delayDebounceFn);
  }, [searchText]);

  useEffect(() => {
    fetchInitialData();
    dispatch(fetchWishlist()); // Fetch wishlist khi vào HomeScreen
  }, []);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setProducts([]);
    const categoryToUse = activeSearch ? 'Tất cả' : selectedCategory;
    fetchProducts(1, categoryToUse, activeSearch, true); 
  }, [selectedCategory, activeSearch]);

  const fetchInitialData = async () => {
    try {
      const [catRes, bestRes] = await Promise.all([
        axiosClient.get('/products/categories'),
        axiosClient.get('/products?type=best-seller&limit=10'),
      ]);
      setCategories(['Tất cả', 'Đang khuyến mãi', ...catRes.data]);
      setBestSellers(bestRes.data);
    } catch (error) {
      console.error('Lỗi data ban đầu:', error);
    }
  };

  const fetchProducts = async (pageNumber: number, category: string, search: string, isRefresh = false) => {
    try {
      if (isRefresh) setLoading(true);
      let url = `/products?page=${pageNumber}&limit=10`;
      if (search) {
        url += `&keyword=${search}`;
      } else {
        if (category === 'Đang khuyến mãi') url += '&type=promotion';
        else if (category !== 'Tất cả') url += `&category=${category}`;
      }
      const res         = await axiosClient.get(url);
      const newProducts = res.data;
      if (newProducts.length < 10) setHasMore(false);
      if (isRefresh) setProducts(newProducts);
      else setProducts(prev => [...prev, ...newProducts]);
    } catch (error) {
      console.error('Lỗi lấy sp:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && !loading && hasMore) {
      setLoadingMore(true);
      const nextPage      = page + 1;
      const categoryToUse = activeSearch ? 'Tất cả' : selectedCategory;
      setPage(nextPage);
      fetchProducts(nextPage, categoryToUse, activeSearch, false);
    }
  };

  const handleClearSearch = () => {
    setSearchText('');
    setActiveSearch(''); 
  };

  const handleAvatarPress = () => setMenuVisible(true);

  const handleProductPress = (product: any) => {
    navigation.navigate('ProductDetail', { product });
  };

  const handleToggleWishlist = async (productId: string) => {
    await dispatch(toggleWishlist(productId));
    dispatch(fetchWishlist()); // Refresh để cập nhật icon tim
  };

  const handleMenuOption = (option: string) => {
    setMenuVisible(false);
    setTimeout(() => {
      if      (option === 'Profile')      navigation.navigate('Profile');
      else if (option === 'Cart')         navigation.navigate('Cart');
      else if (option === 'OrderHistory') navigation.navigate('OrderHistory');
      else if (option === 'Wishlist')     navigation.navigate('Wishlist');
      else if (option === 'RecentlyViewed') navigation.navigate('RecentlyViewed');
      else if (option === 'Voucher') navigation.navigate('Voucher');
      else if (option === 'Logout') {
        Alert.alert('Đăng xuất', 'Bạn muốn đăng xuất?', [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Đồng ý', onPress: () => dispatch(logout()) }
        ]);
      }
    }, 100);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={
          <HomeHeader 
            user={user}
            searchText={searchText}
            setSearchText={setSearchText}
            handleClearSearch={handleClearSearch}
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            bestSellers={bestSellers}
            activeSearch={activeSearch}
            handleAvatarPress={handleAvatarPress}
            handleProductPress={handleProductPress}
          />
        }
        ListEmptyComponent={
          !loading ? <Text style={{ textAlign: 'center', marginTop: 20 }}>Không tìm thấy sản phẩm nào.</Text> : null
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? <ActivityIndicator size="small" color="#007BFF" style={{ marginVertical: 10 }} /> : null
        }
        renderItem={({ item }) => {
          const isLiked = wishlistItems.some((p: any) => p._id === item._id);
          return (
            <TouchableOpacity 
              style={styles.productCardGrid}
              onPress={() => handleProductPress(item)}
            >
              {/* Icon trái tim góc trên phải */}
              <TouchableOpacity
                style={styles.heartBtn}
                onPress={() => handleToggleWishlist(item._id)}
              >
                <Icon
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isLiked ? 'red' : '#ccc'}
                />
              </TouchableOpacity>

              <Image source={{ uri: item.image }} style={styles.productImageGrid} resizeMode="contain" />
              <Text numberOfLines={2} style={styles.productName}>{item.name}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                <Text style={styles.price}>{item.price.toLocaleString()}đ</Text>
                {item.discount > 0 && <Text style={styles.discountText}>-{item.discount}%</Text>}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Modal Menu */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <Text style={styles.menuTitle}>Tài khoản</Text>

            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('Profile')}>
              <Icon name="person-outline" size={22} color="#333" />
              <Text style={styles.menuText}>Hồ sơ cá nhân</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('Cart')}>
              <Icon name="cart-outline" size={22} color="#333" />
              <Text style={styles.menuText}>Giỏ hàng của tôi</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('Wishlist')}>
              <Icon name="heart-outline" size={22} color="#333" />
              <Text style={styles.menuText}>Sản phẩm yêu thích</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('RecentlyViewed')}>
              <Icon name="eye-outline" size={22} color="#333" />
              <Text style={styles.menuText}>Đã xem gần đây</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('Voucher')}>
              <Icon name="pricetag-outline" size={22} color="#FF6B35" />
              <Text style={styles.menuText}>Voucher khuyến mãi</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('OrderHistory')}>
              <Icon name="time-outline" size={22} color="#333" />
              <Text style={styles.menuText}>Lịch sử mua hàng</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('Logout')}>
              <Icon name="log-out-outline" size={22} color="red" />
              <Text style={[styles.menuText, { color: 'red' }]}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container:              { flex: 1, backgroundColor: '#f5f5f5', paddingHorizontal: 15 },
  header:                 { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, marginTop: 15 },
  welcome:                { fontSize: 14, color: '#666' },
  username:               { fontSize: 18, fontWeight: 'bold' },
  avatar:                 { width: 50, height: 50, borderRadius: 25, backgroundColor: '#ddd', borderWidth: 1, borderColor: '#fff' },
  searchContainer:        { flexDirection: 'row', backgroundColor: '#fff', padding: 10, borderRadius: 10, alignItems: 'center', marginBottom: 15, elevation: 2 },
  searchInput:            { marginLeft: 10, flex: 1, color: '#000' },
  categoryItem:           { backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#ddd' },
  categoryItemActive:     { backgroundColor: '#007BFF', borderColor: '#007BFF' },
  categoryText:           { fontWeight: '500', color: '#333' },
  categoryTextActive:     { color: '#fff', fontWeight: 'bold' },
  sectionTitle:           { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  productCardHorizontal:  { backgroundColor: '#fff', padding: 10, borderRadius: 10, marginRight: 15, width: 140, elevation: 2 },
  productImageHorizontal: { width: '100%', height: 100, borderRadius: 5, marginBottom: 5, resizeMode: 'contain' },
  soldText:               { fontSize: 10, color: '#888', marginTop: 2 },
  productCardGrid:        { width: (width - 40) / 2, backgroundColor: '#fff', padding: 10, borderRadius: 10, marginBottom: 15, elevation: 2 },
  productImageGrid:       { width: '100%', height: 140, borderRadius: 5, marginBottom: 5 },
  heartBtn:               { position: 'absolute', top: 6, right: 6, zIndex: 1, padding: 4 },
  productName:            { fontSize: 14, marginBottom: 2, color: '#333', fontWeight: '500' },
  price:                  { color: 'red', fontWeight: 'bold' },
  discountText:           { color: 'white', backgroundColor: '#d32f2f', fontSize: 10, paddingHorizontal: 5, borderRadius: 4, overflow: 'hidden' },
  modalOverlay:           { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  menuContainer:          { width: '80%', backgroundColor: '#fff', borderRadius: 15, padding: 20, elevation: 5 },
  menuTitle:              { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  menuItem:               { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  menuText:               { fontSize: 16, marginLeft: 15, fontWeight: '500', color: '#333' },
  divider:                { height: 1, backgroundColor: '#eee', marginVertical: 10 },
});

export default HomeScreen;