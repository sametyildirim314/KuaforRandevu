import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator as createNativeStack } from '@react-navigation/native-stack';
import BarberTab from './BarberTab';

const Stack = createNativeStack();

export default function BarberStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BarberTab" component={BarberTab} />
    </Stack.Navigator>
  );
}
