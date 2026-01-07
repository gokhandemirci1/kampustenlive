# 🎥 Agora Canlı Yayın Sistemi - Hızlı Başlangıç

## 📝 Özet

Bu dokümantasyon, Kampusten.org platformuna Agora canlı yayın entegrasyonunun nasıl yapıldığını açıklar.

## ✅ Tamamlanan Özellikler

1. ✅ **Veritabanı Şeması**: `live_sessions` tablosu eklendi
2. ✅ **Agora SDK Entegrasyonu**: Frontend'e Agora RTC SDK eklendi
3. ✅ **Öğretmen Component**: Canlı ders başlatma ve yönetim paneli
4. ✅ **Öğrenci Component**: Canlı derse katılma (mikrofon/kamera kapalı default)
5. ✅ **Routing**: Canlı ders sayfası route'ları eklendi
6. ✅ **Dashboard Entegrasyonu**: Öğretmen ve öğrenci dashboard'larına butonlar eklendi

## 🎯 Sistem Mimarisi

### Öğretmen Akışı:
1. Teacher Dashboard → Kurs seç → "Dersi Başlat" butonu
2. `/live/{courseId}` sayfasına yönlendirilir
3. Canlı ders oturumu otomatik oluşturulur (`live_sessions` tablosuna kayıt)
4. Agora'ya host/broadcaster olarak bağlanır
5. Yayın kontrol paneli ile kamera/mikrofon yönetimi yapabilir
6. Katılan öğrencileri görür

### Öğrenci Akışı:
1. Student Dashboard → Kayıtlı kurs → "CANLI" badge görürse → "Derse Gir" butonu
2. `/live/{courseId}` sayfasına yönlendirilir
3. Aktif canlı ders oturumu kontrol edilir
4. Agora'ya audience/subscriber olarak bağlanır
5. **Mikrofon ve kamera varsayılan olarak KAPALI** (sadece izleyici)
6. İsterseniz mikrofon/kamera açabilir (öğretmen izni gerekmez)

## 📦 Dosya Yapısı

```
kampusten.org/
├── src/
│   ├── components/
│   │   └── live/
│   │       ├── LiveClassTeacher.jsx    # Öğretmen canlı ders componenti
│   │       └── LiveClassStudent.jsx    # Öğrenci canlı ders componenti
│   ├── lib/
│   │   └── agora.js                    # Agora helper fonksiyonları
│   └── pages/
│       └── LiveClass.jsx               # Canlı ders sayfası (routing)
├── supabase/
│   ├── add_live_sessions_table.sql     # Veritabanı migration
│   └── functions/
│       └── agora-token/
│           └── index.ts                # Supabase Edge Function (Token Server)
├── server/
│   ├── agora-token-server.js           # Node.js Token Server (Alternatif)
│   └── package.json
├── AGORA_KURULUM_REHBERI.md            # Agora hesap açma rehberi
├── AGORA_ENTEGRASYON_PLANI.md          # Entegrasyon planı
└── KURULUM_ADIMLARI.md                 # Detaylı kurulum adımları
```

## 🚀 Hızlı Başlangıç

### 1. Agora Bilgilerini Alın
- `AGORA_KURULUM_REHBERI.md` dosyasına bakın
- Agora hesabı açın, App ID ve App Certificate alın

### 2. Environment Değişkenlerini Ekleyin
`.env` dosyasına:
```env
VITE_AGORA_APP_ID=your_app_id_here
```

### 3. Veritabanını Güncelleyin
Supabase SQL Editor'de `supabase/add_live_sessions_table.sql` dosyasını çalıştırın.

### 4. Token Server Kurun
İki seçenek var (birini seçin):
- **Supabase Edge Function**: `KURULUM_ADIMLARI.md` dosyasına bakın
- **Node.js Server**: `server/agora-token-server.js` dosyasını kullanın

### 5. Bağımlılıkları Yükleyin ve Başlatın
```bash
npm install
npm run dev
```

## 🔐 Güvenlik Notları

- ✅ App Certificate sadece backend'de (token server) saklanıyor
- ✅ Token'lar her kullanıcı için ayrı üretiliyor
- ✅ RLS policies ile yetkilendirme kontrolü yapılıyor
- ✅ Öğrenciler sadece kayıtlı oldukları kurslara katılabiliyor
- ✅ Öğretmenler sadece kendi kurslarını başlatabiliyor

## 📱 Özellikler

### Öğretmen Özellikleri:
- ✅ Canlı ders başlatma
- ✅ Kamera açma/kapama
- ✅ Mikrofon açma/kapama
- ✅ Katılımcı sayısını görme
- ✅ Dersi sonlandırma
- ✅ Katılan öğrencileri görme (video varsa)

### Öğrenci Özellikleri:
- ✅ Canlı derse katılma
- ✅ Varsayılan olarak mikrofon/kamera kapalı
- ✅ İsterse mikrofon/kamera açabilme
- ✅ Öğretmeni ve diğer öğrencileri görme
- ✅ Dersden ayrılma

## 🎨 UI/UX

- Modern, minimalist tasarım (mevcut tasarıma uyumlu)
- Responsive (mobil uyumlu)
- Tailwind CSS kullanılıyor
- Lucide React iconları

## 📊 Ölçeklenebilirlik

- Agora otomatik ölçeklenme desteği sunuyor
- Aynı anda 1000+ kişi bir kanala katılabilir
- Global CDN ile düşük gecikme
- Token server'ınızın da ölçeklenebilir olması gerekiyor

## 🔧 Teknik Detaylar

### Agora Mode
- **Mode**: `live` (broadcasting mode)
- **Codec**: `vp8`
- **Teacher Role**: `host` / `publisher` (role: 1)
- **Student Role**: `audience` / `subscriber` (role: 2)

### Channel Naming
- Format: `course_{courseId}_{timestamp}`
- Her ders için unique channel name
- Course ID'den parse edilebilir

### Token Expiration
- Token'lar 24 saat geçerli
- Production'da daha kısa süre ayarlanabilir

## 🐛 Bilinen Sorunlar / Notlar

1. **Edge Function Token Generation**: `supabase/functions/agora-token/index.ts` dosyasındaki token generation kısmı placeholder. Agora'nın resmi SDK'sı ile güncellenmelidir.

2. **Browser İzinleri**: HTTPS üzerinde çalışmalı (localhost hariç)

3. **Firewall**: Agora portlarının açık olması gerekiyor (genellikle firewall sorunu yoktur)

## 📚 Kaynaklar

- [Agora Dokümantasyonu](https://docs.agora.io/en/video-calling/get-started/get-started-sdk?platform=web)
- [Agora Token Server](https://www.agora.io/en/blog/agora-token-server-sdk/)
- [Agora Pricing](https://www.agora.io/pricing/)

## 🤝 Destek

Sorularınız için:
1. `KURULUM_ADIMLARI.md` dosyasına bakın
2. Kod içindeki yorumları inceleyin
3. Browser console'daki hata mesajlarını kontrol edin

## ✅ Test Checklist

- [ ] Agora hesabı açıldı
- [ ] App ID ve Certificate alındı
- [ ] Environment değişkenleri eklendi
- [ ] Veritabanı migration çalıştırıldı
- [ ] Token server kuruldu ve çalışıyor
- [ ] Frontend bağımlılıkları yüklendi
- [ ] Öğretmen olarak canlı ders başlatıldı
- [ ] Öğrenci olarak canlı derse katılındı
- [ ] Mikrofon/kamera kontrolü test edildi
- [ ] Birden fazla öğrenci ile test edildi

---

**🎉 Sistem hazır! Başarılar!**

