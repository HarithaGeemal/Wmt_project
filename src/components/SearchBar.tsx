import { StyleSheet, Text, TextInput, View } from 'react-native';
import React from 'react';
import { FontAwesome } from '@react-native-vector-icons/fontawesome';

export default function SearchBar({value,onChange} : {value?: string, onChange?: (v: string) => void}) {
  return (
    <View className='flex-row items-center bg-gray-200 rounded-full px-7 py-2 w-11/12 self-center mt-4 shadow-black'>
      <FontAwesome name="search" size={16} color="#9CA3AF" />
      <TextInput value={value} onChangeText={onChange} placeholder="Search Foods" placeholderTextColor="#9CA3AF" className='ml-3 flex-1 text-base'/>
    </View>
  );
}
