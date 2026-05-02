import React from 'react';
import { View, Text, FlatList, ActivityIndicator, Pressable, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUserOrders, updateOrderStatus } from '../api/apiClient';
import { useRoute } from '@react-navigation/native';

const UserOrdersScreen = () => {
    const route = useRoute();
    const { userId, userName } = route.params as { userId: string, userName?: string };
    const queryClient = useQueryClient();

    const { data: orders, isLoading, isError } = useQuery({
        queryKey: ['userOrders', userId],
        queryFn: () => fetchUserOrders(userId),
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => updateOrderStatus(id, status),
        onSuccess: (updatedOrder, variables) => {
            queryClient.setQueryData(['userOrders', userId], (oldData: any) => {
                if (!oldData) return [];
                return oldData.map((o: any) => (o.id === variables.id || o._id === variables.id) ? { ...o, ...updatedOrder } : o);
            });
            Alert.alert('Success', 'Order status updated');
        },
        onError: () => {
            Alert.alert('Error', 'Failed to update order status');
        }
    });

    const handleStatusChange = (id: string, currentStatus: string) => {
        const statuses = ['pending', 'processing', 'delivering', 'completed', 'cancelled'];
        const nextIndex = statuses.indexOf(currentStatus) + 1;
        const nextStatus = nextIndex < statuses.length ? statuses[nextIndex] : statuses[0];
        updateStatusMutation.mutate({ id, status: nextStatus });
    };

    const renderOrderItem = ({ item }: any) => {
        return (
            <View 
                className="bg-white p-4 rounded-xl mb-4 border border-gray-100"
                style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2 }}
            >
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-[13px] font-bold text-gray-800">Order ID: {item.id || item._id}</Text>
                    <Pressable 
                        className={`px-3 py-1 rounded-md ${item.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'}`}
                        onPress={() => handleStatusChange(item.id || item._id, item.status)}
                    >
                        <Text className={`text-[12px] font-bold capitalize ${item.status === 'completed' ? 'text-green-800' : 'text-yellow-800'}`}>
                            {item.status} (Tap to change)
                        </Text>
                    </Pressable>
                </View>
                <Text className="text-[12px] text-gray-500 mb-2">
                    Date: {new Date(item.createdAt).toLocaleDateString()}
                </Text>
                <View className="border-t border-gray-100 pt-2 mb-2">
                    {item.items && item.items.map((prod: any, idx: number) => (
                        <Text key={idx} className="text-[13px] text-gray-700">
                            {prod.quantity}x {prod.name}
                        </Text>
                    ))}
                </View>
                <View className="flex-row justify-between items-center mt-2">
                    <Text className="text-[14px] font-medium text-gray-600">Total:</Text>
                    <Text className="text-[15px] font-bold text-gray-900">LKR {item.totalAmount}</Text>
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-gray-50">
            <View 
                className="flex-row items-center justify-between px-4 py-4 bg-white border-b border-gray-100 pb-4"
                style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2 }}
            >
                <Text className="text-xl font-bold pl-2 mt-4 text-gray-800">
                    Orders for {userName || userId}
                </Text>
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#3b82f6" />
                </View>
            ) : isError ? (
                <View className="flex-1 items-center justify-center">
                    <Text className="text-red-500">Error loading orders</Text>
                </View>
            ) : orders?.length === 0 ? (
                <View className="flex-1 items-center justify-center pt-24 pb-10 px-4">
                    <Text className="text-gray-500 mt-4 font-bold text-lg">No Orders Yet</Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item: any) => item.id || item._id}
                    renderItem={renderOrderItem}
                    contentContainerStyle={{ padding: 16 }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

export default UserOrdersScreen;
