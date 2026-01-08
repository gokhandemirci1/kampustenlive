# 🔧 Agora Token "Invalid Token" Hatası - Çözüm

## ❌ Sorun
```
AgoraRTCError CAN_NOT_GET_GATEWAY_SERVER: invalid token, authorized failed
```

## ✅ Yapılan Düzeltmeler

### 1. UID Numeric Conversion
- ✅ UID artık numeric olarak token'a gönderiliyor
- ✅ Frontend'de UUID'den numeric hash üretiliyor
- ✅ Token generation'da numeric UID kullanılıyor

### 2. Token Response Format
- ✅ Token response artık `{ token, appId }` formatında
- ✅ Join işleminde server'dan dönen App ID kullanılıyor

### 3. Logging Eklendi
- ✅ Edge Function'da detaylı logging
- ✅ Frontend'de join parametreleri loglanıyor

## 🔍 Kontrol Adımları

### 1. Supabase Edge Function Logları
Supabase Dashboard > Edge Functions > `agora-token` > Logs:
- "Generating token with:" logunu kontrol edin
- App ID, UID, role değerlerini kontrol edin
- Token başarıyla üretildi mi?

### 2. Browser Console
- "Joining channel with:" logunu kontrol edin
- App ID, channel name, UID değerlerini kontrol edin
- Token length'ı kontrol edin

### 3. Agora Dashboard
- Agora Console'da App ID'nin doğru olduğundan emin olun
- App Certificate'ın doğru olduğundan emin olun

## 🔄 Olası Sorunlar ve Çözümleri

### Sorun 1: App ID/Certificate Yanlış
**Çözüm:** Supabase secrets'ları kontrol edin:
```powershell
npx supabase secrets list
```

### Sorun 2: UID Format Sorunu
**Çözüm:** UID artık numeric - kod güncellendi ✅

### Sorun 3: Token Expiration
**Çözüm:** Token 24 saat geçerli - yeterli olmalı

### Sorun 4: Channel Name Format
**Çözüm:** Channel name format: `course_{courseId}_{timestamp}`

## 🧪 Test

1. Production'da test edin
2. Browser console'u açın
3. "Dersi Başlat" butonuna tıklayın
4. Console loglarını kontrol edin
5. Edge Function loglarını kontrol edin

---

**Son güncelleme ile sorun çözülmüş olmalı!** 🚀

