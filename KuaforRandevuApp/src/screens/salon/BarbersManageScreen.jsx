import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../services/api';
import authStore from '../../store/authStore';
import { COLORS, SHADOW } from '../../utils/theme';
import StarRating from '../../components/StarRating';

export default function BarbersManageScreen() {
  const navigation = useNavigation();
  const { user } = authStore();

  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [salonId, setSalonId] = useState(null);
  const [salons, setSalons] = useState([]);

  // Salon listesini yükle
  useEffect(() => {
    api.get('/api/salon-dashboard').then(({ data }) => {
      setSalons(data);
      if (data.length > 0) setSalonId(data[0].salonId);
    });
  }, []);

  const fetchBarbers = useCallback(async () => {
    if (!salonId) return;
    try {
      const { data } = await api.get('/api/salon-dashboard/barbers', { params: { salonId } });
      setBarbers(data);
    } catch (e) {
      console.warn(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [salonId]);

  useEffect(() => {
    if (salonId) { setLoading(true); fetchBarbers(); }
  }, [fetchBarbers, salonId]);

  // Ekrana dönüldüğünde yenile
  useEffect(() => {
    const unsub = navigation.addListener('focus', fetchBarbers);
    return unsub;
  }, [navigation, fetchBarbers]);

  const onRefresh = () => { setRefreshing(true); fetchBarbers(); };

  const handleDelete = (barberId, displayName) => {
    Alert.alert('Berber Sil', `${displayName} kaldırılsın mı?`, [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/api/salon-dashboard/barbers/${barberId}`);
            setBarbers((prev) => prev.filter((b) => b.id !== barberId));
          } catch (e) {
            Alert.alert('Hata', e.response?.data?.message || e.message);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.barberName}>{item.displayName}</Text>
          <Text style={styles.barberMeta}>
            🕐 {item.workStartHour}:00 – {item.workEndHour}:00 · {item.slotDurationMinutes} dk
          </Text>
          <View style={styles.ratingRow}>
            <StarRating value={Math.round(item.averageRating)} readonly size={14} />
            <Text style={styles.ratingText}>
              {item.reviewCount > 0 ? ` ${item.averageRating.toFixed(1)} (${item.reviewCount})` : ' Henüz yorum yok'}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('BarberForm', { mode: 'edit', barber: item, salonId })}
        >
          <Text style={styles.editBtnText}>✏️ Düzenle</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item.id, item.displayName)}
        >
          <Text style={styles.deleteBtnText}>🗑️ Kaldır</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Salon seçici */}
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

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={barbers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Henüz berber eklenmemiş.</Text>
            </View>
          }
        />
      )}

      {/* Berber ekle butonu (FAB) */}
      {salonId && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('BarberForm', { mode: 'add', salonId })}
          activeOpacity={0.85}
        >
          <Text style={styles.fabText}>+ Yeni Berber</Text>
        </TouchableOpacity>
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
  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 10, ...SHADOW },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  barberName: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  barberMeta: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  ratingText: { fontSize: 12, color: COLORS.textMuted },
  cardActions: { flexDirection: 'row', gap: 10, marginTop: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 12 },
  editBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: COLORS.primaryLight, alignItems: 'center' },
  editBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  deleteBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: COLORS.dangerLight, alignItems: 'center' },
  deleteBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.danger },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 15, color: COLORS.textMuted },
  fab: {
    position: 'absolute', bottom: 24, right: 20, left: 20,
    backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 16,
    alignItems: 'center', ...SHADOW,
  },
  fabText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
