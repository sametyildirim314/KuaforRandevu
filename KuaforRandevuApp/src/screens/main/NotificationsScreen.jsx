import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import useNotificationStore from '../../store/notificationStore';
import { COLORS } from '../../utils/theme';

export default function NotificationsScreen({ navigation }) {
  const {
    notifications,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    if (notification.relatedAppointmentId) {
      // Randevu detayına yönlendir — Salon veya Müşteri olmasına göre navigasyon değişebilir
      // Şimdilik genel AppointmentDetail'e yönlendiriyoruz
      try {
        // Eğer Salon ekranındaysak SalonAppointmentDetail, değilse AppointmentDetail
        const isSalonScreen = navigation.getState().routes.some(r => r.name.includes('Salon'));
        if (isSalonScreen) {
            navigation.navigate('SalonAppointmentDetail', { appointmentId: notification.relatedAppointmentId });
        } else {
            navigation.navigate('AppointmentDetail', { appointmentId: notification.relatedAppointmentId });
        }
      } catch (e) {
         console.log(e);
      }
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.content}>
        <Text style={[styles.title, !item.isRead && styles.unreadText]}>
          {item.title}
        </Text>
        <Text style={styles.message} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleString('tr-TR')}
        </Text>
      </View>
      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bildirimler</Text>
        {notifications.some((n) => !n.isRead) && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markAllText}>Tümünü Okundu Yap</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          !isLoading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Henüz bildiriminiz yok.</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  markAllText: { color: COLORS.primary, fontWeight: '600' },
  listContainer: { padding: 16 },
  notificationCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  unreadCard: {
    backgroundColor: '#F0EFFF', // Açık mor/primary
    borderColor: COLORS.primary,
  },
  content: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  unreadText: { color: COLORS.primary, fontWeight: '700' },
  message: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 8 },
  date: { fontSize: 12, color: '#A0AEC0' },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginLeft: 12,
  },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: COLORS.textSecondary, fontSize: 16 },
});
