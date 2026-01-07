-- ============================================
-- KAYIT (REGISTER) HATASI DÜZELTMESİ
-- ============================================
-- Bu dosyayı Supabase SQL Editor'de çalıştırın
-- Kayıt işlemi sırasında oluşan duplicate key hatasını düzeltir

-- 1. Trigger fonksiyonunu güncelle (metadata'dan role al, ON CONFLICT ekle)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role_value user_role;
BEGIN
    -- Get role from metadata, default to 'student'
    user_role_value := COALESCE(
        (NEW.raw_user_meta_data->>'role')::user_role,
        CASE 
            WHEN NEW.email = 'admin@kampus.org' THEN 'admin'::user_role
            ELSE 'student'::user_role
        END
    );
    
    INSERT INTO public.profiles (id, role, full_name)
    VALUES (
        NEW.id,
        user_role_value,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    )
    ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role,
        full_name = EXCLUDED.full_name;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. RLS Policy ekle (profiles tablosuna INSERT için)
-- Eğer zaten varsa hata vermez (IF NOT EXISTS benzeri kontrol)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Users can insert own profile'
    ) THEN
        CREATE POLICY "Users can insert own profile"
            ON profiles FOR INSERT
            WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- 3. student_details için INSERT policy kontrolü (zaten varsa sorun çıkarmaz)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'student_details' 
        AND policyname = 'Students can insert own details'
    ) THEN
        CREATE POLICY "Students can insert own details"
            ON student_details FOR INSERT
            WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- Not: Bu migration'ı çalıştırdıktan sonra kayıt işlemi düzgün çalışmalı
-- Register sayfası artık profile'ı UPDATE edecek (INSERT yerine)

