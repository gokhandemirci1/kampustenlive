-- ============================================
-- COURSES TABLOSUNA IMAGE_URL ALANI EKLEME
-- ============================================
-- Bu SQL'i Supabase SQL Editor'de çalıştırın

-- Courses tablosuna image_url alanı ekle
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Yorum ekle
COMMENT ON COLUMN courses.image_url IS 'Kamp için yüklenen görsel URL''si (Supabase Storage)';

