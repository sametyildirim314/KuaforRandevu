import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../utils/constants';
import appointmentStore from '../../store/appointmentStore';

const STATUS_COLORS = {
  Pending:   { bg: '#FFF3CD', border: '#FFA500', text: '#856404' },
  Confirmed: { bg: '#D1F2EB', border: '#00b894', text: '#155724' },
  Completed: { bg: '#E2E3E5', border: '#636E72', text: '#383d41' },
  Cancelled: { bg: '#F8D7DA', border: '#e74c3c', text: '#721c24' },
};

export default function AppointmentDetailScreen() {
  const { appointmentId } = useRoute().params;
  const navigation = useNavigation();
  const { cancelAppointment } = appointmentStore();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    api.get(`${API_ENDPOINTS.appointments}/${appointmentId}`)
      .then((r) => setAppointment(r.data))
      .catch((e) => console.warn(e.message))
      .finally(() => setLoading(false));
  }, [appointmentId]);

  const handleCancel = () => {
    Alert.alert(
      'Randevuyu İptal Et',
      'Bu randevuyu iptal etmek istediğinize emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'İptal Et', style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            try {
              await cancelAppointment(appointmentId);
              setAppointment((prev) => ({ ...prev, status: 'Cancelled', statusLabel: 'İptal Edildi' }));
            } catch (e) {
              Alert.alert('Hata', e.message);
            } finally {
              setCancelling(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  if (!appointment) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Randevu bulunamadı.</Text>
      </View>
    );
  }

  const colors = STATUS_COLORS[appointment.status] || STATUS_COLORS.Cancelled;
  const dateStr = new Date(appointment.appointedAt).toLocaleString('tr-TR', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  const isActive = appointment.status === 'Pending' || appointment.status === 'Confirmed';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Durum banner */}
      <View style={[styles.statusBanner, { backgroundColor: colors.bg, borderColor: colors.border }]}>
        <Text style={[styles.statusText, { color: colors.text }]}>{appointment.statusLabel}</Text>
      </View>

      {/* Detaylar */}
      <View style={styles.card}>
        {[
          ['👤 Kuaför', appointment.barberName],
          ['📍 Salon', appointment.salonName],
          ['✂️ Hizmet', `Saç Kesimi · ${appointment.durationMinutes} dk`],
          ['📅 Tarih & Saat', dateStr],
        ].map(([label, value]) => (
          <View key={label} style={styles.rowItem}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.rowValue}>{value}</Text>
          </View>
        ))}
        {appointment.notes ? (
          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>📝 Not</Text>
            <Text style={styles.rowValue}>{appointment.notes}</Text>
          </View>
        ) : null}
      </View>

      {/* İptal butonu — sadece aktif randevularda görünür */}
      {isActive && (
        <TouchableOpacity
          style={[styles.cancelBtn, cancelling && styles.cancelBtnDisabled]}
          disabled={cancelling}
          onPress={handleCancel}
        >
          {cancelling ? (
            <ActivityIndicator color="#e74c3c" />
          ) : (
            <Text style={styles.cancelBtnText}>Randevuyu İptal Et</Text>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { padding: 20, paddingBottom: 48 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#636E72', fontSize: 16 },
  statusBanner: { borderRadius: 12, borderWidth: 1.5, padding: 14, alignItems: 'center', marginBottom: 20 },
  statusText: { fontWeight: '800', fontSize: 16 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3, marginBottom: 20 },
  rowItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  rowLabel: { fontSize: 12, color: '#636E72', marginBottom: 2 },
  rowValue: { fontSize: 15, fontWeight: '600', color: '#2D3436' },
  cancelBtn: { borderWidth: 2, borderColor: '#e74c3c', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  cancelBtnDisabled: { opacity: 0.6 },
  cancelBtnText: { color: '#e74c3c', fontWeight: '700', fontSize: 15 },
});
