import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import React from 'react';
import { AuthStackParamList } from 'navigation/Routes';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { ScrollView } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { AuthRoutes } from 'navigation/Routes';
import { useAuthStore } from 'store/useAuthStore';
import { signUp } from '../api/apiClient';

const SignUpScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  interface FormData {
    email: string;
    password: string;
    phone: string;
    confirmPassword: string;
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    getValues,
  } = useForm<FormData>({
    defaultValues: {
      email: '',
      password: '',
      phone: '',
      confirmPassword: '',
    },
  });

  const { setAuth } = useAuthStore();

  const password = watch('password');

  const [showPassword, setShowPassword] = React.useState(false);

  const onSubmit = async (data: FormData) => {
    console.log('submitting Sign Up', data);
    try {
      const { user, accessToken } = await signUp(data);
      console.log('Signup Success', user, accessToken);
      setAuth(user, accessToken);
    } catch (error: any) {
      console.error('Signup Error', error.response?.data);
      Alert.alert("Error", error?.response?.data?.error || "Signup failed. Please check youre details and try again");
    }
  };
  
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        flexGrow: 1,
        padding: 16,
        justifyContent: 'center',
      }}
    >
      <Text className="text-2xl font-bold text-center text-green-600">
        Sign Up
      </Text>

      <Text className="text-sm font-medium mt-6 ">Email</Text>
      <Controller
        control={control}
        name="email"
        rules={{
          required: 'Email is required',
          pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
        }}
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

      <Text className="text-sm font-medium mt-6 ">Phone Number</Text>
      <Controller
        control={control}
        name="phone"
        rules={{
          required: 'Phone number is required',
          pattern: { value: /^\d{10}$/, message: 'Invalid phone number' },
        }}
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Enter Phone Number"
            autoCapitalize="none"
            keyboardType="phone-pad"
            className="border-b border-gray-300 rounded-lg px-4 py-2 mt-2"
          />
        )}
      />

      <Text className="text-sm font-medium mt-6 ">Password</Text>
      <View>
        <Controller
          control={control}
          name="password"
          rules={{
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters',
            },
          }}
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

      <Text className="text-sm font-medium mt-6 ">Confirm Password</Text>
      <View>
        <Controller
          control={control}
          name="confirmPassword"
          rules={{
            required: 'Confirm Password is required',
            validate: value =>
              value === getValues('password') || 'Passwords do not match',
          }}
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Confirm Password"
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
        <Text className="text-white text-center font-bold">Sign Up</Text>
      </TouchableOpacity>

      <View className="flex-row justify-center items-center mt-4">
        <Text className="text-gray-600 ">Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="ml-1">
          <Text className="text-green-600 font-bold ">Login</Text>
        </TouchableOpacity>
      </View>

      {errors.email && (
        <Text className="text-red-500 text-sm mt-1">
          {errors?.email?.message}
        </Text>
      )}
      {errors.phone && (
        <Text className="text-red-500 text-sm mt-1">
          {errors?.phone?.message}
        </Text>
      )}
      {errors.password && (
        <Text className="text-red-500 text-sm mt-1">
          {errors?.password?.message}
        </Text>
      )}
      {errors.confirmPassword && (
        <Text className="text-red-500 text-sm mt-1">
          {errors?.confirmPassword?.message}
        </Text>
      )}
    </ScrollView>
  );
};

export default SignUpScreen;
