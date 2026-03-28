import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTab from './MainTab';
import SalonDetailScreen from '../screens/main/SalonDetailScreen';

const Stack = createNativeStackNavigator();

export default function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerBackTitle: 'Geri',
        headerTintColor: '#6C5CE7',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen
        name="Tabs"
        component={MainTab}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SalonDetail"
        component={SalonDetailScreen}
        options={{ title: 'Salon Detayı' }}
      />
    </Stack.Navigator>
  );
}
