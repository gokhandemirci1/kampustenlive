-- ============================================
-- RANDOM 12 ÖĞRETMEN OLUŞTURMA
-- ============================================
-- Bu dosyayı Supabase SQL Editor'de çalıştırın
-- 12 adet test öğretmeni oluşturur

-- ÖNEMLİ: Bu script auth.users tablosuna direkt INSERT yapamaz
-- Önce Supabase Dashboard > Authentication > Users bölümünden
-- veya Admin API kullanarak kullanıcıları oluşturmanız gerekiyor
-- Sonra bu script'i çalıştırarak profiles ve teacher_details'ı doldurabilirsiniz

-- Alternatif: Eğer auth.users'a direkt ekleme yapmak istiyorsanız
-- extensions ve auth.uid() fonksiyonlarını kullanmanız gerekir
-- Bu örnek sadece test amaçlıdır

-- 1. Önce mevcut öğretmen varsa YKS rank'larını güncelle
-- 2. Yeni öğretmenler için: Bu script'i çalıştırdıktan sonra
--    manuel olarak Supabase Dashboard'dan kullanıcı oluşturun
--    veya aşağıdaki script'i admin yetkisiyle çalıştırın

-- ============================================
-- ALTERNATİF 1: Mevcut öğretmenlere YKS rank ekle ve onayla
-- ============================================

-- Mevcut öğretmenleri onayla ve YKS rank ekle (test için)
UPDATE teacher_details
SET 
  is_approved = true,
  yks_rank = CASE 
    WHEN id NOT IN (SELECT id FROM teacher_details WHERE yks_rank IS NOT NULL)
    THEN floor(random() * 5000 + 1)::INTEGER
    ELSE yks_rank
  END
WHERE EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = teacher_details.id AND profiles.role = 'teacher'
);

-- ============================================
-- ALTERNATİF 2: Admin fonksiyonu ile kullanıcı oluştur
-- ============================================
-- Bu kısım Supabase Admin API gerektirir
-- Dashboard'dan manuel olarak veya Admin API ile yapılmalı

-- ============================================
-- MANUEL KULLANICI OLUŞTURMA SONRASI:
-- Aşağıdaki script'i çalıştırarak test verilerini ekleyin
-- ============================================

-- Test için: Eğer extension ile auth.users'a ekleme yapmak istiyorsanız
-- Bu kısım security definer gerektirir

DO $$
DECLARE
  teacher_emails TEXT[] := ARRAY[
    'ogretmen1@test.com',
    'ogretmen2@test.com',
    'ogretmen3@test.com',
    'ogretmen4@test.com',
    'ogretmen5@test.com',
    'ogretmen6@test.com',
    'ogretmen7@test.com',
    'ogretmen8@test.com',
    'ogretmen9@test.com',
    'ogretmen10@test.com',
    'ogretmen11@test.com',
    'ogretmen12@test.com'
  ];
  
  teacher_names TEXT[] := ARRAY[
    'Ahmet Yılmaz',
    'Ayşe Demir',
    'Mehmet Kaya',
    'Fatma Şahin',
    'Ali Öztürk',
    'Zeynep Çelik',
    'Can Arslan',
    'Elif Aydın',
    'Burak Yıldız',
    'Selin Doğan',
    'Emre Koç',
    'Melisa Güneş'
  ];
  
  universities TEXT[] := ARRAY[
    'Boğaziçi Üniversitesi',
    'ODTÜ',
    'İTÜ',
    'Koç Üniversitesi',
    'Sabancı Üniversitesi',
    'Galatasaray Üniversitesi',
    'Hacettepe Üniversitesi',
    'Ankara Üniversitesi',
    'İstanbul Üniversitesi',
    'Bilkent Üniversitesi',
    'Yeditepe Üniversitesi',
    'Bahçeşehir Üniversitesi'
  ];
  
  departments TEXT[] := ARRAY[
    'Elektrik-Elektronik Mühendisliği',
    'Bilgisayar Mühendisliği',
    'Endüstri Mühendisliği',
    'Makine Mühendisliği',
    'Matematik',
    'Fizik',
    'Kimya',
    'İktisat',
    'İşletme',
    'Tıp',
    'Diş Hekimliği',
    'Hukuk'
  ];
  
  i INTEGER;
  user_id UUID;
  teacher_id UUID;
BEGIN
  -- Bu script sadece mevcut kullanıcılar için çalışır
  -- Yeni kullanıcı oluşturmak için Supabase Dashboard veya Admin API kullanın
  
  -- Mevcut öğretmenleri güncelle
  FOR i IN 1..12 LOOP
    -- Mevcut bir teacher profile'ı bul veya oluştur
    SELECT id INTO teacher_id
    FROM profiles
    WHERE role = 'teacher'
    AND (full_name = teacher_names[i] OR email LIKE '%' || teacher_emails[i] || '%')
    LIMIT 1;
    
    -- Eğer öğretmen bulunamazsa, ilk mevcut öğretmene veri atayalım
    IF teacher_id IS NULL THEN
      SELECT id INTO teacher_id
      FROM profiles
      WHERE role = 'teacher'
      AND id NOT IN (SELECT id FROM teacher_details WHERE university IS NOT NULL)
      LIMIT 1;
    END IF;
    
    -- Eğer hala bulunamazsa, sonraki döngüye geç
    IF teacher_id IS NOT NULL THEN
      -- Teacher details oluştur veya güncelle
      INSERT INTO teacher_details (
        id,
        university,
        department,
        yks_rank,
        is_approved
      )
      VALUES (
        teacher_id,
        universities[i],
        departments[i],
        floor(random() * 5000 + 1)::INTEGER,
        true
      )
      ON CONFLICT (id) DO UPDATE SET
        university = EXCLUDED.university,
        department = EXCLUDED.department,
        yks_rank = COALESCE(teacher_details.yks_rank, EXCLUDED.yks_rank),
        is_approved = true;
      
      -- Profile'ı güncelle
      UPDATE profiles
      SET full_name = teacher_names[i]
      WHERE id = teacher_id;
    END IF;
  END LOOP;
END $$;

-- Sonuçları kontrol et
SELECT 
  p.full_name,
  td.university,
  td.department,
  td.yks_rank,
  td.is_approved
FROM profiles p
LEFT JOIN teacher_details td ON p.id = td.id
WHERE p.role = 'teacher'
AND td.is_approved = true
ORDER BY td.yks_rank
LIMIT 12;
