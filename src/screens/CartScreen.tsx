import {
  Pressable,
  StatusBar,
  Text,
  View,
  FlatList,
  Image,
  ScrollView,
} from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useQuery } from '@tanstack/react-query';
import { fetchAddresses } from '../api/apiClient';
import { useCartStore, CartItem } from '../store/useCartStore';

const CartScreen = () => {
  const navigation = useNavigation();
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalItems = useCartStore((s) => s.getTotalItems());
  const totalPrice = useCartStore((s) => s.getTotalPrice());

  const deliveryFee = totalPrice > 30 ? 0 : 3.99;
  const taxes = parseFloat((totalPrice * 0.05).toFixed(2));
  const grandTotal = parseFloat((totalPrice + deliveryFee + taxes).toFixed(2));

  const { data: addresses } = useQuery({ queryKey: ['addresses'], queryFn: fetchAddresses });
  const defaultAddress = addresses?.find(a => a.isDefault) || addresses?.[0];

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View className="flex-row items-center bg-white rounded-2xl p-3 mb-3 shadow-sm">
      {/* Product Image */}
      <View className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden">
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center bg-gray-200">
            <Text className="text-gray-400 font-bold">
              {item.name?.substring(0, 2)?.toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {/* Item Details */}
      <View className="flex-1 ml-3">
        <Text className="text-[14px] font-bold text-gray-900" numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="text-[14px] font-bold text-gray-700 mt-0.5">
          ${item.price}
        </Text>
      </View>

      {/* Quantity Stepper */}
      <View className="flex-row items-center bg-green-600 rounded-lg overflow-hidden">
        <Pressable
          className="px-3 py-2"
          onPress={() => removeItem(item.id)}
        >
          <Text className="text-white font-bold text-[14px]">−</Text>
        </Pressable>
        <Text className="text-white font-bold text-[13px] px-1">{item.qty}</Text>
        <Pressable
          className="px-3 py-2"
          onPress={() =>
            addItem({ id: item.id, name: item.name, price: item.price, imageUrl: item.imageUrl })
          }
        >
          <Text className="text-white font-bold text-[14px]">+</Text>
        </Pressable>
      </View>
    </View>
  );

  if (totalItems === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        {/* Header */}
        <View className="px-4 pt-3 pb-3 bg-white flex-row items-center shadow-sm">
          <Pressable className="p-2" onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#000" />
          </Pressable>
          <Text className="text-[18px] font-bold text-gray-900 ml-2">Your Cart</Text>
        </View>

        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="cart-outline" size={80} color="#d1d5db" />
          <Text className="text-xl font-bold text-gray-400 mt-4">Your cart is empty</Text>
          <Text className="text-[14px] text-gray-400 text-center mt-2">
            Browse categories and add items to get started
          </Text>
          <Pressable
            className="mt-6 bg-green-600 rounded-2xl px-8 py-3"
            onPress={() => navigation.goBack()}
          >
            <Text className="text-white font-bold text-[15px]">Browse Menu</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View className="px-4 pt-3 pb-3 bg-white flex-row items-center justify-between shadow-sm">
        <View className="flex-row items-center">
          <Pressable className="p-2" onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#000" />
          </Pressable>
          <View className="ml-2">
            <Text className="text-[18px] font-bold text-gray-900">Your Cart</Text>
            <Text className="text-[12px] text-gray-500">{totalItems} {totalItems === 1 ? 'item' : 'items'}</Text>
          </View>
        </View>
        <Pressable className="p-2" onPress={clearCart}>
          <Text className="text-red-500 font-semibold text-[13px]">Clear all</Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Cart Items */}
        <View className="px-4 pt-4">
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={renderCartItem}
            scrollEnabled={false}
          />
        </View>

        {/* Delivery Info */}
        <View className="mx-4 mt-2 bg-white rounded-2xl p-4 shadow-sm">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-green-50 items-center justify-center">
              <Ionicons name="bicycle-outline" size={20} color="#16a34a" />
            </View>
            <View className="ml-3">
              <Text className="text-[14px] font-bold text-gray-900">Delivery</Text>
              <Text className="text-[12px] text-gray-500">Estimated 16-25 mins</Text>
            </View>
          </View>

          <View className="h-[0.5px] bg-gray-200 my-3" />

          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center">
              <Ionicons name="location-outline" size={20} color="#3b82f6" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-[14px] font-bold text-gray-900">
                 Deliver to {defaultAddress?.type ? `(${defaultAddress.type})` : ''}
              </Text>
              <Text className="text-[12px] text-gray-500" numberOfLines={1}>
                {defaultAddress ? `${defaultAddress.address}, ${defaultAddress.city}` : 'No address saved.'}
              </Text>
            </View>
          </View>
        </View>

        {/* Bill Details */}
        <View className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm mb-4">
          <Text className="text-[16px] font-bold text-gray-900 mb-3">Bill Details</Text>

          <View className="flex-row justify-between mb-2">
            <Text className="text-[14px] text-gray-600">Subtotal</Text>
            <Text className="text-[14px] font-semibold text-gray-900">${totalPrice.toFixed(2)}</Text>
          </View>

          <View className="flex-row justify-between mb-2">
            <View className="flex-row items-center">
              <Text className="text-[14px] text-gray-600">Delivery fee</Text>
              {deliveryFee === 0 && (
                <View className="ml-2 bg-green-100 rounded-full px-2 py-0.5">
                  <Text className="text-[10px] text-green-700 font-bold">FREE</Text>
                </View>
              )}
            </View>
            <Text className={`text-[14px] font-semibold ${deliveryFee === 0 ? 'text-green-600' : 'text-gray-900'}`}>
              {deliveryFee === 0 ? '$0.00' : `$${deliveryFee.toFixed(2)}`}
            </Text>
          </View>

          <View className="flex-row justify-between mb-3">
            <Text className="text-[14px] text-gray-600">Taxes & charges</Text>
            <Text className="text-[14px] font-semibold text-gray-900">${taxes.toFixed(2)}</Text>
          </View>

          <View className="h-[0.5px] bg-gray-200 mb-3" />

          <View className="flex-row justify-between">
            <Text className="text-[16px] font-extrabold text-gray-900">Grand Total</Text>
            <Text className="text-[16px] font-extrabold text-gray-900">${grandTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Tip Section */}
        <View className="mx-4 mb-4 bg-white rounded-2xl p-4 shadow-sm">
          <Text className="text-[14px] font-bold text-gray-900 mb-1">Tip your delivery partner</Text>
          <Text className="text-[12px] text-gray-500 mb-3">Your tips are a direct way to appreciate their efforts</Text>
          <View className="flex-row gap-2">
            {['$1', '$2', '$5', 'Other'].map((tip) => (
              <Pressable
                key={tip}
                className="border border-gray-300 rounded-full px-5 py-2"
              >
                <Text className="text-[13px] font-semibold text-gray-700">{tip}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Bottom spacing for checkout button */}
        <View className="h-24" />
      </ScrollView>

      {/* Checkout Button */}
      <View className="absolute bottom-0 left-0 right-0 px-4 pb-5 pt-3 bg-white border-t border-gray-100">
        <Pressable
          className="bg-green-600 rounded-2xl py-4 flex-row items-center justify-center shadow-lg"
          onPress={() => navigation.navigate('CheckoutScreen' as any)}
        >
          <Text className="text-white font-bold text-[16px] mr-2">
            Proceed to Checkout · ${grandTotal.toFixed(2)}
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#fff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default CartScreen;
