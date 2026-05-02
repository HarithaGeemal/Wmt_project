import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { createProduct } from '../api/apiClient';
import * as ImagePicker from 'expo-image-picker';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
}

const AddProductScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<any, any>>();
  const { categoryId, categoryName } = (route?.params as any) ?? { categoryId: '' };

  const [imageUri, setImageUri] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: { name: '', description: '', price: '' },
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: ProductFormData) =>
      createProduct({ 
          name: data.name, 
          description: data.description,
          price: data.price,
          categoryId,
          imageUri: imageUri ?? undefined 
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products', categoryId] });
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
      navigation.goBack();
    },
    onError: (error: any) => {
      console.error('Error creating product:', error);
      Alert.alert('Error', 'Failed to create product. Please try again.');
    },
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photo library to upload an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const onSubmit = (data: ProductFormData) => {
    mutation.mutate(data);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16 }}>
      <Text className="text-lg font-bold text-gray-900 mb-1">Add New Product</Text>
      <Text className="text-sm text-gray-500 mb-6">Attach it directly to {categoryName}</Text>

      {/* Image Picker */}
      <Text className="text-sm font-medium text-gray-700 mb-2">Product Image</Text>
      <TouchableOpacity
        onPress={pickImage}
        activeOpacity={0.8}
        style={styles.imagePicker}
      >
        {imageUri ? (
          <>
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            <View style={styles.changeOverlay}>
              <Ionicons name="camera" size={20} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 12, marginTop: 4 }}>Change</Text>
            </View>
          </>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={40} color="#9ca3af" />
            <Text className="text-gray-400 mt-2 text-sm">Tap to select an image</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Title */}
      <Text className="text-sm font-medium text-gray-700 mb-2 mt-5">Product Name</Text>
      <Controller
        control={control}
        name="name"
        rules={{
          required: 'Product name is required',
          minLength: { value: 3, message: 'Must be at least 3 characters' },
        }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="E.g. Spicy Chicken Burger"
            value={value}
            onChangeText={onChange}
            className="bg-white p-3 rounded-lg border border-gray-200"
          />
        )}
      />
      {errors.name && (
        <Text className="text-red-500 mt-1 text-sm">{errors.name.message}</Text>
      )}

      {/* Price */}
      <Text className="text-sm font-medium text-gray-700 mb-2 mt-5">Price ($)</Text>
      <Controller
        control={control}
        name="price"
        rules={{
          required: 'Price is required',
          pattern: {
            value: /^\d+(\.\d{1,2})?$/,
            message: 'Must be a valid positive number format e.g. 10.99'
          }
        }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="E.g. 12.99"
            value={value}
            keyboardType="decimal-pad"
            onChangeText={onChange}
            className="bg-white p-3 rounded-lg border border-gray-200"
          />
        )}
      />
      {errors.price && (
        <Text className="text-red-500 mt-1 text-sm">{errors.price.message}</Text>
      )}

      {/* Description */}
      <Text className="text-sm font-medium text-gray-700 mb-2 mt-5">Description (Optional)</Text>
      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="Add a detailed description..."
            value={value}
            onChangeText={onChange}
            multiline
            numberOfLines={4}
            className="bg-white p-3 rounded-lg border border-gray-200 h-28"
            style={{ textAlignVertical: 'top' }}
          />
        )}
      />

      {/* Submit */}
      <Pressable
        className="flex-row items-center justify-center bg-blue-600 px-4 py-3 rounded-xl mt-8"
        onPress={handleSubmit(onSubmit)}
        disabled={mutation.isPending}
      >
        <Ionicons name="save" size={18} color="#fff" />
        <Text className="text-white font-semibold ml-2 text-base">
          {mutation.isPending ? 'Uploading & Saving...' : 'Create Product'}
        </Text>
      </Pressable>
    </ScrollView>
  );
};

export default AddProductScreen;

const styles = StyleSheet.create({
  imagePicker: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  changeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingVertical: 8,
    alignItems: 'center',
  },
});