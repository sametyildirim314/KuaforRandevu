import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../utils/constants';
import appointmentStore from '../../store/appointmentStore';

// Sonraki 14 günü üret (bugün dahil)
function getNextDays(count = 14) {
  const days = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    let label = d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', weekday: 'short' });
    if (i === 0) label = `Bugün, ${label}`;
    else if (i === 1) label = `Yarın, ${label}`;
    const value = d.toISOString().slice(0, 10); // YYYY-MM-DD
    days.push({ label, value, date: d });
  }
  return days;
}

const DAYS = getNextDays();

export default function BookingScreen() {
  const navigation = useNavigation();
  const { salonId, salonName, services = [] } = useRoute().params;
  const { createAppointment } = appointmentStore();

  const [step, setStep] = useState(1);
  const [barbers, setBarbers] = useState([]);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState(DAYS[0].value);
  const [slots, setSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [notes, setNotes] = useState('');
  const [loadingBarbers, setLoadingBarbers] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Kuaförleri yükle
  useEffect(() => {
    api.get(`${API_ENDPOINTS.salons}/${salonId}/barbers`)
      .then((r) => setBarbers(r.data))
      .catch((e) => console.warn(e.message))
      .finally(() => setLoadingBarbers(false));
  }, [salonId]);

  // Berber + tarih değişince müsait saatleri yükle
  useEffect(() => {
    if (!selectedBarber || !selectedDate) return;
    setLoadingSlots(true);
    setSelectedTime(null);
    api.get(`${API_ENDPOINTS.barbers}/${selectedBarber.id}/availability?date=${selectedDate}`)
      .then((r) => setSlots(r.data))
      .catch((e) => console.warn(e.message))
      .finally(() => setLoadingSlots(false));
  }, [selectedBarber, selectedDate]);

  // Seçili hizmetleri toggle et (varsa çıkar, yoksa ekle)
  const toggleService = (service) => {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.id === service.id);
      if (exists) return prev.filter((s) => s.id !== service.id);
      return [...prev, service];
    });
  };

  // Toplam tutar ve süre
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);

  const handleConfirm = async () => {
    if (!selectedBarber || !selectedDate || !selectedTime) return;
    setSubmitting(true);
    try {
      const appointedAt = `${selectedDate}T${selectedTime}:00`;
      // Seçilen hizmet adlarını not alanına ekle
      const serviceNames = selectedServices.map((s) => s.name).join(', ');
      const fullNotes = [`Hizmetler: ${serviceNames}`, notes].filter(Boolean).join('\n');
      await createAppointment({ barberId: selectedBarber.id, salonId, appointedAt, price: totalPrice, notes: fullNotes });
      Alert.alert('Başarılı! 🎉', 'Randevunuz oluşturuldu.', [
        { text: 'Randevularım', onPress: () => navigation.navigate('Tabs', { screen: 'Appointments' }) },
      ]);
    } catch (e) {
      Alert.alert('Hata', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Adım göstergesi ──────────────────────────────────────────────
  const StepIndicator = () => (
    <View style={styles.stepRow}>
      {[1, 2, 3, 4].map((s) => (
        <View key={s} style={[styles.stepDot, step >= s && styles.stepDotActive]}>
          <Text style={[styles.stepNum, step >= s && styles.stepNumActive]}>{s}</Text>
        </View>
      ))}
    </View>
  );

  // ── ADIM 1: Kuaför Seç ───────────────────────────────────────────
  const Step1 = () => (
    <View>
      <Text style={styles.stepTitle}>Kuaför Seçin</Text>
      {loadingBarbers ? <ActivityIndicator color="#6C5CE7" style={{ marginTop: 24 }} /> :
        barbers.map((b) => (
          <TouchableOpacity
            key={b.id}
            style={[styles.selectCard, selectedBarber?.id === b.id && styles.selectCardActive]}
            onPress={() => setSelectedBarber(b)}
          >
            <Text style={styles.selectCardTitle}>{b.displayName}</Text>
            <Text style={styles.selectCardSub}>{b.workStartHour}:00 – {b.workEndHour}:00</Text>
          </TouchableOpacity>
        ))
      }
    </View>
  );

  // ── ADIM 2: Hizmet Seçimi (Çoklu) ──────────────────────────────────
  const Step2 = () => (
    <View>
      <Text style={styles.stepTitle}>Hizmet Seçin (birden fazla seçebilirsiniz)</Text>
      {services.length === 0 ? (
        <Text style={{ color: '#636E72', textAlign: 'center', marginTop: 20 }}>
          Bu salona ait hizmet bulunamadı.
        </Text>
      ) : (
        <>
          {services.map((s) => {
            const isSelected = selectedServices.some((sel) => sel.id === s.id);
            return (
              <TouchableOpacity
                key={s.id}
                style={[styles.selectCard, isSelected && styles.selectCardActive]}
                onPress={() => toggleService(s)}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.selectCardTitle}>{s.name}</Text>
                    <Text style={styles.selectCardSub}>{s.durationMinutes} dk</Text>
                  </View>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: isSelected ? '#6C5CE7' : '#2D3436', marginRight: 10 }}>
                    {s.price} ₺
                  </Text>
                  <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
          {selectedServices.length > 0 && (
            <View style={styles.selectionSummary}>
              <Text style={styles.selectionSummaryText}>
                {selectedServices.length} hizmet seçildi — Toplam: {totalPrice} ₺ / {totalDuration} dk
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );

  // ── ADIM 3: Tarih & Saat ─────────────────────────────────────────
  const Step3 = () => (
    <View>
      <Text style={styles.stepTitle}>Tarih Seçin</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateRow}>
        {DAYS.map((d) => (
          <TouchableOpacity
            key={d.value}
            style={[styles.dateChip, selectedDate === d.value && styles.dateChipActive]}
            onPress={() => setSelectedDate(d.value)}
          >
            <Text style={[styles.dateChipText, selectedDate === d.value && styles.dateChipTextActive]}>
              {d.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={[styles.stepTitle, { marginTop: 20 }]}>Saat Seçin</Text>
      {loadingSlots ? (
        <ActivityIndicator color="#6C5CE7" style={{ marginTop: 16 }} />
      ) : (
        <View style={styles.slotGrid}>
          {slots.map((s) => (
            <TouchableOpacity
              key={s.time}
              disabled={!s.isAvailable}
              style={[
                styles.slotChip,
                !s.isAvailable && styles.slotChipDisabled,
                selectedTime === s.time && styles.slotChipSelected,
              ]}
              onPress={() => setSelectedTime(s.time)}
            >
              <Text style={[
                styles.slotChipText,
                !s.isAvailable && styles.slotChipTextDisabled,
                selectedTime === s.time && styles.slotChipTextSelected,
              ]}>
                {s.time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  // ── ADIM 4: Onay ─────────────────────────────────────────────────
  const Step4 = () => (
    <View>
      <Text style={styles.stepTitle}>Randevu Özeti</Text>
      <View style={styles.summaryCard}>
        {[
          ['📍 Salon', salonName],
          ['👤 Kuaför', selectedBarber?.displayName],
          ['📅 Tarih', selectedDate],
          ['🕐 Saat', selectedTime],
        ].map(([label, value]) => (
          <View key={label} style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{label}</Text>
            <Text style={styles.summaryValue}>{value}</Text>
          </View>
        ))}

        {/* Seçilen Hizmetler Listesi */}
        <View style={styles.summaryDivider} />
        <Text style={[styles.summaryLabel, { marginBottom: 8 }]}>✂️ Seçilen Hizmetler</Text>
        {selectedServices.map((s) => (
          <View key={s.id} style={styles.summaryServiceRow}>
            <Text style={styles.summaryServiceName}>{s.name}</Text>
            <Text style={styles.summaryServiceDetail}>{s.durationMinutes} dk — {s.price} ₺</Text>
          </View>
        ))}
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { fontWeight: '700' }]}>💰 Toplam Tutar</Text>
          <Text style={[styles.summaryValue, { color: '#6C5CE7', fontSize: 16 }]}>{totalPrice} ₺</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { fontWeight: '700' }]}>⏱️ Toplam Süre</Text>
          <Text style={[styles.summaryValue, { color: '#6C5CE7', fontSize: 16 }]}>{totalDuration} dk</Text>
        </View>
      </View>
      <Text style={styles.notesLabel}>Not ekleyin (isteğe bağlı)</Text>
      <TextInput
        style={styles.notesInput}
        placeholder="Örn: Saçlarım uzun, lütfen daha dikkatli kesim..."
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
      />
    </View>
  );

  const canNext = () => {
    if (step === 1) return !!selectedBarber;
    if (step === 2) return selectedServices.length > 0;
    if (step === 3) return !!selectedTime;
    return true;
  };

  return (
    <View style={styles.container}>
      <StepIndicator />
      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {step === 1 && <Step1 />}
        {step === 2 && <Step2 />}
        {step === 3 && <Step3 />}
        {step === 4 && <Step4 />}
      </ScrollView>

      {/* Alt butonlar */}
      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep(step - 1)}>
            <Text style={styles.backBtnText}>← Geri</Text>
          </TouchableOpacity>
        )}
        {step < 4 ? (
          <TouchableOpacity
            style={[styles.nextBtn, !canNext() && styles.nextBtnDisabled]}
            disabled={!canNext()}
            onPress={() => setStep(step + 1)}
          >
            <Text style={styles.nextBtnText}>Devam Et →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextBtn, submitting && styles.nextBtnDisabled]}
            disabled={submitting}
            onPress={handleConfirm}
          >
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.nextBtnText}>Randevuyu Onayla ✓</Text>}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  stepRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  stepDot: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: '#ddd', justifyContent: 'center', alignItems: 'center' },
  stepDotActive: { backgroundColor: '#6C5CE7', borderColor: '#6C5CE7' },
  stepNum: { fontSize: 13, fontWeight: '700', color: '#aaa' },
  stepNumActive: { color: '#fff' },
  body: { flex: 1 },
  bodyContent: { padding: 20, paddingBottom: 8 },
  stepTitle: { fontSize: 17, fontWeight: '700', color: '#2D3436', marginBottom: 14 },
  selectCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 2, borderColor: '#eee' },
  selectCardActive: { borderColor: '#6C5CE7', backgroundColor: '#f0eeff' },
  selectCardTitle: { fontSize: 15, fontWeight: '700', color: '#2D3436' },
  selectCardSub: { fontSize: 13, color: '#636E72', marginTop: 2 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#ddd', justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: '#6C5CE7', borderColor: '#6C5CE7' },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '700' },
  selectionSummary: { backgroundColor: '#f0eeff', borderRadius: 10, padding: 12, marginTop: 4 },
  selectionSummaryText: { fontSize: 13, fontWeight: '600', color: '#6C5CE7', textAlign: 'center' },
  dateRow: { marginBottom: 8 },
  dateChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#ddd', marginRight: 10 },
  dateChipActive: { backgroundColor: '#6C5CE7', borderColor: '#6C5CE7' },
  dateChipText: { fontSize: 12, color: '#636E72', fontWeight: '600' },
  dateChipTextActive: { color: '#fff' },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slotChip: { width: '30%', paddingVertical: 12, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#6C5CE7', alignItems: 'center' },
  slotChipSelected: { backgroundColor: '#6C5CE7' },
  slotChipDisabled: { borderColor: '#ddd', backgroundColor: '#f5f5f5' },
  slotChipText: { fontSize: 14, fontWeight: '600', color: '#6C5CE7' },
  slotChipTextSelected: { color: '#fff' },
  slotChipTextDisabled: { color: '#bbb' },
  summaryCard: { backgroundColor: '#fff', borderRadius: 14, padding: 18, borderWidth: 1, borderColor: '#eee', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  summaryLabel: { fontSize: 14, color: '#636E72' },
  summaryValue: { fontSize: 14, fontWeight: '700', color: '#2D3436' },
  summaryDivider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  summaryServiceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryServiceName: { fontSize: 14, fontWeight: '600', color: '#2D3436' },
  summaryServiceDetail: { fontSize: 13, color: '#636E72' },
  notesLabel: { fontSize: 14, fontWeight: '600', color: '#2D3436', marginBottom: 8 },
  notesInput: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1.5, borderColor: '#ddd', padding: 14, fontSize: 14, textAlignVertical: 'top', minHeight: 80 },
  footer: { flexDirection: 'row', gap: 12, padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  backBtn: { flex: 1, paddingVertical: 16, borderRadius: 12, borderWidth: 2, borderColor: '#6C5CE7', alignItems: 'center' },
  backBtnText: { color: '#6C5CE7', fontWeight: '700', fontSize: 15 },
  nextBtn: { flex: 2, backgroundColor: '#6C5CE7', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  nextBtnDisabled: { backgroundColor: '#a29bfe' },
  nextBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
