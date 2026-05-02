import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuthStore } from '../store/useAuthStore';
import { login } from '../api/apiClient';

interface FormData {
  email: string;
  password: string;
}

const LoginScreen = () => {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const { setAuth } = useAuthStore();
  const navigation = useNavigation<any>();

  const onSubmit = async (data: FormData) => {
    try {
      const { user, accessToken } = await login(data);
      if (user.role !== 'admin') {
        Alert.alert("Access Denied", "You do not have administrative privileges.");
        return;
      }
      setAuth(user, accessToken);
    } catch (error: any) {
      console.error('Login Error', error?.response?.data || error?.message);
      const errorMsg = error?.response?.data?.error 
        || error?.message 
        || "Unknown error occurred";
      Alert.alert("Login Failed", errorMsg);
    }
  };

  return (
    <View className="flex-1 bg-white p-4 justify-center">
      <Text className="text-2xl font-bold text-center text-green-600">
        Admin Login
      </Text>
      <Text className="text-center text-green-600 mt-2">
        Enter Your Details to access Admin Panel
      </Text>

      <Text className="text-sm font-medium mt-6 ">Email</Text>
      <Controller
        control={control}
        name="email"
        rules={{ required: true }}
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Enter Email"
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
            keyboardType="email-address"
            className="border-b border-gray-300 rounded-lg px-4 py-2 mt-2 text-black"
          />
        )}
      />

      <Text className="text-sm font-medium mt-6 ">Password</Text>
      <View>
        <Controller
          control={control}
          name="password"
          rules={{ required: true }}
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Enter Password"
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              keyboardType="default"
              secureTextEntry={!showPassword}
              className="border-b border-gray-300 rounded-lg px-4 py-2 mt-2 text-black"
            />
          )}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-5"
        >
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={20}
            color="gray"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleSubmit(onSubmit)} className="bg-green-600 p-3 rounded-full mt-6">
        <Text className="text-white text-center font-bold">Continue</Text>
      </TouchableOpacity>

      <TouchableOpacity
        // onPress={handleGoogleSignin}
        className="bg-white border border-gray-300 p-3 rounded-full mt-4 flex-row justify-center"
      >
        <Ionicons name="logo-google" size={20} color="#3b82f6" />
        <Text className="text-gray-800 font-bold ml-2">
          Sign in with Google
        </Text>
      </TouchableOpacity>

      <View className='flex-row justify-center items-center mt-4'>
        <Text className="text-gray-600 ">
          Don't have an account?{' '}
        </Text>
        <TouchableOpacity onPress={()=> navigation.navigate('SignUp')} className='ml-1'>
          <Text className="text-green-600 font-bold ">Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;
