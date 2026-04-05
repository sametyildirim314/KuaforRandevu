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

export default function LoginScreen({ navigation }) {
  // useState: Bileşen içinde veri (state) tutmamızı sağlar. 
  // email değiştikçe setEmail fonksiyonu ile güncellenir.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({}); // Giriş hatalarını tutar
  const [loading, setLoading] = useState(false); // İşlem devam ediyor mu?

  // authStore içindeki login fonksiyonuna erişiyoruz
  const login = authStore((s) => s.login);

  // Girdi doğrulaması (Validation)
  const validate = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'E-posta gerekli';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Geçerli bir e-posta girin';
    if (!password) newErrors.password = 'Şifre gerekli';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Giriş yap butonuna basıldığında çalışır
  const handleLogin = async () => {
    if (!validate() || loading) return; // Hata varsa veya zaten yükleniyorsa dur

    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      // Alert: Kullanıcıya mesaj kutusu gösterir
      Alert.alert('Giriş Hatası', err.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    // KeyboardAvoidingView: Klavye açıldığında içeriğin yukarı kaymasını sağlar
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* ScrollView: İçeriğin ekrana sığmadığı durumda kaydırılmasını sağlar */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled" // Ekrana dokunulduğunda klavyeyi kapatır
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Hoş Geldiniz</Text>
          <Text style={styles.subtitle}>Hesabınıza giriş yapın</Text>
        </View>

        <View style={styles.form}>
          {/* Özel Input bileşenimiz: label, value ve error gibi proplar alır */}
          <Input
            label="E-posta"
            value={email}
            onChangeText={setEmail} // Metin değiştikçe setEmail çalışır
            placeholder="ornek@email.com"
            keyboardType="email-address"
            error={errors.email}
          />
          <Input
            label="Şifre"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry // Şifreyi gizli (noktalı) gösterir
            error={errors.password}
          />

          <TouchableOpacity
            style={styles.forgotLink}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotLinkText}>Şifremi unuttum</Text>
          </TouchableOpacity>

          {/* Button: Kendi yaptığımız buton bileşeni */}
          <Button
            title="Giriş Yap"
            onPress={handleLogin}
            loading={loading}
            style={styles.button}
          />

          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerLinkText}>
              Hesabınız yok mu? <Text style={styles.registerLinkBold}>Kayıt olun</Text>
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
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotLinkText: {
    color: '#6C5CE7',
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    marginTop: 8,
    marginBottom: 24,
  },
  registerLink: {
    alignItems: 'center',
  },
  registerLinkText: {
    color: '#636E72',
    fontSize: 15,
  },
  registerLinkBold: {
    color: '#6C5CE7',
    fontWeight: '700',
  },
});
