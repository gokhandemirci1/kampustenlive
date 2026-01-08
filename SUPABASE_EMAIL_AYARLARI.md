# Supabase Email Ayarları - Şifre Sıfırlama

Bu dokümantasyon, Supabase'de şifre sıfırlama e-postalarının **Namecheap Private Email** üzerinden gönderilmesi için gerekli ayarları açıklar.

## 📧 Email Provider Ayarları

### 1. Supabase Dashboard'a Giriş

1. [Supabase Dashboard](https://app.supabase.com) adresine gidin
2. Projenizi seçin
3. Sol menüden **Settings** > **Auth** bölümüne gidin

### 2. SMTP Ayarları (Namecheap Private Email)

**Settings > Auth > SMTP Settings** bölümüne gidin ve aşağıdaki ayarları yapın:

#### SMTP Host
```
mail.privateemail.com
```
*(Namecheap Private Email için standart SMTP host)*

**Alternatif (eğer yukarıdaki çalışmazsa):**
```
smtp.privateemail.com
```

#### SMTP Port
```
587
```
*(TLS için - Önerilen)*

**Alternatif (SSL için):**
```
465
```

#### SMTP User
```
noreply@yourdomain.com
```
*(Namecheap'ten aldığınız tam mailbox e-posta adresinizi buraya yazın)*

**Örnek:**
- Eğer domain'iniz `kampusten.org` ise: `noreply@kampusten.org`
- Eğer domain'iniz `example.com` ise: `noreply@example.com`

#### SMTP Password
```
[Namecheap Private Email mailbox şifreniz]
```
*(Namecheap Private Email panelinden oluşturduğunuz mailbox şifresi)*

#### Sender Email
```
noreply@yourdomain.com
```
*(SMTP User ile aynı olmalı - tam mailbox e-posta adresiniz)*

#### Sender Name
```
KAMPÜSTEN
```

### 3. Email Templates Ayarları

**Settings > Auth > Email Templates** bölümüne gidin:

#### Password Reset Template

**Subject:**
```
KAMPÜSTEN - Şifre Sıfırlama
```

**Body (HTML):**
```html
<h2>Şifre Sıfırlama</h2>
<p>Merhaba,</p>
<p>Şifrenizi sıfırlamak için aşağıdaki linke tıklayın:</p>
<p><a href="{{ .ConfirmationURL }}">Şifremi Sıfırla</a></p>
<p>Bu link 1 saat süreyle geçerlidir.</p>
<p>Eğer bu isteği siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
<p>Saygılarımızla,<br>KAMPÜSTEN Ekibi</p>
```

### 4. Redirect URL Ayarları (ÖNEMLİ!)

**Settings > Auth > URL Configuration** bölümüne gidin:

#### Site URL
```
https://kampustenlive.vercel.app
```
*(Vercel deployment URL'inizi buraya yazın - ÖNEMLİ: Bu ayar yanlışsa link anasayfaya gider!)*

#### Redirect URLs
Aşağıdaki URL'leri **mutlaka** ekleyin (her birini ayrı ayrı):
```
https://kampustenlive.vercel.app/reset-password/student
https://kampustenlive.vercel.app/reset-password/teacher
http://localhost:5173/reset-password/student
http://localhost:5173/reset-password/teacher
```

**ÖNEMLİ NOTLAR:**
- Site URL **mutlaka** production domain'iniz olmalı
- Redirect URLs'e **hem production hem development** URL'lerini ekleyin
- Her URL'i **ayrı satır** olarak ekleyin
- URL'lerde **trailing slash (/) olmamalı**
- `http://` ve `https://` protokollerini doğru kullanın

### 5. Namecheap Private Email Mailbox Ayarları

1. [Namecheap Private Email](https://privateemail.com) hesabınıza giriş yapın
   - Namecheap hesabınızla giriş yapın
   - Private Email bölümüne gidin
2. Mailbox oluşturun (eğer yoksa):
   - `noreply@yourdomain.com` adında bir mailbox oluşturun
   - Güçlü bir şifre belirleyin
3. SMTP ayarlarını kontrol edin:
   - SMTP ayarları otomatik olarak aktif olmalı
   - Port 587 (TLS) veya 465 (SSL) kullanılabilir
4. Mailbox şifresini not edin:
   - Bu şifreyi Supabase SMTP ayarlarına gireceksiniz

## ✅ Test Etme

### 1. Test Email Gönderme

1. Uygulamanızda `/forgot-password/student` veya `/forgot-password/teacher` sayfasına gidin
2. Geçerli bir e-posta adresi girin
3. "Şifre Sıfırlama Linki Gönder" butonuna tıklayın
4. E-posta kutunuzu kontrol edin

### 2. E-posta Gelmeme Durumunda

- **Spam klasörünü kontrol edin**
- **PrivateEmail.com mailbox ayarlarını kontrol edin**
- **Supabase Dashboard > Logs** bölümünden hata loglarını kontrol edin
- **SMTP ayarlarının doğru olduğundan emin olun**

## 🔒 Güvenlik Notları

1. **Mailbox şifresini güvenli tutun** - Bu şifre Supabase dashboard'da saklanır
2. **SMTP ayarlarını production'da mutlaka yapılandırın** - Varsayılan Supabase email servisi sınırlıdır
3. **Redirect URL'lerini doğru ayarlayın** - Güvenlik için sadece kendi domain'inizi ekleyin

## 📝 Önemli Notlar

- **Namecheap Private Email** için mailbox adresinizi (`noreply@yourdomain.com`) Supabase SMTP ayarlarına ekleyin
- E-posta gönderimi için SMTP port **587 (TLS)** önerilir, alternatif olarak **465 (SSL)** kullanılabilir
- SMTP Host olarak `mail.privateemail.com` kullanın (eğer çalışmazsa `smtp.privateemail.com` deneyin)
- E-postalar oluşturduğunuz mailbox adresinden (`noreply@yourdomain.com`) gönderilecektir
- Şifre sıfırlama linkleri 1 saat süreyle geçerlidir
- **SMTP User** ve **Sender Email** aynı olmalıdır (tam e-posta adresi)

## 🆘 Sorun Giderme

### E-posta gelmiyor
1. Supabase Dashboard > Logs bölümünü kontrol edin
2. SMTP ayarlarının doğru olduğundan emin olun:
   - SMTP Host: `mail.privateemail.com`
   - SMTP Port: `587` veya `465`
   - SMTP User: Tam e-posta adresi (örn: `noreply@yourdomain.com`)
   - SMTP Password: Mailbox şifresi
3. Namecheap Private Email panelinde mailbox'ınızın aktif olduğundan emin olun
4. Spam klasörünü kontrol edin
5. Namecheap Private Email'de mailbox limitlerini kontrol edin

### SMTP bağlantı hatası
1. SMTP port'unun **587** (TLS) veya **465** (SSL) olduğundan emin olun
2. SMTP host'unun `mail.privateemail.com` olduğundan emin olun (alternatif: `smtp.privateemail.com`)
3. Mailbox şifresinin doğru olduğundan emin olun
4. **SMTP User** alanına tam e-posta adresini yazdığınızdan emin olun (örn: `noreply@yourdomain.com`)
5. Namecheap Private Email panelinde mailbox'ın aktif olduğundan emin olun

### 500 Server Error (E-posta gönderilemiyor)

Bu hata genellikle Supabase SMTP ayarlarının yapılmadığını veya yanlış yapılandırıldığını gösterir.

**Kontrol Listesi:**

1. **Supabase Dashboard > Settings > Auth > SMTP Settings** bölümüne gidin
   - SMTP ayarlarının **aktif** olduğundan emin olun
   - Tüm alanların doldurulduğundan emin olun

2. **SMTP Ayarlarını Kontrol Edin:**
   ```
   ✅ SMTP Host: mail.privateemail.com
   ✅ SMTP Port: 587 (veya 465)
   ✅ SMTP User: noreply@yourdomain.com (TAM E-POSTA ADRESİ)
   ✅ SMTP Password: [Mailbox şifreniz]
   ✅ Sender Email: noreply@yourdomain.com (SMTP User ile aynı)
   ✅ Sender Name: KAMPÜSTEN
   ```

3. **Supabase Dashboard > Logs** bölümünü kontrol edin
   - Son hataları görüntüleyin
   - SMTP bağlantı hatalarını kontrol edin

4. **Test SMTP Bağlantısı:**
   - Supabase Dashboard'da "Test SMTP Connection" butonunu kullanın
   - Bağlantı başarısız olursa, ayarları tekrar kontrol edin

5. **Namecheap Private Email Kontrolleri:**
   - Mailbox'ın aktif olduğundan emin olun
   - Mailbox şifresinin doğru olduğundan emin olun
   - SMTP erişiminin açık olduğundan emin olun

6. **Alternatif Çözümler:**
   - SMTP Port'u 587'den 465'e değiştirmeyi deneyin (veya tam tersi)
   - SMTP Host'u `mail.privateemail.com` yerine `smtp.privateemail.com` deneyin
   - Mailbox şifresini sıfırlayıp yeni şifreyi Supabase'e girin

### Redirect URL hatası
1. Settings > Auth > URL Configuration'da redirect URL'lerin doğru olduğundan emin olun
2. Production ve development URL'lerini eklediğinizden emin olun
3. Redirect URL'lerde `http://` ve `https://` protokollerinin doğru olduğundan emin olun

