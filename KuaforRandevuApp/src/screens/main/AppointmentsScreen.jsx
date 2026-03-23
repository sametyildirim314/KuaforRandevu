import { View, Text, StyleSheet } from 'react-native';

export default function AppointmentsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Randevularım</Text>
      <Text style={styles.placeholder}>Randevu listesi yakında...</Text>
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3436',
  },
  placeholder: {
    fontSize: 16,
    color: '#636E72',
    marginTop: 12,
  },
});
