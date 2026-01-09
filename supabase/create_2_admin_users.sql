-- ============================================
-- 2 ADMIN KULLANICISI OLUŞTURMA
-- ============================================
-- Bu script 2 admin kullanıcısı oluşturur
-- 1. gokhan@kampus.org / Salaksacma1
-- 2. emre@kampus.org / Salaksacma1

-- ÖNEMLİ: Bu script auth.users tablosuna direkt erişim gerektirir
-- Supabase Dashboard > SQL Editor'de service_role ile çalıştırın

-- UUID extension'ını kontrol et
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- HELPER FUNCTION: Admin kullanıcısı oluştur
-- ============================================
CREATE OR REPLACE FUNCTION create_admin_user(
  p_email TEXT,
  p_full_name TEXT,
  p_password TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_encrypted_password TEXT;
  v_instance_id UUID;
BEGIN
  -- Instance ID'yi al
  SELECT id INTO v_instance_id FROM auth.instances LIMIT 1;
  
  -- Eğer instance yoksa default kullan
  IF v_instance_id IS NULL THEN
    v_instance_id := '00000000-0000-0000-0000-000000000000';
  END IF;
  
  -- UUID oluştur
  v_user_id := uuid_generate_v4();
  
  -- Password hash'le (bcrypt)
  v_encrypted_password := crypt(p_password, gen_salt('bf'));
  
  -- Önce kullanıcı var mı kontrol et
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
  
  -- Eğer kullanıcı yoksa yeni oluştur
  IF v_user_id IS NULL THEN
    v_user_id := uuid_generate_v4();
    
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
      v_instance_id,
      p_email,
      v_encrypted_password,
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', p_full_name),
      NOW(),
      NOW(),
      '',
      '',
      '',
      '',
      false,
      'authenticated'
    );
  ELSE
    -- Kullanıcı varsa güncelle
    UPDATE auth.users
    SET
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', p_full_name),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;
  
  -- profiles tablosuna admin profil ekle
  INSERT INTO profiles (
    id,
    role,
    full_name,
    created_at,
    updated_at
  )
  VALUES (
    v_user_id,
    'admin',
    p_full_name,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    full_name = p_full_name,
    updated_at = NOW();
  
  RETURN v_user_id;
END;
$$;

-- ============================================
-- 2 ADMIN KULLANICISI OLUŞTUR
-- ============================================
DO $$
DECLARE
  v_user1_id UUID;
  v_user2_id UUID;
BEGIN
  -- 1. Admin: gokhan@kampus.org
  BEGIN
    v_user1_id := create_admin_user(
      'gokhan@kampus.org',
      'Gokhan',
      'Salaksacma1'
    );
    RAISE NOTICE 'Admin kullanıcısı oluşturuldu: gokhan@kampus.org (ID: %)', v_user1_id;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Hata (gokhan@kampus.org): % - %', SQLERRM, SQLSTATE;
  END;
  
  -- 2. Admin: emre@kampus.org
  BEGIN
    v_user2_id := create_admin_user(
      'emre@kampus.org',
      'Emre',
      'Salaksacma1'
    );
    RAISE NOTICE 'Admin kullanıcısı oluşturuldu: emre@kampus.org (ID: %)', v_user2_id;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Hata (emre@kampus.org): % - %', SQLERRM, SQLSTATE;
  END;
  
  RAISE NOTICE 'Toplam 2 admin kullanıcısı oluşturma işlemi tamamlandı';
END;
$$;

-- ============================================
-- ALTERNATİF YÖNTEM: Direkt INSERT
-- ============================================
-- Eğer yukarıdaki function çalışmazsa bu yöntemi deneyin

DO $$
DECLARE
  v_user1_id UUID;
  v_user2_id UUID;
  v_instance_id UUID;
  v_encrypted_password TEXT;
BEGIN
  -- Instance ID'yi al
  SELECT id INTO v_instance_id FROM auth.instances LIMIT 1;
  
  -- Eğer instance yoksa default kullan
  IF v_instance_id IS NULL THEN
    v_instance_id := '00000000-0000-0000-0000-000000000000';
  END IF;
  
  -- Password hash'le
  v_encrypted_password := crypt('Salaksacma1', gen_salt('bf'));
  
  -- 1. Admin: gokhan@kampus.org
  -- Önce var mı kontrol et
  SELECT id INTO v_user1_id FROM auth.users WHERE email = 'gokhan@kampus.org';
  
  IF v_user1_id IS NULL THEN
    v_user1_id := uuid_generate_v4();
    
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
      v_user1_id,
      v_instance_id,
      'gokhan@kampus.org',
      v_encrypted_password,
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Gokhan'),
      NOW(),
      NOW(),
      '',
      '',
      '',
      '',
      false,
      'authenticated'
    );
  ELSE
    -- Kullanıcı varsa şifreyi güncelle
    UPDATE auth.users
    SET
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Gokhan'),
      updated_at = NOW()
    WHERE id = v_user1_id;
  END IF;
  
  -- Profile ekle
  INSERT INTO profiles (id, role, full_name, created_at, updated_at)
  VALUES (v_user1_id, 'admin', 'Gokhan', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    full_name = 'Gokhan',
    updated_at = NOW();
  
  -- 2. Admin: emre@kampus.org
  -- Önce var mı kontrol et
  SELECT id INTO v_user2_id FROM auth.users WHERE email = 'emre@kampus.org';
  
  IF v_user2_id IS NULL THEN
    v_user2_id := uuid_generate_v4();
    
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
      v_user2_id,
      v_instance_id,
      'emre@kampus.org',
      v_encrypted_password,
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Emre'),
      NOW(),
      NOW(),
      '',
      '',
      '',
      '',
      false,
      'authenticated'
    );
  ELSE
    -- Kullanıcı varsa şifreyi güncelle
    UPDATE auth.users
    SET
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Emre'),
      updated_at = NOW()
    WHERE id = v_user2_id;
  END IF;
  
  -- Profile ekle
  INSERT INTO profiles (id, role, full_name, created_at, updated_at)
  VALUES (v_user2_id, 'admin', 'Emre', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    full_name = 'Emre',
    updated_at = NOW();
  
  RAISE NOTICE 'Admin kullanıcıları oluşturuldu: gokhan@kampus.org (%), emre@kampus.org (%)', v_user1_id, v_user2_id;
END;
$$;

-- ============================================
-- SONUÇLARI KONTROL ET
-- ============================================
SELECT 
  p.full_name AS "İsim",
  au.email AS "Email",
  p.role AS "Rol",
  au.created_at AS "Oluşturulma Tarihi"
FROM profiles p
INNER JOIN auth.users au ON p.id = au.id
WHERE p.role = 'admin'
AND (au.email = 'gokhan@kampus.org' OR au.email = 'emre@kampus.org')
ORDER BY au.email;

-- ============================================
-- HELPER FUNCTION'ı temizle (isteğe bağlı)
-- ============================================
-- DROP FUNCTION IF EXISTS create_admin_user(TEXT, TEXT, TEXT);
