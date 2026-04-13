// ── Merkezi Renk ve Tema Tanımları ─────────────────────────────────
// Tüm ekranlar bu dosyadaki renkleri kullanır.
// Bir renk değiştirmek istediğinizde tek yerden değiştirmeniz yeterlidir.

export const COLORS = {
  // Ana renkler
  primary: '#2A9D8F',         // Soft teal — ana aksiyon rengi
  primaryLight: '#E6F5F3',    // Açık teal — seçili kartlar, arka plan vurgusu
  primaryDark: '#1E7A6E',     // Koyu teal — pressed durumu

  // Arka planlar
  background: '#F5F5F0',      // Sıcak off-white — ana arka plan
  card: '#FFFFFF',             // Saf beyaz — kartlar
  cardBorder: '#EBEBEB',      // Kart kenarlık rengi

  // Metin
  textPrimary: '#1A1A2E',     // Koyu lacivert — başlıklar
  textSecondary: '#6B7280',   // Gray-500 — açıklama metinleri
  textMuted: '#9CA3AF',       // Gray-400 — placeholder

  // Durumlar
  success: '#059669',          // Yeşil — onaylandı, tamamlandı
  successLight: '#D1FAE5',     // Açık yeşil — badge arka planı
  warning: '#D97706',          // Amber — beklemede
  warningLight: '#FEF3C7',     // Açık amber
  danger: '#DC2626',           // Kırmızı — iptal, silme
  dangerLight: '#FEE2E2',      // Açık kırmızı
  accent: '#7C3AED',           // Mor — özel badge'ler
  accentLight: '#EDE9FE',      // Açık mor

  // Sabitler
  white: '#FFFFFF',
  black: '#000000',

  // Diğer
  border: '#E5E7EB',           // Genel border
  shadow: '#000',              // Gölge rengi (opacity ile kullanılır)
  star: '#F59E0B',             // Yıldız rengi (amber)
  disabled: '#D1D5DB',         // Disabled buton
  tabBar: '#FFFFFF',           // Tab bar arka planı
  tabActive: '#2A9D8F',       // Tab bar aktif ikon
  tabInactive: '#9CA3AF',     // Tab bar pasif ikon
};

// Ortak gölge stili
export const SHADOW = {
  shadowColor: COLORS.shadow,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 3,
};

// Ortak kart stili
export const CARD_STYLE = {
  backgroundColor: COLORS.card,
  borderRadius: 14,
  padding: 16,
  ...SHADOW,
};

// Randevu durum renkleri
export const STATUS_COLORS = {
  Pending:   { bg: COLORS.warningLight, border: COLORS.warning, text: '#92400E' },
  Confirmed: { bg: COLORS.successLight, border: COLORS.success, text: '#065F46' },
  Completed: { bg: '#F3F4F6',           border: '#6B7280',      text: '#374151' },
  Cancelled: { bg: COLORS.dangerLight,  border: COLORS.danger,  text: '#991B1B' },
};
