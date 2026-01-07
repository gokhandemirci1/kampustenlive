# 🚀 Supabase Edge Function - Agora Token Server Kurulum Rehberi

## 📋 Adım Adım Kurulum

### 1️⃣ Supabase CLI Kurulumu

Windows PowerShell'de çalıştırın:

```powershell
npm install -g supabase
```

Kurulumun başarılı olduğunu kontrol edin:
```powershell
supabase --version
```

---

### 2️⃣ Supabase'e Login Olun

```powershell
supabase login
```

Bu komut tarayıcınızı açacak ve Supabase hesabınızla giriş yapmanızı isteyecek.

---

### 3️⃣ Proje Referans ID'sini Bulun

1. **Supabase Dashboard**'a gidin: https://app.supabase.com
2. Projenizi seçin
3. **Settings** > **General** sekmesine gidin
4. **Reference ID** değerini kopyalayın (örn: `abcdefghijklmnop`)

---

### 4️⃣ Projeyi Link Edin

Terminal'de projenizin kök dizininde (`c:\kampusten.org`) çalıştırın:

```powershell
supabase link --project-ref YOUR_PROJECT_REF_ID
```

Örnek:
```powershell
supabase link --project-ref abcdefghijklmnop
```

✅ Proje başarıyla link edildi!

---

### 5️⃣ Agora Secret'larını Ekleyin

Agora App ID ve Certificate'ı Supabase secrets olarak ekleyin:

```powershell
supabase secrets set AGORA_APP_ID=your_app_id_here
supabase secrets set AGORA_APP_CERTIFICATE=your_app_certificate_here
```

**Örnek:**
```powershell
supabase secrets set AGORA_APP_ID=1234567890abcdef1234567890abcdef
supabase secrets set AGORA_APP_CERTIFICATE=abc123def456ghi789jkl012mno345pqr678
```

> ⚠️ **ÖNEMLİ**: App ID ve Certificate'ı `.env` dosyanızdan kopyalayın!

✅ Secret'lar başarıyla eklendi!

---

### 6️⃣ Edge Function'ı Deploy Edin

```powershell
supabase functions deploy agora-token
```

✅ Deploy işlemi tamamlandı!

---

### 7️⃣ Test Edin

Edge Function'ın çalıştığını test edin:

1. **Supabase Dashboard** > **Edge Functions** sekmesine gidin
2. `agora-token` function'ını görmelisiniz
3. Function URL'ini kopyalayın: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/agora-token`

---

### 8️⃣ Frontend Entegrasyonu

Frontend otomatik olarak Edge Function'ı kullanacak! `.env` dosyanızda `VITE_AGORA_TOKEN_SERVER_URL` tanımlı değilse, otomatik olarak Supabase Edge Function URL'i kullanılacak.

Kontrol için `src/lib/agora.js` dosyasındaki `getTokenServerUrl()` fonksiyonuna bakın.

---

## 🔍 Sorun Giderme

### "supabase: command not found" hatası
- Node.js'in PATH'e eklendiğinden emin olun
- PowerShell'i yeniden başlatın
- Global kurulum: `npm install -g supabase`

### "Project not found" hatası
- Project Ref ID'nin doğru olduğundan emin olun
- Supabase Dashboard'dan kontrol edin

### Secret'lar eklenmiyor
- Secret'ları tek tek ekleyin
- Tırnak işareti kullanmayın
- Özel karakterleri escape edin (gerekirse)

### Deploy hatası
- `supabase/functions/agora-token/index.ts` dosyasının syntax hatasız olduğundan emin olun
- Deno syntax kurallarına uygun olduğundan emin olun

---

## ✅ Kurulum Tamamlandı!

Artık Edge Function hazır! Frontend'den token istekleri otomatik olarak Edge Function'a gidecek.

---

## 📝 Sonraki Adımlar

1. Frontend'i başlatın: `npm run dev`
2. Öğretmen olarak giriş yapın
3. Canlı ders başlatmayı test edin!

---

**Başarılar! 🎉**

