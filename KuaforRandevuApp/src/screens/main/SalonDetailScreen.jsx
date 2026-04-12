import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../utils/constants';
import StarRating from '../../components/StarRating';

export default function SalonDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { salonId } = route.params;

  const [salon, setSalon] = useState(null);
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Değerlendirmeler için durum
  const [selectedBarberId, setSelectedBarberId] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Salon + berberler yükle
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [salonRes, barbersRes] = await Promise.all([
          api.get(`${API_ENDPOINTS.salons}/${salonId}`),
          api.get(`${API_ENDPOINTS.salons}/${salonId}/barbers`),
        ]);
        if (!cancelled) {
          setSalon(salonRes.data);
          const loadedBarbers = barbersRes.data;
          setBarbers(loadedBarbers);
          // İlk yüklenmede ilk berberi seç
          if (loadedBarbers.length > 0) {
            setSelectedBarberId(loadedBarbers[0].id);
          }
        }
      } catch (e) {
        console.warn(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [salonId]);

  // Seçili berberin değerlendirmeleri
  useEffect(() => {
    if (!selectedBarberId) return;
    setReviewsLoading(true);
    api.get(`${API_ENDPOINTS.barbers}/${selectedBarberId}/reviews`)
      .then((r) => setReviews(r.data))
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
  }, [selectedBarberId]);

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

  // Seçili berberin bilgisi
  const selectedBarber = barbers.find((b) => b.id === selectedBarberId);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{salon.name}</Text>
      <Text style={styles.meta}>{salon.city} · {salon.address}</Text>
      {salon.phone ? <Text style={styles.phone}>{salon.phone}</Text> : null}
      {salon.description ? <Text style={styles.desc}>{salon.description}</Text> : null}

      {/* Kuaförler listesi — her birinde puan özeti */}
      {barbers.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kuaförlerimiz</Text>
          {barbers.map((b) => (
            <TouchableOpacity
              key={b.id}
              style={[styles.barberCard, b.id === selectedBarberId && styles.barberCardSelected]}
              onPress={() => setSelectedBarberId(b.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.barberName}>{b.displayName}</Text>
              <Text style={styles.barberInfo}>
                {b.workStartHour}:00 – {b.workEndHour}:00 · {b.slotDurationMinutes} dk seans
              </Text>
              {/* Puan özeti */}
              <View style={styles.ratingRow}>
                <StarRating value={Math.round(b.averageRating)} readonly size={14} />
                <Text style={styles.ratingText}>
                  {b.reviewCount > 0
                    ? `  ${b.averageRating.toFixed(1)} (${b.reviewCount} yorum)`
                    : '  Henüz değerlendirme yok'}
                </Text>
              </View>
            </TouchableOpacity>
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

      {/* Değerlendirmeler bölümü */}
      {barbers.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Müşteri Yorumları
            {selectedBarber ? ` — ${selectedBarber.displayName}` : ''}
          </Text>

          {/* Berber seçici (birden fazla berber varsa) */}
          {barbers.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {barbers.map((b) => (
                <TouchableOpacity
                  key={b.id}
                  style={[styles.barberTab, b.id === selectedBarberId && styles.barberTabActive]}
                  onPress={() => setSelectedBarberId(b.id)}
                >
                  <Text style={[styles.barberTabText, b.id === selectedBarberId && styles.barberTabTextActive]}>
                    {b.displayName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {reviewsLoading ? (
            <ActivityIndicator color="#6C5CE7" style={{ marginTop: 16 }} />
          ) : reviews.length === 0 ? (
            <Text style={styles.noReview}>Henüz değerlendirme yapılmamış.</Text>
          ) : (
            reviews.map((r) => (
              <View key={r.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewAuthor}>{r.authorName}</Text>
                  <Text style={styles.reviewDate}>
                    {new Date(r.createdAt).toLocaleDateString('tr-TR')}
                  </Text>
                </View>
                <StarRating value={r.rating} readonly size={16} />
                {r.comment ? <Text style={styles.reviewComment}>{r.comment}</Text> : null}
              </View>
            ))
          )}
        </View>
      )}
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
    borderWidth: 1.5, borderColor: '#eee',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  barberCardSelected: { borderColor: '#6C5CE7', backgroundColor: '#f0eeff' },
  barberName: { fontSize: 15, fontWeight: '700', color: '#2D3436' },
  barberInfo: { fontSize: 13, color: '#636E72', marginTop: 2, marginBottom: 6 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 12, color: '#636E72' },
  bookBtn: {
    backgroundColor: '#6C5CE7', borderRadius: 14, paddingVertical: 18,
    alignItems: 'center', marginTop: 4, marginBottom: 28,
  },
  bookBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  barberTab: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#ddd', marginRight: 8,
  },
  barberTabActive: { backgroundColor: '#6C5CE7', borderColor: '#6C5CE7' },
  barberTabText: { fontSize: 13, color: '#636E72', fontWeight: '600' },
  barberTabTextActive: { color: '#fff' },
  noReview: { color: '#636E72', textAlign: 'center', marginTop: 8, fontSize: 14 },
  reviewCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  reviewAuthor: { fontSize: 14, fontWeight: '700', color: '#2D3436' },
  reviewDate: { fontSize: 12, color: '#aaa' },
  reviewComment: { fontSize: 14, color: '#636E72', marginTop: 6, lineHeight: 20 },
});
