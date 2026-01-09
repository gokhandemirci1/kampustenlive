-- ============================================
-- TAMAMEN YENİ 12 ÖĞRETMEN OLUŞTURMA
-- ============================================
-- Bu script tamamen yeni 12 öğretmen oluşturur
-- Mevcut kullanıcıları kullanmaz

-- ÖNEMLİ: auth.users tablosuna direkt INSERT yapmak için
-- security definer fonksiyonu kullanıyoruz

-- Önce gerekli extension'ları kontrol et
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- HELPER FUNCTION: Yeni öğretmen oluştur
-- ============================================
CREATE OR REPLACE FUNCTION create_new_teacher(
  p_email TEXT,
  p_full_name TEXT,
  p_university TEXT,
  p_department TEXT,
  p_yks_rank INTEGER
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_encrypted_password TEXT;
BEGIN
  -- UUID oluştur
  v_user_id := uuid_generate_v4();
  
  -- Encrypted password oluştur (default: 'test123456')
  -- NOT: Production'da gerçek password hash'leme yapılmalı
  v_encrypted_password := crypt('test123456', gen_salt('bf'));
  
  -- auth.users tablosuna kullanıcı ekle
  -- NOT: auth.users tablosuna direkt erişim için service_role key gerekir
  -- Bu script Supabase SQL Editor'de service_role ile çalışır
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
  )
  VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000', -- Default instance
    p_email,
    v_encrypted_password,
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', p_full_name),
    false,
    'authenticated'
  )
  ON CONFLICT (id) DO NOTHING;
  
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
    p_full_name,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'teacher',
    full_name = p_full_name;
  
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
    p_university,
    p_department,
    p_yks_rank,
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    university = p_university,
    department = p_department,
    yks_rank = p_yks_rank,
    is_approved = true;
  
  RETURN v_user_id;
END;
$$;

-- ============================================
-- 12 YENİ ÖĞRETMEN OLUŞTUR
-- ============================================
DO $$
DECLARE
  teacher_data RECORD;
  created_ids UUID[] := ARRAY[]::UUID[];
  i INTEGER;
  
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
BEGIN
  -- Her öğretmen için döngü
  FOR i IN 0..jsonb_array_length(teachers_data) - 1 LOOP
    teacher_data := jsonb_populate_record(
      NULL::RECORD,
      teachers_data->i
    );
    
    -- Öğretmen oluştur
    BEGIN
      PERFORM create_new_teacher(
        teacher_data.email,
        teacher_data.name,
        teacher_data.university,
        teacher_data.department,
        (teacher_data.yks)::INTEGER
      );
      
      RAISE NOTICE 'Öğretmen oluşturuldu: %', teacher_data.name;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Hata: % için %', teacher_data.email, SQLERRM;
    END;
  END LOOP;
END;
$$;

-- ============================================
-- ALTERNATİF YÖNTEM: auth.users'a direkt INSERT
-- ============================================
-- Eğer yukarıdaki yöntem çalışmazsa, bu alternatifi deneyin
-- Bu yöntem Supabase'in auth.users tablosuna direkt erişim gerektirir

-- Helper function'ı temizle (isteğe bağlı)
-- DROP FUNCTION IF EXISTS create_new_teacher(TEXT, TEXT, TEXT, TEXT, INTEGER);

-- ============================================
-- SONUÇLARI GÖSTER
-- ============================================
SELECT 
  p.full_name AS "İsim",
  au.email AS "Email",
  td.university AS "Üniversite",
  td.department AS "Bölüm",
  td.yks_rank AS "YKS Sıralaması",
  td.is_approved AS "Onaylı"
FROM profiles p
INNER JOIN teacher_details td ON p.id = td.id
INNER JOIN auth.users au ON p.id = au.id
WHERE p.role = 'teacher'
AND au.email LIKE 'ogretmen%@kampusten.org'
ORDER BY td.yks_rank
LIMIT 12;
