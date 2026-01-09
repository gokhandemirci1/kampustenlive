-- ============================================
-- TAMAMEN YENİ 12 ÖĞRETMEN OLUŞTURMA (V2)
-- ============================================
-- Bu script tamamen yeni 12 öğretmen oluşturur
-- Mevcut kullanıcıları kullanmaz
-- NOT: Bu script auth.users tablosuna direkt INSERT yapar

-- ÖNEMLİ: Bu script'i çalıştırmak için service_role key gerekebilir
-- Supabase Dashboard > Settings > API > service_role key ile çalıştırın

-- UUID extension'ını kontrol et
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 12 YENİ ÖĞRETMEN OLUŞTUR
-- ============================================
DO $$
DECLARE
  teacher_rec RECORD;
  v_user_id UUID;
  v_encrypted_password TEXT;
  v_instance_id UUID := '00000000-0000-0000-0000-000000000000';
  
  teachers_data JSONB := '[
    {"email": "ogretmen1@kampusten.org", "name": "Ahmet Yılmaz", "university": "Boğaziçi Üniversitesi", "department": "Elektrik-Elektronik Mühendisliği", "yks": 245},
    {"email": "ogretmen2@kampusten.org", "name": "Ayşe Demir", "university": "ODTÜ", "department": "Bilgisayar Mühendisliği", "yks": 189},
    {"email": "ogretmen3@kampusten.org", "name": "Mehmet Kaya", "university": "İTÜ", "department": "Endüstri Mühendisliği", "yks": 567},
    {"email": "ogretmen4@kampusten.org", "name": "Fatma Şahin", "university": "Koç Üniversitesi", "department": "Makine Mühendisliği", "yks": 412},
    {"email": "ogretmen5@kampusten.org", "name": "Ali Öztürk", "university": "Sabancı Üniversitesi", "department": "Matematik", "yks": 324},
    {"email": "ogretmen6@kampusten.org", "name": "Zeynep Çelik", "university": "Galatasaray Üniversitesi", "department": "Fizik", "yks": 678},
    {"email": "ogretmen7@kampusten.org", "name": "Can Arslan", "university": "Hacettepe Üniversitesi", "department": "Kimya", "yks": 523},
    {"email": "ogretmen8@kampusten.org", "name": "Elif Aydın", "university": "Ankara Üniversitesi", "department": "İktisat", "yks": 891},
    {"email": "ogretmen9@kampusten.org", "name": "Burak Yıldız", "university": "İstanbul Üniversitesi", "department": "İşletme", "yks": 734},
    {"email": "ogretmen10@kampusten.org", "name": "Selin Doğan", "university": "Bilkent Üniversitesi", "department": "Elektrik Elektronik Mühendisliği", "yks": 256},
    {"email": "ogretmen11@kampusten.org", "name": "Emre Koç", "university": "Yeditepe Üniversitesi", "department": "Diş Hekimliği", "yks": 445},
    {"email": "ogretmen12@kampusten.org", "name": "Melisa Güneş", "university": "Bahçeşehir Üniversitesi", "department": "Hukuk", "yks": 623}
  ]'::JSONB;
  
  i INTEGER;
  teacher_data JSONB;
BEGIN
  -- Önce mevcut ogretmen@kampusten.org email'lerini sil (isteğe bağlı)
  -- DELETE FROM auth.users WHERE email LIKE 'ogretmen%@kampusten.org';
  
  -- Her öğretmen için döngü
  FOR i IN 0..jsonb_array_length(teachers_data) - 1 LOOP
    teacher_data := teachers_data->i;
    v_user_id := uuid_generate_v4();
    
    -- Password hash'i oluştur (bcrypt ile)
    -- Default password: "Test123456!"
    -- NOT: Gerçek uygulamada daha güvenli bir yöntem kullanın
    BEGIN
      -- auth.users tablosuna kullanıcı ekle
      -- NOT: auth.users tablosuna erişim için service_role key gerekir
      -- Bu script Supabase SQL Editor'de service_role ile çalışmalı
      
      INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token,
        is_super_admin,
        role
      )
      VALUES (
        v_user_id,
        (SELECT id FROM auth.instances LIMIT 1), -- Instance ID
        teacher_data->>'email',
        crypt('Test123456!', gen_salt('bf')), -- Password hash
        NOW(), -- email_confirmed_at
        NOW(), -- recovery_sent_at
        NOW(), -- last_sign_in_at
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('full_name', teacher_data->>'name'),
        NOW(),
        NOW(),
        '', -- confirmation_token
        '', -- email_change
        '', -- email_change_token_new
        '', -- recovery_token
        false, -- is_super_admin
        'authenticated' -- role
      )
      ON CONFLICT (email) DO UPDATE SET
        email = EXCLUDED.email;
      
      -- profiles tablosuna profil ekle
      INSERT INTO profiles (
        id,
        role,
        full_name,
        created_at,
        updated_at
      )
      VALUES (
        v_user_id,
        'teacher',
        teacher_data->>'name',
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        role = 'teacher',
        full_name = teacher_data->>'name';
      
      -- teacher_details tablosuna detay ekle
      INSERT INTO teacher_details (
        id,
        university,
        department,
        yks_rank,
        is_approved,
        created_at,
        updated_at
      )
      VALUES (
        v_user_id,
        teacher_data->>'university',
        teacher_data->>'department',
        (teacher_data->>'yks')::INTEGER,
        true,
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        university = EXCLUDED.university,
        department = EXCLUDED.department,
        yks_rank = EXCLUDED.yks_rank,
        is_approved = true;
      
      RAISE NOTICE 'Öğretmen oluşturuldu: % (ID: %)', teacher_data->>'name', v_user_id;
      
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Hata: % için % - %', teacher_data->>'email', SQLERRM, SQLSTATE;
        -- Hata durumunda devam et
    END;
  END LOOP;
  
  RAISE NOTICE 'Toplam 12 öğretmen oluşturma işlemi tamamlandı';
END;
$$;

-- ============================================
-- SONUÇLARI GÖSTER
-- ============================================
SELECT 
  p.full_name AS "İsim",
  COALESCE(au.email, 'Email bulunamadı') AS "Email",
  td.university AS "Üniversite",
  td.department AS "Bölüm",
  td.yks_rank AS "YKS Sıralaması",
  td.is_approved AS "Onaylı",
  p.created_at AS "Oluşturulma Tarihi"
FROM profiles p
INNER JOIN teacher_details td ON p.id = td.id
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.role = 'teacher'
AND (au.email LIKE 'ogretmen%@kampusten.org' OR p.full_name IN (
  'Ahmet Yılmaz', 'Ayşe Demir', 'Mehmet Kaya', 'Fatma Şahin',
  'Ali Öztürk', 'Zeynep Çelik', 'Can Arslan', 'Elif Aydın',
  'Burak Yıldız', 'Selin Doğan', 'Emre Koç', 'Melisa Güneş'
))
ORDER BY td.yks_rank
LIMIT 12;
