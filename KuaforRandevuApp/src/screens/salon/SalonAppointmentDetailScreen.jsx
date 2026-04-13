import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../../services/api';
import { COLORS, SHADOW, STATUS_COLORS } from '../../utils/theme';

export default function SalonAppointmentDetailScreen() {
  const navigation = useNavigation();
  const { appointment } = useRoute().params;
  const [status, setStatus] = useState(appointment.status);
  const [statusLabel, setStatusLabel] = useState(appointment.statusLabel);
  const [busy, setBusy] = useState(false);

  const handleAction = async (action, confirmMsg) => {
    Alert.alert('Emin misiniz?', confirmMsg, [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Evet',
        onPress: async () => {
          setBusy(true);
          try {
            await api.put(`/api/salon-dashboard/appointments/${appointment.id}/${action}`);
            const labels = { confirm: ['Confirmed', 'Onaylandı'], cancel: ['Cancelled', 'İptal Edildi'], complete: ['Completed', 'Tamamlandı'] };
            setStatus(labels[action][0]);
            setStatusLabel(labels[action][1]);
            Alert.alert('✅', `Randevu ${labels[action][1].toLowerCase()} olarak güncellendi.`);
          } catch (e) {
            Alert.alert('Hata', e.response?.data?.message || e.message);
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  };

  const sc = STATUS_COLORS[status] || STATUS_COLORS.Pending;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Durum banner */}
      <View style={[styles.banner, { backgroundColor: sc.bg, borderColor: sc.border }]}>
        <Text style={[styles.bannerText, { color: sc.text }]}>{statusLabel}</Text>
      </View>

      {/* Detay kartı */}
      <View style={styles.card}>
        <DetailRow label="Müşteri" value={appointment.customerName} />
        <DetailRow label="Kuaför" value={appointment.barberName} />
        <DetailRow label="Tarih" value={new Date(appointment.appointedAt).toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} />
        <DetailRow label="Saat" value={new Date(appointment.appointedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} />
        <DetailRow label="Süre" value={`${appointment.durationMinutes} dakika`} />
        {appointment.notes ? <DetailRow label="Not" value={appointment.notes} /> : null}
      </View>

      {/* Aksiyon butonları */}
      {busy ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
      ) : (
        <View style={styles.actions}>
          {status === 'Pending' && (
            <>
              <TouchableOpacity
                style={[styles.actionBtn, styles.confirmBtn]}
                onPress={() => handleAction('confirm', 'Bu randevuyu onaylamak istiyor musunuz?')}
              >
                <Text style={styles.actionBtnConfirmText}>✓ Onayla</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.cancelBtn]}
                onPress={() => handleAction('cancel', 'Bu randevuyu iptal etmek istiyor musunuz?')}
              >
                <Text style={styles.actionBtnCancelText}>✗ İptal Et</Text>
              </TouchableOpacity>
            </>
          )}
          {status === 'Confirmed' && (
            <>
              <TouchableOpacity
                style={[styles.actionBtn, styles.completeBtn]}
                onPress={() => handleAction('complete', 'Bu randevuyu tamamlandı olarak işaretlemek istiyor musunuz?')}
              >
                <Text style={styles.actionBtnConfirmText}>✓✓ Tamamla</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.cancelBtn]}
                onPress={() => handleAction('cancel', 'Bu randevuyu iptal etmek istiyor musunuz?')}
              >
                <Text style={styles.actionBtnCancelText}>✗ İptal Et</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}

function DetailRow({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 48 },
  banner: {
    borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 20,
    borderWidth: 1,
  },
  bannerText: { fontSize: 15, fontWeight: '700' },
  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 20, ...SHADOW },
  row: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  rowLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 2 },
  rowValue: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  actions: { gap: 10 },
  actionBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  confirmBtn: { backgroundColor: COLORS.success },
  completeBtn: { backgroundColor: COLORS.primary },
  cancelBtn: { borderWidth: 2, borderColor: COLORS.danger, backgroundColor: 'transparent' },
  actionBtnConfirmText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  actionBtnCancelText: { color: COLORS.danger, fontWeight: '700', fontSize: 15 },
});
