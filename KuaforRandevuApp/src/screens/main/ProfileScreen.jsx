import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import authStore from '../../store/authStore';
import { COLORS, SHADOW } from '../../utils/theme';

export default function ProfileScreen() {
  const { user, logout } = authStore();

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
      
      {/* Çıkış Yap butonu eklendi */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutBtnText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 24,
    paddingTop: 24,
  },
  card: {
    backgroundColor: COLORS.card,
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    ...SHADOW
  },
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  logoutBtn: {
    marginTop: 20,
    backgroundColor: COLORS.dangerLight,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  logoutBtnText: {
    color: COLORS.danger,
    fontWeight: '700',
    fontSize: 16,
  }
});
