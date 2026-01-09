# 2 ADMIN KULLANICISI OLUŞTURMA - MANUEL YÖNTEM

## ÖNEMLİ: En Güvenli Yöntem

Supabase'de `auth.users` tablosuna direkt INSERT yapmak genellikle şifre hash formatı nedeniyle çalışmaz. 
**EN İYİ YÖNTEM: Supabase Dashboard'dan manuel oluşturmak**

---

## ADIM 1: Kullanıcıları Dashboard'dan Oluşturun

### 1. Admin: gokhan@kampusten.org

1. Supabase Dashboard'a gidin: https://supabase.com/dashboard
2. Projenizi seçin
3. **Authentication** > **Users** bölümüne gidin
4. **"Add user"** veya **"Invite user"** butonuna tıklayın
5. Aşağıdaki bilgileri girin:
   - **Email:** `gokhan@kampusten.org`
   - **Password:** `Salaksacma1`
   - **Auto Confirm User:** ✓ (işaretleyin - çok önemli!)
   - **Send invite email:** (isteğe bağlı - açık bırakabilirsiniz)
6. **"Create user"** butonuna tıklayın

### 2. Admin: emre@kampusten.org

1. Aynı adımları tekrarlayın
2. **Email:** `emre@kampusten.org`
3. **Password:** `Salaksacma1`
4. **Auto Confirm User:** ✓ (işaretleyin)
5. **"Create user"** butonuna tıklayın

---

## ADIM 2: Profilleri Admin Yapın

Kullanıcıları oluşturduktan sonra, SQL Editor'de aşağıdaki script'i çalıştırın:

```sql
-- Profiles tablosunu güncelle
UPDATE profiles
SET 
  role = 'admin',
  updated_at = NOW()
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('gokhan@kampusten.org', 'emre@kampusten.org')
);

-- Eğer profiles kaydı yoksa oluştur
INSERT INTO profiles (id, role, full_name, created_at, updated_at)
SELECT 
  au.id,
  'admin',
  CASE 
    WHEN au.email = 'gokhan@kampusten.org' THEN 'Gokhan'
    WHEN au.email = 'emre@kampusten.org' THEN 'Emre'
    ELSE 'Admin'
  END,
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email IN ('gokhan@kampusten.org', 'emre@kampusten.org')
AND NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = au.id
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  updated_at = NOW();

-- Sonuçları kontrol et
SELECT 
  p.full_name AS "İsim",
  au.email AS "Email",
  p.role AS "Rol",
  au.email_confirmed_at IS NOT NULL AS "Email Onaylı"
FROM profiles p
INNER JOIN auth.users au ON p.id = au.id
WHERE p.role = 'admin'
AND (au.email = 'gokhan@kampusten.org' OR au.email = 'emre@kampusten.org')
ORDER BY au.email;
```

---

## ADIM 3: Giriş Bilgileri

### Admin 1:
- **Email:** `gokhan@kampusten.org`
- **Password:** `Salaksacma1`

### Admin 2:
- **Email:** `emre@kampusten.org`
- **Password:** `Salaksacma1`

---

## SORUN GİDERME

### "Invalid credentials" hatası alıyorsanız:

1. **Email'i kontrol edin:** Büyük/küçük harf duyarlı değil ama yazım hatası olabilir
2. **Şifreyi kontrol edin:** Tam olarak `Salaksacma1` (büyük S, küçük a, sonunda 1)
3. **Auto Confirm kontrolü:** Dashboard'da kullanıcı oluştururken "Auto Confirm User" işaretli olmalı
4. **Email confirmation:** Eğer Auto Confirm işaretlenmediyse, email onayı gerekebilir
5. **Kullanıcıyı silip tekrar oluşturun:** Dashboard'dan silin ve yukarıdaki adımları tekrarlayın

### Şifreyi sıfırlamak için:

1. Dashboard > Authentication > Users
2. İlgili kullanıcıyı bulun
3. "..." menüsünden **"Reset Password"** seçin
4. Yeni şifreyi ayarlayın

---

## NOTLAR

- Dashboard'dan oluşturma en güvenli ve en çalışan yöntemdir
- SQL ile direkt INSERT yapmak şifre hash formatı nedeniyle çalışmayabilir
- Auto Confirm önemlidir - işaretlemediyseniz email onayı gerekir
- İlk girişten sonra şifrenizi değiştirmeniz önerilir
