import { Platform } from 'react-native';

// Fiziksel cihazda test için buraya IP adresinizi yazın: 'http://192.168.1.100:5252'
const API_URL_OVERRIDE = null;

// API Base URL - Android emülatör: 10.0.2.2, iOS: localhost
// Fiziksel cihaz: API_URL_OVERRIDE kullanın
export const API_BASE_URL = API_URL_OVERRIDE ?? (__DEV__
  ? Platform.select({
      android: 'http://10.0.2.2:5252',
      ios: 'http://localhost:5252',
      web: 'http://localhost:5252',
      default: 'http://localhost:5252',
    })
  : 'https://your-api-domain.com');

export const API_ENDPOINTS = {
  register: '/api/auth/register',
  login: '/api/auth/login',
  refreshToken: '/api/auth/refresh-token',
  forgotPassword: '/api/auth/forgot-password',
  resetPassword: '/api/auth/reset-password',
};
