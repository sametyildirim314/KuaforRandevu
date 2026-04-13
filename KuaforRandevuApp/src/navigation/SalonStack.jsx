import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SalonTab from './SalonTab';
import SalonAppointmentDetailScreen from '../screens/salon/SalonAppointmentDetailScreen';
import BarberFormScreen from '../screens/salon/BarberFormScreen';
import { COLORS } from '../utils/theme';

const Stack = createNativeStackNavigator();

export default function SalonStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerBackTitle: 'Geri',
        headerTintColor: COLORS.primary,
        headerTitleStyle: { fontWeight: '700', color: COLORS.textPrimary },
      }}
    >
      <Stack.Screen name="SalonTabs" component={SalonTab} options={{ headerShown: false }} />
      <Stack.Screen
        name="SalonAppointmentDetail"
        component={SalonAppointmentDetailScreen}
        options={{ title: 'Randevu Detayı' }}
      />
      <Stack.Screen
        name="BarberForm"
        component={BarberFormScreen}
        options={{ title: 'Berber Formu' }}
      />
    </Stack.Navigator>
  );
}
