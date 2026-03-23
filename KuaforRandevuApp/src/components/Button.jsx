import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}) {
  const isSecondary = variant === 'secondary';
  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity
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
