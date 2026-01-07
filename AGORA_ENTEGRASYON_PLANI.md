# Agora Canlı Yayın Entegrasyon Planı

## 🎯 Sistem Mimarisi

### 1. Öğretmen Tarafı (Host/Broadcaster)
- ✅ Canlı dersi başlatma butonu
- ✅ Yayın kontrol paneli (mikrofon, kamera açma/kapama)
- ✅ Katılan öğrencileri görme (viewer listesi)
- ✅ Dersi bitirme butonu
- ✅ Ekran paylaşımı (opsiyonel)

### 2. Öğrenci Tarafı (Audience/Viewer)
- ✅ Canlı derse katılma butonu
- ✅ **Varsayılan olarak mikrofon ve kamera KAPALI** (sadece izleyici)
- ✅ Öğretmen isterse mikrofon/kamera açma izni
- ✅ Chat ile soru sorma (mevcut chat sistemi ile entegre)

## 🔧 Teknik Detaylar

### Token Server
Agora token'ları için iki seçenek:

#### Seçenek 1: Supabase Edge Function (Önerilen)
- Supabase projesinde Edge Function oluşturulacak
- Her token isteğinde güvenli şekilde token üretilecek
- App Certificate backend'de saklanacak

#### Seçenek 2: Basit Node.js Server
- Ayrı bir server kurulabilir
- Express.js ile basit endpoint

### Frontend Entegrasyonu
- Agora RTC SDK (Video SDK) kullanılacak
- React hooks ile state management
- Responsive tasarım

## 📦 Kurulum Adımları

1. ✅ Agora hesabı açma (kullanıcı yapacak)
2. ⏳ Agora SDK kurulumu
3. ⏳ Veritabanı şeması güncellemesi
4. ⏳ Token server kurulumu
5. ⏳ Frontend componentleri
6. ⏳ Route entegrasyonu

## 🔐 Güvenlik

- Token'lar sadece backend'de üretilecek
- Her kullanıcı için unique UID kullanılacak
- Channel name course_id + timestamp ile oluşturulacak
- RLS policies ile yetkilendirme kontrolü

## 📱 Kullanıcı Deneyimi

### Öğretmen Akışı:
1. Kurs detay sayfasında "Canlı Ders Başlat" butonu
2. Canlı ders sayfası açılır
3. Öğretmen kamera/mikrofon izinleri verir
4. Yayın başlar
5. Katılan öğrenciler görünür
6. Dersi bitir butonu ile sonlandırır

### Öğrenci Akışı:
1. Kayıtlı olduğu kurslarda "Canlı Derse Katıl" butonu
2. Canlı ders sayfası açılır
3. **Mikrofon ve kamera KAPALI** olarak giriş yapar
4. Öğretmeni ve diğer öğrencileri izler
5. Chat ile soru sorabilir

