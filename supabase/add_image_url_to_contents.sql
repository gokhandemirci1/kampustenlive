-- ============================================
-- CONTENTS TABLOSUNA IMAGE_URL ALANI EKLEME
-- ============================================
-- Bu SQL'i Supabase SQL Editor'de çalıştırın

-- Contents tablosuna image_url alanı ekle
ALTER TABLE contents 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Yorum ekle
COMMENT ON COLUMN contents.image_url IS 'İçerik için yüklenen görsel URL''si (Supabase Storage)';

