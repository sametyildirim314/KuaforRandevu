import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity,
  ActivityIndicator, Alert, Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../utils/constants';
import authStore from '../../store/authStore';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 3;

export default function BarberPortfolioScreen() {
  const navigation = useNavigation();
  const { barberId, barberName } = useRoute().params;
  const { user } = authStore();

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Galeri resimlerini yükle
  const loadGallery = async () => {
    try {
      const { data } = await api.get(`${API_ENDPOINTS.barbers}/${barberId}/gallery`);
      setImages(data);
    } catch (e) {
      console.warn(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, [barberId]);

  // Resim yükleme yetkisi var mı? (Salon sahibi veya Berber rolündeki kullanıcılar)
  const canManage = user?.role === 'SalonOwner' || user?.role === 'Barber';

  const handlePickImage = async () => {
    Alert.alert(
      'Resim Yükle 📸',
      'Portfolyo için resim yükleme kaynağını seçin:',
      [
        { text: 'Kamera', onPress: () => openPicker(true) },
        { text: 'Galeri', onPress: () => openPicker(false) },
        { text: 'İptal', style: 'cancel' },
      ]
    );
  };

  const openPicker = async (useCamera = false) => {
    try {
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('İzin Gerekli', 'Kamerayı kullanmak için izin vermelisiniz.');
          return;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('İzin Gerekli', 'Galeriye erişmek için izin vermelisiniz.');
          return;
        }
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
          });

      if (result.canceled || !result.assets || result.assets.length === 0) return;

      const selectedAsset = result.assets[0];
      await uploadImage(selectedAsset.uri);
    } catch (e) {
      Alert.alert('Hata', 'Fotoğraf seçilirken bir hata oluştu.');
    }
  };

  const uploadImage = async (uri) => {
    setUploading(true);
    try {
      const formData = new FormData();
      // Dosya adını ve tipini belirle
      const filename = uri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append('file', { uri, name: filename, type });

      const { data } = await api.post(
        `${API_ENDPOINTS.barbers}/${barberId}/gallery`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Başarılı yüklemeden sonra galeri listesine ekle
      setImages((prev) => [data, ...prev]);
      Alert.alert('Başarılı! 🎉', 'Çalışmanız galeriye eklendi.');
    } catch (e) {
      Alert.alert('Hata', e.response?.data?.message || e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = (imgId) => {
    if (!canManage) return;

    Alert.alert(
      'Resmi Sil 🗑️',
      'Bu çalışmayı portfolyonuzdan silmek istediğinize emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`${API_ENDPOINTS.gallery}/${imgId}`);
              setImages((prev) => prev.filter((img) => img.id !== imgId));
              Alert.alert('Başarılı', 'Resim galeriden silindi.');
            } catch (e) {
              Alert.alert('Hata', 'Resim silinirken bir hata oluştu.');
            }
          },
        },
      ]
    );
  };

  // Resimlerin tam URL'sini al (Eğer yerel geliştirme ise public IP'yi ekler)
  const getFullImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    // API_URL_OVERRIDE veya varsayılan URL'i constants'tan oku
    const baseURL = api.defaults.baseURL || 'http://localhost:5252';
    // Sunucu base URL'ine relative path ekle
    return `${baseURL.replace('/api', '')}${url}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{barberName}</Text>
        <Text style={styles.subtitle}>Çalışmaları & Portfolyo</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6C5CE7" />
        </View>
      ) : (
        <FlatList
          data={images}
          keyExtractor={(item) => String(item.id)}
          numColumns={3}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Henüz portfolyo fotoğrafı eklenmemiş.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.imageWrapper}
              activeOpacity={0.9}
              onLongPress={() => handleDeleteImage(item.id)}
            >
              <Image source={{ uri: getFullImageUrl(item.imageUrl) }} style={styles.image} />
            </TouchableOpacity>
          )}
        />
      )}

      {/* Yükleme Butonu (Yalnızca yetkili kullanıcılar için) */}
      {canManage && (
        <TouchableOpacity
          style={[styles.uploadBtn, uploading && styles.uploadBtnDisabled]}
          onPress={handlePickImage}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.uploadBtnText}>📸 Fotoğraf Ekle</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 20, fontWeight: '800', color: '#2D3436' },
  subtitle: { fontSize: 13, color: '#636E72', marginTop: 2 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  row: { gap: 8, marginBottom: 8 },
  listContent: { padding: 16 },
  imageWrapper: { width: COLUMN_WIDTH, height: COLUMN_WIDTH, borderRadius: 12, overflow: 'hidden', backgroundColor: '#e2e3e5' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  empty: { flex: 1, paddingVertical: 80, alignItems: 'center' },
  emptyText: { color: '#636E72', fontSize: 14, textAlign: 'center' },
  uploadBtn: {
    backgroundColor: '#6C5CE7',
    paddingVertical: 18,
    alignItems: 'center',
    margin: 16,
    borderRadius: 14,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  uploadBtnDisabled: { backgroundColor: '#a29bfe' },
  uploadBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
