import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../../services/api';
import { COLORS } from '../../utils/theme';

export default function BarberFormScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { mode, salonId, barber } = route.params || {};

  const isEdit = mode === 'edit';

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    displayName: isEdit ? barber.displayName : '',
    workStartHour: isEdit ? barber.workStartHour.toString() : '9',
    workEndHour: isEdit ? barber.workEndHour.toString() : '18',
    slotDurationMinutes: isEdit ? barber.slotDurationMinutes.toString() : '30',
    isActive: isEdit ? barber.isActive : true,
  });

  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    setBusy(true);
    try {
      if (isEdit) {
        await api.put(`/api/salon-dashboard/barbers/${barber.id}`, {
          displayName: formData.displayName,
          workStartHour: parseInt(formData.workStartHour),
          workEndHour: parseInt(formData.workEndHour),
          slotDurationMinutes: parseInt(formData.slotDurationMinutes),
          isActive: formData.isActive,
        });
        Alert.alert('Başarılı', 'Berber bilgileri güncellendi.', [{ text: 'Tamam', onPress: () => navigation.goBack() }]);
      } else {
        await api.post(`/api/salon-dashboard/barbers?salonId=${salonId}`, {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password,
          displayName: formData.displayName,
          workStartHour: parseInt(formData.workStartHour),
          workEndHour: parseInt(formData.workEndHour),
          slotDurationMinutes: parseInt(formData.slotDurationMinutes),
          isSelf: false, // Şimdilik hep false, kendisi ekleme sonraya
        });
        Alert.alert('Başarılı', 'Yeni berber eklendi.', [{ text: 'Tamam', onPress: () => navigation.goBack() }]);
      }
    } catch (e) {
      Alert.alert('Hata', e.response?.data?.message || e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{isEdit ? 'Berberi Düzenle' : 'Yeni Berber Ekle'}</Text>

      {/* Sadece ekleme sırasında gerekli alanlar */}
      {!isEdit && (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-posta</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(t) => setFormData({ ...formData, email: t })}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Berberin e-posta adresi"
            />
          </View>
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Ad</Text>
              <TextInput
                style={styles.input}
                value={formData.firstName}
                onChangeText={(t) => setFormData({ ...formData, firstName: t })}
                placeholder="Örn: Ali"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Soyad</Text>
              <TextInput
                style={styles.input}
                value={formData.lastName}
                onChangeText={(t) => setFormData({ ...formData, lastName: t })}
                placeholder="Örn: Yılmaz"
              />
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Geçici Şifre</Text>
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={(t) => setFormData({ ...formData, password: t })}
              secureTextEntry
              placeholder="Berberin giriş şifresi"
            />
          </View>
        </>
      )}

      {/* Ortak alanlar */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Görünen Ad</Text>
        <TextInput
          style={styles.input}
          value={formData.displayName}
          onChangeText={(t) => setFormData({ ...formData, displayName: t })}
          placeholder="Müşterilerin göreceği ad"
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Mesai Başlangıç</Text>
          <TextInput
            style={styles.input}
            value={formData.workStartHour}
            onChangeText={(t) => setFormData({ ...formData, workStartHour: t })}
            keyboardType="numeric"
            placeholder="Örn: 9"
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>Mesai Bitiş</Text>
          <TextInput
            style={styles.input}
            value={formData.workEndHour}
            onChangeText={(t) => setFormData({ ...formData, workEndHour: t })}
            keyboardType="numeric"
            placeholder="Örn: 18"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Seans Süresi (Dakika)</Text>
        <TextInput
          style={styles.input}
          value={formData.slotDurationMinutes}
          onChangeText={(t) => setFormData({ ...formData, slotDurationMinutes: t })}
          keyboardType="numeric"
          placeholder="Örn: 30"
        />
      </View>

      <TouchableOpacity
        style={styles.submitBtn}
        onPress={handleSubmit}
        disabled={busy}
      >
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>{isEdit ? 'Güncelle' : 'Kaydet'}</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 24 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.card, borderRadius: 10, padding: 14,
    borderWidth: 1.5, borderColor: COLORS.border, fontSize: 15,
  },
  row: { flexDirection: 'row' },
  submitBtn: {
    backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', marginTop: 12,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
