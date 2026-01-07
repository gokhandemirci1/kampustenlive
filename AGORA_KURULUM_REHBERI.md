# Agora Canlı Yayın Sistemi Kurulum Rehberi

## 📋 Adım 1: Agora Hesabı Açma

### 1.1. Agora.io'ya Kayıt Olun
1. Tarayıcınızda https://console.agora.io/ adresine gidin
2. **"Sign Up"** butonuna tıklayın
3. E-posta adresiniz, şifreniz ve şirket bilgilerinizi girin
4. E-posta doğrulamasını yapın

### 1.2. Proje Oluşturma
1. Agora Console'a giriş yaptıktan sonra **"Create Project"** butonuna tıklayın
2. Proje adını girin (örn: "Kampusten Live Classes")
3. **Use case** olarak **"Audio/Video Call"** veya **"Education"** seçin
4. **Authentication Mode** seçiminde **"APP ID + Token"** seçin ✅ (ÖNEMLİ!)
   - Bu mod güvenlik için gereklidir
   - Production'da kullanılması önerilir
   - Token server kurduğumuz için bu modu kullanacağız
5. **Create** butonuna tıklayın

### 1.3. API Bilgilerini Alma
1. Oluşturduğunuz projeye tıklayın
2. **Project Management** > **Keys** bölümüne gidin
3. Şu bilgileri kopyalayın ve saklayın:
   - **App ID** (Örnek: `1234567890abcdef1234567890abcdef`)
   - **App Certificate** (Güvenlik için önemli! Bu bilgiyi gizli tutun)

> ⚠️ **ÖNEMLİ**: App Certificate'ı **ASLA** frontend kodunda kullanmayın! Sadece backend'de token oluştururken kullanılacak.

## 📋 Adım 2: Environment Değişkenlerini Ekleme

Projenizde `.env` dosyanıza şu değişkenleri ekleyin:

```env
# Agora Configuration
VITE_AGORA_APP_ID=your_app_id_here
# App Certificate sadece backend'de kullanılacak (Edge Function'da)
AGORA_APP_CERTIFICATE=your_app_certificate_here
```

## 📋 Adım 3: Agora Pricing ve Limitler

### Free Tier (Trial)
- İlk 10,000 dakika ücretsiz
- Sonrasında ücretlendirme yapılır

### Pricing (2024)
- Video Call: ~$0.99/1000 dakika
- Audio Call: ~$0.49/1000 dakika
- Ayrıntılar: https://www.agora.io/pricing/

### Ölçeklenebilirlik
- Aynı anda **1000+ kişi** bir kanala katılabilir
- Otomatik ölçeklenme desteği
- Global CDN ile düşük gecikme

## 📋 Adım 4: Güvenlik Notları

1. **Authentication Mode**: ✅ **APP ID + Token** modunu seçtiğiniz için doğru yoldasınız!
   - Bu mod her kullanıcı için token gerektirir (güvenlik için önemli)
   - Sistemimizde token server kurulu, bu modla uyumlu
   - Production'da kullanılması zorunludur

2. **App Certificate**: Mutlaka backend'de saklanmalı (Supabase Edge Function veya secret)
3. **Token Server**: Her kullanıcı için token oluşturulmalı (RTC Token)
4. **Channel Name**: Her canlı ders için unique bir channel name kullanın (örn: course_id + timestamp)
5. **UID**: Her kullanıcı için unique bir UID (user ID) kullanın

## 📋 Adım 5: Sonraki Adımlar

Bu bilgileri aldıktan sonra:
1. `.env` dosyanıza bilgileri ekleyin
2. Backend token server'ı kurulumunu yapacağız
3. Frontend entegrasyonunu tamamlayacağız

---

**Not**: App ID ve App Certificate'ı aldıktan sonra bana bildirin, entegrasyona başlayalım! 🚀

