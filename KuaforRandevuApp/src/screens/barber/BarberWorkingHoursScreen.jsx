import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import authStore from '../../store/authStore';
import barberDashboardService from '../../services/barberDashboardService';
import { COLORS, SHADOW } from '../../utils/theme';
import SkeletonLoader from '../../components/SkeletonLoader';

export default function BarberWorkingHoursScreen() {
  const { user } = authStore();
  const [hours, setHours] = useState({ workStartHour: '09', workEndHour: '18', slotDurationMinutes: '30' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchHours = async () => {
      if (!user?.barberId) return;
      try {
        const data = await barberDashboardService.getWorkingHours(user.barberId);
        setHours({
          workStartHour: data.workStartHour.toString(),
          workEndHour: data.workEndHour.toString(),
          slotDurationMinutes: data.slotDurationMinutes.toString()
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    };
    fetchHours();
  }, [user?.barberId]);

  const handleSave = async () => {
    if (!user?.barberId) return;
    setSaving(true);
    try {
      await barberDashboardService.updateWorkingHours(user.barberId, {
        workStartHour: parseInt(hours.workStartHour),
        workEndHour: parseInt(hours.workEndHour),
        slotDurationMinutes: parseInt(hours.slotDurationMinutes)
      });
      Alert.alert('Başarılı', 'Çalışma saatleri güncellendi.');
    } catch (e) {
      Alert.alert('Hata', 'Güncellenemedi. Lütfen değerleri kontrol edin.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <SkeletonLoader width={200} height={30} style={{ margin: 20 }} />
        <View style={styles.card}>
          <SkeletonLoader width="100%" height={50} style={{ marginBottom: 15 }} />
          <SkeletonLoader width="100%" height={50} style={{ marginBottom: 15 }} />
          <SkeletonLoader width="100%" height={50} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Mesai Saatleri</Text>
      
      <View style={styles.card}>
        <Text style={styles.label}>Mesai Başlangıcı (Saat: 0-23)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={hours.workStartHour}
          onChangeText={t => setHours(prev => ({ ...prev, workStartHour: t }))}
          maxLength={2}
        />

        <Text style={styles.label}>Mesai Bitişi (Saat: 0-24)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={hours.workEndHour}
          onChangeText={t => setHours(prev => ({ ...prev, workEndHour: t }))}
          maxLength={2}
        />

        <Text style={styles.label}>Randevu Aralığı (Dakika)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={hours.slotDurationMinutes}
          onChangeText={t => setHours(prev => ({ ...prev, slotDurationMinutes: t }))}
          maxLength={3}
        />

        <TouchableOpacity style={styles.btnSave} onPress={handleSave} disabled={saving}>
          <Text style={styles.btnSaveText}>{saving ? 'Kaydediliyor...' : 'Kaydet'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerTitle: { fontSize: 24, fontWeight: 'bold', margin: 20, color: COLORS.textPrimary },
  card: { backgroundColor: COLORS.card, padding: 20, margin: 15, borderRadius: 10, ...SHADOW },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 5, color: COLORS.textSecondary },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 15, fontSize: 16 },
  btnSave: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  btnSaveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
