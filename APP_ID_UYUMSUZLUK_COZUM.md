# 🔧 App ID Uyumsuzluğu - Çözüm

## ❌ SORUN TESPİT EDİLDİ!

**App ID uyumsuzluğu var:**
- Supabase Secret: `e48ffde718b00b3859f807adc51f652398f1a9f115a2495a448912ef20cba3c6`
- Frontend .env: Muhtemelen farklı (log'larda `412be2c4...` görünüyor)

Bu yüzden token bir App ID ile üretiliyor, join başka bir App ID ile yapılıyor → **"invalid token" hatası!**

## ✅ ÇÖZÜM

### 1. Agora Console'dan Doğru App ID'yi Bulun

1. Agora Console: https://console.agora.io/
2. Project Management > Keys
3. **App ID** değerini kopyalayın

### 2. İkisini de Aynı Yapın

**Seçenek A: Supabase Secret'ını .env ile eşleştirin (Önerilen)**

`.env` dosyanızdaki App ID'yi Supabase secret'ına kopyalayın:

```powershell
# .env'deki değeri kullanarak Supabase secret'ını güncelleyin
npx supabase secrets set AGORA_APP_ID=412be2c4f8214423aa63cf9d94e753b6
```

**Seçenek B: .env'i Supabase Secret ile Eşleştirin**

Supabase secret'ındaki App ID'yi `.env` dosyanıza kopyalayın:

```env
VITE_AGORA_APP_ID=e48ffde718b00b3859f807adc51f652398f1a9f115a2495a448912ef20cba3c6
```

### 3. Hangisi Doğru?

**Agora Console'dan kontrol edin:**
- Hangi App ID gerçekten aktif?
- O App ID'yi **her iki yerde de** kullanın!

### 4. Edge Function'ı Yeniden Deploy Edin (Secret değiştirdiyseniz)

```powershell
npx supabase functions deploy agora-token
```

### 5. Frontend'i Yeniden Başlatın (.env değiştirdiyseniz)

```powershell
# Development için
npm run dev

# Production için rebuild
npm run build
```

## 🎯 Hızlı Çözüm

En hızlı yol:

1. **Agora Console'dan App ID'yi kopyalayın**
2. **Hem `.env` hem de Supabase secret'ına aynı değeri yapıştırın:**

```powershell
# Supabase secret güncelle
npx supabase secrets set AGORA_APP_ID=YOUR_APP_ID_FROM_AGORA_CONSOLE

# .env dosyasını manuel olarak güncelleyin
VITE_AGORA_APP_ID=YOUR_APP_ID_FROM_AGORA_CONSOLE
```

3. **Edge Function'ı redeploy edin**
4. **Frontend'i yeniden başlatın**
5. **Test edin!**

---

**Bu uyumsuzluğu çözdükten sonra sorun çözülecek!** ✅

