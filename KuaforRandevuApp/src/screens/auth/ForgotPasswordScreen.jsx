import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import Input from '../../components/Input';
import Button from '../../components/Button';
import authStore from '../../store/authStore';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const forgotPassword = authStore((s) => s.forgotPassword);

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'E-posta gerekli';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Geçerli bir e-posta girin';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || loading) return;

    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      Alert.alert('Hata', err.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <View style={styles.successBox}>
          <Text style={styles.successTitle}>E-posta Gönderildi</Text>
          <Text style={styles.successText}>
            Şifre sıfırlama bağlantısı {email} adresine gönderildi. Lütfen gelen kutunuzu kontrol edin.
          </Text>
          <Button
            title="Giriş Ekranına Dön"
            onPress={() => navigation.goBack()}
            variant="outline"
            style={styles.backButton}
          />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Şifremi Unuttum</Text>
          <Text style={styles.subtitle}>
            E-posta adresinizi girin, size şifre sıfırlama bağlantısı göndereceğiz.
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="E-posta"
            value={email}
            onChangeText={setEmail}
            placeholder="ornek@email.com"
            keyboardType="email-address"
            error={errors.email}
          />

          <Button
            title="Gönder"
            onPress={handleSubmit}
            loading={loading}
            style={styles.button}
          />

          <Button
            title="Geri"
            onPress={() => navigation.goBack()}
            variant="outline"
            style={styles.backButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D3436',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#636E72',
    lineHeight: 24,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  button: {
    marginBottom: 12,
  },
  backButton: {
    marginTop: 8,
  },
  successBox: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 24,
    marginTop: 80,
    borderRadius: 16,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 12,
  },
  successText: {
    fontSize: 16,
    color: '#636E72',
    lineHeight: 24,
    marginBottom: 24,
  },
});
