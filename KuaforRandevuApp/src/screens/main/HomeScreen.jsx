import { View, Text, StyleSheet } from 'react-native';
import Button from '../../components/Button';
import authStore from '../../store/authStore';

export default function HomeScreen() {
  const { user, logout } = authStore();

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Hoş geldiniz, {user?.fullName || 'Kullanıcı'}!</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <Text style={styles.role}>Rol: {user?.role || 'Customer'}</Text>
      <Button
        title="Çıkış Yap"
        onPress={logout}
        variant="outline"
        style={styles.logoutButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 24,
    paddingTop: 60,
  },
  welcome: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#636E72',
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: '#6C5CE7',
    fontWeight: '600',
    marginBottom: 32,
  },
  logoutButton: {
    alignSelf: 'stretch',
  },
});
