import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthRoutes, AuthStackParamList } from 'navigation/Routes';
import { useAuthStore } from '../store/useAuthStore';
import { login } from '../api/apiClient';
import { Alert } from 'react-native';

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
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const onSubmit = async (data: FormData) => {
    try {
      const { user, accessToken } = await login(data);
      setAuth(user, accessToken);
    } catch (error: any) {
      console.error('Login Error', error.response?.data);
      Alert.alert("Login Failed", error?.response?.data?.error || "Invalid email or password");
    }
  };

  return (
    <View className="flex-1 bg-white p-4 justify-center">
      <Text className="text-2xl font-bold text-center text-green-600">
        Get Started
      </Text>
      <Text className="text-center text-green-600 mt-2">
        Enter Your Details to Pick Fresh food
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
            autoCapitalize="none"
            keyboardType="email-address"
            className="border-b border-gray-300 rounded-lg px-4 py-2 mt-2"
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
              autoCapitalize="none"
              keyboardType="default"
              secureTextEntry={!showPassword}
              className="border-b border-gray-300 rounded-lg px-4 py-2 mt-2"
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
        <TouchableOpacity onPress={()=> navigation.navigate(AuthRoutes.SignUp)} className='ml-1'>
          <Text className="text-green-600 font-bold ">Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;
