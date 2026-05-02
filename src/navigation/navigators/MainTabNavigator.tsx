import { StyleSheet } from 'react-native';
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../../screens/HomeScreen';
import StoreScreen from '../../screens/StoreScreen';
import AvailableOrdersScreen from '../../screens/AvailableOrdersScreen';
import { MainRoutes } from 'navigation/Routes';
import FontAwesome from '@react-native-vector-icons/fontawesome';
import { useAuthStore } from '../../store/useAuthStore';

const tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const { user } = useAuthStore();
  const isDriver = user?.role === 'driver';

  return (
    <tab.Navigator screenOptions={{
        tabBarActiveTintColor: "#1E88E5",
        headerShown: false,
    }}>
      <tab.Screen
        name={MainRoutes.Home}
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }: { color: string }) => (
            <FontAwesome name="home" size={28} color={color} />
          ),
        }}
      />
      <tab.Screen
        name={MainRoutes.Store}
        component={StoreScreen}
        options={{
          tabBarIcon: ({ color }: { color: string }) => (
            <FontAwesome name="shopping-cart" size={28} color={color} />
          ),
        }}
      />
      {isDriver && (
        <tab.Screen
          name={MainRoutes.Deliveries}
          component={AvailableOrdersScreen}
          options={{
            title: 'Deliveries',
            tabBarIcon: ({ color }: { color: string }) => (
              <FontAwesome name="motorcycle" size={24} color={color} />
            ),
          }}
        />
      )}
    </tab.Navigator>
  );
};

export default MainTabNavigator;

const styles = StyleSheet.create({});
