import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import authStore from '../../store/authStore';
import barberDashboardService from '../../services/barberDashboardService';
import { COLORS, SHADOW } from '../../utils/theme';
import SkeletonLoader from '../../components/SkeletonLoader';
import api from '../../services/api';

export default function BarberDashboardScreen() {
  const { user } = authStore();
  const barberId = user?.barberId;
  const [summary, setSummary] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [priceInput, setPriceInput] = useState('');

  const fetchDashboardData = async () => {
    if (!barberId) return;
    try {
      const [sumData, schedData] = await Promise.all([
        barberDashboardService.getDashboardSummary(barberId),
        barberDashboardService.getDailySchedule(barberId, new Date().toISOString().split('T')[0])
      ]);
      setSummary(sumData);
      setSchedule(schedData);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [barberId]);

  const handleUpdateStatus = async (item, newStatus) => {
    // 1: Confirmed, 2: Cancelled
    Alert.alert('Emin misiniz?', 'Randevu durumu güncellenecek.', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Evet', onPress: async () => {
        try {
          // Salon API endpoint'i üzerinden status güncelleme 
          await api.put(`/api/salons/${item.salonId || user.salonId}/appointments/${item.id}/status`, { status: newStatus });
          Alert.alert('Bilgi', 'Durum başarıyla güncellendi.');
          fetchDashboardData();
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
      // Önce fiyatı güncelle (BarberDashboardController)
      await api.put(`/api/barbers/${barberId}/appointments/${selectedAppointment.id}/price`, { price: parseFloat(priceInput) });
      
      // Ardından statüyü Completed (3) yap
      await api.put(`/api/salons/${selectedAppointment.salonId || user.salonId}/appointments/${selectedAppointment.id}/status`, { status: 3 });
      
      Alert.alert('Başarılı', 'Randevu tamamlandı ve gelir eklendi.');
      setModalVisible(false);
      fetchDashboardData();
    } catch (e) {
      Alert.alert('Hata', 'Randevu tamamlanırken bir hata oluştu.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <SkeletonLoader width={200} height={30} style={{ marginBottom: 10 }} />
          <SkeletonLoader width={150} height={20} />
        </View>
        <View style={styles.list}>
          {[1,2,3].map(i => (
             <View key={i} style={styles.card}>
                <SkeletonLoader width="100%" height={80} />
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
        <Text style={styles.title}>Günlük Program</Text>
        <Text style={styles.subtitle}>
          Bugün {summary?.totalAppointmentsToday || 0} randevu, {summary?.pendingAppointmentsCount || 0} bekleyen
        </Text>
      </View>
      <FlatList
        data={schedule}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Bugün için randevu bulunmuyor.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.time}>
                {new Date(item.appointedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} 
                ({item.durationMinutes} dk)
              </Text>
              <Text style={[styles.status, { color: item.status === 'Pending' ? COLORS.warning : COLORS.success }]}>
                {item.statusLabel}
              </Text>
            </View>
            <Text style={styles.detail}>Müşteri: <Text style={{fontWeight: 'bold'}}>{item.customerName || 'Bilinmiyor'}</Text></Text>
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
        )}
      />

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
  header: { padding: 20, backgroundColor: COLORS.primary, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#e0e0e0', marginTop: 5 },
  list: { padding: 15 },
  card: { backgroundColor: COLORS.card, padding: 15, borderRadius: 10, marginBottom: 15, ...SHADOW },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  time: { fontWeight: 'bold', fontSize: 16 },
  status: { fontWeight: 'bold' },
  detail: { color: COLORS.textSecondary, marginBottom: 5 },
  notes: { color: COLORS.primary, fontStyle: 'italic', marginBottom: 10, fontSize: 13 },
  actions: { flexDirection: 'row', gap: 10 },
  btnApprove: { flex: 1, backgroundColor: COLORS.success, padding: 10, borderRadius: 8, alignItems: 'center' },
  btnReject: { flex: 1, backgroundColor: COLORS.danger, padding: 10, borderRadius: 8, alignItems: 'center' },
  btnComplete: { backgroundColor: COLORS.primary, padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 5 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 50, color: 'gray' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: '#fff', padding: 20, borderRadius: 15 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  modalDesc: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 15, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 16, marginBottom: 20, textAlign: 'center' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between' }
});
