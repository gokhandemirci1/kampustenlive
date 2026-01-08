# 🔧 Agora "Invalid Token" Hatası - Detaylı Çözüm

## ❌ Sorun
Token başarıyla üretiliyor ama join'de "invalid token, authorized failed" hatası alınıyor.

## 🔍 Olası Nedenler

### 1. App ID Uyumsuzluğu (EN OLASI)
- Frontend `.env` dosyasındaki `VITE_AGORA_APP_ID`
- Supabase secret'ındaki `AGORA_APP_ID`
- **İkisi TAM OLARAK aynı olmalı!**

### 2. App Certificate Yanlış
- Supabase secret'ındaki `AGORA_APP_CERTIFICATE`
- Agora Console'dan kopyalanan değerle **birebir aynı** olmalı

### 3. Token Format Sorunu
- Token başarıyla üretiliyor ama format yanlış olabilir
- Agora'nın beklediği format farklı olabilir

## ✅ Çözüm Adımları

### Adım 1: App ID'leri Karşılaştırın

1. **Frontend `.env` dosyası:**
   ```
   VITE_AGORA_APP_ID=412be2c4f8214423aa63cf9d94e753b6
   ```

2. **Supabase Secret:**
   ```powershell
   npx supabase secrets list
   ```
   `AGORA_APP_ID` değerini kontrol edin

3. **İkisi aynı mı?**
   - ✅ Aynıysa → Adım 2'ye geçin
   - ❌ Farklıysa → Aynı yapın!

### Adım 2: App Certificate Kontrolü

1. **Agora Console:**
   - Project Management > Keys
   - App Certificate'ı kopyalayın

2. **Supabase Secret:**
   ```powershell
   npx supabase secrets list
   ```
   `AGORA_APP_CERTIFICATE` değerini kontrol edin

3. **Birebir aynı mı?**
   - Başında/sonunda boşluk yok mu?
   - Tüm karakterler dahil mi?

### Adım 3: Console Logları Kontrol

Test ederken browser console'da şu logları görmelisiniz:

```
Token Response: {
  tokenLength: 139,
  appIdFromServer: "...",
  appIdFromEnv: "...",
  finalAppId: "...",
  uid: 309007,
  channelName: "..."
}

Join Parameters: {
  tokenType: "string",
  tokenLength: 139,
  tokenPreview: "006412be2c4f8214423a...",
  appIdFromServer: "...",
  appIdFromEnv: "...",
  finalAppId: "...",
  uid: 309007,
  uidType: "number",
  channelName: "...",
  channelNameLength: ...
}
```

**Kontrol edin:**
- `appIdFromServer` ve `appIdFromEnv` aynı mı?
- `token` string ve boş değil mi?
- `appId` string ve boş değil mi?

### Adım 4: Manuel Token Testi

Agora Console'da manuel token üretin:
1. Tools > Token Generator
2. App ID: `412be2c4f8214423aa63cf9d94e753b6`
3. App Certificate: (Supabase secret'ındaki değer)
4. Channel Name: Test için basit bir isim
5. UID: `309007`
6. Role: Publisher
7. Token üretin

**Bu token çalışıyor mu?**
- ✅ Çalışıyorsa → Edge Function'da sorun var
- ❌ Çalışmıyorsa → App ID/Certificate yanlış

## 🔄 Hızlı Test Komutları

```powershell
# Secret'ları kontrol et
npx supabase secrets list

# Secret'ı güncelle
npx supabase secrets set AGORA_APP_ID=your_app_id
npx supabase secrets set AGORA_APP_CERTIFICATE=your_certificate

# Function'ı yeniden deploy et
npx supabase functions deploy agora-token
```

---

**Test edin ve console loglarını paylaşın!** 🔍

