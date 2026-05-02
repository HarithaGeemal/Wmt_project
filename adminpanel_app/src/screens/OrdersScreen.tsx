import React, { useState } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    Modal,
    Pressable,
    Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllOrders, updateOrderStatus } from '../api/apiClient';
import Ionicons from '@expo/vector-icons/Ionicons';

// ─── Status config ────────────────────────────────────────────────────────────
type StatusKey = 'pending' | 'processing' | 'ready' | 'accepted' | 'delivering' | 'completed' | 'cancelled';

const STATUS_CONFIG: Record<StatusKey, { label: string; bg: string; text: string; icon: keyof typeof Ionicons.glyphMap }> = {
    pending:    { label: 'Pending',         bg: '#fef9c3', text: '#854d0e', icon: 'time-outline' },
    processing: { label: 'Processing',      bg: '#dbeafe', text: '#1e40af', icon: 'construct-outline' },
    ready:      { label: 'Ready for Rider', bg: '#ede9fe', text: '#6d28d9', icon: 'bicycle-outline' },
    accepted:   { label: 'Rider Accepted',  bg: '#e0f2fe', text: '#0369a1', icon: 'checkmark-circle-outline' },
    delivering: { label: 'Delivering',      bg: '#f0fdf4', text: '#166534', icon: 'navigate-outline' },
    completed:  { label: 'Completed',       bg: '#dcfce7', text: '#14532d', icon: 'checkmark-done-outline' },
    cancelled:  { label: 'Cancelled',       bg: '#fee2e2', text: '#991b1b', icon: 'close-circle-outline' },
};

// Admin can set these; accepted/delivering are driver-only
const ADMIN_STATUSES: StatusKey[] = ['pending', 'processing', 'ready', 'completed', 'cancelled'];

// ─── Status picker modal ──────────────────────────────────────────────────────
function StatusPickerModal({
    visible,
    currentStatus,
    onSelect,
    onClose,
}: {
    visible: boolean;
    currentStatus: StatusKey;
    onSelect: (s: StatusKey) => void;
    onClose: () => void;
}) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            {/* Backdrop — tap to dismiss */}
            <Pressable
                className="flex-1 items-center justify-center"
                style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
                onPress={onClose}
            >
                {/* Card — stop propagation */}
                <Pressable
                    className="bg-white rounded-2xl overflow-hidden mx-6"
                    style={{ width: 310 }}
                    onPress={() => {}}
                >
                    {/* Title */}
                    <View className="px-4 pt-5 pb-3 border-b border-gray-100">
                        <Text className="text-[16px] font-extrabold text-gray-900">Update Status</Text>
                        <Text className="text-[12px] text-gray-400 mt-0.5">Select a new status for this order</Text>
                    </View>

                    {/* Options */}
                    {ADMIN_STATUSES.map((status) => {
                        const cfg = STATUS_CONFIG[status];
                        const isSelected = status === currentStatus;
                        return (
                            <Pressable
                                key={status}
                                onPress={() => onSelect(status)}
                                className="flex-row items-center px-4 py-3 border-b border-gray-50"
                                style={({ pressed }) => ({
                                    backgroundColor: pressed ? '#f9fafb' : isSelected ? '#f9fafb' : '#fff',
                                })}
                            >
                                {/* Icon chip */}
                                <View
                                    className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                                    style={{ backgroundColor: cfg.bg }}
                                >
                                    <Ionicons name={cfg.icon} size={17} color={cfg.text} />
                                </View>

                                <View className="flex-1">
                                    <Text className="text-[14px] font-semibold text-gray-900">{cfg.label}</Text>
                                    {status === 'ready' && (
                                        <Text className="text-[11px] text-purple-600 mt-0.5">
                                            🛵  Visible in Rider dashboard
                                        </Text>
                                    )}
                                </View>

                                {isSelected && (
                                    <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
                                )}
                            </Pressable>
                        );
                    })}

                    {/* Cancel */}
                    <Pressable onPress={onClose} className="py-4 items-center">
                        <Text className="text-[14px] font-semibold text-gray-400">Cancel</Text>
                    </Pressable>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
const OrdersScreen = () => {
    const queryClient = useQueryClient();
    const [pickerOrderId, setPickerOrderId] = useState<string | null>(null);
    const [pickerCurrentStatus, setPickerCurrentStatus] = useState<StatusKey>('pending');

    const { data: orders, isLoading, isError } = useQuery({
        queryKey: ['adminOrders'],
        queryFn: fetchAllOrders,
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            updateOrderStatus(id, status),
        onSuccess: (updatedOrder, variables) => {
            queryClient.setQueryData(['adminOrders'], (oldData: any) => {
                if (!oldData) return [];
                return oldData.map((o: any) =>
                    o.id === variables.id || o._id === variables.id
                        ? { ...o, ...updatedOrder }
                        : o,
                );
            });
        },
        onError: () => Alert.alert('Error', 'Failed to update order status'),
    });

    const openPicker = (id: string, status: StatusKey) => {
        setPickerOrderId(id);
        setPickerCurrentStatus(status);
    };

    const handleSelect = (newStatus: StatusKey) => {
        if (!pickerOrderId) return;
        setPickerOrderId(null);
        if (newStatus === pickerCurrentStatus) return;
        updateStatusMutation.mutate({ id: pickerOrderId, status: newStatus });
    };

    const renderOrderItem = ({ item }: any) => {
        const statusKey = (item.status ?? 'pending') as StatusKey;
        const cfg = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.pending;
        const orderId = item.id || item._id;
        const isDriverOwned = ['accepted', 'delivering'].includes(statusKey);
        const isUpdating =
            updateStatusMutation.isPending &&
            updateStatusMutation.variables?.id === orderId;

        return (
            <View
                className="bg-white rounded-2xl mb-3 border border-gray-100 overflow-hidden"
                style={{
                    shadowColor: '#000',
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    shadowOffset: { width: 0, height: 1 },
                    elevation: 2,
                }}
            >
                {/* Coloured status strip */}
                <View
                    className="flex-row items-center justify-between px-4 py-2"
                    style={{ backgroundColor: cfg.bg }}
                >
                    <View className="flex-row items-center">
                        <Ionicons name={cfg.icon} size={13} color={cfg.text} />
                        <Text
                            className="text-[12px] font-bold ml-1.5"
                            style={{ color: cfg.text }}
                        >
                            {cfg.label}
                        </Text>
                    </View>
                    <Text className="text-[11px] font-semibold" style={{ color: cfg.text }}>
                        #{orderId?.toString().slice(-6).toUpperCase()}
                    </Text>
                </View>

                {/* Card body */}
                <View className="p-4">
                    {/* Date */}
                    <Text className="text-[12px] text-gray-400 mb-2">
                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                        })}
                    </Text>

                    {/* Customer */}
                    {item.userId && (
                        <View className="flex-row items-center mb-3">
                            <View className="w-7 h-7 rounded-full bg-blue-100 items-center justify-center mr-2">
                                <Text className="text-blue-700 font-bold text-[11px]">
                                    {(item.userId.name || item.userId.email || 'U')
                                        .substring(0, 1)
                                        .toUpperCase()}
                                </Text>
                            </View>
                            <Text className="text-[13px] font-semibold text-gray-800 flex-1" numberOfLines={1}>
                                {item.userId.name || item.userId.email}
                            </Text>
                            {item.userId.phone && (
                                <Text className="text-[12px] text-gray-400">
                                    {item.userId.phone}
                                </Text>
                            )}
                        </View>
                    )}

                    {/* Items */}
                    <View className="border-t border-gray-100 pt-2 mb-3">
                        {item.items?.map((prod: any, idx: number) => (
                            <Text key={idx} className="text-[13px] text-gray-600 mb-1">
                                {prod.quantity}× {prod.name}
                            </Text>
                        ))}
                    </View>

                    {/* Total + action */}
                    <View className="flex-row items-center justify-between">
                        <Text className="text-[15px] font-extrabold text-gray-900">
                            LKR {item.totalAmount}
                        </Text>

                        {isUpdating ? (
                            <ActivityIndicator size="small" color="#16a34a" />
                        ) : isDriverOwned ? (
                            <View className="flex-row items-center bg-gray-100 px-3 py-1.5 rounded-full">
                                <Ionicons name="lock-closed-outline" size={11} color="#9ca3af" />
                                <Text className="text-[11px] text-gray-400 ml-1">Driver controlled</Text>
                            </View>
                        ) : (
                            <Pressable
                                onPress={() => openPicker(orderId, statusKey)}
                                className="flex-row items-center bg-green-50 border border-green-200 px-3 py-1.5 rounded-full"
                                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                            >
                                <Text className="text-[12px] font-bold text-green-700 mr-1">
                                    Change Status
                                </Text>
                                <Ionicons name="chevron-down-outline" size={12} color="#15803d" />
                            </Pressable>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header — matches FeedbackScreen pattern */}
            <View
                className="flex-row items-center justify-between px-4 py-4 bg-white border-b border-gray-100"
                style={{
                    shadowColor: '#000',
                    shadowOpacity: 0.05,
                    shadowRadius: 3,
                    shadowOffset: { width: 0, height: 1 },
                    elevation: 2,
                }}
            >
                <Text className="text-2xl font-bold pl-2 mt-4 text-gray-800">Orders</Text>
                {orders && (
                    <Text className="text-[13px] text-gray-400 mt-4 pr-2">
                        {orders.length} order{orders.length !== 1 ? 's' : ''}
                    </Text>
                )}
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
                    <Ionicons name="receipt-outline" size={48} color="#d1d5db" />
                    <Text className="text-gray-500 mt-4 font-bold text-lg">No Orders Yet</Text>
                    <Text className="text-gray-400 text-[13px] mt-1 text-center">
                        Customer orders will appear here once they start ordering.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id || item._id}
                    renderItem={renderOrderItem}
                    contentContainerStyle={{ padding: 16 }}
                    showsVerticalScrollIndicator={false}
                />
            )}

            <StatusPickerModal
                visible={pickerOrderId !== null}
                currentStatus={pickerCurrentStatus}
                onSelect={handleSelect}
                onClose={() => setPickerOrderId(null)}
            />
        </View>
    );
};

export default OrdersScreen;
