import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../utils/constants';

export default function SalonDetailScreen() {
  const route = useRoute();
  const { salonId } = route.params;
  const [salon, setSalon] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get(`${API_ENDPOINTS.salons}/${salonId}`);
        if (!cancelled) setSalon(data);
      } catch (e) {
        console.warn(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
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
      <Text style={styles.meta}>
        {salon.city} · {salon.address}
      </Text>
      {salon.phone ? <Text style={styles.phone}>{salon.phone}</Text> : null}
      {salon.description ? (
        <Text style={styles.desc}>{salon.description}</Text>
      ) : null}

      <View style={styles.hintBox}>
        <Text style={styles.hint}>
          Randevu oluşturma özelliği 3. haftada eklenecek.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { padding: 20, paddingBottom: 40 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2D3436',
    marginBottom: 8,
  },
  meta: { fontSize: 15, color: '#636E72', marginBottom: 8 },
  phone: { fontSize: 15, color: '#6C5CE7', fontWeight: '600', marginBottom: 16 },
  desc: { fontSize: 16, color: '#2D3436', lineHeight: 24, marginBottom: 24 },
  hintBox: {
    backgroundColor: '#e8f4fe',
    padding: 14,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#6C5CE7',
  },
  hint: { fontSize: 14, color: '#2D3436', lineHeight: 20 },
});
