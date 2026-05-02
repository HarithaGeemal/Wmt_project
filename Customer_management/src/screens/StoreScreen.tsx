import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import Ionicons from '@react-native-vector-icons/ionicons';
import { fetchCategories, fetchProducts, Category, Product } from '../api/apiClient';
import { MainRoutes, MainStackParamList } from 'navigation/Routes';
import SearchBar from 'components/SearchBar';
import CartBar from 'components/CartBar';
import { useCartStore } from '../store/useCartStore';

const StoreScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: categories, isLoading: catLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const { data: productsData, isLoading: prodLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const allProducts = useMemo(() => {
    if (selectedCategory && categories) {
      const cat = categories.find(c => c.name === selectedCategory);
      return cat?.products || [];
    }
    return productsData || [];
  }, [selectedCategory, categories, productsData]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return allProducts;
    return allProducts.filter((p: any) =>
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [allProducts, searchQuery]);

  const isLoading = catLoading || prodLoading;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#15803d' }}>
      <StatusBar barStyle="light-content" backgroundColor="#15803d" translucent={false} />

      {/* Green Header — matches HomeScreen */}
      <View className="bg-green-700">
        <View className="px-4 pt-3 pb-1">
          <Text className="text-white text-[22px] font-bold">Store</Text>
        </View>
        <View className="px-4 pb-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </View>
      </View>

      {/* White Content Area — same rounded-t-3xl as HomeScreen */}
      <View className="flex-1 bg-white rounded-t-3xl mt-[-2px]">

        {/* Category Pills */}
        <View className="pt-4 pb-2">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            <Pressable
              onPress={() => setSelectedCategory(null)}
              className={`mr-2.5 px-4 py-2 rounded-full border ${
                selectedCategory === null
                  ? 'bg-green-600 border-green-600'
                  : 'bg-white border-gray-200'
              }`}
            >
              <Text
                className={`text-[13px] font-semibold ${
                  selectedCategory === null ? 'text-white' : 'text-gray-600'
                }`}
              >
                All
              </Text>
            </Pressable>
            {(categories || []).map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() =>
                  setSelectedCategory(
                    selectedCategory === cat.name ? null : cat.name,
                  )
                }
                className={`mr-2.5 px-4 py-2 rounded-full border ${
                  selectedCategory === cat.name
                    ? 'bg-green-600 border-green-600'
                    : 'bg-white border-gray-200'
                }`}
              >
                <Text
                  className={`text-[13px] font-semibold ${
                    selectedCategory === cat.name
                      ? 'text-white'
                      : 'text-gray-600'
                  }`}
                >
                  {cat.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Products Grid */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#16a34a" />
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            keyExtractor={(item: any) => item.id}
            numColumns={2}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 90, paddingTop: 4 }}
            columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 14 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }: { item: any }) => (
              <StoreProductCard item={item} navigation={navigation} />
            )}
            ListEmptyComponent={
              <View className="items-center justify-center pt-20">
                <Ionicons name="search-outline" size={48} color="#d1d5db" />
                <Text className="text-gray-400 font-semibold text-[15px] mt-4">
                  {searchQuery ? 'No results found' : 'No products available'}
                </Text>
              </View>
            }
          />
        )}
      </View>

      <CartBar />
    </SafeAreaView>
  );
};

// ─── Product Card (matches ProductsCard.tsx style) ──────────
type StoreCardProps = {
  item: Product & { description?: string };
  navigation: NativeStackNavigationProp<MainStackParamList>;
};

function StoreProductCard({ item, navigation }: StoreCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const qty = useCartStore((s) => s.getItemQty(item.id));
  const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;

  const screen = require('react-native').Dimensions.get('window').width;
  const cardWidth = (screen - 16 * 2 - 14) / 2; // px-4 on both sides + gap

  return (
    <Pressable
      style={{ width: cardWidth }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm mb-1"
      onPress={() => navigation.navigate(MainRoutes.ProductDetails, { productId: item.id })}
    >
      {/* Image */}
      <View className="h-[150px] bg-gray-100 relative">
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center bg-gray-200">
            <Text className="text-gray-400 font-bold text-xl">
              {item.name?.substring(0, 2)?.toUpperCase()}
            </Text>
          </View>
        )}

        {/* Pack Badge */}
        <View className="absolute top-2 right-2 bg-gray-800/70 rounded-full px-2.5 py-1 flex-row items-center">
          <Ionicons name="cube-outline" size={10} color="#fff" />
          <Text className="text-[10px] font-semibold text-white ml-1">1 pack</Text>
        </View>
      </View>

      {/* Info */}
      <View className="px-3 pt-2.5 pb-2.5">
        <Text
          className="text-[13px] font-bold text-gray-900 leading-[18px]"
          numberOfLines={2}
        >
          {item.name}
        </Text>

        {/* Price + ADD */}
        <View className="flex-row items-center justify-between mt-1.5">
          <Text className="text-[15px] font-extrabold text-gray-900">
            ${price}
          </Text>

          {qty === 0 ? (
            <Pressable
              className="px-1"
              onPress={() =>
                addItem({
                  id: item.id,
                  name: item.name,
                  price,
                  imageUrl: item.imageUrl,
                })
              }
            >
              <Text className="text-green-600 font-extrabold text-[13px] tracking-wider">ADD</Text>
            </Pressable>
          ) : (
            <View className="flex-row items-center bg-green-600 rounded-md overflow-hidden">
              <Pressable className="px-2 py-0.5" onPress={() => removeItem(item.id)}>
                <Text className="text-white font-bold text-[13px]">−</Text>
              </Pressable>
              <Text className="text-white font-bold text-[12px] px-1.5">{qty}</Text>
              <Pressable
                className="px-2 py-0.5"
                onPress={() =>
                  addItem({
                    id: item.id,
                    name: item.name,
                    price,
                    imageUrl: item.imageUrl,
                  })
                }
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
  );
}

export default StoreScreen;