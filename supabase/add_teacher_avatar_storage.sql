-- ============================================
-- TEACHER AVATAR STORAGE MIGRATION
-- ============================================
-- Bu migration dosyası öğretmen kayıt olurken profil fotoğrafı yükleyebilmesi için gerekli yapılandırmaları içerir.
--
-- ÖNEMLİ: Storage bucket'ı Supabase Dashboard'dan manuel olarak oluşturmanız gerekiyor:
-- 1. Supabase Dashboard > Storage > New Bucket
-- 2. Bucket Name: "avatars"
-- 3. Public: true (profesyonel: false olabilir, RLS politikaları ile kontrol edilebilir)
-- 4. File size limit: 2MB (veya istediğiniz limit)
-- 5. Allowed MIME types: image/jpeg, image/png, image/gif, image/webp
--
-- Alternatif olarak, Supabase CLI ile oluşturabilirsiniz:
-- supabase storage create avatars --public
-- ============================================

-- Storage bucket'ı için RLS politikaları
-- Not: Storage bucket'ı SQL ile oluşturulamaz, önce Dashboard'dan oluşturmanız gerekir

-- Storage bucket RLS politikaları
-- Bu politikalar storage.objects tablosu üzerinde çalışır
-- NOT: Önce mevcut politikaları sil, sonra yenilerini oluştur

-- ÖNEMLİ: Storage bucket'ta RLS etkin olmalı ama bucket public olabilir
-- Supabase Dashboard > Storage > avatars bucket > Settings > Enable RLS

-- 1. Herkes avatar'ları okuyabilir (public bucket için)
DROP POLICY IF EXISTS "Avatars are publicly readable" ON storage.objects;
CREATE POLICY "Avatars are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- 2. Kullanıcılar kendi avatar'larını yükleyebilir
-- Dosya yolu: {user_id}/avatar_*.{ext} formatında olmalı (avatars bucket içinde)
-- Authenticated kullanıcılar kendi klasörlerine dosya yükleyebilir
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated' AND
  (
    split_part(name, '/', 1) = auth.uid()::text OR
    name LIKE auth.uid()::text || '/%'
  )
);

-- 3. Kullanıcılar kendi avatar'larını güncelleyebilir
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated' AND
  (
    split_part(name, '/', 1) = auth.uid()::text OR
    name LIKE auth.uid()::text || '/%'
  )
)
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated' AND
  (
    split_part(name, '/', 1) = auth.uid()::text OR
    name LIKE auth.uid()::text || '/%'
  )
);

-- 4. Kullanıcılar kendi avatar'larını silebilir
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated' AND
  (
    split_part(name, '/', 1) = auth.uid()::text OR
    name LIKE auth.uid()::text || '/%'
  )
);

-- 5. Admin tüm avatar'ları yönetebilir
DROP POLICY IF EXISTS "Admins can manage all avatars" ON storage.objects;
CREATE POLICY "Admins can manage all avatars"
ON storage.objects FOR ALL
USING (
  bucket_id = 'avatars' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  bucket_id = 'avatars' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Not: Storage bucket'ı oluşturduktan sonra bu migration'ı çalıştırın
-- Supabase Dashboard > SQL Editor > Bu dosyayı çalıştırın
--
-- Adımlar:
-- 1. Supabase Dashboard > Storage > New Bucket
-- 2. Bucket adı: "avatars"
-- 3. Public bucket: true (veya false + RLS ile kontrol)
-- 4. Storage > avatars bucket > Settings > Enable RLS (RLS'yi etkinleştir)
-- 5. Bu SQL dosyasını çalıştırın
--
-- ÖNEMLİ: RLS etkinleştirilmezse politikalar çalışmaz!

-- ============================================
-- KULLANIM ÖRNEĞİ
-- ============================================
-- Frontend'de (Register.jsx veya başka bir yerde):
-- 
-- const uploadAvatar = async (file, userId) => {
--   const fileExt = file.name.split('.').pop()
--   const fileName = `${userId}/avatar_${Date.now()}.${fileExt}`
--   // NOT: filePath sadece dosya adını içermeli, bucket adı değil
--   // Supabase storage.from('avatars') ile bucket zaten belirleniyor
--
--   const { error } = await supabase.storage
--     .from('avatars')
--     .upload(fileName, file, {
--       cacheControl: '3600',
--       upsert: false
--     })
--
--   if (error) throw error
--
--   const { data: { publicUrl } } = supabase.storage
--     .from('avatars')
--     .getPublicUrl(fileName)
--
--   // profiles tablosunu güncelle
--   await supabase
--     .from('profiles')
--     .update({ avatar_url: publicUrl })
--     .eq('id', userId)
--
--   return publicUrl
-- }
-- ============================================
