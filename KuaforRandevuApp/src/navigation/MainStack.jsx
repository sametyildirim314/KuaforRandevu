import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTab from './MainTab';
import SalonDetailScreen from '../screens/main/SalonDetailScreen';
import BookingScreen from '../screens/booking/BookingScreen';
import AppointmentDetailScreen from '../screens/main/AppointmentDetailScreen';
import ReviewScreen from '../screens/review/ReviewScreen';

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
      {/* Randevu alma akışı */}
      <Stack.Screen
        name="Booking"
        component={BookingScreen}
        options={{ title: 'Randevu Al' }}
      />
      {/* Randevu detay ve iptal */}
      <Stack.Screen
        name="AppointmentDetail"
        component={AppointmentDetailScreen}
        options={{ title: 'Randevu Detayı' }}
      />
      {/* Değerlendirme formu */}
      <Stack.Screen
        name="Review"
        component={ReviewScreen}
        options={{ title: 'Değerlendirme Yap' }}
      />
    </Stack.Navigator>
  );
}
