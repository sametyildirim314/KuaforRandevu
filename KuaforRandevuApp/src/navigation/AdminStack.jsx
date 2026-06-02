import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminTab from './AdminTab';

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminMain" component={AdminTab} />
    </Stack.Navigator>
  );
}
