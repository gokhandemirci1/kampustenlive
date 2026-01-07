-- ============================================
-- ADMIN KULLANICISI OLUŞTURMA (Şifre ile)
-- ============================================
-- ÖNEMLİ: Bu SQL Supabase'de çalışmayabilir!
-- En iyi yöntem: Supabase Dashboard > Authentication > Users'dan oluşturun
-- Sonra aşağıdaki profile SQL'ini çalıştırın

-- ============================================
-- ADIM 1: Dashboard'dan Kullanıcı Oluşturun
-- ============================================
-- 1. Supabase Dashboard > Authentication > Users
-- 2. "Add user" butonuna tıklayın
-- 3. Email: admin@kampus.org
-- 4. Password: Kampusten2024!Admin
-- 5. "Auto Confirm User" seçeneğini işaretleyin
-- 6. "Create user" butonuna tıklayın

-- ============================================
-- ADIM 2: Profile'ı Admin Yapın (Aşağıdaki SQL'i çalıştırın)
-- ============================================

-- Admin profile'ı oluştur veya güncelle
INSERT INTO public.profiles (id, role, full_name)
SELECT 
    id,
    'admin'::user_role,
    'Yönetici'
FROM auth.users
WHERE email = 'admin@kampus.org'
ON CONFLICT (id) DO UPDATE SET
    role = 'admin'::user_role,
    full_name = COALESCE(profiles.full_name, 'Yönetici');

-- Sonuç kontrolü
SELECT 
    u.email,
    u.email_confirmed_at,
    p.role,
    p.full_name
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'admin@kampus.org';

-- ============================================
-- GİRİŞ BİLGİLERİ
-- ============================================
-- Email: admin@kampus.org
-- Şifre: Kampusten2024!Admin
-- 
-- NOT: İlk girişten sonra şifrenizi değiştirmeniz önerilir!
-- ============================================

