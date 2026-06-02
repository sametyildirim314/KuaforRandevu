import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import adminService from '../../services/adminService';
import { COLORS } from '../../utils/theme';

export default function AdminSalonsScreen() {
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSalons = async () => {
    try {
      const data = await adminService.getSalons();
      setSalons(data);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalons();
  }, []);

  const handleApprove = (salon, isApprove) => {
    // 1: Approved, 2: Rejected
    const statusVal = isApprove ? 1 : 2; 
    const actionText = isApprove ? 'onaylamak' : 'reddetmek';

    Alert.alert('Emin misiniz?', `${salon.name} adlı salonu ${actionText} istiyor musunuz?`, [
      { text: 'İptal', style: 'cancel' },
      { text: 'Evet', style: isApprove ? 'default' : 'destructive', onPress: async () => {
          try {
            await adminService.updateSalonStatus(salon.id, statusVal);
            fetchSalons();
          } catch (e) {
            Alert.alert('Hata', 'İşlem başarısız');
          }
      }}
    ]);
  };

  const getStatusText = (status) => {
    if (status === 0) return { label: 'Bekliyor', color: '#f39c12' };
    if (status === 1) return { label: 'Onaylandı', color: '#27ae60' };
    return { label: 'Reddedildi', color: '#c0392b' };
  };

  if (loading) return <ActivityIndicator style={styles.center} size="large" color={COLORS.primary} />;

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Salon Başvuruları</Text>
      <FlatList
        data={salons}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 15 }}
        renderItem={({ item }) => {
          const st = getStatusText(item.approvalStatus);
          return (
            <View style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={[styles.status, { color: st.color }]}>{st.label}</Text>
              </View>
              <Text style={styles.detail}>Sahibi: {item.ownerName}</Text>
              <Text style={styles.detail}>Şehir: {item.city}</Text>
              
              {item.approvalStatus === 0 && (
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.btnApprove} onPress={() => handleApprove(item, true)}>
                    <Text style={styles.btnText}>✓ Onayla</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnReject} onPress={() => handleApprove(item, false)}>
                    <Text style={styles.btnText}>✗ Reddet</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center' },
  container: { flex: 1, backgroundColor: COLORS.background },
  headerTitle: { fontSize: 22, fontWeight: 'bold', margin: 20, marginTop: 50 },
  card: { backgroundColor: COLORS.card, padding: 15, borderRadius: 10, marginBottom: 15, elevation: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  name: { fontSize: 18, fontWeight: 'bold', flex: 1 },
  status: { fontWeight: 'bold', fontSize: 13 },
  detail: { color: COLORS.textSecondary, marginBottom: 4 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 15 },
  btnApprove: { flex: 1, backgroundColor: COLORS.success, padding: 12, borderRadius: 8, alignItems: 'center' },
  btnReject: { flex: 1, borderWidth: 2, borderColor: COLORS.danger, padding: 10, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' }
});
