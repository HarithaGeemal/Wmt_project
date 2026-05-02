import { View, Text, FlatList, ActivityIndicator, Image, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { useRoute, RouteProp, useNavigation, NavigationProp } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProductsByCategory, deleteProduct } from '../api/apiClient';
import Ionicons from '@expo/vector-icons/Ionicons';

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  description?: string;
};

const getAvatarColor = (name: string) => {
    const colors = [
        { bg: '#dbeafe', text: '#2563eb' },
        { bg: '#dcfce7', text: '#16a34a' },
        { bg: '#f3e8ff', text: '#9333ea' },
        { bg: '#ffedd5', text: '#ea580c' },
        { bg: '#ffe4e6', text: '#e11d48' },
        { bg: '#ccfbf1', text: '#0d9488' },
    ];
    let hash = 0;
    if (name) {
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
};

const ProductItem = ({ item, categoryId }: { item: Product; categoryId: string }) => {
    const [imageError, setImageError] = useState(false);
    const navigation = useNavigation<NavigationProp<any>>();
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteProduct(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['products', categoryId] });
            await queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
        onError: error => {
            console.error('Error deleting product:', error);
            Alert.alert('Error', 'Failed to delete product.');
        },
    });

    const handleEdit = () => {
        navigation.navigate('EditProduct', { product: item, categoryId });
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Product',
            `Are you sure you want to delete\n${item.name} product`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteMutation.mutate(item.id),
                },
            ]
        );
    };

    return (
        <View 
            className="bg-white p-3 rounded-2xl mb-3 flex-row items-center justify-between border border-gray-100"
            style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2 }}
        >
            <View className="flex-row items-center flex-1">
                {item.imageUrl && !imageError ? (
                    <Image
                        source={{ uri: item.imageUrl }}
                        className="w-14 h-14 rounded-xl shrink-0 bg-gray-100"
                        style={{ width: 56, height: 56 }}
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <View
                        className="w-14 h-14 rounded-xl items-center justify-center shrink-0"
                        style={{ width: 56, height: 56, backgroundColor: getAvatarColor(item.name).bg }}
                    >
                        <Text 
                            className="text-2xl font-bold tracking-widest"
                            style={{ color: getAvatarColor(item.name).text }}
                        >
                            {item.name ? item.name.substring(0, 2).toUpperCase() : ''}
                        </Text>
                    </View>
                )}
                <View className="flex-1 ml-3 justify-center">
                    <Text
                        className="text-[16px] font-bold text-gray-800"
                        numberOfLines={1}
                    >
                        {item.name}
                    </Text>
                    {item.description ? (
                        <Text className="text-[12px] text-gray-500 mt-0.5" numberOfLines={2}>
                            {item.description.length > 50 ? item.description.substring(0, 50) + '...' : item.description}
                        </Text>
                    ) : null}
                    <Text className="text-[14px] text-blue-600 font-bold mt-0.5">
                        ${item.price}
                    </Text>
                </View>
            </View>
            <View className="flex-row items-center ml-2">
                <TouchableOpacity className="p-2.5 rounded-full bg-blue-50" onPress={handleEdit}>
                    <Ionicons name="pencil" size={18} color="#3b82f6" />
                </TouchableOpacity>
                <TouchableOpacity
                    className="p-2.5 rounded-full bg-red-50 ml-2"
                    onPress={handleDelete}
                    disabled={deleteMutation.isPending}
                >
                    {deleteMutation.isPending ? (
                        <ActivityIndicator size="small" color="#ef4444" />
                    ) : (
                        <Ionicons name="trash" size={18} color="#ef4444" />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const ProductScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<any, any>>();
  const { categoryId, categoryName } = (route?.params as any) ?? {
    categoryId: '',
    categoryName: '',
  };

  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ['products', categoryId],
    queryFn: () => fetchProductsByCategory(categoryId),
    enabled: !!categoryId,
  });

  return (
    <View className="flex-1 bg-gray-50">
      <View 
        className='flex-row items-center justify-between px-4 py-4 bg-white border-b border-gray-100 pb-4'
        style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2 }}
      >
        <Text className='text-xl font-bold text-gray-900 mt-1'>{categoryName ? `${categoryName} products` : 'Products'}</Text>
        <TouchableOpacity
          className="flex-row items-center bg-blue-600 px-3 py-2 rounded-lg mt-1"
          onPress={() => (navigation as any).navigate('AddProduct', { categoryId, categoryName })}
        >
          <Ionicons name="add-circle" size={18} color="#fff" />
          <Text className="text-white font-semibold ml-2">Add</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : products?.length === 0 ? (
        <View className="flex-1 justify-center items-center pt-24 pb-10 px-4">
            <Ionicons name="cube-outline" size={60} color="#9ca3af" />
            <Text className="text-gray-800 mt-4 font-bold text-lg">
                No Products Yet
            </Text>
            <Text className="text-gray-400 mt-2 text-sm text-center">
                Add products to carefully organize your items.
            </Text>
            <TouchableOpacity 
                className="bg-blue-600 px-6 py-3 rounded-lg mt-6"
                onPress={() => (navigation as any).navigate('AddProduct', { categoryId, categoryName })}
            >
                <Text className="text-white font-semibold text-base">
                    Create product
                </Text>
            </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => <ProductItem item={item} categoryId={categoryId} />}
        />
      )}
    </View>
  );
};

export default ProductScreen;