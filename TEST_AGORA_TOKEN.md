# 🧪 Agora Token Test Rehberi

## ✅ Secret'lar Doğru!

Secret isimleri artık doğru:
- ✅ `AGORA_APP_ID`
- ✅ `AGORA_APP_CERTIFICATE`

## 🧪 Test Adımları

### 1. Production'da Test Edin

1. Vercel deployment'ınızı açın
2. Öğretmen olarak giriş yapın
3. Teacher Dashboard'a gidin
4. Bir kurs seçin ve "Dersi Başlat" butonuna tıklayın

### 2. Başarılı Olursa

- Canlı ders ekranı açılmalı
- Kamera/mikrofon izni isteyecek
- Yayın başlamalı

### 3. Hata Alırsanız

Browser console'da kontrol edin:

**Token hatası:**
- Secret'ların doğru olduğundan emin olun (✅ zaten doğru)
- Edge Function loglarını kontrol edin

**CORS hatası:**
- Supabase Dashboard > Edge Functions > Logs
- OPTIONS request'lerini kontrol edin

## 📊 Edge Function Log Kontrolü

1. Supabase Dashboard > **Edge Functions** > `agora-token`
2. **Logs** sekmesine gidin
3. Son istekleri kontrol edin
4. Hata varsa detaylarını inceleyin

---

**Artık çalışması gerekiyor! Test edin ve sonucu bildirin.** 🚀

