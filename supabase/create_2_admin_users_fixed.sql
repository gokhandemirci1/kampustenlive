-- ============================================
-- 2 ADMIN KULLANICISI OLUŞTURMA (DÜZELTİLMİŞ)
-- ============================================
-- Bu script 2 admin kullanıcısı oluşturur
-- 1. gokhan@kampusten.org / Salaksacma1
-- 2. emre@kampusten.org / Salaksacma1

-- ÖNEMLİ: Supabase auth.users tablosuna direkt INSERT yapmak 
-- genellikle çalışmaz çünkü Supabase kendi auth sistemini kullanır.
-- EN İYİ YÖNTEM: Supabase Dashboard'dan manuel oluşturmak veya Admin API kullanmak

-- ============================================
-- YÖNTEM 1: MANUEL OLUŞTURMA (ÖNERİLEN)
-- ============================================
-- 1. Supabase Dashboard > Authentication > Users
-- 2. "Add User" butonuna tıklayın
-- 3. Email: gokhan@kampusten.org, Password: Salaksacma1
-- 4. Email: emre@kampusten.org, Password: Salaksacma1
-- 5. Sonra aşağıdaki script'i çalıştırarak profiles'ı güncelleyin

-- ============================================
-- YÖNTEM 2: SQL İLE PROFİL GÜNCELLEME
-- ============================================
-- Eğer kullanıcıları Dashboard'dan oluşturduysanız
-- Bu script sadece profiles tablosunu günceller

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
  au.created_at AS "Oluşturulma Tarihi",
  au.email_confirmed_at IS NOT NULL AS "Email Onaylı"
FROM profiles p
INNER JOIN auth.users au ON p.id = au.id
WHERE p.role = 'admin'
AND (au.email = 'gokhan@kampusten.org' OR au.email = 'emre@kampusten.org')
ORDER BY au.email;

-- ============================================
-- YÖNTEM 3: SUPABASE ADMIN API (ALTERNATİF)
-- ============================================
-- Frontend'den veya backend'den Supabase Admin API kullanarak:
-- 
-- const { data, error } = await supabase.auth.admin.createUser({
--   email: 'gokhan@kampusten.org',
--   password: 'Salaksacma1',
--   email_confirm: true,
--   user_metadata: { full_name: 'Gokhan' }
-- })

-- ============================================
-- YÖNTEM 4: DIRECT SQL (DENE)
-- ============================================
-- Bu yöntem çalışmayabilir ama deneyebilirsiniz

DO $$
DECLARE
  v_user1_id UUID;
  v_user2_id UUID;
  v_instance_id UUID;
  v_encrypted_password TEXT;
BEGIN
  -- Instance ID'yi al
  SELECT id INTO v_instance_id FROM auth.instances LIMIT 1;
  
  IF v_instance_id IS NULL THEN
    -- Default instance ID (Supabase'den alın)
    v_instance_id := (SELECT id FROM auth.instances LIMIT 1);
  END IF;
  
  -- Password hash'le (Supabase formatında)
  -- NOT: Bu format her zaman çalışmayabilir
  v_encrypted_password := crypt('Salaksacma1', gen_salt('bf', 10));
  
  -- 1. Admin: gokhan@kampusten.org
  SELECT id INTO v_user1_id FROM auth.users WHERE email = 'gokhan@kampusten.org';
  
  IF v_user1_id IS NULL THEN
    v_user1_id := gen_random_uuid();
    
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
      'gokhan@kampusten.org',
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
  END IF;
  
  -- 2. Admin: emre@kampusten.org
  SELECT id INTO v_user2_id FROM auth.users WHERE email = 'emre@kampusten.org';
  
  IF v_user2_id IS NULL THEN
    v_user2_id := gen_random_uuid();
    
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
      'emre@kampusten.org',
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
  END IF;
  
  -- Profiles oluştur
  INSERT INTO profiles (id, role, full_name, created_at, updated_at)
  VALUES 
    (v_user1_id, 'admin', 'Gokhan', NOW(), NOW()),
    (v_user2_id, 'admin', 'Emre', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    updated_at = NOW();
    
  RAISE NOTICE 'Admin kullanıcıları oluşturuldu (veya güncellendi)';
END;
$$;
