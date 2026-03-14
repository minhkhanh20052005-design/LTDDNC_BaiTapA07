import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

import LoginScreen           from '../screens/Auth/LoginScreen';
import RegisterScreen        from '../screens/Auth/RegisterScreen';
import ForgotPasswordScreen  from '../screens/Auth/ForgotPasswordScreen';
import HomeScreen            from '../screens/Home/HomeScreen';
import ProfileScreen         from '../screens/Profile/ProfileScreen';
import EditProfileScreen     from '../screens/Profile/EditProfileScreen';
import ProductDetailScreen   from '../screens/Home/ProductDetailScreen';
import CartScreen            from '../screens/Cart/CartScreen';
import CheckoutScreen        from '../screens/Cart/CheckoutScreen';
import OrderHistoryScreen    from '../screens/Profile/OrderHistoryScreen';
import ReviewScreen          from '../screens/Review/ReviewScreen';
import WishlistScreen        from '../screens/Wishlist/WishlistScreen';
import RecentlyViewedScreen  from '../screens/Wishlist/RecentlyViewedScreen';
import VoucherScreen from '../screens/Wishlist/VoucherScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { token } = useSelector((state: RootState) => state.auth);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <>
            <Stack.Screen name="Home"           component={HomeScreen} />
            <Stack.Screen name="Profile"        component={ProfileScreen} />
            <Stack.Screen name="EditProfile"    component={EditProfileScreen} />
            <Stack.Screen name="ProductDetail"  component={ProductDetailScreen} />
            <Stack.Screen name="Cart"           component={CartScreen} />
            <Stack.Screen name="Checkout"       component={CheckoutScreen} />
            <Stack.Screen name="OrderHistory"   component={OrderHistoryScreen} />
            <Stack.Screen name="Review"         component={ReviewScreen} />
            <Stack.Screen name="Wishlist"       component={WishlistScreen} />
            <Stack.Screen name="RecentlyViewed" component={RecentlyViewedScreen} />
            <Stack.Screen name="Voucher" component={VoucherScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login"          component={LoginScreen} />
            <Stack.Screen name="Register"       component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;