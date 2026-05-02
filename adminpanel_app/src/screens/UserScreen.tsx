import { StyleSheet, Text, View, FlatList, Pressable, ActivityIndicator, Alert } from 'react-native'
import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchUsers, updateUser } from '../api/apiClient'
import { useNavigation } from '@react-navigation/native'

const UserScreen = () => {
  const navigation = useNavigation()
  const queryClient = useQueryClient()
  const { data: users, isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: { role?: string, isActive?: boolean } }) => updateUser(id, data),
    onSuccess: (updatedUser, variables) => {
      queryClient.setQueryData(['users'], (oldData: any) => {
        if (!oldData) return [];
        return oldData.map((u: any) => (u.id === variables.id || u._id === variables.id) ? { ...u, ...updatedUser } : u);
      });
      Alert.alert('Success', 'User updated successfully');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to update user')
    }
  })

  const handleToggleRole = (user: any) => {
    const newRole = user.role === 'driver' ? 'user' : 'driver';
    updateMutation.mutate({ id: user.id || user._id, data: { role: newRole } })
  }

  const handleToggleStatus = (user: any) => {
    const isCurrentlyActive = user.isActive !== false; // Default to true if undefined
    updateMutation.mutate({ id: user.id || user._id, data: { isActive: !isCurrentlyActive } })
  }

  const renderUserItem = ({ item }: any) => {
    const isCurrentlyActive = item.isActive !== false;
    return (
    <View 
      className="bg-white p-4 mb-3 rounded-xl border border-gray-100 flex-row justify-between items-center"
      style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2 }}
    >
      <View className="flex-1 mr-2">
        <Text className="text-[15px] font-bold text-gray-900">{item.name || item.email}</Text>
        <Text className="text-[13px] text-gray-500 mt-1">{item.phone || 'No phone number'}</Text>
        <View className="flex-row items-center mt-2">
           <Text className={`text-[12px] font-bold uppercase mr-3 ${item.role === 'driver' ? 'text-blue-600' : 'text-gray-500'}`}>{item.role || 'user'}</Text>
           <Text className={`text-[12px] font-bold uppercase ${isCurrentlyActive ? 'text-green-600' : 'text-red-600'}`}>{isCurrentlyActive ? 'Active' : 'Inactive'}</Text>
        </View>
      </View>
      <View className="items-end">
        <Pressable 
          className="bg-green-100 px-3 py-1.5 rounded-lg mb-2"
          onPress={() => (navigation as any).navigate('Orders', { screen: 'UserOrders', params: { userId: item.id || item._id, userName: item.name || item.email } })}
        >
          <Text className="text-green-800 font-semibold text-[12px]">Orders</Text>
        </Pressable>
        <View className="flex-row gap-2">
          <Pressable 
            className="bg-blue-100 px-2 py-1.5 rounded-lg"
            onPress={() => handleToggleRole(item)}
          >
            <Text className="text-blue-800 font-semibold text-[11px]">{item.role === 'driver' ? 'Make User' : 'Make Driver'}</Text>
          </Pressable>
          <Pressable 
            className={`${!isCurrentlyActive ? 'bg-gray-100' : 'bg-red-100'} px-2 py-1.5 rounded-lg`}
            onPress={() => handleToggleStatus(item)}
          >
            <Text className={`${!isCurrentlyActive ? 'text-gray-800' : 'text-red-800'} font-semibold text-[11px]`}>{!isCurrentlyActive ? 'Activate' : 'Deactivate'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

  return (
    <View className="flex-1 bg-gray-50">
      <View 
        className="flex-row items-center justify-between px-4 py-4 bg-white border-b border-gray-100 pb-4"
        style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2 }}
      >
        <Text className="text-2xl font-bold pl-2 mt-4 text-gray-800">
          Users
        </Text>
      </View>
      
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : isError ? (
        <View className="flex-1 justify-center items-center">
            <Text className="text-red-500 text-center mt-4">Failed to load users</Text>
        </View>
      ) : (
        <FlatList
          data={users || []}
          keyExtractor={(item: any) => item.id || item._id}
          renderItem={renderUserItem}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  )
}

export default UserScreen