# 🚀 Agora Canlı Yayın - Sonraki Adımlar

## ✅ Tamamlananlar
- [x] Agora hesabı açıldı
- [x] APP ID + Token modu seçildi
- [x] App ID ve App Certificate alındı
- [x] .env dosyasına bilgiler eklendi

## 📋 Şimdi Yapılacaklar

### Adım 1: Veritabanı Migration'ı (ÖNEMLİ!)

1. **Supabase Dashboard'a gidin**: https://app.supabase.com
2. **Projenizi seçin**
3. **SQL Editor** sekmesine tıklayın
4. **New Query** butonuna tıklayın
5. `supabase/add_live_sessions_table.sql` dosyasının içeriğini kopyalayıp yapıştırın
6. **RUN** butonuna tıklayın

✅ Bu işlem `live_sessions` tablosunu oluşturacak ve gerekli izinleri ayarlayacak.

---

### Adım 2: Token Server Kurulumu

İki seçenek var, birini seçin:

#### 🔵 Seçenek 1: Node.js Server (Kolay ve Hızlı - Önerilen Başlangıç için)

**Avantajları:**
- Kolay kurulum
- Hızlı test
- Local development için ideal

**Adımlar:**
1. Terminal'de `server` klasörüne gidin:
   ```bash
   cd server
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. `.env` dosyası oluşturun (`server/.env`):
   ```env
   AGORA_APP_ID=your_app_id_here
   AGORA_APP_CERTIFICATE=your_app_certificate_here
   PORT=3001
   ```

4. Sunucuyu başlatın:
   ```bash
   npm start
   ```

5. Frontend `.env` dosyanıza ekleyin:
   ```env
   VITE_AGORA_TOKEN_SERVER_URL=http://localhost:3001/api/agora-token
   ```

✅ Token server çalışıyor olmalı!

---

#### 🟢 Seçenek 2: Supabase Edge Function (Production için İdeal)

**Avantajları:**
- Production-ready
- Otomatik ölçeklenme
- Supabase ile entegre

**Adımlar:**
1. Supabase CLI kurun (eğer yoksa):
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
   (Project ref'i Supabase Dashboard > Settings > General'da bulabilirsiniz)

4. Secret'ları ekleyin:
   ```bash
   supabase secrets set AGORA_APP_ID=your_app_id
   supabase secrets set AGORA_APP_CERTIFICATE=your_app_certificate
   ```

5. Edge Function'ı deploy edin:
   ```bash
   supabase functions deploy agora-token
   ```

⚠️ **ÖNEMLİ NOT**: Edge Function'daki token generation kısmını Agora'nın resmi SDK'sı ile güncelleyin! (Şu anda placeholder)

✅ Edge Function deploy edildi, otomatik olarak kullanılacak!

---

### Adım 3: Test Etme

1. **Frontend'i başlatın** (yeni terminal):
   ```bash
   npm run dev
   ```

2. **Öğretmen olarak giriş yapın**

3. **Teacher Dashboard'a gidin**

4. **Bir kursunuzda "Dersi Başlat" butonuna tıklayın**

5. **Tarayıcı kamera/mikrofon izni isteyecek** - İzin verin

6. **Canlı ders ekranı açılmalı!** 🎉

---

## 🔍 Sorun Giderme

### Token Server çalışmıyor
- Port 3001'in kullanılabilir olduğundan emin olun
- `.env` dosyasında bilgilerin doğru olduğunu kontrol edin
- Console'da hata mesajlarını kontrol edin

### Veritabanı hatası
- `live_sessions` tablosunun oluşturulduğunu kontrol edin
- Supabase SQL Editor'de tabloyu kontrol edin: `SELECT * FROM live_sessions LIMIT 1;`

### Frontend'de token hatası
- Token server'ın çalıştığından emin olun
- Browser console'da hata mesajlarını kontrol edin
- Network tab'da token isteğinin gittiğini kontrol edin

---

## 📞 Yardım

Herhangi bir sorunla karşılaşırsanız:
1. Browser console'u kontrol edin
2. Network tab'ı kontrol edin
3. Terminal'deki hata mesajlarını kontrol edin

---

**Başarılar! 🚀**

