import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../utils/constants';
import authStore from '../../store/authStore';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user, logout } = authStore();
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSalons = async () => {
    try {
      const { data } = await api.get(API_ENDPOINTS.salons);
      setSalons(data);
    } catch (e) {
      console.warn(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSalons();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadSalons();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Hoş geldiniz, {user?.fullName || 'Kullanıcı'}!</Text>
      <Text style={styles.sectionTitle}>Kuaför salonları</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#6C5CE7" style={styles.loader} />
      ) : (
        <FlatList
          data={salons}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>Kayıtlı salon bulunamadı.</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate('SalonDetail', { salonId: item.id })
              }
              activeOpacity={0.8}
            >
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardMeta}>
                {item.city} · {item.address}
              </Text>
              {item.phone ? (
                <Text style={styles.cardPhone}>{item.phone}</Text>
              ) : null}
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity style={styles.logout} onPress={logout}>
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  welcome: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#636E72',
    marginBottom: 8,
  },
  loader: { marginTop: 40 },
  listContent: { paddingBottom: 80 },
  empty: { color: '#636E72', textAlign: 'center', marginTop: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 4,
  },
  cardMeta: { fontSize: 14, color: '#636E72' },
  cardPhone: { fontSize: 13, color: '#6C5CE7', marginTop: 6 },
  logout: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    paddingVertical: 8,
  },
  logoutText: { color: '#e74c3c', fontWeight: '600' },
});
