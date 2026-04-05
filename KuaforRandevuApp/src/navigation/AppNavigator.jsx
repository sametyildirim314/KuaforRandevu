import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import authStore from '../store/authStore';
import AuthStack from './AuthStack';
import MainStack from './MainStack';

// Stack, ekranlar arası geçişleri (yığın mantığıyla) yöneten yapıdır.
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  // Giriş yapılıp yapılmadığını ve yüklenme durumunu store'dan alıyoruz
  const { isAuthenticated, isLoading, loadStoredAuth } = authStore();

  // Uygulama açıldığında kayıtlı oturum bilgilerini yükler
  useEffect(() => {
    loadStoredAuth();
  }, []);

  // Eğer bilgiler hala yükleniyorsa bir yükleme animasyonu (spinner) gösterir
  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  return (
    // NavigationContainer, tüm navigasyon yapısını sarmalayan ana bileşendir
    <NavigationContainer>
      {/* headerShown: false -> Ekranların üstündeki varsayılan başlığı gizler */}
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Kullanıcı giriş yapmışsa ana sayfaları (Main), yapmamışsa giriş sayfalarını (Auth) gösterir */}
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainStack} />
        ) : (
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
    backgroundColor: '#F8F9FA',
  },
});
