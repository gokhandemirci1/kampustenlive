# Agora Canlı Yayın Sistemi - Kurulum Adımları

## 📋 Ön Hazırlık

### 1. Agora Hesabı ve Bilgiler
✅ Agora hesabını açtınız mı? → `AGORA_KURULUM_REHBERI.md` dosyasına bakın
✅ App ID ve App Certificate aldınız mı?

### 2. Environment Değişkenleri
`.env` dosyanıza şu satırları ekleyin:

```env
# Mevcut Supabase değişkenleri
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Agora değişkenleri
VITE_AGORA_APP_ID=your_agora_app_id_here

# Token Server URL (İki seçenek var - birini seçin)
# Seçenek 1: Supabase Edge Function kullanacaksanız (önerilen)
# Bu durumda VITE_AGORA_TOKEN_SERVER_URL eklemeyin, otomatik olarak Edge Function URL'i kullanılacak

# Seçenek 2: Custom Node.js server kullanacaksanız
VITE_AGORA_TOKEN_SERVER_URL=http://localhost:3001/api/agora-token
```

## 🗄️ Veritabanı Kurulumu

### 1. Supabase SQL Editor'e gidin
1. Supabase Dashboard > SQL Editor
2. `supabase/add_live_sessions_table.sql` dosyasının içeriğini kopyalayın
3. SQL Editor'de çalıştırın

Bu işlem:
- `live_sessions` tablosunu oluşturur
- Gerekli indexleri ekler
- RLS (Row Level Security) politikalarını ayarlar

## 🔧 Token Server Kurulumu

### Seçenek 1: Supabase Edge Function (Önerilen)

#### Adımlar:
1. Supabase CLI kurun:
```bash
npm install -g supabase
```

2. Supabase'e login olun:
```bash
supabase login
```

3. Projenizi link edin:
```bash
supabase link --project-ref your-project-ref
```

4. Secret'ları ekleyin:
```bash
supabase secrets set AGORA_APP_ID=your_app_id
supabase secrets set AGORA_APP_CERTIFICATE=your_app_certificate
```

5. Edge Function'ı deploy edin:
```bash
supabase functions deploy agora-token
```

**NOT**: `supabase/functions/agora-token/index.ts` dosyasındaki token generation kısmını Agora'nın resmi SDK'sı ile güncelleyin!

---

### Seçenek 2: Node.js Server (Alternatif)

#### Adımlar:
1. `server` klasörüne gidin:
```bash
cd server
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. `.env` dosyası oluşturun (`server/.env`):
```env
AGORA_APP_ID=your_app_id
AGORA_APP_CERTIFICATE=your_app_certificate
PORT=3001
```

4. Sunucuyu başlatın:
```bash
npm start
```

5. Production'da da çalıştırın (örnek: PM2 veya systemd ile)

---

## 📦 Frontend Kurulumu

### 1. Agora SDK Kurulumu
```bash
npm install
```
(Agora SDK zaten `package.json`'a eklenmiş durumda)

### 2. Uygulamayı Başlatın
```bash
npm run dev
```

## 🧪 Test Etme

### Öğretmen Tarafı:
1. Öğretmen olarak giriş yapın
2. Teacher Dashboard'a gidin
3. Bir kursunuzda "Dersi Başlat" butonuna tıklayın
4. Tarayıcı kamera/mikrofon izni isteyecek - izin verin
5. Canlı ders ekranı açılacak

### Öğrenci Tarafı:
1. Öğrenci olarak giriş yapın
2. Student Dashboard'a gidin
3. Kayıtlı olduğunuz bir kurs için "CANLI" badge'i görünüyorsa
4. "Derse Gir" butonuna tıklayın
5. Canlı ders ekranı açılacak (mikrofon/kamera kapalı olarak)

## 🔍 Sorun Giderme

### Token hatası alıyorsanız:
1. Token server'ın çalıştığından emin olun
2. Environment değişkenlerinin doğru olduğunu kontrol edin
3. Browser console'da hata mesajlarını kontrol edin

### Kamera/Mikrofon çalışmıyorsa:
1. Tarayıcı izinlerini kontrol edin
2. HTTPS üzerinde çalıştığınızdan emin olun (localhost hariç)
3. Browser console'da hata mesajlarını kontrol edin

### Canlı ders sayfası açılmıyorsa:
1. Veritabanında `live_sessions` tablosunun oluşturulduğunu kontrol edin
2. RLS politikalarının doğru ayarlandığını kontrol edin
3. Browser console'da hata mesajlarını kontrol edin

## 📚 Dokümantasyon

- Agora SDK Dokümantasyonu: https://docs.agora.io/en/video-calling/get-started/get-started-sdk?platform=web
- Agora Token Server: https://www.agora.io/en/blog/agora-token-server-sdk/

## ⚠️ Önemli Notlar

1. **App Certificate**: ASLA frontend kodunda kullanmayın, sadece backend'de saklayın
2. **Token Server**: Production'da mutlaka HTTPS kullanın
3. **Ölçeklenebilirlik**: Agora otomatik olarak ölçeklenir, ancak token server'ınızın da ölçeklenebilir olduğundan emin olun
4. **Güvenlik**: Her token isteğinde kullanıcı kimlik doğrulaması yapılmalıdır

## 🎉 Tamamlandı!

Artık sisteminiz hazır! Canlı ders özelliğini kullanmaya başlayabilirsiniz.

Sorularınız için: README.md dosyasına veya kod içindeki yorumlara bakın.

