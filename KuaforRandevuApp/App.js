import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, StyleSheet, View } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

// Uygulamanın ana giriş bileşeni
export default function App() {
  return (
    // SafeAreaProvider, çentik ve durum çubuğu gibi alanları yönetmek için kullanılır
    <SafeAreaProvider>
      <View style={styles.root}>
        {/* statusBar: Telefonun üst kısmındaki pil, saat gibi bilgilerin stili */}
        <StatusBar style="dark" />
        {/* AppNavigator: Uygulamanın sayfalar arası geçişini (navigasyon) yönetir */}
        <AppNavigator />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1, // Ekranın tamamını kaplamasını sağlar
    // Web platformu için minimum yüksekliği ayarlar
    minHeight: Platform.OS === 'web' ? '100vh' : undefined,
  },
});
