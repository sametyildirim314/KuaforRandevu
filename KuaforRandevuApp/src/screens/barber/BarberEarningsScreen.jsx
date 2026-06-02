import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import authStore from '../../store/authStore';
import barberDashboardService from '../../services/barberDashboardService';
import { COLORS, SHADOW } from '../../utils/theme';
import SkeletonLoader from '../../components/SkeletonLoader';

export default function BarberEarningsScreen() {
  const { user } = authStore();
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      if (!user?.barberId) return;
      try {
        const data = await barberDashboardService.getEarnings(user.barberId);
        setEarnings(data);
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, [user?.barberId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <SkeletonLoader width={200} height={30} style={{ marginBottom: 10 }} />
          <SkeletonLoader width={150} height={20} />
        </View>
        <View style={styles.grid}>
          {[1,2,3,4].map(i => (
             <View key={i} style={styles.card}>
                <SkeletonLoader width="80%" height={20} style={{ marginBottom: 10 }} />
                <SkeletonLoader width="50%" height={30} />
             </View>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.title}>Gelir İstatistikleri</Text>
        <Text style={styles.subtitle}>Tamamlanan randevulardan elde edilen gelirler</Text>
      </View>
      <ScrollView contentContainerStyle={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Günlük Kazanç</Text>
          <Text style={styles.cardValue}>{earnings?.dailyEarnings || 0} ₺</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Haftalık Kazanç</Text>
          <Text style={styles.cardValue}>{earnings?.weeklyEarnings || 0} ₺</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Aylık Kazanç</Text>
          <Text style={styles.cardValue}>{earnings?.monthlyEarnings || 0} ₺</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Toplam Kazanç</Text>
          <Text style={styles.cardValue}>{earnings?.totalEarnings || 0} ₺</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, backgroundColor: COLORS.primary, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
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
  cardTitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 10, textAlign: 'center' },
  cardValue: { fontSize: 22, fontWeight: 'bold', color: COLORS.textPrimary },
});
