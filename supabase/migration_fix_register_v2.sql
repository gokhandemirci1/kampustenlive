-- ============================================
-- KAYIT HATASI DÜZELTMESİ - V2 (Basit Çözüm)
-- ============================================
-- Bu dosyayı Supabase SQL Editor'de çalıştırın
-- Trigger'ı devre dışı bırakıp, tüm işlemi frontend'den yapıyoruz

-- 1. Trigger'ı devre dışı bırak (DROP)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. RLS Policy ekle (profiles tablosuna INSERT için)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 3. student_details için INSERT policy
DROP POLICY IF EXISTS "Students can insert own details" ON student_details;
CREATE POLICY "Students can insert own details"
    ON student_details FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Not: Artık Register sayfası tüm işlemi yapacak (trigger yok)


