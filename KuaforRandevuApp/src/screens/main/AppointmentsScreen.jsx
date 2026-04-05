import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import appointmentStore from '../../store/appointmentStore';

// Sekme tanımları
const TABS = [
  { key: 'active', label: 'Aktif' },
  { key: 'past', label: 'Geçmiş' },
  { key: 'cancelled', label: 'İptal' },
];

// Durum badge renkleri
const STATUS_COLORS = {
  Pending:   { bg: '#FFA500', txt: '#fff' },
  Confirmed: { bg: '#00b894', txt: '#fff' },
  Completed: { bg: '#636E72', txt: '#fff' },
  Cancelled: { bg: '#e74c3c', txt: '#fff' },
};

export default function AppointmentsScreen() {
  const navigation = useNavigation();
  const { appointments, loading, fetchMyAppointments } = appointmentStore();
  const [activeTab, setActiveTab] = useState('active');
  const [refreshing, setRefreshing] = useState(false);

  // Ekran açıldığında randevuları yükle
  useEffect(() => { fetchMyAppointments(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyAppointments();
    setRefreshing(false);
  };

  // Sekmeye göre filtrele
  const filtered = appointments.filter((a) => {
    if (activeTab === 'active') return a.status === 'Pending' || a.status === 'Confirmed';
    if (activeTab === 'past') return a.status === 'Completed';
    if (activeTab === 'cancelled') return a.status === 'Cancelled';
    return true;
  });

  const renderItem = ({ item }) => {
    const colors = STATUS_COLORS[item.status] || { bg: '#aaa', txt: '#fff' };
    const dateStr = new Date(item.appointedAt).toLocaleString('tr-TR', {
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: item.id })}
        activeOpacity={0.8}
      >
        <View style={styles.cardTop}>
          <Text style={styles.barberName}>{item.barberName}</Text>
          <View style={[styles.badge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.badgeText, { color: colors.txt }]}>{item.statusLabel}</Text>
          </View>
        </View>
        <Text style={styles.salonName}>📍 {item.salonName}</Text>
        <Text style={styles.dateText}>🕐 {dateStr}</Text>
        <Text style={styles.durationText}>✂️ Saç Kesimi · {item.durationMinutes} dk</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Sekmeler */}
      <View style={styles.tabBar}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, activeTab === t.key && styles.tabActive]}
            onPress={() => setActiveTab(t.key)}
          >
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#6C5CE7" style={{ marginTop: 48 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Bu kategoride randevu bulunamadı.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#6C5CE7' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#636E72' },
  tabTextActive: { color: '#6C5CE7' },
  listContent: { padding: 16, paddingBottom: 80 },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07,
    shadowRadius: 6, elevation: 3,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  barberName: { fontSize: 16, fontWeight: '700', color: '#2D3436' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  salonName: { fontSize: 13, color: '#636E72', marginBottom: 4 },
  dateText: { fontSize: 13, color: '#636E72', marginBottom: 4 },
  durationText: { fontSize: 13, color: '#636E72' },
  emptyText: { textAlign: 'center', color: '#636E72', marginTop: 32, fontSize: 15 },
});
