import { Pressable, StatusBar, StyleSheet, Text, View, FlatList, Modal, TextInput } from 'react-native';
import React, { useState } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MainRoutes, MainStackParamList } from 'navigation/Routes';
import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '../api/apiClient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import ProductsCard from 'components/ProductsCard';
import CartBar from 'components/CartBar';

type Route = RouteProp<{ params: { categoryName?: string } }, 'params'>;

const CategoryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const initialCategoryName = route?.params?.categoryName;

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const [selectedCategoryName, setSelectedCategoryName] = useState(
    initialCategoryName || categories?.[0]?.name,
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedCategory = categories?.find((cat: any) => cat.name === selectedCategoryName);
  const allProducts = selectedCategory?.products || [];

  // Filter products by search query
  const products = searchQuery
    ? allProducts.filter((p: any) =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : allProducts;

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar barStyle={'dark-content'} backgroundColor="#fff" />

      {/* Header */}
      <View className='px-4 pt-3 pb-2 bg-white'>
        <View className='flex-row items-center justify-between'>
          <View className='flex-row items-center'>
            <Pressable className='p-2' onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color="#000" />
            </Pressable>

            <Pressable
              className='flex-row items-center gap-1 ml-1'
              onPress={() => setModalVisible(true)}
            >
              <Text className="text-[16px] font-semibold">{selectedCategoryName}</Text>
              <Ionicons name="chevron-down-outline" size={18} color="#000" />
            </Pressable>
          </View>

          <Pressable
            className="p-2"
            onPress={() => {
              setSearchVisible(!searchVisible);
              if (searchVisible) setSearchQuery('');
            }}
          >
            <Ionicons
              name={searchVisible ? 'close' : 'search-outline'}
              size={20}
              color="#000"
            />
          </Pressable>
        </View>

        {/* Search Bar */}
        {searchVisible && (
          <View className="mt-2 mb-1 flex-row items-center bg-gray-100 rounded-xl px-3 py-2">
            <Ionicons name="search-outline" size={18} color="#9ca3af" />
            <TextInput
              className="flex-1 ml-2 text-[14px] text-gray-900 p-0"
              placeholder="Search products..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#9ca3af" />
              </Pressable>
            )}
          </View>
        )}
      </View>

      {/* Products Grid */}
      <View className="flex-1">
        <FlatList
          data={products}
          keyExtractor={(i) => i.id}
          numColumns={2}
          contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 14 }}
          renderItem={({ item }) => <ProductsCard item={item} />}
          ListEmptyComponent={
            <Text className='text-gray-500 text-center mt-10'>
              {searchQuery ? 'No products match your search' : 'No Products in this Category'}
            </Text>
          }
        />
      </View>

      {/* Cart Bar */}
      <CartBar />

      {/* Category Selection Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/40"
          onPress={() => setModalVisible(false)}
        />
        <View className="bg-white rounded-t-3xl px-5 pt-5 pb-8 max-h-[60%]">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-gray-900">Select Category</Text>
            <Pressable className="p-1" onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#000" />
            </Pressable>
          </View>

          <FlatList
            data={categories || []}
            keyExtractor={(cat: any) => cat.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: cat }: { item: any }) => {
              const isSelected = cat.name === selectedCategoryName;
              return (
                <Pressable
                  className={`flex-row items-center justify-between py-3.5 px-4 rounded-xl mb-2 ${
                    isSelected ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                  }`}
                  onPress={() => {
                    setSelectedCategoryName(cat.name);
                    setModalVisible(false);
                    setSearchQuery('');
                  }}
                >
                  <View className="flex-row items-center">
                    <Text
                      className={`text-[15px] font-semibold ${
                        isSelected ? 'text-green-700' : 'text-gray-800'
                      }`}
                    >
                      {cat.name}
                    </Text>
                    <Text className="text-[12px] text-gray-400 ml-2">
                      {cat.products?.length || 0} items
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={22} color="#16a34a" />
                  )}
                </Pressable>
              );
            }}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CategoryScreen;
