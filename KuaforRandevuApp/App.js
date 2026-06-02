import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import OfflineNotice from './src/components/OfflineNotice';
import { StyleSheet, View, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <StatusBar style="dark" />
        <OfflineNotice />
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
