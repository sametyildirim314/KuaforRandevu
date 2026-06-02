import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import adminService from '../../services/adminService';
import { COLORS, SHADOW } from '../../utils/theme';
import { Ionicons } from '@expo/vector-icons';

export default function AdminDashboardScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await adminService.getStatistics();
      setStats(data);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading && !refreshing) {
    return <ActivityIndicator style={styles.center} size="large" color={COLORS.primary} />;
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Sistem Özeti</Text>
        <Text style={styles.subtitle}>Genel istatistikler ve bekleyen işlemler</Text>
      </View>

      <View style={styles.grid}>
        <StatCard title="Toplam Kullanıcı" value={stats?.totalUsers || 0} icon="people" color="#3498db" />
        <StatCard title="Toplam Salon" value={stats?.totalSalons || 0} icon="business" color="#9b59b6" />
        <StatCard title="Toplam Randevu" value={stats?.totalAppointments || 0} icon="calendar" color="#2ecc71" />
        <StatCard title="Bekleyen Onaylar" value={stats?.pendingSalons || 0} icon="time" color="#f1c40f" />
      </View>
    </ScrollView>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={32} color={color} />
      </View>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, paddingTop: 60, backgroundColor: COLORS.primary, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#e0e0e0', marginTop: 5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 10, marginTop: 10 },
  card: {
    width: '45%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    margin: '2.5%',
    alignItems: 'center',
    ...SHADOW
  },
  iconContainer: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  cardValue: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary },
  cardTitle: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginTop: 5 }
});
