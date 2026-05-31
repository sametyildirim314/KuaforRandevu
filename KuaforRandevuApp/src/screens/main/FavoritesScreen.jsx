import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import api from '../../services/api';
import { COLORS } from '../../utils/theme';

export default function FavoritesScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused(); // Ekran aktif olunca tetiklenir

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFavorites = async () => {
    try {
      const { data } = await api.get('/api/favorites/my');
      setFavorites(data);
    } catch (e) {
      console.warn(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Ekran her odağa geldiğinde favorileri tekrar yükle (diğer ekranda kaldırılmış olabilir)
  useEffect(() => {
    if (isFocused) {
      loadFavorites();
    }
  }, [isFocused]);

  const onRefresh = () => {
    setRefreshing(true);
    loadFavorites();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favori Salonlarım ❤️</Text>
      <Text style={styles.subtitle}>En çok beğendiğiniz ve kaydettiğiniz kuaför salonları</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#6C5CE7" style={styles.loader} />
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🤍</Text>
              <Text style={styles.emptyText}>Henüz favori salon kaydetmemişsiniz.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('SalonDetail', { salonId: item.id })}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.heart}>❤️</Text>
              </View>
              <Text style={styles.cardMeta}>{item.city} · {item.address}</Text>
              {item.phone ? <Text style={styles.cardPhone}>{item.phone}</Text> : null}
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 16, paddingTop: 20 },
  title: { fontSize: 22, fontWeight: '800', color: '#2D3436' },
  subtitle: { fontSize: 13, color: '#636E72', marginTop: 4, marginBottom: 20 },
  loader: { marginTop: 40 },
  listContent: { paddingBottom: 40 },
  empty: { flex: 1, alignItems: 'center', paddingVertical: 120 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#636E72', fontSize: 15, textAlign: 'center', fontWeight: '500' },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#2D3436' },
  heart: { fontSize: 16 },
  cardMeta: { fontSize: 14, color: '#636E72' },
  cardPhone: { fontSize: 13, color: '#6C5CE7', marginTop: 6, fontWeight: '500' },
});
