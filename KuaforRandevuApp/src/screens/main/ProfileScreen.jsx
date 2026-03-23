import { View, Text, StyleSheet } from 'react-native';
import authStore from '../../store/authStore';

export default function ProfileScreen() {
  const { user } = authStore();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Ad Soyad</Text>
        <Text style={styles.value}>{user?.fullName || '-'}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>E-posta</Text>
        <Text style={styles.value}>{user?.email || '-'}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Rol</Text>
        <Text style={styles.value}>{user?.role || '-'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 24,
    paddingTop: 24,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 12,
    color: '#636E72',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
  },
});
