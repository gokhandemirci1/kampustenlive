# 🔍 Agora Token "Invalid Token" - Diagnostik Rehberi

## ✅ Log Analizi - Parametreler Doğru!

Log'larda görünen parametreler doğru:
- ✅ App ID: `412be2c4...` (doğru başlıyor)
- ✅ Channel Name: `course_e7006027-99e2-4a74-94c2-0abb4b3e346f_1767857650341` (doğru format)
- ✅ UID: `309007` (numeric, doğru)
- ✅ Role: `1` (PUBLISHER, doğru)
- ✅ Expiration Time: `1767944053` (doğru hesaplanmış)

## ❌ Olası Sorunlar

### 1. App Certificate Yanlış Olabilir

**En Olası Sorun:** Supabase secret'ındaki `AGORA_APP_CERTIFICATE` değeri yanlış veya eksik olabilir.

**Kontrol:**
1. Agora Console > Project Management > Keys
2. **App Certificate** değerini kopyalayın (tam olarak, hiçbir karakter eksik olmadan)
3. Supabase Dashboard > Settings > Edge Functions > Secrets
4. `AGORA_APP_CERTIFICATE` değerini kontrol edin
5. Değer tam olarak aynı mı?

### 2. Token Generation Başarısız Olabilir

**Kontrol:**
- Supabase Logs'ta "Token generated successfully" mesajını arayın
- "Token generation error" mesajı var mı kontrol edin
- Token length 0 veya null mu?

### 3. App ID Uyumsuzluğu

**Kontrol:**
- Frontend `.env` dosyasındaki `VITE_AGORA_APP_ID`
- Supabase secret'ındaki `AGORA_APP_ID`
- İkisi de **tam olarak aynı** olmalı!

## 🔧 Çözüm Adımları

### Adım 1: App Certificate'ı Yeniden Ekleyin

```powershell
# Mevcut certificate'ı sil
npx supabase secrets unset AGORA_APP_CERTIFICATE

# Doğru certificate'ı ekleyin (Agora Console'dan kopyalayın)
npx supabase secrets set AGORA_APP_CERTIFICATE=YOUR_CERTIFICATE_HERE
```

**ÖNEMLİ:** Certificate'ı kopyalarken:
- Başında/sonunda boşluk olmamalı
- Tüm karakterler dahil olmalı
- Satır sonları (newline) olmamalı

### Adım 2: Edge Function'ı Yeniden Deploy Edin

```powershell
npx supabase functions deploy agora-token
```

### Adım 3: Test Edin ve Logları Kontrol Edin

1. Production'da test edin
2. Supabase Dashboard > Edge Functions > `agora-token` > Logs
3. Şu mesajları arayın:
   - "Token generation result:"
   - "Token generated successfully"
   - Veya hata mesajları

## 🧪 Manuel Test

Agora Console'da token'ı manuel test edebilirsiniz:
1. Agora Console > Tools > Token Generator
2. App ID, App Certificate, Channel Name, UID, Role girin
3. Token üretin
4. Bu token çalışıyor mu?

Eğer manuel token çalışıyorsa, Edge Function'da bir sorun var.
Eğer manuel token çalışmıyorsa, App ID/Certificate yanlış.

---

**Son güncelleme ile daha detaylı loglar göreceksiniz. Test edin!** 🔍

