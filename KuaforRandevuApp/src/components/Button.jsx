import {TouchableOpacity,Text,StyleSheet,ActivityIndicator,} from 'react-native';

// Reusable (Tekrar kullanılabilir) buton bileşeni
export default function Button({
  title, // Butonun üzerinde yazacak metin
  onPress, // Butona basıldığında çalışacak fonksiyon
  variant = 'primary', // Butonun stil tipi (primary, secondary, outline)
  disabled = false, // Butonun tıklanabilir olup olmadığı
  loading = false, // İşlem yapılıyorsa spinner gösterir
  style, // Dışarıdan ekstra stil vermek için
}) {
  const isSecondary = variant === 'secondary';
  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity
      // Birden fazla stili dizi şeklinde uygulayabiliyoruz
      style={[
        styles.button,
        isSecondary && styles.buttonSecondary,
        isOutline && styles.buttonOutline,
        disabled && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {/* Eğer işlem yapılıyorsa (loading true) spinner göster, değilse metni göster */}
      {loading ? (
        <ActivityIndicator color={isOutline ? '#6C5CE7' : '#fff'} />
      ) : (
        <Text
          style={[
            styles.text,
            isSecondary && styles.textSecondary,
            isOutline && styles.textOutline,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#6C5CE7',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonSecondary: {
    backgroundColor: '#a29bfe',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#6C5CE7',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  textSecondary: {
    color: '#fff',
  },
  textOutline: {
    color: '#6C5CE7',
  },
});
