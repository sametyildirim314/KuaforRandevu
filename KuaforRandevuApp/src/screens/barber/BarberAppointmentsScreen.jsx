import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Modal, TextInput, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import api from '../../services/api';
import authStore from '../../store/authStore';
import barberDashboardService from '../../services/barberDashboardService';
import { COLORS, SHADOW, STATUS_COLORS } from '../../utils/theme';

const TABS = [
  { key: null, label: 'Tümü' },
  { key: 'Pending', label: 'Bekleyen' },
  { key: 'Confirmed', label: 'Onaylı' },
  { key: 'Completed', label: 'Tamamla' },
  { key: 'Cancelled', label: 'İptal' },
];

export default function BarberAppointmentsScreen() {
  const navigation = useNavigation();
  const { user } = authStore();
  const barberId = user?.barberId;

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(null);

  // Modal State for completing an appointment
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [priceInput, setPriceInput] = useState('');

  const fetchAppointments = useCallback(async () => {
    if (!barberId) return;
    try {
      const data = await barberDashboardService.getAppointments(barberId, activeTab);
      console.log('=== BARBER APPOINTMENTS RAW DATA ===', JSON.stringify(data?.[0], null, 2));
      setAppointments(data);
    } catch (e) {
      console.warn('FETCH ERROR:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [barberId, activeTab]);

  useEffect(() => {
    setLoading(true);
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    const unsub = navigation.addListener('focus', fetchAppointments);
    return unsub;
  }, [navigation, fetchAppointments]);

  const onRefresh = () => { setRefreshing(true); fetchAppointments(); };

  const handleUpdateStatus = async (item, newStatus) => {
    Alert.alert('Emin misiniz?', 'Randevu durumu güncellenecek.', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Evet', onPress: async () => {
        try {
          await api.put(`/api/salons/${item.salonId || user.salonId}/appointments/${item.id}/status`, { status: newStatus });
          Alert.alert('Bilgi', 'Durum başarıyla güncellendi.');
          fetchAppointments();
        } catch (e) {
          Alert.alert('Hata', 'Güncellenemedi. Lütfen tekrar deneyin.');
        }
      }}
    ]);
  };

  const handleOpenCompleteModal = (item) => {
    setSelectedAppointment(item);
    setPriceInput('');
    setModalVisible(true);
  };

  const handleCompleteAppointment = async () => {
    if (!priceInput || isNaN(priceInput)) {
      Alert.alert('Hata', 'Lütfen geçerli bir fiyat giriniz.');
      return;
    }
    try {
      await api.put(`/api/barbers/${barberId}/appointments/${selectedAppointment.id}/price`, { price: parseFloat(priceInput) });
      await api.put(`/api/salons/${selectedAppointment.salonId || user.salonId}/appointments/${selectedAppointment.id}/status`, { status: 3 });
      
      Alert.alert('Başarılı', 'Randevu tamamlandı ve gelir eklendi.');
      setModalVisible(false);
      fetchAppointments();
    } catch (e) {
      Alert.alert('Hata', 'Randevu tamamlanırken bir hata oluştu.');
    }
  };

  const renderItem = ({ item }) => {
    const sc = STATUS_COLORS[item.status] || STATUS_COLORS.Pending;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.customerName}>{item.customerName || 'Bilinmiyor'}</Text>
          <View style={[styles.badge, { backgroundColor: sc.bg, borderColor: sc.border }]}>
            <Text style={[styles.badgeText, { color: sc.text }]}>{item.statusLabel}</Text>
          </View>
        </View>
        <Text style={styles.barberLabel}>✂️ {item.barberName}</Text>
        <Text style={styles.dateLabel}>
          📅 {new Date(item.appointedAt).toLocaleDateString('tr-TR')} · {new Date(item.appointedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} ({item.durationMinutes} dk)
        </Text>
        {item.notes ? (
          <Text style={styles.notes}>Not: {item.notes}</Text>
        ) : null}

        {item.status === 'Pending' && (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.btnApprove} onPress={() => handleUpdateStatus(item, 1)}>
              <Text style={styles.btnText}>✓ Onayla</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnReject} onPress={() => handleUpdateStatus(item, 2)}>
              <Text style={styles.btnText}>✗ Reddet</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {item.status === 'Confirmed' && (
          <TouchableOpacity style={styles.btnComplete} onPress={() => handleOpenCompleteModal(item)}>
            <Text style={styles.btnText}>Randevuyu Tamamla</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
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

      {/* Fiyat Girme Modalı */}
      <Modal visible={isModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Randevuyu Tamamla</Text>
            <Text style={styles.modalDesc}>Müşteriden alınan ücreti (₺) giriniz:</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Örn: 250"
              value={priceInput}
              onChangeText={setPriceInput}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.btnComplete, { backgroundColor: COLORS.danger, flex: 1, marginRight: 10 }]} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnComplete, { flex: 1 }]} onPress={handleCompleteAppointment}>
                <Text style={styles.btnText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  tabBar: {
    flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, gap: 6, backgroundColor: '#fff',
    borderBottomWidth: 1, borderColor: COLORS.border
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
  dateLabel: { fontSize: 13, color: COLORS.textMuted, marginBottom: 5 },
  notes: { color: COLORS.primary, fontStyle: 'italic', marginBottom: 10, fontSize: 13 },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 15, color: COLORS.textMuted },
  actions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  btnApprove: { flex: 1, backgroundColor: COLORS.success, padding: 10, borderRadius: 8, alignItems: 'center' },
  btnReject: { flex: 1, backgroundColor: COLORS.danger, padding: 10, borderRadius: 8, alignItems: 'center' },
  btnComplete: { backgroundColor: COLORS.primary, padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: '#fff', padding: 20, borderRadius: 15 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  modalDesc: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 15, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 16, marginBottom: 20, textAlign: 'center' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between' }
});
