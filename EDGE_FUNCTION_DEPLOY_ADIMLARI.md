# 🚀 Edge Function Deploy - Adım Adım Rehber

## ⚠️ ÖNEMLİ
Bu komutları **kendi PowerShell/CMD terminalinizde** çalıştırmanız gerekiyor (interactive login gerekiyor).

---

## 📋 Adım 1: Login Olun

PowerShell'de çalıştırın:
```powershell
npx supabase login
```

Bu komut:
- Tarayıcınızı açacak
- Supabase hesabınızla giriş yapmanızı isteyecek
- Token'ı otomatik olarak kaydedecek

---

## 📋 Adım 2: Proje Referans ID Bulun

1. https://app.supabase.com → Projenizi seçin
2. **Settings** > **General** 
3. **Reference ID** değerini kopyalayın (örn: `abcdefghijklmnop`)

---

## 📋 Adım 3: Projeyi Link Edin

```powershell
npx supabase link --project-ref YOUR_PROJECT_REF_ID
```

**Örnek:**
```powershell
npx supabase link --project-ref abcdefghijklmnop
```

✅ Proje link edildi!

---

## 📋 Adım 4: Secret'ları Ekleyin

`.env` dosyanızdan değerleri kopyalayın ve şu komutları çalıştırın:

```powershell
npx supabase secrets set AGORA_APP_ID=YOUR_APP_ID_BURAYA
npx supabase secrets set AGORA_APP_CERTIFICATE=YOUR_CERTIFICATE_BURAYA
```

**ÖNEMLİ NOTLAR:**
- Tırnak işareti kullanmayın!
- Değerleri direkt yazın
- Boşluk olmamalı

**Örnek:**
```powershell
npx supabase secrets set AGORA_APP_ID=1234567890abcdef1234567890abcdef
npx supabase secrets set AGORA_APP_CERTIFICATE=abc123def456ghi789jkl012mno345pqr678
```

✅ Secret'lar eklendi!

---

## 📋 Adım 5: Deploy Edin

```powershell
npx supabase functions deploy agora-token
```

Bu işlem:
- Edge Function'ı Supabase'e yükler
- Birkaç dakika sürebilir
- Başarılı olursa URL göreceksiniz

✅ Deploy tamamlandı!

---

## 📋 Adım 6: Kontrol Edin

Supabase Dashboard'a gidin:
1. **Edge Functions** sekmesine tıklayın
2. `agora-token` function'ını görmelisiniz
3. Function aktif ve çalışıyor olmalı ✅

---

## 🎉 Tamamlandı!

Artık Edge Function hazır! Frontend otomatik olarak kullanacak.

---

## 🧪 Test Etme

1. Frontend'i başlatın: `npm run dev`
2. Öğretmen olarak giriş yapın
3. Bir kurs seçin ve "Dersi Başlat" butonuna tıklayın
4. Canlı ders ekranı açılmalı! 🎥

---

## ❓ Yardım Gerekiyor mu?

Herhangi bir adımda sorun yaşarsanız:
1. Terminal'deki hata mesajını kontrol edin
2. Supabase Dashboard'dan proje ayarlarını kontrol edin
3. `.env` dosyasındaki değerlerin doğru olduğundan emin olun

---

**Hazırsanız terminalinizde başlayın!** 🚀

