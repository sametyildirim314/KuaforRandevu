import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { API_BASE_URL } from '../utils/constants';
import useNotificationStore from '../store/notificationStore';
import useAuthStore from '../store/authStore';

class SignalRService {
  constructor() {
    this.connection = null;
  }

  startConnection = async () => {
    const token = useAuthStore.getState().accessToken;
    if (!token) return;

    if (this.connection && this.connection.state !== 'Disconnected') {
      return; // Zaten bağlı
    }

    this.connection = new HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/hubs/notifications`, {
        accessTokenFactory: () => token,
      })
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    // Event Dinleyicileri
    this.connection.on('ReceiveNotification', (notification) => {
      useNotificationStore.getState().addNotification(notification);
    });

    this.connection.on('UnreadCountUpdated', (count) => {
      useNotificationStore.getState().setUnreadCount(count);
    });

    try {
      await this.connection.start();
      console.log('SignalR Connected.');
      
      // Bağlanınca hemen okunmamış sayısını çek
      useNotificationStore.getState().fetchUnreadCount();
    } catch (err) {
      console.error('SignalR Connection Error: ', err);
      setTimeout(this.startConnection, 5000);
    }
  };

  stopConnection = async () => {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log('SignalR Disconnected.');
      } catch (err) {
        console.error('SignalR Disconnect Error: ', err);
      }
    }
  };
}

const signalRService = new SignalRService();
export default signalRService;
