import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import api from './api';

// Bildirimlerin ekranda nasıl görüneceğini yapılandır
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const registerForPushNotificationsAsync = async () => {
  let token;

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const settings = await Notifications.getPermissionsAsync();
      let existingStatus = settings?.status;
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const request = await Notifications.requestPermissionsAsync();
        finalStatus = request?.status;
      }
      if (finalStatus !== 'granted') {
        console.log('Push notification izni alınamadı!');
        return;
      }
      
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
        
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      token = tokenData?.data;
      
      if (token) {
        console.log('Expo Push Token:', token);
        try {
          await api.post('/api/push-token', { token });
        } catch (error) {
          console.error('Push token kaydı başarısız:', error);
        }
      }
    } else {
      console.log('Push bildirimleri fiziksel cihaz gerektirir.');
    }
  } catch (error) {
    console.error('Push notification ayarlanırken hata:', error);
  }

  return token;
};
