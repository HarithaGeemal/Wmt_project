import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    FlatList,
    ActivityIndicator,
    Image,
    Alert,
} from 'react-native';
import React, { useState } from 'react';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCategories, deleteCategory } from '../api/apiClient';
import { useAuthStore } from '../store/useAuthStore';

type NavigationPropType = NavigationProp<any>;

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

const CategoryItem = ({ item }: { item: any }) => {
    const [imageError, setImageError] = useState(false);
    const navigation = useNavigation<NavigationPropType>();
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteCategory(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
        onError: error => {
            console.error('Error deleting category:', error);
            Alert.alert('Error', 'Failed to delete category.');
        },
    });

    const handleEdit = () => {
        navigation.navigate('EditCategory', { category: item });
    };

    const handleDelete = () => {
        const productCount = item.products ? item.products.length : 0;
        const message = productCount > 0
            ? `This category contains ${productCount} items. Deleting it will also remove all its items locally.\n\nAre you sure you want to delete "${item.name}"?`
            : `Are you sure you want to delete "${item.name}"?`;

        Alert.alert(
            'Delete Category',
            message,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteMutation.mutate(item.id),
                },
            ],
        );
    };

    return (
        <TouchableOpacity 
            className="bg-white p-4 rounded-xl mb-4 flex-row items-center justify-between border border-gray-100"
            style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2 }}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Product', { categoryId: item.id, categoryName: item.name })}
        >
            <View className="flex-row items-center flex-1">
                {item.imageUrl && !imageError ? (
                    <Image
                        source={{ uri: item.imageUrl }}
                        className="w-12 h-12 rounded-lg shrink-0 bg-gray-100"
                        style={{ width: 48, height: 48 }}
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <View
                        className="w-12 h-12 rounded-lg items-center justify-center shrink-0"
                        style={{ width: 48, height: 48, backgroundColor: getAvatarColor(item.name).bg }}
                    >
                        <Text 
                            className="text-xl font-bold tracking-widest"
                            style={{ color: getAvatarColor(item.name).text }}
                        >
                            {item.name ? item.name.substring(0, 2).toUpperCase() : ''}
                        </Text>
                    </View>
                )}
                <View className="flex-1 ml-4 justify-center">
                    <Text
                        className="text-lg font-semibold text-gray-800"
                        numberOfLines={1}
                    >
                        {item.name}
                    </Text>
                    <Text className="text-sm text-gray-500 mt-1 font-medium">
                        {item.products ? item.products.length : 0} {item.products?.length === 1 ? 'Product' : 'Products'}
                    </Text>
                </View>
            </View>
            <View className="flex-row items-center">
                <TouchableOpacity className="ml-2 p-2 rounded-full bg-blue-100" onPress={handleEdit}>
                    <Ionicons name="pencil" size={20} color="#6b7280" />
                </TouchableOpacity>
                <TouchableOpacity
                    className="ml-2 p-2 rounded-full bg-red-100"
                    onPress={handleDelete}
                    disabled={deleteMutation.isPending}
                >
                    {deleteMutation.isPending ? (
                        <ActivityIndicator size="small" color="#ef4444" />
                    ) : (
                        <Ionicons name="trash" size={20} color="#ef4444" />
                    )}
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const CategoriesScreen = () => {
    const navigation = useNavigation<NavigationPropType>();
    const { logout } = useAuthStore();

    const {
        data: categories,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories,
    });

    return (
        <View className="flex-1 bg-gray-50">
            <View 
                className="flex-row items-center justify-between px-4 py-4 bg-white border-b border-gray-100 pb-4"
                style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2 }}
            >
                <Text className="text-2xl font-bold pl-2 mt-4 text-gray-800">
                    Categories
                </Text>
                <View className="flex-row mt-5">
                    <TouchableOpacity
                        className="flex-row items-center bg-blue-600 px-3 py-2 rounded-lg"
                        onPress={() => navigation.navigate('AddCategory')}
                    >
                        <Ionicons name="add-circle" size={18} color="#fff" />
                        <Text className="text-white font-semibold ml-2">Add</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="flex-row items-center bg-red-100 px-3 py-2 rounded-lg ml-2"
                        onPress={logout}
                    >
                        <Ionicons name="log-out-outline" size={18} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>

            {isLoading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#2563eb" />
                </View>
            ) : isError ? (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-red-500">Error loading categories</Text>
                </View>
            ) : !categories || categories.length === 0 ? (
                <View className="flex-1 justify-center items-center pt-24 pb-10 px-4">
                    <Ionicons name="layers" size={60} color="#9ca3af" />
                    <Text className="text-gray-800 mt-4 font-bold text-lg">
                        No Categories Yet
                    </Text>
                    <Text className="text-gray-400 mt-2 text-sm text-center">
                        Create Categories to organize your products
                    </Text>
                    <TouchableOpacity 
                        className="bg-blue-600 px-6 py-3 rounded-lg mt-6"
                        onPress={() => navigation.navigate('AddCategory')}
                    >
                        <Text className="text-white font-semibold text-base">
                            Create category
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={categories}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ padding: 16 }}
                    renderItem={({ item }) => <CategoryItem item={item} /> }
                    ListEmptyComponent={() => (
                        <View className="flex-1 justify-center items-center pt-24 pb-10 px-4">
                            <Ionicons name="layers" size={60} color="#9ca3af" />
                            <Text className="text-gray-800 mt-4 font-bold text-lg">
                                No Categories Yet
                            </Text>
                            <Text className="text-gray-400 mt-2 text-sm text-center">
                                Create Categories to organize your products
                            </Text>
                            <TouchableOpacity 
                                className="bg-blue-600 px-6 py-3 rounded-lg mt-6"
                                onPress={() => navigation.navigate('AddCategory')}
                            >
                                <Text className="text-white font-semibold text-base">
                                    Create category
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}
        </View>
    );
};

export default CategoriesScreen;

const styles = StyleSheet.create({});
