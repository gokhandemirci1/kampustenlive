-- ============================================
-- 406 HATASI DÜZELTMESİ
-- ============================================
-- Bu dosyayı Supabase SQL Editor'de çalıştırın
-- 406 (Not Acceptable) hatasını düzeltir

-- 1. Profiles tablosu için RLS policy'lerini kontrol et ve düzelt
-- Kullanıcılar kendi profile'larını okuyabilmeli

-- Mevcut policy'leri kontrol et ve gerekirse yeniden oluştur
DROP POLICY IF EXISTS "Users can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;

-- Kullanıcılar tüm profile'ları okuyabilir (public bilgiler için)
-- auth.role() yerine auth.uid() kontrolü kullan
CREATE POLICY "Users can read all profiles"
    ON profiles FOR SELECT
    USING (
        auth.uid() IS NOT NULL OR 
        id = auth.uid()
    );

-- Alternatif: Herkes okuyabilir (daha basit)
-- CREATE POLICY "Anyone can read profiles"
--     ON profiles FOR SELECT
--     USING (true);

-- 2. Profile INSERT policy'sini güçlendir
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 3. Profile UPDATE policy'sini kontrol et
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 4. Admin her şeyi yapabilir (zaten var ama emin olmak için)
-- Bu policy zaten varsa hata vermez
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Admin full access on profiles'
    ) THEN
        CREATE POLICY "Admin full access on profiles"
            ON profiles FOR ALL
            USING (
                EXISTS (
                    SELECT 1 FROM profiles
                    WHERE id = auth.uid() AND role = 'admin'
                )
            )
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM profiles
                    WHERE id = auth.uid() AND role = 'admin'
                )
            );
    END IF;
END $$;

-- Test: Mevcut kullanıcıların profile'larını kontrol et
SELECT 
    u.id,
    u.email,
    p.role,
    p.full_name
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LIMIT 10;

