import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

/**
 * Yıldız puanlama bileşeni.
 * - readonly=false (varsayılan): Kullanıcı puan seçebilir (form modu)
 * - readonly=true: Sadece görüntüleme (değerlendirme listesi modu)
 *
 * Kullanım:
 *   <StarRating value={rating} onChange={setRating} />           // interaktif
 *   <StarRating value={4.5} readonly size={16} />               // salt okunur
 */
export default function StarRating({ value = 0, onChange, readonly = false, size = 28 }) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          disabled={readonly}
          onPress={() => onChange?.(star)}
          activeOpacity={0.7}
          style={styles.starWrap}
        >
          <Text style={[styles.star, { fontSize: size, color: star <= value ? '#FFA500' : '#DDD' }]}>
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  starWrap: { paddingHorizontal: 2 },
  star: { fontWeight: '700' },
});
