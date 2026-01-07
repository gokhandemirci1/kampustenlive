# 🔧 CORS Sorunu Çözüm Rehberi

## ⚠️ Sorun
Production'da (Vercel) CORS hatası alıyorsunuz:
```
Access to fetch at 'https://drzlusgujsfdbrnihtej.supabase.co/functions/v1/agora-token' 
from origin 'https://kampustenlive.vercel.app' has been blocked by CORS policy
```

## ✅ Yapılan Düzeltmeler

1. ✅ OPTIONS request için 200 OK dönüyor
2. ✅ CORS header'ları eklendi
3. ✅ Deploy edildi

## 🔍 Kontrol Adımları

### 1. Supabase Dashboard'dan Kontrol
1. Supabase Dashboard > **Edge Functions** > `agora-token`
2. **Logs** sekmesine gidin
3. OPTIONS request'lerini kontrol edin
4. Hata mesajlarını inceleyin

### 2. Browser Network Tab Kontrolü
1. Browser Developer Tools > **Network** tab
2. OPTIONS request'i bulun
3. **Response Headers** kontrol edin
4. CORS header'larının geldiğini doğrulayın

### 3. Alternatif Çözüm: Supabase Client Kullanımı

Eğer CORS sorunu devam ederse, Supabase client'ı kullanarak Edge Function'ı çağırabilirsiniz:

```javascript
// src/lib/agora.js dosyasında değişiklik
const { data, error } = await supabase.functions.invoke('agora-token', {
  body: {
    channelName,
    uid: uid.toString(),
    role,
  },
})
```

Bu yöntem otomatik olarak authentication header'larını ekler ve CORS sorununu çözer.

## 🔄 Hızlı Test

Production'da test edin:
1. Vercel deployment'ınızı açın
2. Browser console'u açın
3. Canlı ders başlatmayı deneyin
4. Network tab'da OPTIONS request'ini kontrol edin

---

**Sorun devam ederse, Supabase client yöntemine geçelim!** 🔄

