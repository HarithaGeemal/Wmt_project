import React from 'react';
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
import { fetchMyDeliveries, markOrderDelivered, startDeliveryOrder } from '../api/apiClient';
import Ionicons from '@react-native-vector-icons/ionicons';

const statusConfig: Record<
  string,
  { bg: string; textColor: string; icon: string; label: string }
> = {
  pending: {
    bg: '#fef9c3',
    textColor: '#854d0e',
    icon: 'time-outline',
    label: 'Pending',
  },
  processing: {
    bg: '#dbeafe',
    textColor: '#1e40af',
    icon: 'construct-outline',
    label: 'Processing',
  },
  ready: {
    bg: '#ede9fe',
    textColor: '#6d28d9',
    icon: 'bicycle-outline',
    label: 'Ready for Pickup',
  },
  accepted: {
    bg: '#dcfce7',
    textColor: '#166534',
    icon: 'checkmark-circle-outline',
    label: 'Accepted',
  },
  delivering: {
    bg: '#dbeafe',
    textColor: '#1e40af',
    icon: 'bicycle-outline',
    label: 'Delivering',
  },
  completed: {
    bg: '#f0fdf4',
    textColor: '#166534',
    icon: 'checkmark-done-outline',
    label: 'Delivered',
  },
  cancelled: {
    bg: '#fee2e2',
    textColor: '#991b1b',
    icon: 'close-circle-outline',
    label: 'Cancelled',
  },
};

const MyDeliveriesScreen = () => {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();

  const {
    data: deliveries,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['myDeliveries'],
    queryFn: fetchMyDeliveries,
  });

  const completeMutation = useMutation({
    mutationFn: markOrderDelivered,
    onSuccess: (updatedOrder) => {
      // Optimistically update the cache so the card moves to History immediately
      queryClient.setQueryData(['myDeliveries'], (old: any[]) =>
        old?.map((o) =>
          (o.id || o._id) === (updatedOrder.id || updatedOrder._id)
            ? { ...o, status: 'completed' }
            : o,
        ),
      );
      Alert.alert('Delivered! 🎉', 'Order marked as completed.');
    },
    onError: () => {
      Alert.alert('Error', 'Could not mark this order as delivered.');
    },
  });

  const startMutation = useMutation({
    mutationFn: startDeliveryOrder,
    onSuccess: (updatedOrder) => {
      // Optimistically update to 'delivering'
      queryClient.setQueryData(['myDeliveries'], (old: any[]) =>
        old?.map((o) =>
          (o.id || o._id) === (updatedOrder.id || updatedOrder._id)
            ? { ...o, status: 'delivering' }
            : o,
        ),
      );
    },
    onError: () => {
      Alert.alert('Error', 'Could not start delivery.');
    },
  });

  const handleStartDelivery = (orderId: string) => {
    startMutation.mutate(orderId);
  };

  const handleMarkDelivered = (orderId: string) => {
    Alert.alert(
      'Mark as Delivered',
      'Confirm that you have delivered this order to the customer?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => completeMutation.mutate(orderId) },
      ],
    );
  };

  const active =
    deliveries?.filter(
      (o: any) => !['completed', 'cancelled'].includes(o.status),
    ) ?? [];
  const history =
    deliveries?.filter((o: any) =>
      ['completed', 'cancelled'].includes(o.status),
    ) ?? [];

  const renderCard = (item: any) => {
    const sc = statusConfig[item.status] ?? statusConfig.pending;
    const addr = item.addressId;
    const orderId = item.id || item._id;
    const itemCount =
      item.items?.reduce((acc: number, i: any) => acc + i.quantity, 0) ?? 0;

    return (
      <View
        key={orderId}
        className="bg-white rounded-2xl mb-3 border border-gray-100 overflow-hidden"
        style={{
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 5,
          elevation: 2,
        }}
      >
        {/* Status strip */}
        <View
          className="flex-row items-center justify-between px-4 py-2"
          style={{ backgroundColor: sc.bg }}
        >
          <View className="flex-row items-center">
            <Ionicons
              name={sc.icon as any}
              size={13}
              color={sc.textColor}
            />
            <Text
              className="text-[12px] font-bold ml-1"
              style={{ color: sc.textColor }}
            >
              {sc.label}
            </Text>
          </View>
          <Text
            className="text-[11px] font-semibold"
            style={{ color: sc.textColor }}
          >
            #{orderId?.toString().slice(-6).toUpperCase()}
          </Text>
        </View>

        {/* Card body */}
        <View className="px-4 py-3">
          {/* Address */}
          <View className="flex-row items-start mb-2">
            <Ionicons
              name="location-outline"
              size={14}
              color="#16a34a"
              style={{ marginTop: 1 }}
            />
            <Text
              className="text-[13px] text-gray-600 ml-1.5 flex-1"
              numberOfLines={2}
            >
              {addr
                ? `${addr.address}, ${addr.city}`
                : 'Address unavailable'}
            </Text>
          </View>

          {/* Meta row */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="fast-food-outline" size={12} color="#9ca3af" />
              <Text className="text-[12px] text-gray-400 ml-1">
                {itemCount} item{itemCount !== 1 ? 's' : ''}
              </Text>
              <Text className="text-gray-300 mx-2">·</Text>
              <Text className="text-[12px] text-gray-400">
                {new Date(item.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
            <Text className="text-[14px] font-extrabold text-gray-900">
              LKR {item.totalAmount}
            </Text>
          </View>

          {/* Start Delivery — only shown for 'accepted' status */}
          {item.status === 'accepted' && (
            <Pressable
              onPress={() => handleStartDelivery(orderId)}
              disabled={startMutation.isPending && startMutation.variables === orderId}
              className="mt-3 bg-blue-600 rounded-xl py-2.5 flex-row items-center justify-center"
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            >
              {startMutation.isPending && startMutation.variables === orderId ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="bicycle-outline" size={16} color="#fff" />
                  <Text className="text-white text-[13px] font-extrabold ml-2">
                    Start Delivery
                  </Text>
                </>
              )}
            </Pressable>
          )}

          {/* Mark as Delivered — only shown for 'delivering' status */}
          {item.status === 'delivering' && (
            <Pressable
              onPress={() => handleMarkDelivered(orderId)}
              disabled={completeMutation.isPending && completeMutation.variables === orderId}
              className="mt-3 bg-green-600 rounded-xl py-2.5 flex-row items-center justify-center"
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            >
              {completeMutation.isPending && completeMutation.variables === orderId ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-done-outline" size={16} color="#fff" />
                  <Text className="text-white text-[13px] font-extrabold ml-2">
                    Mark as Delivered
                  </Text>
                </>
              )}
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  const SectionHeader = ({
    title,
    count,
  }: {
    title: string;
    count: number;
  }) => (
    <View className="flex-row items-center mb-3 mt-1">
      <Text className="text-[16px] font-extrabold text-gray-900">{title}</Text>
      <View className="ml-2 bg-green-100 px-2.5 py-0.5 rounded-full">
        <Text className="text-green-700 text-[11px] font-bold">{count}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#15803d' }}>
      <StatusBar barStyle="light-content" backgroundColor="#15803d" translucent={false} />

      {/* Green header */}
      <View className="bg-green-700">
        <View className="px-4 pt-3 pb-4 flex-row items-center">
          <Pressable
            onPress={() => navigation.goBack()}
            className="mr-3 p-1"
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-white text-[22px] font-bold">
              My Deliveries
            </Text>
            {deliveries && (
              <Text className="text-green-200 text-[13px] mt-0.5">
                {deliveries.length} total delivery
                {deliveries.length !== 1 ? 's' : ''}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* White content */}
      <View className="flex-1 bg-white rounded-t-3xl mt-[-2px]">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#16a34a" />
          </View>
        ) : isError ? (
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons name="cloud-offline-outline" size={48} color="#d1d5db" />
            <Text className="text-gray-500 mt-4 font-bold text-lg">
              Could not load deliveries
            </Text>
            <Pressable
              onPress={() => refetch()}
              className="mt-4 bg-green-600 px-6 py-2.5 rounded-full"
            >
              <Text className="text-white font-semibold">Retry</Text>
            </Pressable>
          </View>
        ) : deliveries?.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons name="bicycle-outline" size={60} color="#d1d5db" />
            <Text className="text-gray-600 mt-4 font-bold text-xl">
              No Deliveries Yet
            </Text>
            <Text className="text-gray-400 text-[13px] mt-2 text-center">
              Once you accept an order it will appear here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={[]}
            keyExtractor={() => 'dummy'}
            renderItem={null}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor="#16a34a"
                colors={['#16a34a']}
              />
            }
            ListHeaderComponent={
              <View className="px-4 pt-5 pb-4">
                {active.length > 0 && (
                  <>
                    <SectionHeader title="Active" count={active.length} />
                    {active.map((item: any) => renderCard(item))}
                    <View className="h-3" />
                  </>
                )}
                {history.length > 0 && (
                  <>
                    <SectionHeader title="History" count={history.length} />
                    {history.map((item: any) => renderCard(item))}
                  </>
                )}
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default MyDeliveriesScreen;
