# 🚀 Supabase Edge Function Kurulumu (npx ile)

## ✅ Hazırlık Kontrolü
- [x] Supabase CLI çalışıyor (npx ile)
- [x] Edge Function dosyası hazır
- [x] Agora bilgileri `.env` dosyasında

---

## 📋 Adım Adım Kurulum

### 1️⃣ Supabase'e Login Olun

PowerShell'de çalıştırın:
```powershell
npx supabase login
```

Bu komut tarayıcınızı açacak ve Supabase hesabınızla giriş yapmanızı isteyecek.

---

### 2️⃣ Proje Referans ID'sini Bulun

1. **Supabase Dashboard**: https://app.supabase.com
2. Projenizi seçin
3. **Settings** > **General** sekmesi
4. **Reference ID** değerini kopyalayın

Örnek: `abcdefghijklmnop`

---

### 3️⃣ Projeyi Link Edin

```powershell
npx supabase link --project-ref YOUR_PROJECT_REF_ID
```

**Örnek:**
```powershell
npx supabase link --project-ref abcdefghijklmnop
```

✅ Proje başarıyla link edildi!

---

### 4️⃣ Agora Secret'larını Ekleyin

`.env` dosyanızdan App ID ve Certificate değerlerini kopyalayın.

```powershell
npx supabase secrets set AGORA_APP_ID=your_app_id_here
npx supabase secrets set AGORA_APP_CERTIFICATE=your_app_certificate_here
```

**ÖNEMLİ**: Tırnak işareti kullanmayın!

**Örnek:**
```powershell
npx supabase secrets set AGORA_APP_ID=1234567890abcdef1234567890abcdef
npx supabase secrets set AGORA_APP_CERTIFICATE=abc123def456ghi789jkl012mno345pqr678
```

✅ Secret'lar eklendi!

---

### 5️⃣ Edge Function'ı Deploy Edin

```powershell
npx supabase functions deploy agora-token
```

Bu işlem biraz sürebilir. Bekleyin...

✅ Deploy tamamlandı!

---

### 6️⃣ Kontrol Edin

1. **Supabase Dashboard** > **Edge Functions** sekmesine gidin
2. `agora-token` function'ını görmelisiniz ✅
3. Function URL'i: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/agora-token`

---

## 🎉 Tamamlandı!

Artık Edge Function hazır ve çalışıyor!

Frontend otomatik olarak Edge Function'ı kullanacak (`.env` dosyasında `VITE_AGORA_TOKEN_SERVER_URL` tanımlı değilse).

---

## 🧪 Test Etme

1. Frontend'i başlatın: `npm run dev`
2. Öğretmen olarak giriş yapın
3. Teacher Dashboard'da bir kurs seçin
4. "Dersi Başlat" butonuna tıklayın
5. Canlı ders ekranı açılmalı! 🎥

---

## 🔍 Sorun Giderme

### "Project not found" hatası
- Project Ref ID'nin doğru olduğundan emin olun
- Dashboard'dan tekrar kontrol edin

### Secret'lar çalışmıyor
- Secret'ları tek tek ekleyin
- Tırnak işareti kullanmayın
- `.env` dosyasındaki değerleri doğrudan kopyalayın

### Deploy hatası
- `supabase/functions/agora-token/index.ts` dosyasının syntax hatasız olduğundan emin olun
- Terminal'deki hata mesajlarını kontrol edin

---

**Hazırsanız başlayalım!** 🚀

