import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { API_BASE_URL } from '../utils/constants';
import useNotificationStore from '../store/notificationStore';
import useAuthStore from '../store/authStore';

const MAX_RETRY_COUNT = 3;

class SignalRService {
  constructor() {
    this.connection = null;
    this.retryCount = 0;
  }

  startConnection = async () => {
    const token = useAuthStore.getState().accessToken;
    if (!token) {
      console.log('SignalR: Token bulunamadı, bağlantı atlandı.');
      return;
    }

    if (this.connection && this.connection.state !== 'Disconnected') {
      return; // Zaten bağlı
    }

    this.connection = new HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/hubs/notifications`, {
        accessTokenFactory: () => useAuthStore.getState().accessToken,
      })
      .configureLogging(LogLevel.Warning)
      .withAutomaticReconnect([0, 2000, 5000, 10000]) // Sınırlı reconnect aralıkları
      .build();

    // Event Dinleyicileri
    this.connection.on('ReceiveNotification', (notification) => {
      useNotificationStore.getState().addNotification(notification);
    });

    this.connection.on('UnreadCountUpdated', (count) => {
      useNotificationStore.getState().setUnreadCount(count);
    });

    this.connection.onclose(() => {
      console.log('SignalR Disconnected.');
    });

    try {
      await this.connection.start();
      console.log('SignalR Connected.');
      this.retryCount = 0; // Başarılı bağlantıda sayacı sıfırla

      // Bağlanınca hemen okunmamış sayısını çek
      useNotificationStore.getState().fetchUnreadCount();
    } catch (err) {
      const errorMsg = err?.message || err?.toString() || '';

      // 401 hatası: Token geçersiz veya süresi dolmuş — tekrar denemeyi durdur
      if (errorMsg.includes('401')) {
        console.warn('SignalR: Oturum süresi dolmuş (401). Bağlantı denemesi durduruldu.');
        return;
      }

      this.retryCount++;
      if (this.retryCount < MAX_RETRY_COUNT) {
        console.warn(`SignalR bağlantı hatası. Tekrar deneniyor (${this.retryCount}/${MAX_RETRY_COUNT})...`);
        setTimeout(this.startConnection, 5000);
      } else {
        console.warn('SignalR: Maksimum deneme sayısına ulaşıldı. Bağlantı durduruldu.');
      }
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
      this.connection = null;
      this.retryCount = 0;
    }
  };
}

const signalRService = new SignalRService();
export default signalRService;
