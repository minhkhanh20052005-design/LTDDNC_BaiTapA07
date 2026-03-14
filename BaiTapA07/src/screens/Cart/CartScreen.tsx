import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart, removeFromCart } from '../../store/slices/cartSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const CartScreen = () => {
  const dispatch = useDispatch<any>();
  const navigation: any = useNavigation();
  const { items, status } = useSelector((state: any) => state.cart);
  
  // State lưu danh sách ID các sản phẩm ĐƯỢC CHỌN (Tích xanh)
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    dispatch(fetchCart());
  }, []);

  // Hàm xử lý chọn/bỏ chọn
  const toggleSelection = (productId: string) => {
    if (selectedItems.includes(productId)) {
      setSelectedItems(selectedItems.filter(id => id !== productId));
    } else {
      setSelectedItems([...selectedItems, productId]);
    }
  };

  // Hàm xử lý Xóa các mục đã chọn
  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) return Alert.alert('Thông báo', 'Vui lòng chọn sản phẩm cần xóa');
    
    Alert.alert('Xác nhận', `Xóa ${selectedItems.length} sản phẩm đã chọn?`, [
      { text: 'Hủy', style: 'cancel' },
      { 
        text: 'Xóa', 
        style: 'destructive', 
        onPress: () => {
           // Lặp qua từng ID để xóa (Hoặc viết API xóa nhiều ở backend tốt hơn, nhưng cách này nhanh cho bài tập)
           selectedItems.forEach(id => dispatch(removeFromCart(id)));
           setSelectedItems([]); // Reset selection
        } 
      }
    ]);
  };

  // Hàm chuyển sang màn hình Thanh toán
  const handleCheckout = () => {
    if (selectedItems.length === 0) return Alert.alert('Thông báo', 'Vui lòng chọn sản phẩm để thanh toán');
    
    // Lọc ra chi tiết các sản phẩm được chọn
    const productsToCheckout = items.filter((item: any) => selectedItems.includes(item.product._id));
    
    navigation.navigate('Checkout', { selectedProducts: productsToCheckout });
  };

  const renderItem = ({ item }: any) => {
    const isSelected = selectedItems.includes(item.product._id);
    return (
      <View style={styles.cartItem}>
        {/* Ô Vuông Checkbox */}
        <TouchableOpacity onPress={() => toggleSelection(item.product._id)} style={{padding: 5}}>
            <Icon 
                name={isSelected ? "checkbox" : "square-outline"} 
                size={24} 
                color={isSelected ? "#007BFF" : "#888"} 
            />
        </TouchableOpacity>

        <Image source={{ uri: item.product.image }} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>{item.product.name}</Text>
          <Text style={styles.price}>{item.product.price.toLocaleString()}đ</Text>
          <Text style={{fontSize: 12, color: '#666'}}>x{item.quantity}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giỏ hàng</Text>
        <View style={{width: 24}} /> 
      </View>

      {items.length === 0 ? (
        <View style={styles.center}><Text>Giỏ hàng trống</Text></View>
      ) : (
        <FlatList 
          data={items} 
          renderItem={renderItem} 
          keyExtractor={(item: any) => item._id} 
          contentContainerStyle={{padding: 15}}
        />
      )}

      {/* Footer 2 Nút: Xóa & Thanh Toán */}
      {items.length > 0 && (
        <View style={styles.footer}>
            <TouchableOpacity style={styles.btnDelete} onPress={handleDeleteSelected}>
                <Text style={{color: 'red', fontWeight: 'bold'}}>Xóa ({selectedItems.length})</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnCheckout} onPress={handleCheckout}>
                <Text style={{color: '#fff', fontWeight: 'bold'}}>Thanh toán ({selectedItems.length})</Text>
            </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cartItem: { flexDirection: 'row', backgroundColor: '#fff', padding: 10, borderRadius: 8, marginBottom: 10, alignItems: 'center' },
  image: { width: 70, height: 70, borderRadius: 5, marginHorizontal: 10 },
  info: { flex: 1 },
  name: { fontWeight: 'bold', fontSize: 14 },
  price: { color: 'red', fontWeight: 'bold' },
  footer: { flexDirection: 'row', padding: 15, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee' },
  btnDelete: { flex: 1, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'red', borderRadius: 5, padding: 12, marginRight: 10 },
  btnCheckout: { flex: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: '#007BFF', borderRadius: 5, padding: 12 }
});

export default CartScreen;