import React from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchAvailableOrders, acceptDeliveryOrder } from '../api/apiClient';
import Ionicons from '@react-native-vector-icons/ionicons';

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  pending:    { bg: '#fef9c3', text: '#854d0e', label: 'Pending' },
  accepted:   { bg: '#dcfce7', text: '#166534', label: 'Accepted' },
  delivering: { bg: '#dbeafe', text: '#1e40af', label: 'Delivering' },
  completed:  { bg: '#f0fdf4', text: '#166534', label: 'Completed' },
  cancelled:  { bg: '#fee2e2', text: '#991b1b', label: 'Cancelled' },
};

const DeliveryDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { orderId } = route.params as { orderId: string };
  const queryClient = useQueryClient();

  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ['availableOrders'],
    queryFn: fetchAvailableOrders,
  });

  const order = orders?.find((o: any) => (o.id || o._id) === orderId);

  const acceptMutation = useMutation({
    mutationFn: acceptDeliveryOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableOrders'] });
      queryClient.invalidateQueries({ queryKey: ['myDeliveries'] });
      Alert.alert(
        'Order Accepted! 🎉',
        'You can track it in My Deliveries.',
        [
          { text: 'Go to My Deliveries', onPress: () => navigation.navigate('MyDeliveries') },
          { text: 'Stay here', style: 'cancel' },
        ],
      );
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || 'This order is no longer available.';
      Alert.alert('Could Not Accept', message);
    },
  });

  const handleAccept = () => {
    Alert.alert('Accept Delivery', 'Confirm you want to pick up this order?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Accept', onPress: () => acceptMutation.mutate(orderId) },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#15803d' }}>
        <StatusBar barStyle="light-content" backgroundColor="#15803d" />
        <View className="bg-green-700 px-4 pt-3 pb-4 flex-row items-center">
          <Pressable onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>
          <Text className="text-white text-[20px] font-bold">Order Detail</Text>
        </View>
        <View className="flex-1 bg-white rounded-t-3xl mt-[-2px] items-center justify-center">
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !order) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#15803d' }}>
        <StatusBar barStyle="light-content" backgroundColor="#15803d" />
        <View className="bg-green-700 px-4 pt-3 pb-4 flex-row items-center">
          <Pressable onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>
          <Text className="text-white text-[20px] font-bold">Order Detail</Text>
        </View>
        <View className="flex-1 bg-white rounded-t-3xl mt-[-2px] items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={48} color="#d1d5db" />
          <Text className="text-gray-500 mt-4 font-bold text-lg text-center">
            Order not found or no longer available
          </Text>
          <Pressable
            onPress={() => navigation.goBack()}
            className="mt-4 bg-green-600 px-6 py-2.5 rounded-full"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const addr = order.addressId;
  const sc = statusConfig[order.status] ?? statusConfig.pending;
  const isPending = order.status === 'pending';
  const isCash = order.paymentMethod === 'cash';

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#15803d' }}>
      <StatusBar barStyle="light-content" backgroundColor="#15803d" translucent={false} />

      {/* Green Header */}
      <View className="bg-green-700">
        <View className="px-4 pt-3 pb-4 flex-row items-center justify-between">
          <Pressable
            onPress={() => navigation.goBack()}
            className="flex-row items-center"
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
            <Text className="text-white text-[20px] font-bold ml-2">
              Order Detail
            </Text>
          </Pressable>
          <View
            className="px-3 py-1 rounded-full"
            style={{ backgroundColor: sc.bg }}
          >
            <Text
              className="text-[12px] font-bold capitalize"
              style={{ color: sc.text }}
            >
              {sc.label}
            </Text>
          </View>
        </View>
      </View>

      {/* White content area */}
      <View className="flex-1 bg-white rounded-t-3xl mt-[-2px]">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        >
          {/* Order ID strip */}
          <View className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 mb-5 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="receipt-outline" size={16} color="#16a34a" />
              <Text className="text-green-800 font-bold text-[14px] ml-2">
                Order #{(order.id || order._id)?.toString().slice(-6).toUpperCase()}
              </Text>
            </View>
            <Text className="text-green-600 text-[12px]">
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>

          {/* Delivery Address */}
          <Text className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            Delivery Address
          </Text>
          <View
            className="bg-white rounded-2xl p-4 mb-4 border border-gray-100"
            style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 }}
          >
            <View className="flex-row items-start">
              <View className="w-9 h-9 bg-green-100 rounded-full items-center justify-center mr-3 mt-0.5">
                <Ionicons name="location-outline" size={18} color="#15803d" />
              </View>
              {addr ? (
                <View className="flex-1">
                  <Text className="text-[14px] font-bold text-gray-900">
                    {addr.name}
                  </Text>
                  <Text className="text-[13px] text-gray-500 mt-0.5">
                    {addr.address}
                  </Text>
                  <Text className="text-[13px] text-gray-500">
                    {addr.city}
                    {addr.province ? `, ${addr.province}` : ''} {addr.zipCode}
                  </Text>
                  {addr.mobile && (
                    <View className="flex-row items-center mt-1.5">
                      <Ionicons name="call-outline" size={12} color="#9ca3af" />
                      <Text className="text-[12px] text-gray-400 ml-1">
                        {addr.mobile}
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <Text className="text-gray-400 text-[13px]">
                  Address details not available
                </Text>
              )}
            </View>
          </View>

          {/* Customer Info */}
          {order.userId && (
            <>
              <Text className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Customer
              </Text>
              <View
                className="bg-white rounded-2xl p-4 mb-4 border border-gray-100"
                style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 }}
              >
                <View className="flex-row items-center">
                  <View className="w-9 h-9 bg-green-100 rounded-full items-center justify-center mr-3">
                    <Text className="text-green-800 font-bold text-[14px]">
                      {(order.userId.name || order.userId.email || 'U')
                        .substring(0, 1)
                        .toUpperCase()}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-[14px] font-bold text-gray-900">
                      {order.userId.name || 'Unknown'}
                    </Text>
                    <Text className="text-[12px] text-gray-500 mt-0.5">
                      {order.userId.email}
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}

          {/* Items */}
          <Text className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            Items
          </Text>
          <View
            className="bg-white rounded-2xl p-4 mb-4 border border-gray-100"
            style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 }}
          >
            {order.items?.map((item: any, idx: number) => (
              <View
                key={idx}
                className={`flex-row justify-between items-center py-2 ${
                  idx < order.items.length - 1 ? 'border-b border-gray-50' : ''
                }`}
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-6 h-6 bg-green-100 rounded-full items-center justify-center mr-2">
                    <Text className="text-green-700 text-[10px] font-bold">
                      {item.quantity}x
                    </Text>
                  </View>
                  <Text
                    className="text-[13px] text-gray-700 flex-1"
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>
                </View>
                <Text className="text-[13px] font-semibold text-gray-800 ml-2">
                  LKR {(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
            <View className="border-t border-gray-100 mt-2 pt-2 flex-row justify-between">
              <Text className="text-[14px] font-bold text-gray-600">Total</Text>
              <Text className="text-[16px] font-extrabold text-gray-900">
                LKR {order.totalAmount}
              </Text>
            </View>
          </View>

          {/* Payment Method */}
          <Text className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            Payment
          </Text>
          <View
            className="bg-white rounded-2xl p-4 mb-6 border border-gray-100 flex-row items-center justify-between"
            style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 }}
          >
            <View className="flex-row items-center">
              <Ionicons
                name={isCash ? 'cash-outline' : 'card-outline'}
                size={20}
                color={isCash ? '#16a34a' : '#1e40af'}
              />
              <Text className="text-[14px] font-semibold text-gray-800 ml-2 capitalize">
                {order.paymentMethod}
              </Text>
            </View>
            <View
              className={`px-3 py-1 rounded-full ${
                isCash ? 'bg-amber-50' : 'bg-blue-50'
              }`}
            >
              <Text
                className={`text-[12px] font-bold ${
                  isCash ? 'text-amber-700' : 'text-blue-700'
                }`}
              >
                {isCash ? 'Collect from customer' : 'Already paid'}
              </Text>
            </View>
          </View>

          {/* Accept Button — only for pending orders */}
          {isPending && (
            <Pressable
              onPress={handleAccept}
              disabled={acceptMutation.isPending}
              className="bg-green-600 rounded-2xl py-4 items-center"
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            >
              {acceptMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View className="flex-row items-center">
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color="#fff"
                  />
                  <Text className="text-white text-[16px] font-extrabold ml-2">
                    Accept This Delivery
                  </Text>
                </View>
              )}
            </Pressable>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default DeliveryDetailScreen;
