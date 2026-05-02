import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import UserScreen from '../screens/UserScreen';

const Stack = createNativeStackNavigator();

const UsersStack = () => {
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
      <Stack.Screen name="UsersList" component={UserScreen} options={{ title: 'Users' }} />
    </Stack.Navigator>
  );
};

export default UsersStack;
