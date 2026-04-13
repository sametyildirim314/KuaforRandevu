import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../services/api';
import authStore from '../../store/authStore';
import { COLORS, SHADOW, STATUS_COLORS } from '../../utils/theme';

const TABS = [
  { key: null, label: 'Tümü' },
  { key: 'Pending', label: 'Bekleyen' },
  { key: 'Confirmed', label: 'Onaylı' },
  { key: 'Completed', label: 'Tamamla' },
  { key: 'Cancelled', label: 'İptal' },
];

export default function SalonAppointmentsScreen() {
  const navigation = useNavigation();
  const { user } = authStore();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const [salonId, setSalonId] = useState(null);
  const [salons, setSalons] = useState([]);

  // Salon listesini yükle (birden fazla salon varsa)
  useEffect(() => {
    api.get('/api/salon-dashboard').then(({ data }) => {
      setSalons(data);
      if (data.length > 0) setSalonId(data[0].salonId);
    });
  }, []);

  const fetchAppointments = useCallback(async () => {
    if (!salonId) return;
    try {
      const params = { salonId };
      if (activeTab) params.status = activeTab;
      const { data } = await api.get('/api/salon-dashboard/appointments', { params });
      setAppointments(data);
    } catch (e) {
      console.warn(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [salonId, activeTab]);

  useEffect(() => {
    setLoading(true);
    fetchAppointments();
  }, [fetchAppointments]);

  // Ekrana geri dönüldüğünde yenile
  useEffect(() => {
    const unsub = navigation.addListener('focus', fetchAppointments);
    return unsub;
  }, [navigation, fetchAppointments]);

  const onRefresh = () => { setRefreshing(true); fetchAppointments(); };

  const renderItem = ({ item }) => {
    const sc = STATUS_COLORS[item.status] || STATUS_COLORS.Pending;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('SalonAppointmentDetail', { appointment: item, salonId })}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.customerName}>{item.customerName}</Text>
          <View style={[styles.badge, { backgroundColor: sc.bg, borderColor: sc.border }]}>
            <Text style={[styles.badgeText, { color: sc.text }]}>{item.statusLabel}</Text>
          </View>
        </View>
        <Text style={styles.barberLabel}>✂️ {item.barberName}</Text>
        <Text style={styles.dateLabel}>
          📅 {new Date(item.appointedAt).toLocaleDateString('tr-TR')} · {new Date(item.appointedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Salon seçici (birden fazla salon varsa) */}
      {salons.length > 1 && (
        <View style={styles.salonPicker}>
          {salons.map((s) => (
            <TouchableOpacity
              key={s.salonId}
              style={[styles.salonChip, s.salonId === salonId && styles.salonChipActive]}
              onPress={() => setSalonId(s.salonId)}
            >
              <Text style={[styles.salonChipText, s.salonId === salonId && styles.salonChipTextActive]}>
                {s.salonName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Durum sekmeleri */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key ?? 'all'}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Bu kategoride randevu yok.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  salonPicker: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, gap: 8 },
  salonChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: COLORS.card, borderWidth: 1.5, borderColor: COLORS.border,
  },
  salonChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  salonChipText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  salonChipTextActive: { color: '#fff' },
  tabBar: {
    flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, gap: 6,
  },
  tab: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, backgroundColor: COLORS.card },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  tabTextActive: { color: '#fff' },
  card: {
    backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 10, ...SHADOW,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  customerName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  barberLabel: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 3 },
  dateLabel: { fontSize: 13, color: COLORS.textMuted },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 15, color: COLORS.textMuted },
});
