import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity,
} from 'react-native';
import api from '../../services/api';
import { COLORS, SHADOW } from '../../utils/theme';
import authStore from '../../store/authStore';

export default function DashboardScreen() {
  const { user } = authStore();
  const [dashboardData, setDashboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const { data } = await api.get('/api/salon-dashboard');
      setDashboardData(data);
    } catch (e) {
      console.warn(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const onRefresh = () => { setRefreshing(true); fetchDashboard(); };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Selamlama
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi günler' : 'İyi akşamlar';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      {/* Karşılama */}
      <Text style={styles.greeting}>{greeting} 👋</Text>
      <Text style={styles.userName}>{user?.fullName}</Text>

      {dashboardData.map((salon) => (
        <View key={salon.salonId} style={styles.salonSection}>
          <Text style={styles.salonName}>{salon.salonName}</Text>

          {/* İstatistik Kartları */}
          <View style={styles.statsGrid}>
            <StatCard icon="📅" label="Bugün" value={salon.todayAppointments} color={COLORS.primary} />
            <StatCard icon="⏳" label="Bekleyen" value={salon.pendingCount} color={COLORS.warning} />
            <StatCard icon="✅" label="Bu Hafta" value={salon.completedThisWeek} color={COLORS.success} />
            <StatCard icon="⭐" label="Puan" value={salon.averageRating > 0 ? salon.averageRating.toFixed(1) : '—'} color={COLORS.star} />
          </View>

          {/* Berber sayısı */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>✂️ Aktif Berber</Text>
            <Text style={styles.infoValue}>{salon.totalBarbers}</Text>
          </View>
        </View>
      ))}

      {dashboardData.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Henüz salonunuz bulunmuyor.</Text>
        </View>
      )}
    </ScrollView>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  greeting: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 2 },
  userName: { fontSize: 26, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 24 },
  salonSection: { marginBottom: 28 },
  salonName: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 14 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  statCard: {
    flex: 1, minWidth: '45%', backgroundColor: COLORS.card, borderRadius: 12, padding: 14,
    borderLeftWidth: 4, ...SHADOW,
  },
  statIcon: { fontSize: 20, marginBottom: 6 },
  statValue: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.card, borderRadius: 12, padding: 14, ...SHADOW,
  },
  infoLabel: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  infoValue: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 15, color: COLORS.textMuted },
});
