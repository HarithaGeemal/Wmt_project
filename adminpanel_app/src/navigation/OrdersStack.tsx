import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OrdersScreen from '../screens/OrdersScreen';
import UserOrdersScreen from '../screens/UserOrdersScreen';

const Stack = createNativeStackNavigator();

const OrdersStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "tomato" },
        headerTintColor: "white",
        headerTitleStyle: { fontWeight: "bold" },
        headerTitleAlign: "center",
        headerShadowVisible: false
      }}
    >
      <Stack.Screen name="OrdersList" component={OrdersScreen} options={{ title: 'All Orders' }} />
      <Stack.Screen name="UserOrders" component={UserOrdersScreen} options={{ title: "User's Orders" }} />
    </Stack.Navigator>
  );
};

export default OrdersStack;