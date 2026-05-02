import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import React from 'react';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/useAuthStore';
import { Alert } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';


type ProfileItem = {
    icon?: string;
    title?: string;
    subtitle?: string;
    divider?: boolean;
    route?: string;
}

const profileItems: ProfileItem[] = [
    {icon : 'receipt-outline', title: 'My Orders', subtitle: 'View your order history', route: 'MyOrders'},
    {icon : 'gift-outline', title: 'Earn Rewards', subtitle: 'Invite your friends and earn rewards'},
    {icon : 'call-outline', title: 'Contact Us', subtitle: 'Contact us for any queries'},
    {divider : true},
    {icon : 'help-circle-outline', title: 'FAQs', subtitle: 'Frequently Asked Questions'},
    {icon : 'document-text-outline', title: 'Terms and Conditions'},
    {icon : 'shield-checkmark-outline', title: 'Privacy Policy'},
    {icon : 'information-circle-outline', title: 'Seller Information'},
    {icon : 'earth-outline', title: 'Change Country'},

];


const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const maskedPhone = user?.phone?.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');


  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: () => logout(), style: 'destructive' },
    ]);
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="px-4"
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) }}
      >
        <View className="pt-4 pb-2">
          <Text className="text-2xl font-extrabold text-gray-900">
            {isAuthenticated
              ? `Hi, ${user?.name || user?.email}`
              : ' Hi Guest '}
          </Text>
          {!isAuthenticated ? (
            <View className="flex-row items-center mt-1">
              <Text className="text-sm text-gray-500">Please</Text>
              <Pressable className="mx-1">
                <Text>Login</Text>
              </Pressable>
              <Text className="text-sm text-gray-500">
                to enjoy your shopping{' '}
              </Text>
            </View>
          ) : (
            <View className="mt-1">
              <Text className="text-sm text-gray-600">{user?.email}</Text>
              <Text className="text-sm text-gray-600 mt-1">{maskedPhone}</Text>
              <Pressable onPress={handleLogout}>
                <Text className="text-sm text-red-600 font-semibold">
                  {' '}
                  Logout
                </Text>
              </Pressable>
            </View>
          )}
        </View>
        <View className='flex-1'>
            {profileItems.map((item, index) =>
                item.divider ? (
                    <View key={index} className='h-px bg-gray-200 my-2 mx-1 '/>
                ) : (
                    <Pressable key={index} className='flex-row items-center py-3 ' onPress={() => item.route && navigation.navigate(item.route as never)}>
                        <View className='mr-3 w-11 h-11 rounded-lg bg-gray-100 items-center justify-center'>
                            <Ionicons name={item?.icon as string} size={20} color='#4b5563'/>
                        </View>
                        <View className='flex-1'>
                            <Text className='text-base text-gray-800 font-medium'>{item.title}</Text>
                            {item.subtitle && (
                                <Text className='text-xs text-gray-500 mt-0.5'>{item.subtitle}</Text>
                            )}
                        </View>
                        <Ionicons name='chevron-forward-outline' size={18} color='#9ca3af'/>
                    </Pressable>
                )
            )}
        </View>
        <View className='mt-10 pb-8 items-center'>
            <View className='flex-row items-center'>
                <Ionicons name='fast-food-outline' size={26} color={'#7c3aed'}/>
                <Text className='text-2xl font-extrabold text-purple-600 ml-2'>Bite</Text>
                <Text className='text-2xl font-extrabold text-green-600 ml-1'>Hub</Text>
            </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({});
