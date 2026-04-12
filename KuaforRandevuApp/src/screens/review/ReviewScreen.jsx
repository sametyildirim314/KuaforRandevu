import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../utils/constants';
import StarRating from '../../components/StarRating';

export default function ReviewScreen() {
  const navigation = useNavigation();
  // appointmentId, barberId ve barberName parametreleri önceki ekrandan geliyor
  const { appointmentId, barberId, barberName } = useRoute().params;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Uyarı', 'Lütfen bir puan seçin.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post(API_ENDPOINTS.reviews, { appointmentId, barberId, rating, comment });
      Alert.alert('Teşekkürler! ⭐', 'Değerlendirmeniz başarıyla kaydedildi.', [
        { text: 'Tamam', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Hata', e.response?.data?.message || e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Başlık */}
      <Text style={styles.heading}>Deneyiminizi Değerlendirin</Text>
      <Text style={styles.subheading}>{barberName} için değerlendirme</Text>

      {/* Yıldız Seçici */}
      <View style={styles.ratingSection}>
        <Text style={styles.label}>Puan</Text>
        <StarRating value={rating} onChange={setRating} size={42} />
        <Text style={styles.ratingHint}>
          {rating === 0 ? 'Bir puan seçin' :
           rating === 1 ? 'Çok Kötü' :
           rating === 2 ? 'Kötü' :
           rating === 3 ? 'Orta' :
           rating === 4 ? 'İyi' : 'Mükemmel!'}
        </Text>
      </View>

      {/* Yorum Kutusu */}
      <View style={styles.commentSection}>
        <Text style={styles.label}>Yorumunuz <Text style={styles.optional}>(isteğe bağlı)</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="Deneyiminizi paylaşın..."
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={5}
          maxLength={500}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{comment.length}/500</Text>
      </View>

      {/* Gönder Butonu */}
      <TouchableOpacity
        style={[styles.submitBtn, (submitting || rating === 0) && styles.submitBtnDisabled]}
        disabled={submitting || rating === 0}
        onPress={handleSubmit}
        activeOpacity={0.85}
      >
        {submitting
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.submitBtnText}>⭐ Değerlendirmeyi Gönder</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { padding: 24, paddingBottom: 60 },
  heading: { fontSize: 22, fontWeight: '800', color: '#2D3436', marginBottom: 6 },
  subheading: { fontSize: 15, color: '#636E72', marginBottom: 28 },
  ratingSection: { alignItems: 'center', marginBottom: 32 },
  label: { fontSize: 14, fontWeight: '700', color: '#2D3436', marginBottom: 12, alignSelf: 'flex-start' },
  ratingHint: { marginTop: 10, fontSize: 15, color: '#6C5CE7', fontWeight: '600' },
  commentSection: { marginBottom: 32 },
  input: {
    backgroundColor: '#fff', borderRadius: 12, borderWidth: 1.5, borderColor: '#E0E0E0',
    padding: 14, fontSize: 15, lineHeight: 22, minHeight: 120,
  },
  charCount: { textAlign: 'right', fontSize: 12, color: '#aaa', marginTop: 4 },
  optional: { color: '#aaa', fontWeight: '400' },
  submitBtn: {
    backgroundColor: '#6C5CE7', borderRadius: 14, paddingVertical: 18, alignItems: 'center',
  },
  submitBtnDisabled: { backgroundColor: '#a29bfe' },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
