import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import React, { useEffect } from 'react';
import { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainNavigator from './MainNavigator';
import { RootRoutes } from '../Routes';
import AuthNavigator from './AuthNavigator';
import { useAuthStore } from 'store/useAuthStore';
import { fetchMe } from '../../api/apiClient';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const { isAuthenticated } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const state = useAuthStore.getState();
      if (state.isAuthenticated && state.token) {
        try {
          await fetchMe();
        } catch (error) {
          console.log("Session validation failed. Logging out.");
          state.logout();
        }
      }
      setIsReady(true);
    };

    if (useAuthStore.persist.hasHydrated()) {
      checkSession();
    } else {
      const unsub = useAuthStore.persist.onFinishHydration(() => {
        checkSession();
      });
      return unsub;
    }
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name={RootRoutes.MainStack} component={MainNavigator} />
      ) : (
        <Stack.Screen name={RootRoutes.AuthStack} component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;

const styles = StyleSheet.create({});
