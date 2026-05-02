import { View, Text, StyleSheet, StatusBar, ScrollView, Image, FlatList, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import BannerCarousel from 'components/BannerCarousel';
import { useQuery } from '@tanstack/react-query';
import { Category, fetchCategories, Product, fetchProducts } from '../api/apiClient';
import CategoryCard from 'components/CategoryCard';
import { MainRoutes, MainStackParamList } from 'navigation/Routes';


function CategorySkeletonRow() {
  const placeholders = Array.from({ length: 8 }, (_, i) => i.toString());

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className='pb-1 mt-2'>
        {placeholders?.map((k: any) => (
          <View key={k} className="items-center mr-4 w-20">
            <View className='h-16 w-16 rounded-full bg-zinc-200 animate-pulse' />
            <View className='h-3 w-14 rounded bg-zinc-200 animate-pulse mt-2' />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
const HomeScreen = () => {
  const [query, setQuery] = useState('');

  const { data: productsData, isLoading: isProductsLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const products = productsData ?? [];

  const { data: categories, isLoading: isCategoriesLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  return (
    <SafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: '#15803d' }}
    >
      <StatusBar
        barStyle={'light-content'}
        backgroundColor="#15803d"
        translucent={false}
      />
      <View className="bg-green-700">
        <Header />
        <View className="px-4 pb-4">
          <SearchBar value={query} onChange={setQuery} />
        </View>
      </View>

      <ScrollView className="flex-1 bg-white rounded-t-3xl mt-[-2px]">
        <View className="pb-10">
          <View className="pt-4">
            <BannerCarousel />
          </View>

          {/* Catogarise */}
          <View className="mt-3 px-4">
            <Text className='text-xl font-bold'>New Kitchen Essentials</Text>


            {isCategoriesLoading ? (
              <CategorySkeletonRow />

            ) : (
              <FlatList
                data={categories ?? []}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="mt-2"
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <CategoryCard name={item?.name} image={item?.imageUrl}
                  onPress={() => navigation.navigate(MainRoutes.Category, {categoryName : item?.name})} />}
              />
            )}

          </View>

          {/* <View>

            </View> */}
          <View className="mt-3 px-4">
            <View className="flex-row items-center mt-3 justify-between">
              <Text className="text-xl font-bold px-4 mt-1">Flash sale</Text>
              <Text className="text-sm text-purple-600 px-4 mt-1">
                View all
              </Text>
            </View>
          </View>

          <View className="mt-3 px-4">
            <View className="flex-row items-center mt-3 justify-between">
              <Text className="text-xl font-bold px-4 mt-1">Specials</Text>
              <Text className="text-sm text-purple-600 px-4 mt-1">
                View all
              </Text>
            </View>
          </View>

          {isProductsLoading ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="px-4" className="mt-2 text-left pb-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <View key={i} className="mr-3 mb-4 w-[140px]">
                  <View className='h-[100px] w-full bg-zinc-200 rounded-xl animate-pulse' />
                  <View className="mt-2">
                    <View className="h-3 w-28 bg-zinc-200 rounded animate-pulse" />
                    <View className="h-3 w-12 bg-zinc-200 rounded animate-pulse mt-1.5" />
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="px-4" className="mt-2 text-left pb-4">
              {products.map((product) => (
                <View key={product.id} className="mr-3 mb-4 w-[140px]">
                  <View className='h-[100px] w-full rounded-xl bg-gray-50 border border-gray-100 overflow-hidden items-center justify-center shadow-sm'>
                    {product.imageUrl ? (
                      <Image source={{ uri: product.imageUrl }} className="w-full h-full" resizeMode='cover' />
                    ) : (
                      <View className="w-full h-full bg-gray-100 items-center justify-center">
                        <Text className="text-gray-400 font-bold tracking-widest">{product.name?.substring(0, 2)?.toUpperCase()}</Text>
                      </View>
                    )}
                  </View>
                  <View className="mt-2">
                    <Text className="font-semibold text-[12px] text-gray-800" numberOfLines={1}>{product.name}</Text>
                    <Text className="font-bold text-gray-800 mt-0.5">${product.price}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
