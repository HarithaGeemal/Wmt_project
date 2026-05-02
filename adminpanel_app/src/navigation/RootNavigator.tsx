import { View, StyleSheet, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainNavigator from './MainNavigator';
import AuthNavigator from './AuthNavigator';
import { useAuthStore } from '../store/useAuthStore';
import { fetchMe } from '../api/apiClient';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const { isAuthenticated } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    console.log("RootNavigator mounted. isAuthenticated:", isAuthenticated);

    const checkSession = async () => {
      console.log("checkSession started");
      const state = useAuthStore.getState();
      if (state.isAuthenticated && state.token) {
        try {
          console.log("Fetching /auth/me...");
          const res = await fetchMe();
          console.log("fetchMe success, role:", res.user?.role);
          if (res.user?.role !== 'admin') {
            console.log("Not an admin. Logging out.");
            state.logout();
          }
        } catch (error) {
          console.log("Session validation failed. Logging out. Error:", error);
          state.logout();
        }
      } else {
        console.log("No authenticated session found in state.");
      }
      if (mounted) {
        console.log("Setting isReady to true from checkSession");
        setIsReady(true);
      }
    };

    let unsubFinishHydration: (() => void) | undefined;

    if (useAuthStore.persist.hasHydrated()) {
      console.log("Store already hydrated. Calling checkSession.");
      checkSession();
    } else {
      console.log("Store NOT hydrated. Waiting for onFinishHydration.");
      unsubFinishHydration = useAuthStore.persist.onFinishHydration(() => {
        console.log("onFinishHydration triggered. Calling checkSession.");
        checkSession();
      });
    }

    const fallbackTimer = setTimeout(() => {
      if (mounted && !isReady) {
        console.log("Fallback timer triggered: forcing isReady to true.");
        setIsReady(true);
      }
    }, 3000);

    return () => {
      mounted = false;
      clearTimeout(fallbackTimer);
      if (unsubFinishHydration) {
        unsubFinishHydration();
      }
    };
  }, [isReady]);

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
        <Stack.Screen name="MainStack" component={MainNavigator} />
      ) : (
        <Stack.Screen name="AuthStack" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;

const styles = StyleSheet.create({});
