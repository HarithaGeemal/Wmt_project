import {
  Pressable,
  StatusBar,
  Text,
  View,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAddresses, createAddress, Address, updateAddress, deleteAddress } from '../api/apiClient';
import { useCartStore } from '../store/useCartStore';

const AddressListScreen = () => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const setStoreSelectedAddress = useCartStore((s) => s.setSelectedAddressId);
  const selectedAddressId = useCartStore((s) => s.selectedAddressId);

  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');
  const [editingAddress, setEditingAddress] = useState<Partial<Address>>({});

  const { data: addresses, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: fetchAddresses,
  });

  const createMutation = useMutation({
    mutationFn: createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setMode('list');
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setMode('list');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setMode('list');
    },
  });

  const handleSave = () => {
    if (!editingAddress.name || !editingAddress.address || !editingAddress.mobile || !editingAddress.city || !editingAddress.zipCode) {
      return; // Basic validation
    }

    if (mode === 'add') {
      createMutation.mutate({
        type: editingAddress.type || 'Home' || 'Work' || 'Other',
        name: editingAddress.name,
        mobile: editingAddress.mobile,
        address: editingAddress.address,
        city: editingAddress.city,
        province: editingAddress.province || '',
        zipCode: editingAddress.zipCode,
        isDefault: !!editingAddress.isDefault,
      });
    } else if (mode === 'edit' && editingAddress.id) {
      updateMutation.mutate({ id: editingAddress.id, data: editingAddress });
    }
  };

  const selectAddress = (id: string) => {
    setStoreSelectedAddress(id);
    navigation.goBack();
  };

  if (mode === 'add' || mode === 'edit') {
    return (
      <SafeAreaView key="form-view" className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
        <View className="px-4 pt-4 pb-3 flex-row items-center border-b border-gray-100 bg-gray-50">
          <Pressable className="p-2 -ml-2" onPress={() => setMode('list')}>
            <Ionicons name="close" size={24} color="#000" />
          </Pressable>
          <Text className="flex-1 text-[18px] font-bold text-gray-900 text-center pr-8">
            {mode === 'add' ? 'New Address' : 'Edit Address'}
          </Text>
        </View>
        <ScrollView className="flex-1 px-4 pt-4">
          <View className="bg-white rounded-2xl p-4 shadow-sm mb-4 border border-gray-100">

            <Text className="text-[13px] text-gray-500 mb-2">Recipient Name</Text>
            <View className="bg-gray-100 rounded-xl px-3 py-2 mb-4">
              <TextInput value={editingAddress.name || ''} onChangeText={(t) => setEditingAddress(p => ({ ...p, name: t }))} placeholder="Your Name" className="text-[14px] text-gray-800 p-0 h-10" />
            </View>
            

            <Text className="text-[13px] text-gray-500 mb-2">Mobile Number</Text>
            <View className="bg-gray-100 rounded-xl px-3 py-2 mb-4">
              <TextInput value={editingAddress.mobile || ''} onChangeText={(t) => setEditingAddress(p => ({ ...p, mobile: t }))} keyboardType="phone-pad" placeholder="e.g. 07********" className="text-[14px] text-gray-800 p-0 h-10" />
            </View>

            <Text className="text-[13px] text-gray-500 mb-2">Full Address</Text>
            <View className="bg-gray-100 rounded-xl px-3 py-2 mb-4">
              <TextInput value={editingAddress.address || ''} onChangeText={(t) => setEditingAddress(p => ({ ...p, address: t }))} placeholder="Street, House no., Area" multiline className="text-[14px] text-gray-800 p-0 h-14" />
            </View>

            <View className="flex-row">
              <View className="flex-1 pr-2">
                <Text className="text-[13px] text-gray-500 mb-2">City</Text>
                <View className="bg-gray-100 rounded-xl px-3 py-2 mb-4">
                  <TextInput value={editingAddress.city || ''} onChangeText={(t) => setEditingAddress(p => ({ ...p, city: t }))} className="text-[14px] text-gray-800 p-0 h-10" />
                </View>
              </View>
              <View className="flex-1 pl-2">
                <Text className="text-[13px] text-gray-500 mb-2">Zip Code</Text>
                <View className="bg-gray-100 rounded-xl px-3 py-2 mb-4">
                  <TextInput value={editingAddress.zipCode || ''} onChangeText={(t) => setEditingAddress(p => ({ ...p, zipCode: t }))} keyboardType="number-pad" className="text-[14px] text-gray-800 p-0 h-10" />
                </View>
              </View>
            </View>

            <View className="flex-row items-center mt-2">
              <Pressable onPress={() => setEditingAddress(p => ({ ...p, isDefault: !p.isDefault }))} className="flex-row items-center">
                <View className={`w-5 h-5 rounded border ${editingAddress.isDefault ? 'bg-green-600 border-green-600' : 'bg-white border-gray-300'} items-center justify-center mr-2`}>
                  {editingAddress.isDefault && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
                <Text className="text-[14px] font-medium text-gray-800">Set as default address</Text>
              </Pressable>
            </View>

            {mode === 'edit' && editingAddress.id && (
              <Pressable onPress={() => deleteMutation.mutate(editingAddress.id!)} className="mt-8 border border-red-500 flex-row items-center justify-center py-3 rounded-xl">
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
                <Text className="text-red-500 font-bold ml-2">Delete Address</Text>
              </Pressable>
            )}

          </View>
        </ScrollView>
        <View className="p-4 bg-white border-t border-gray-100">
          <Pressable onPress={handleSave} disabled={createMutation.isPending || updateMutation.isPending} className="bg-green-600 rounded-xl py-4 flex-row items-center justify-center shadow-lg">
            {(createMutation.isPending || updateMutation.isPending) ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-[16px]">Save Address</Text>}
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView key="list-view" className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      <View className="px-4 pt-4 pb-3 flex-row items-center border-b border-gray-100 bg-gray-50">
        <Pressable className="p-2 -ml-2" onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text className="flex-1 text-[18px] font-bold text-gray-900 text-center pr-8">
          Delivery Addresses
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator color="#16a34a" className="mt-10" />
        ) : (addresses?.length === 0 ? (
          <View className="items-center justify-center py-10">
            <Ionicons name="location-outline" size={60} color="#d1d5db" />
            <Text className="text-gray-500 font-medium mt-4">No saved addresses</Text>
          </View>
        ) : (
          addresses?.map((address) => {
            const isSelected = selectedAddressId === address.id;
            return (
              <Pressable
                key={address.id}
                onPress={() => selectAddress(address.id)}
                className={`bg-white rounded-2xl p-4 shadow-sm mb-4 border ${isSelected ? 'border-green-600' : 'border-transparent'}`}
              >
                <View className="flex-row">
                  <View className="mt-1 mr-3">
                    <View className={`w-5 h-5 rounded-full border-[1.5px] items-center justify-center ${isSelected ? 'border-green-600' : 'border-gray-300'}`}>
                      {isSelected && <View className="w-3 h-3 rounded-full bg-green-600" />}
                    </View>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-[15px] font-bold text-gray-900">{address.type || 'Home'}</Text>
                      {address.isDefault && (
                        <View className="bg-gray-100 px-2 py-0.5 rounded ml-2">
                          <Text className="text-[10px] uppercase font-bold text-gray-600">Default</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-[14px] font-semibold text-gray-800 mt-1">{address.name}</Text>
                    <Text className="text-[13px] text-gray-500 mt-1 leading-5">
                      {address.address}{'\n'}{address.city} - {address.zipCode}
                    </Text>
                    <Text className="text-[13px] text-gray-600 font-medium mt-2">Mobile: {address.mobile}</Text>
                  </View>
                  <Pressable onPress={() => { setEditingAddress(address); setMode('edit'); }} className="p-2">
                    <Ionicons name="create-outline" size={20} color="#6b7280" />
                  </Pressable>
                </View>
              </Pressable>
            );
          })
        ))}
      </ScrollView>

      <View className="p-4 bg-gray-50">
        <Pressable
          className="border-2 border-green-600 bg-white rounded-xl py-3.5 flex-row items-center justify-center border-dashed"
          onPress={() => {
            setEditingAddress({ type: 'Home' });
            setMode('add');
          }}
        >
          <Ionicons name="add" size={20} color="#16a34a" />
          <Text className="text-green-700 font-extrabold ml-1">Add New Address</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default AddressListScreen;
