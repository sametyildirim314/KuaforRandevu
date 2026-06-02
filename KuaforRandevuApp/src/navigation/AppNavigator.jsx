import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import authStore from '../store/authStore';
import AuthStack from './AuthStack';
import MainStack from './MainStack';
import SalonStack from './SalonStack';
import AdminStack from './AdminStack';
import BarberStack from './BarberStack';
import { COLORS } from '../utils/theme';
import signalRService from '../services/signalRService';
import { registerForPushNotificationsAsync } from '../services/pushNotificationService';

// Stack, ekranlar arası geçişleri (yığın mantığıyla) yöneten yapıdır.
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  // Giriş yapılıp yapılmadığını ve yüklenme durumunu store'dan alıyoruz
  const { isAuthenticated, isLoading, loadStoredAuth, user } = authStore();

  // Uygulama açıldığında kayıtlı oturum bilgilerini yükler
  useEffect(() => {
    loadStoredAuth();
  }, []);

  // Giriş yapıldığında SignalR başlat ve Push Token al
  useEffect(() => {
    if (isAuthenticated) {
      signalRService.startConnection();
      registerForPushNotificationsAsync();
    } else {
      signalRService.stopConnection();
    }
  }, [isAuthenticated]);

  // Eğer bilgiler hala yükleniyorsa bir yükleme animasyonu (spinner) gösterir
  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Kullanıcı rolüne göre hangi navigasyon akışının gösterileceğini belirle
  const isSalonOwner = user?.role === 'SalonOwner';
  const isAdmin = user?.role === 'Admin';
  const isBarber = user?.role === 'Barber';

  return (
    // NavigationContainer, tüm navigasyon yapısını sarmalayan ana bileşendir
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // Giriş yapılmış — role göre yönlendir
          isAdmin ? (
            <Stack.Screen name="Admin" component={AdminStack} />
          ) : isSalonOwner ? (
            <Stack.Screen name="Salon" component={SalonStack} />
          ) : isBarber ? (
            <Stack.Screen name="Barber" component={BarberStack} />
          ) : (
            <Stack.Screen name="Main" component={MainStack} />
          )
        ) : (
          // Giriş yapılmamış — auth ekranları
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
