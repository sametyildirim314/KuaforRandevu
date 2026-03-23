import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import Input from '../../components/Input';
import Button from '../../components/Button';
import authStore from '../../store/authStore';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Customer',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const register = authStore((s) => s.register);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = 'Ad gerekli';
    if (!form.lastName.trim()) newErrors.lastName = 'Soyad gerekli';
    if (!form.email.trim()) newErrors.email = 'E-posta gerekli';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Geçerli bir e-posta girin';
    if (!form.password) newErrors.password = 'Şifre gerekli';
    else if (form.password.length < 6) newErrors.password = 'Şifre en az 6 karakter olmalı';
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate() || loading) return;

    setLoading(true);
    try {
      await register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });
    } catch (err) {
      Alert.alert('Kayıt Hatası', err.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

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
          <Text style={styles.title}>Kayıt Ol</Text>
          <Text style={styles.subtitle}>Yeni hesap oluşturun</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="Ad"
                value={form.firstName}
                onChangeText={(v) => updateField('firstName', v)}
                placeholder="Adınız"
                error={errors.firstName}
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="Soyad"
                value={form.lastName}
                onChangeText={(v) => updateField('lastName', v)}
                placeholder="Soyadınız"
                error={errors.lastName}
              />
            </View>
          </View>

          <Input
            label="E-posta"
            value={form.email}
            onChangeText={(v) => updateField('email', v)}
            placeholder="ornek@email.com"
            keyboardType="email-address"
            error={errors.email}
          />
          <Input
            label="Şifre"
            value={form.password}
            onChangeText={(v) => updateField('password', v)}
            placeholder="En az 6 karakter"
            secureTextEntry
            error={errors.password}
          />
          <Input
            label="Şifre Tekrar"
            value={form.confirmPassword}
            onChangeText={(v) => updateField('confirmPassword', v)}
            placeholder="Şifrenizi tekrar girin"
            secureTextEntry
            error={errors.confirmPassword}
          />

          <Button
            title="Kayıt Ol"
            onPress={handleRegister}
            loading={loading}
            style={styles.button}
          />

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.loginLinkText}>
              Zaten hesabınız var mı? <Text style={styles.loginLinkBold}>Giriş yapın</Text>
            </Text>
          </TouchableOpacity>
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  button: {
    marginTop: 8,
    marginBottom: 24,
  },
  loginLink: {
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#636E72',
    fontSize: 15,
  },
  loginLinkBold: {
    color: '#6C5CE7',
    fontWeight: '700',
  },
});
