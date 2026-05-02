import { Text, View, Pressable } from 'react-native';
import React from 'react';
import { useCartStore } from '../store/useCartStore';
import { useNavigation } from '@react-navigation/native';
import { MainRoutes } from 'navigation/Routes';
import Ionicons from '@react-native-vector-icons/ionicons';

const CartBar = () => {
  const totalItems = useCartStore((s) => s.getTotalItems());
  const totalPrice = useCartStore((s) => s.getTotalPrice());
  const navigation = useNavigation<any>();

  if (totalItems === 0) return null;

  return (
    <View className="absolute bottom-0 left-0 right-0 px-4 pb-4">
      <Pressable
        className="bg-green-600 rounded-2xl px-5 py-3.5 flex-row items-center justify-between shadow-lg"
        onPress={() => navigation.navigate('CartScreen' as any)}
      >
        <View className="flex-row items-center">
          <View className="bg-white/20 rounded-full px-2.5 py-1 mr-2">
            <Text className="text-white font-bold text-[13px]">{totalItems}</Text>
          </View>
          <Text className="text-white font-bold text-[14px]">
            {totalItems} {totalItems === 1 ? 'Item' : 'Items'} | ${totalPrice}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Text className="text-white font-bold text-[14px] mr-1">View Cart</Text>
          <Ionicons name="chevron-forward" size={16} color="#fff" />
        </View>
      </Pressable>
    </View>
  );
};

export default CartBar;
