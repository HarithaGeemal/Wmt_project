import {
  Pressable,
  StatusBar,
  Text,
  View,
  ScrollView,
  TextInput,
  Image,
} from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useQuery } from '@tanstack/react-query';
import { fetchAddresses, createOrder, createStripePaymentIntent, fetchStripeConfig } from '../api/apiClient';
import { useCartStore } from '../store/useCartStore';
import { useStripe, StripeProvider } from '@stripe/stripe-react-native';
import { Alert } from 'react-native';

const CheckoutContent = () => {
  const navigation = useNavigation();
  const items = useCartStore((s) => s.items);
  const totalItems = useCartStore((s) => s.getTotalItems());
  const totalPrice = useCartStore((s) => s.getTotalPrice());
  const selectedAddressId = useCartStore((s) => s.selectedAddressId);
  const setSelectedAddressId = useCartStore((s) => s.setSelectedAddressId);
  
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const { data: addresses } = useQuery({ queryKey: ['addresses'], queryFn: fetchAddresses });

  const displayAddress = addresses?.find(a => a.id === selectedAddressId)
    || addresses?.find(a => a.isDefault)
    || addresses?.[0];

  React.useEffect(() => {
    if (displayAddress && selectedAddressId !== displayAddress.id) {
      setSelectedAddressId(displayAddress.id);
    }
  }, [displayAddress, selectedAddressId, setSelectedAddressId]);

  const deliveryFee = totalPrice > 30 ? 0 : 3.99;
  const taxes = parseFloat((totalPrice * 0.05).toFixed(2));
  const grandTotal = parseFloat((totalPrice + deliveryFee + taxes).toFixed(2));

  const [deliverySlot, setDeliverySlot] = useState('ASAP');
  const [paymentMethod, setPaymentMethod] = useState('Pay Online');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    if (!displayAddress) {
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }
    
    if (items.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    setIsProcessing(true);
    try {
      const formattedItems = items.map(i => ({ 
        productId: i.id, 
        name: i.name, 
        price: i.price, 
        quantity: i.qty 
      }));

      if (paymentMethod === 'Pay Online') {
        const { clientSecret } = await createStripePaymentIntent({ amount: grandTotal, currency: 'usd' });
        
        const { error: initError } = await initPaymentSheet({
          merchantDisplayName: 'Food Delivery App',
          paymentIntentClientSecret: clientSecret,
          defaultBillingDetails: {
            name: displayAddress.name,
            phone: displayAddress.mobile,
            address: {
              line1: displayAddress.address,
              city: displayAddress.city,
              postalCode: displayAddress.zipCode,
              country: 'US', // Default country for formatting
            }
          }
        });

        if (initError) {
          setIsProcessing(false);
          Alert.alert('Payment Initialisation Failed', initError.message);
          return;
        }

        const { error: paymentError } = await presentPaymentSheet();

        if (paymentError) {
          setIsProcessing(false);
          Alert.alert('Payment Failed', paymentError.message);
          return;
        }

        // Success callback
        await createOrder({
          items: formattedItems,
          totalAmount: grandTotal,
          addressId: displayAddress.id,
          paymentMethod: 'card',
          paymentId: clientSecret.split('_secret')[0], // Extract paymentIntentId
        });
        
        useCartStore.getState().clearCart();
        Alert.alert('Success', 'Order Placed Successfully!');
        navigation.navigate('MainTabs' as never);

      } else {
        // Cash on Delivery
        await createOrder({
          items: formattedItems,
          totalAmount: grandTotal,
          addressId: displayAddress.id,
          paymentMethod: 'cash',
        });
        useCartStore.getState().clearCart();
        Alert.alert('Success', 'Order Placed Successfully!');
        navigation.navigate('MainTabs' as never);
      }
    } catch (error) {
      setIsProcessing(false);
      Alert.alert('Error', 'Something went wrong while placing your order.');
      console.log('Checkout error:', error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

      {/* Header */}
      <View className="px-4 pt-4 pb-3 flex-row items-center border-b border-gray-100 bg-gray-50">
        <Pressable className="p-2 -ml-2" onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text className="flex-1 text-[18px] font-bold text-gray-900 text-center pr-8">
          Checkout
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* Deliver To */}
        <Text className="text-[15px] font-bold text-gray-800 mb-2">Deliver To</Text>
        <View className="bg-white rounded-2xl p-4 shadow-sm mb-4 border border-gray-100">
          <View className="flex-row justify-between mb-2">
            <View className="flex-row flex-1 mr-4">
              <View className="w-10 h-10 rounded-xl bg-green-50 items-center justify-center mr-3 mt-1">
                <Ionicons name="location-outline" size={20} color="#16a34a" />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-bold text-gray-900">{displayAddress ? (displayAddress.type || 'Home') : 'No Address'}</Text>
                {displayAddress ? (
                  <>
                    <Text className="text-[14px] font-semibold text-gray-800 mt-0.5">{displayAddress.name}</Text>
                    <Text className="text-[13px] text-gray-500 mt-1 leading-5">
                      {displayAddress.address}{'\n'}{displayAddress.city} - {displayAddress.zipCode}
                    </Text>
                    <Text className="text-[13px] text-gray-500 font-medium mt-1">Mobile: {displayAddress.mobile}</Text>
                  </>
                ) : (
                  <Text className="text-[13px] text-gray-500 mt-1">Please select an address for delivery</Text>
                )}
              </View>
            </View>
            <Pressable onPress={() => navigation.navigate('AddressListScreen' as any)}>
              <Text className="text-purple-600 font-semibold text-[14px]">{displayAddress ? 'Change' : 'Add'}</Text>
            </Pressable>
          </View>

          {displayAddress?.isDefault && (
            <View className="flex-row items-center ml-[52px] mt-2">
              <Ionicons name="star" size={14} color="#f59e0b" />
              <Text className="text-[12px] text-gray-600 font-medium ml-1">
                Preferred delivery address
              </Text>
            </View>
          )}
        </View>

        {/* Delivery slot */}
        <Text className="text-[15px] font-bold text-gray-800 mb-2">Delivery slot</Text>
        <View className="bg-white rounded-2xl p-4 shadow-sm mb-4 border border-gray-100">
          <Text className="text-[13px] text-gray-500 mb-3">
            Choose when you'd like your order
          </Text>

          <View className="flex-row gap-2 mb-4">
            {['ASAP', 'Today 6–8 PM', 'Tomorrow 9–11 AM'].map((slot) => (
              <Pressable
                key={slot}
                onPress={() => setDeliverySlot(slot)}
                className={`py-2 px-3 rounded-lg border ${deliverySlot === slot
                  ? 'border-green-600 bg-green-600'
                  : 'border-gray-200 bg-white'
                  }`}
              >
                <Text
                  className={`text-[13px] font-semibold ${deliverySlot === slot ? 'text-white' : 'text-gray-700'
                    }`}
                >
                  {slot}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text className="text-[13px] text-gray-500 mb-2">
            Add note for delivery (optional)
          </Text>
          <View className="bg-gray-100 rounded-xl px-3 py-2.5">
            <TextInput
              placeholder="Leave at door / call on arrival..."
              placeholderTextColor="#9ca3af"
              className="text-[14px] text-gray-800 p-0 h-10"
              multiline
            />
          </View>
        </View>

        {/* Payment Method */}
        <Text className="text-[15px] font-bold text-gray-800 mb-2">Payment Method</Text>
        <View className="bg-white rounded-2xl p-4 shadow-sm mb-4 border border-gray-100">
          {[
            { id: 'Pay Online', label: 'Pay Online (Stripe)' },
            { id: 'COD', label: 'Cash on Delivery' },
          ].map((method) => (
            <Pressable
              key={method.id}
              className="flex-row items-center py-2.5"
              onPress={() => setPaymentMethod(method.id)}
            >
              <View
                className={`w-5 h-5 rounded-full border-[1.5px] items-center justify-center mr-3 flex-shrink-0 ${paymentMethod === method.id
                  ? 'border-green-600'
                  : 'border-gray-300'
                  }`}
              >
                {paymentMethod === method.id && (
                  <View className="w-3 h-3 rounded-full bg-green-600" />
                )}
              </View>
              <Text className="text-[14.5px] font-medium text-gray-800">
                {method.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Order summary */}
        <Text className="text-[15px] font-bold text-gray-800 mb-2">Order summary</Text>
        <View className="bg-white rounded-2xl p-4 shadow-sm mb-6 border border-gray-100">
          {items.map((item, index) => (
            <View
              key={item.id}
              className={`flex-row items-center ${index !== items.length - 1 ? 'border-b border-gray-100 mb-3 pb-3' : ''
                }`}
            >
              <View className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden mr-3">
                {item.imageUrl ? (
                  <Image
                    source={{ uri: item.imageUrl }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-full items-center justify-center">
                    <Text className="text-gray-400 font-bold text-[10px]">
                      {item.name?.substring(0, 2)?.toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>

              <View className="flex-1 pr-2">
                <Text
                  className="text-[14px] font-bold text-gray-900 leading-5"
                  numberOfLines={2}
                >
                  {item.name}
                </Text>
                <Text className="text-[13px] text-gray-500 mt-0.5">
                  {item.qty} × ${item.price}
                </Text>
              </View>

              <Text className="text-[15px] font-bold text-gray-900">
                ${(item.qty * item.price).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View className="h-28" />
      </ScrollView>

      {/* Bottom Floating Bar */}
      <View className="absolute bottom-0 left-0 right-0 px-4 pb-5 pt-3 bg-white">
        <View className="bg-green-600 rounded-2xl px-4 py-3 flex-row items-center justify-between shadow-lg">
          <View>
            <Text className="text-white font-bold text-[14px] leading-5">Proceed to payment</Text>
            <Text className="text-green-100 text-[12px]">
              {totalItems} {totalItems === 1 ? 'item' : 'items'} · ${grandTotal.toFixed(2)}
            </Text>
          </View>

          <Pressable
            className={`bg-white rounded-xl px-5 py-2.5 ${isProcessing ? 'opacity-70' : ''}`}
            disabled={isProcessing}
            onPress={handleCheckout}
          >
            <Text className="text-green-700 font-extrabold text-[13px] tracking-wider text-center">
              {isProcessing ? 'PROCESSING' : 'CONTINUE'}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const CheckoutScreen = () => {
  const [publishableKey, setPublishableKey] = useState('');

  React.useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await fetchStripeConfig();
        if (config?.publishableKey) {
          setPublishableKey(config.publishableKey);
        }
      } catch (err) {
        console.log('Failed to fetch stripe config', err);
      }
    };
    fetchConfig();
  }, []);

  return (
    <StripeProvider publishableKey={publishableKey || 'pk_test_dummy'}>
      <CheckoutContent />
    </StripeProvider>
  );
};

export default CheckoutScreen;
