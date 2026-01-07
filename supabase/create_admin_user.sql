-- ============================================
-- ADMIN KULLANICISI OLUŞTURMA
-- ============================================
-- Bu dosyayı Supabase SQL Editor'de çalıştırın
-- Admin kullanıcısı oluşturur: admin@kampus.org

-- NOT: Bu SQL sadece admin kullanıcısını oluşturur
-- Şifre: Supabase Dashboard > Authentication > Users bölümünden ayarlanmalı
-- VEYA aşağıdaki adımları takip edin:

-- ============================================
-- YÖNTEM 1: Supabase Dashboard'dan (ÖNERİLEN)
-- ============================================
-- 1. Supabase Dashboard > Authentication > Users
-- 2. "Add user" butonuna tıklayın
-- 3. Email: admin@kampus.org
-- 4. Password: istediğiniz şifreyi girin
-- 5. "Auto Confirm User" seçeneğini işaretleyin
-- 6. User oluşturulduktan sonra, aşağıdaki SQL'i çalıştırın:

-- ============================================
-- YÖNTEM 2: SQL ile (User oluşturulduktan sonra)
-- ============================================
-- Aşağıdaki SQL'i çalıştırın (user ID'yi değiştirin):

-- Admin profile'ı oluştur (eğer yoksa)
-- User ID'yi Supabase Dashboard > Authentication > Users'dan alın
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

-- ============================================
-- ŞİFRE AYARLAMA (Supabase Dashboard'dan)
-- ============================================
-- 1. Authentication > Users > admin@kampus.org kullanıcısını bulun
-- 2. "..." menüsünden "Reset Password" seçin
-- 3. Yeni şifreyi ayarlayın
-- 4. VEYA "Send magic link" ile şifre belirleyin

-- ============================================
-- HIZLI TEST İÇİN
-- ============================================
-- Eğer test için hızlı bir şifre istiyorsanız:
-- 1. Dashboard > Authentication > Users > Add user
-- 2. Email: admin@kampus.org
-- 3. Password: Admin123! (veya istediğiniz şifre)
-- 4. Auto Confirm: ✓
-- 5. Yukarıdaki INSERT SQL'ini çalıştırın

