import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
  RefreshControl,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { fetchAvailableOrders, acceptDeliveryOrder } from '../api/apiClient';
import Ionicons from '@react-native-vector-icons/ionicons';

const AvailableOrdersScreen = () => {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();

  const {
    data: orders,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['availableOrders'],
    queryFn: fetchAvailableOrders,
    refetchInterval: 30000,
  });

  const acceptMutation = useMutation({
    mutationFn: acceptDeliveryOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableOrders'] });
      queryClient.invalidateQueries({ queryKey: ['myDeliveries'] });
      Alert.alert(
        'Order Accepted! 🎉',
        'The order has been assigned to you. Check My Deliveries to track it.',
      );
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error || 'This order is no longer available.';
      Alert.alert('Could Not Accept', message);
    },
  });

  const handleAccept = useCallback(
    (orderId: string) => {
      Alert.alert(
        'Accept Delivery',
        'Are you sure you want to accept this order?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Accept',
            onPress: () => acceptMutation.mutate(orderId),
          },
        ],
      );
    },
    [acceptMutation],
  );

  const renderItem = ({ item }: any) => {
    const addr = item.addressId;
    const orderId = item.id || item._id;
    const itemCount =
      item.items?.reduce((acc: number, i: any) => acc + i.quantity, 0) ?? 0;
    const isCash = item.paymentMethod === 'cash';

    return (
      <Pressable
        onPress={() => navigation.navigate('DeliveryDetail', { orderId })}
        style={({ pressed }) => ({ opacity: pressed ? 0.95 : 1 })}
        className="bg-white rounded-2xl mb-3 overflow-hidden border border-gray-100"
        style={{
          shadowColor: '#000',
          shadowOpacity: 0.07,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
          elevation: 3,
          marginBottom: 14,
        }}
      >
        {/* Top Row */}
        <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mr-2">
              <Ionicons name="receipt-outline" size={15} color="#15803d" />
            </View>
            <Text className="text-[13px] font-bold text-gray-800">
              Order #{orderId?.toString().slice(-6).toUpperCase()}
            </Text>
          </View>
          {/* Payment badge */}
          <View
            className={`px-2.5 py-1 rounded-full ${isCash ? 'bg-amber-50' : 'bg-blue-50'}`}
          >
            <Text
              className={`text-[11px] font-bold ${isCash ? 'text-amber-700' : 'text-blue-700'}`}
            >
              {isCash ? '💵 Collect Cash' : '💳 Card Paid'}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View className="h-px bg-gray-100 mx-4" />

        {/* Address row */}
        <View className="flex-row items-start px-4 pt-3 pb-2">
          <Ionicons
            name="location-outline"
            size={16}
            color="#16a34a"
            style={{ marginTop: 1 }}
          />
          <View className="flex-1 ml-2">
            <Text className="text-[13px] font-semibold text-gray-900">
              {addr?.name || item.userId?.name || 'Customer'}
            </Text>
            <Text
              className="text-[12px] text-gray-500 mt-0.5"
              numberOfLines={2}
            >
              {addr
                ? `${addr.address}, ${addr.city}`
                : 'Address not available'}
            </Text>
          </View>
        </View>

        {/* Bottom Row */}
        <View className="flex-row items-center justify-between px-4 pt-1 pb-4">
          <View className="flex-row items-center">
            <Ionicons name="fast-food-outline" size={13} color="#9ca3af" />
            <Text className="text-[12px] text-gray-400 ml-1">
              {itemCount} item{itemCount !== 1 ? 's' : ''}
            </Text>
            <Text className="text-gray-300 mx-2">|</Text>
            <Text className="text-[14px] font-extrabold text-gray-900">
              LKR {item.totalAmount}
            </Text>
          </View>

          <Pressable
            onPress={() => handleAccept(orderId)}
            disabled={acceptMutation.isPending}
            className="bg-green-600 px-5 py-2 rounded-full flex-row items-center"
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
          >
            {acceptMutation.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons
                  name="checkmark-outline"
                  size={14}
                  color="#fff"
                />
                <Text className="text-white text-[13px] font-bold ml-1">
                  Accept
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#15803d' }}>
      <StatusBar barStyle="light-content" backgroundColor="#15803d" translucent={false} />

      {/* Green header — matches HomeScreen & StoreScreen */}
      <View className="bg-green-700">
        <View className="px-4 pt-3 pb-3 flex-row items-center justify-between">
          <View>
            <Text className="text-white text-[22px] font-bold">
              Available Orders
            </Text>
            {orders && (
              <Text className="text-green-200 text-[13px] mt-0.5">
                {orders.length} order{orders.length !== 1 ? 's' : ''} waiting
              </Text>
            )}
          </View>
          <Pressable
            onPress={() => navigation.navigate('MyDeliveries')}
            className="bg-white/20 px-3 py-2 rounded-xl flex-row items-center"
          >
            <Ionicons name="bicycle-outline" size={16} color="#fff" />
            <Text className="text-white text-[12px] font-semibold ml-1.5">
              My Deliveries
            </Text>
          </Pressable>
        </View>
      </View>

      {/* White content area — same pattern as HomeScreen */}
      <View className="flex-1 bg-white rounded-t-3xl mt-[-2px]">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#16a34a" />
            <Text className="text-gray-400 mt-3 text-[13px]">
              Looking for orders...
            </Text>
          </View>
        ) : isError ? (
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons name="cloud-offline-outline" size={48} color="#d1d5db" />
            <Text className="text-gray-500 mt-4 font-bold text-lg">
              Could not load orders
            </Text>
            <Pressable
              onPress={() => refetch()}
              className="mt-4 bg-green-600 px-6 py-2.5 rounded-full"
            >
              <Text className="text-white font-semibold">Retry</Text>
            </Pressable>
          </View>
        ) : orders?.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons name="hourglass-outline" size={56} color="#d1d5db" />
            <Text className="text-gray-600 mt-4 font-bold text-xl">
              No Orders Available
            </Text>
            <Text className="text-gray-400 text-[13px] mt-2 text-center">
              New customer orders will appear here automatically.
            </Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id || item._id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 16, paddingTop: 20 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor="#16a34a"
                colors={['#16a34a']}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default AvailableOrdersScreen;
