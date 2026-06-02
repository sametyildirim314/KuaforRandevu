import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import adminService from '../../services/adminService';
import { COLORS } from '../../utils/theme';

export default function AdminUsersScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = (user) => {
    Alert.alert('Emin misiniz?', `${user.firstName} adlı kullanıcıyı ${user.isActive ? 'banlamak' : 'aktif etmek'} istiyor musunuz?`, [
      { text: 'İptal', style: 'cancel' },
      { text: 'Evet', style: 'destructive', onPress: async () => {
          try {
            await adminService.toggleUserStatus(user.id);
            fetchUsers(); // Listeyi yenile
          } catch (e) {
            Alert.alert('Hata', e.response?.data?.message || 'İşlem başarısız');
          }
      }}
    ]);
  };

  const handleChangeRole = (user) => {
    const roles = ['Customer', 'Barber', 'SalonOwner', 'Admin'];
    Alert.alert('Rol Değiştir', `Mevcut Rol: ${user.role}\nYeni rolü aşağıdan seçin:`, 
      roles.map(r => ({
        text: r,
        onPress: async () => {
          try {
            await adminService.updateUserRole(user.id, r);
            fetchUsers();
          } catch (e) {
            Alert.alert('Hata', e.response?.data?.message || 'Rol değiştirilemedi');
          }
        }
      })).concat([{ text: 'İptal', style: 'cancel' }])
    );
  };

  if (loading) return <ActivityIndicator style={styles.center} size="large" color={COLORS.primary} />;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Kullanıcı Yönetimi</Text>
      <FlatList
        data={users}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 15 }}
        renderItem={({ item }) => (
          <View style={[styles.card, !item.isActive && styles.cardBanned]}>
            <View style={styles.info}>
              <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
              <Text style={styles.email}>{item.email}</Text>
              <Text style={styles.role}>Rol: {item.role}</Text>
            </View>
            <View style={styles.actions}>
              {item.role !== 'Admin' && (
                <>
                  <TouchableOpacity style={styles.btnRole} onPress={() => handleChangeRole(item)}>
                    <Text style={styles.btnText}>Rol Değiştir</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btnBan, !item.isActive && styles.btnUnban]} onPress={() => handleToggleStatus(item)}>
                    <Text style={styles.btnText}>{item.isActive ? 'Banla' : 'Ban Kaldır'}</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center' },
  container: { flex: 1, backgroundColor: COLORS.background },
  headerTitle: { fontSize: 22, fontWeight: 'bold', margin: 20, marginTop: 10 },
  card: { backgroundColor: COLORS.card, padding: 15, borderRadius: 10, marginBottom: 15, elevation: 2 },
  cardBanned: { backgroundColor: '#ffeaea' },
  info: { marginBottom: 10 },
  name: { fontSize: 16, fontWeight: 'bold' },
  email: { color: COLORS.textSecondary, fontSize: 13 },
  role: { fontWeight: '600', color: COLORS.primary, marginTop: 5 },
  actions: { flexDirection: 'row', gap: 10 },
  btnRole: { flex: 1, backgroundColor: COLORS.primary, padding: 10, borderRadius: 8, alignItems: 'center' },
  btnBan: { flex: 1, backgroundColor: COLORS.danger, padding: 10, borderRadius: 8, alignItems: 'center' },
  btnUnban: { backgroundColor: COLORS.success },
  btnText: { color: '#fff', fontWeight: 'bold' }
});
