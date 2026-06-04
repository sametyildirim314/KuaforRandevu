import React, { useEffect, useState, useCallback, memo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
  RefreshControl, TextInput, Modal, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';
import authStore from '../../store/authStore';
import { COLORS } from '../../utils/theme';

const PRESET_CATEGORIES = ['Saç Kesimi', 'Sakal Kesimi', 'Saç Boyama', 'Cilt Bakımı', 'Fön'];

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user, logout } = authStore();

  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Arama & Filtreleme Durumları
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Arama Geçmişi & Önerilenler
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [recommended, setRecommended] = useState([]);

  // Dinamik arama ve filtreleme istekleri
  const loadSalons = async (searchQuery = '', cat = '', rating = 0, price = '') => {
    setLoading(true);
    try {
      const ratingParam = rating > 0 ? rating : '';
      const { data } = await api.get('/api/salons/search', {
        params: {
          q: searchQuery,
          category: cat,
          minRating: ratingParam,
          maxPrice: price,
        },
      });
      setSalons(data);
    } catch (e) {
      console.warn(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Önerilen salonları listeler (puanı >= 4 olanlar)
  const loadRecommended = async () => {
    try {
      const { data } = await api.get('/api/salons/search', { params: { minRating: 4 } });
      setRecommended(data.slice(0, 3));
    } catch (e) {
      console.warn(e.message);
    }
  };

  // Arama geçmişini yerelden yükle
  const loadHistory = async () => {
    try {
      const historyJson = await AsyncStorage.getItem('search_history');
      if (historyJson) {
        setSearchHistory(JSON.parse(historyJson));
      }
    } catch (e) {
      console.warn(e.message);
    }
  };

  useEffect(() => {
    loadSalons();
    loadRecommended();
    loadHistory();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadSalons(q, category, minRating, maxPrice);
    loadRecommended();
  };

  // Aramayı geçmişe kaydet ve çalıştır
  const handleSearchSubmit = async () => {
    setShowHistory(false);
    if (q.trim()) {
      const cleanText = q.trim();
      let newHistory = searchHistory.filter((item) => item !== cleanText);
      newHistory = [cleanText, ...newHistory].slice(0, 5); // Max 5 son arama
      setSearchHistory(newHistory);
      await AsyncStorage.setItem('search_history', JSON.stringify(newHistory));
    }
    loadSalons(q, category, minRating, maxPrice);
  };

  const handleSelectHistoryItem = (item) => {
    setQ(item);
    setShowHistory(false);
    loadSalons(item, category, minRating, maxPrice);
  };

  const handleClearHistoryItem = async (item) => {
    const newHistory = searchHistory.filter((x) => x !== item);
    setSearchHistory(newHistory);
    await AsyncStorage.setItem('search_history', JSON.stringify(newHistory));
  };

  const handleResetFilters = () => {
    setCategory('');
    setMinRating(0);
    setMaxPrice('');
    setFilterModalVisible(false);
    loadSalons(q, '', 0, '');
  };

  const handleApplyFilters = () => {
    setFilterModalVisible(false);
    loadSalons(q, category, minRating, maxPrice);
  };

  const renderSalonItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('SalonDetail', { salonId: item.id })}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.arrow}>→</Text>
      </View>
      <Text style={styles.cardMeta}>
        📍 {item.city} · {item.address}
      </Text>
      {item.phone ? (
        <Text style={styles.cardPhone}>📞 {item.phone}</Text>
      ) : null}
    </TouchableOpacity>
  ), [navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.welcome}>Hoş geldiniz, {user?.fullName || 'Kullanıcı'}! 👋</Text>

      {/* Arama Barı ve Filtreleme Butonu */}
      <View style={styles.searchRow}>
        <View style={{ flex: 1, position: 'relative' }}>
          <TextInput
            style={styles.searchInput}
            placeholder="Salon adı, şehir veya adres ara..."
            value={q}
            onChangeText={(text) => {
              setQ(text);
              if (text.length > 0) setShowHistory(false);
            }}
            onFocus={() => {
              if (searchHistory.length > 0 && q.length === 0) setShowHistory(true);
            }}
            onBlur={() => setTimeout(() => setShowHistory(false), 200)}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          {q.length > 0 && (
            <TouchableOpacity
              style={styles.clearSearch}
              onPress={() => {
                setQ('');
                loadSalons('', category, minRating, maxPrice);
              }}
            >
              <Text style={{ color: '#aaa', fontSize: 18 }}>×</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterModalVisible(true)}>
          <Text style={styles.filterBtnIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Arama Geçmişi Açılır Paneli */}
      {showHistory && searchHistory.length > 0 && (
        <View style={styles.historyDropdown}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Son Aramalar</Text>
            <TouchableOpacity
              onPress={async () => {
                setSearchHistory([]);
                await AsyncStorage.removeItem('search_history');
              }}
            >
              <Text style={styles.historyClearAll}>Tümünü Temizle</Text>
            </TouchableOpacity>
          </View>
          {searchHistory.map((item) => (
            <View key={item} style={styles.historyItemRow}>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => handleSelectHistoryItem(item)}>
                <Text style={styles.historyItemText}>🔍 {item}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleClearHistoryItem(item)} style={{ padding: 4 }}>
                <Text style={{ color: '#aaa', fontSize: 13 }}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Önerilen Salonlar (Yalnızca arama yapılmadığında görünür) */}
      {q.length === 0 && category === '' && minRating === 0 && maxPrice === '' && recommended.length > 0 && (
        <View style={styles.recommendedSection}>
          <Text style={styles.sectionTitle}>⭐ Öne Çıkan & Önerilen Salonlar</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recScroll}>
            {recommended.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.recCard}
                onPress={() => navigation.navigate('SalonDetail', { salonId: item.id })}
                activeOpacity={0.85}
              >
                <Text style={styles.recTitle}>{item.name}</Text>
                <Text style={styles.recMeta}>{item.city}</Text>
                <Text style={styles.recScore}>❤️ Popüler Salon</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <Text style={[styles.sectionTitle, { marginTop: 10 }]}>💇 Tüm Salonlar</Text>

      {/* Salon Listesi */}
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={salons}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>Aradığınız kriterlere uygun salon bulunamadı.</Text>
          }
          renderItem={renderSalonItem}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={5}
          removeClippedSubviews={true}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Çıkış Yap butonu */}
      <TouchableOpacity style={styles.logout} onPress={logout}>
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>

      {/* Gelişmiş Filtreleme Modalı */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detaylı Filtreleme ⚙️</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Text style={styles.modalCloseText}>Kapat</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
              {/* Kategori/Hizmet Seçimi */}
              <Text style={styles.filterLabel}>Hizmet Kapsamı</Text>
              <View style={styles.chipGrid}>
                {PRESET_CATEGORIES.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => setCategory(isSelected ? '' : cat)}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Minimum Puan Seçimi */}
              <Text style={styles.filterLabel}>Minimum Değerlendirme Puanı</Text>
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const isSelected = minRating >= star;
                  return (
                    <TouchableOpacity key={star} onPress={() => setMinRating(star)}>
                      <Text style={{ fontSize: 32, color: isSelected ? '#FFA500' : '#DDD', marginRight: 8 }}>
                        ★
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                {minRating > 0 && (
                  <TouchableOpacity onPress={() => setMinRating(0)} style={{ marginLeft: 8 }}>
                    <Text style={{ color: '#e74c3c', fontSize: 13, fontWeight: '600' }}>Temizle</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Maksimum Fiyat Girişi */}
              <Text style={styles.filterLabel}>Maksimum Hizmet Fiyatı (₺)</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="Örn: 250"
                keyboardType="numeric"
                value={maxPrice}
                onChangeText={setMaxPrice}
              />
            </ScrollView>

            {/* Alt İşlem Butonları */}
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.resetBtn} onPress={handleResetFilters}>
                <Text style={styles.resetBtnText}>Sıfırla</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyBtn} onPress={handleApplyFilters}>
                <Text style={styles.applyBtnText}>Filtreleri Uygula</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 16, paddingTop: 16 },
  welcome: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  searchRow: { flexDirection: 'row', gap: 8, marginBottom: 14, alignItems: 'center' },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#eee',
    fontSize: 14,
    color: '#2D3436',
  },
  clearSearch: { position: 'absolute', right: 14, top: 12 },
  filterBtn: {
    backgroundColor: '#6C5CE7',
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBtnIcon: { fontSize: 18, color: '#fff' },
  historyDropdown: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 6 },
  historyTitle: { fontSize: 12, fontWeight: '700', color: '#636E72' },
  historyClearAll: { fontSize: 12, color: '#e74c3c', fontWeight: '600' },
  historyItemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#fcfcfc' },
  historyItemText: { fontSize: 14, color: '#2D3436' },
  recommendedSection: { marginBottom: 18 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 10 },
  recScroll: { flexDirection: 'row', gap: 10 },
  recCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    width: 150,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#f0eeff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  recTitle: { fontSize: 14, fontWeight: '700', color: '#2D3436' },
  recMeta: { fontSize: 12, color: '#636E72', marginTop: 2, marginBottom: 8 },
  recScore: { fontSize: 11, fontWeight: '600', color: '#6C5CE7' },
  loader: { marginTop: 40 },
  listContent: { paddingBottom: 100 },
  empty: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 32, paddingHorizontal: 20 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#2D3436' },
  arrow: { color: '#6C5CE7', fontSize: 16, fontWeight: '700' },
  cardMeta: { fontSize: 13, color: '#636E72' },
  cardPhone: { fontSize: 12, color: '#6C5CE7', marginTop: 6, fontWeight: '500' },
  logout: { position: 'absolute', bottom: 12, alignSelf: 'center', paddingVertical: 8 },
  logoutText: { color: '#e74c3c', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#2D3436' },
  modalCloseText: { color: '#6C5CE7', fontWeight: '700', fontSize: 14 },
  filterLabel: { fontSize: 14, fontWeight: '700', color: '#2D3436', marginTop: 14, marginBottom: 8 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f5f5f5', borderWidth: 1.5, borderColor: '#eee' },
  chipActive: { backgroundColor: '#f0eeff', borderColor: '#6C5CE7' },
  chipText: { fontSize: 13, color: '#636E72', fontWeight: '500' },
  chipTextActive: { color: '#6C5CE7', fontWeight: '700' },
  starRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  priceInput: { backgroundColor: '#f9f9f9', borderRadius: 12, borderWidth: 1.5, borderColor: '#eee', padding: 12, fontSize: 14, color: '#2D3436' },
  modalFooter: { flexDirection: 'row', gap: 10, marginTop: 24, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 16 },
  resetBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 2, borderColor: '#e74c3c', alignItems: 'center' },
  resetBtnText: { color: '#e74c3c', fontWeight: '700' },
  applyBtn: { flex: 2, backgroundColor: '#6C5CE7', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  applyBtnText: { color: '#fff', fontWeight: '700' },
});
