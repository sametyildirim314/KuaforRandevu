import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../utils/constants';

export default function SalonDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { salonId } = route.params;

  const [salon, setSalon] = useState(null);
  const [barbers, setBarbers] = useState([]);    // Salona ait kuaförler
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Salon detayı ve berberler paralelde yüklenir
        const [salonRes, barbersRes] = await Promise.all([
          api.get(`${API_ENDPOINTS.salons}/${salonId}`),
          api.get(`${API_ENDPOINTS.salons}/${salonId}/barbers`),
        ]);
        if (!cancelled) {
          setSalon(salonRes.data);
          setBarbers(barbersRes.data);
        }
      } catch (e) {
        console.warn(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [salonId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  if (!salon) {
    return (
      <View style={styles.centered}>
        <Text>Salon bulunamadı.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{salon.name}</Text>
      <Text style={styles.meta}>{salon.city} · {salon.address}</Text>
      {salon.phone ? <Text style={styles.phone}>{salon.phone}</Text> : null}
      {salon.description ? <Text style={styles.desc}>{salon.description}</Text> : null}

      {/* Kuaförler listesi */}
      {barbers.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kuaförlerimiz</Text>
          {barbers.map((b) => (
            <View key={b.id} style={styles.barberCard}>
              <Text style={styles.barberName}>{b.displayName}</Text>
              <Text style={styles.barberInfo}>
                {b.workStartHour}:00 – {b.workEndHour}:00 · {b.slotDurationMinutes} dk seans
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Randevu Al butonu */}
      <TouchableOpacity
        style={styles.bookBtn}
        onPress={() => navigation.navigate('Booking', { salonId: salon.id, salonName: salon.name })}
        activeOpacity={0.85}
      >
        <Text style={styles.bookBtnText}>📅  Randevu Al</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { padding: 20, paddingBottom: 48 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
  title: { fontSize: 24, fontWeight: '800', color: '#2D3436', marginBottom: 6 },
  meta: { fontSize: 15, color: '#636E72', marginBottom: 6 },
  phone: { fontSize: 15, color: '#6C5CE7', fontWeight: '600', marginBottom: 14 },
  desc: { fontSize: 16, color: '#2D3436', lineHeight: 24, marginBottom: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#2D3436', marginBottom: 10 },
  barberCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06,
    shadowRadius: 4, elevation: 2,
  },
  barberName: { fontSize: 15, fontWeight: '700', color: '#2D3436' },
  barberInfo: { fontSize: 13, color: '#636E72', marginTop: 2 },
  bookBtn: {
    backgroundColor: '#6C5CE7', borderRadius: 14, paddingVertical: 18,
    alignItems: 'center', marginTop: 8,
  },
  bookBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});




