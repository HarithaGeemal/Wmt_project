import {
  Dimensions,
  Text,
  View,
  Pressable,
  Image,
} from 'react-native';
import React, { memo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useCartStore } from '../store/useCartStore';
import { MainRoutes, MainStackParamList } from 'navigation/Routes';

const screen = Dimensions.get('window').width;
const gap = 18;
const cardWidth = (screen - gap * 3) / 2;

type ProductItem = {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  imageUrl?: string;
};

type Props = {
  item: ProductItem;
};

function ProductsCard({ item }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const [liked, setLiked] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const qty = useCartStore((s) => s.getItemQty(item.id));

  const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;

  const handleAdd = () => {
    addItem({
      id: item.id,
      name: item.name,
      price: price,
      imageUrl: item.imageUrl,
    });
  };

  const handleRemove = () => {
    removeItem(item.id);
  };

  return (
    <View
      style={{ width: cardWidth }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm mb-1"
    >
      <Pressable onPress={() => navigation.navigate(MainRoutes.ProductDetails, { productId: item.id })}>
        {/* Image Section */}
        <View className="h-[150px] bg-gray-100 relative">
          {item?.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center bg-gray-200">
              <Text className="text-gray-400 font-bold text-xl">
                {item?.name?.substring(0, 2)?.toUpperCase()}
              </Text>
            </View>
          )}

          {/* Favorite Button */}
          <Pressable
            className="absolute top-2 left-2 w-7 h-7 rounded-full bg-white/90 items-center justify-center shadow-sm"
            onPress={() => setLiked(!liked)}
          >
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={15}
              color={liked ? '#ef4444' : '#9ca3af'}
            />
          </Pressable>

          {/* Pack Badge */}
          <View className="absolute top-2 right-2 bg-gray-800/70 rounded-full px-2.5 py-1 flex-row items-center">
            <Ionicons name="cube-outline" size={10} color="#fff" />
            <Text className="text-[10px] font-semibold text-white ml-1">1 pack</Text>
          </View>
        </View>

        {/* Product Info */}
        <View className="px-3 pt-2.5 pb-2.5">
          {/* Product Name */}
          <Text
            className="text-[13px] font-bold text-gray-900 leading-[18px]"
            numberOfLines={2}
          >
            {item?.name}
          </Text>

          {/* Price + ADD */}
          <View className="flex-row items-center justify-between mt-1.5">
            <Text className="text-[15px] font-extrabold text-gray-900">
              ${price}
            </Text>
            {qty === 0 ? (
              <Pressable
                className="px-1"
                onPress={handleAdd}
              >
                <Text className="text-green-600 font-extrabold text-[13px] tracking-wider">ADD</Text>
              </Pressable>
            ) : (
              <View className="flex-row items-center bg-green-600 rounded-md overflow-hidden">
                <Pressable
                  className="px-2 py-0.5"
                  onPress={handleRemove}
                >
                  <Text className="text-white font-bold text-[13px]">−</Text>
                </Pressable>
                <Text className="text-white font-bold text-[12px] px-1.5">{qty}</Text>
                <Pressable
                  className="px-2 py-0.5"
                  onPress={handleAdd}
                >
                  <Text className="text-white font-bold text-[13px]">+</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Divider */}
          <View className="h-[0.5px] bg-gray-200 mt-2 mb-1.5" />

          {/* Delivery ETA */}
          <View className="flex-row items-center">
            <Ionicons name="flash" size={11} color="#16a34a" />
            <Text className="text-[10px] text-green-600 font-bold ml-1 tracking-wide">
              GET IN 16 MINS
            </Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

export default memo(ProductsCard);
