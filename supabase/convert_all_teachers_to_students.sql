-- ============================================
-- TÜM ÖĞRETMENLERİ ÖĞRENCİYE ÇEVİRME
-- ============================================
-- Bu script tüm öğretmen kayıtlarını öğrenciye çevirir
-- ÖNEMLİ: Bu işlem geri alınamaz! Yedek alın!

-- ============================================
-- 1. TÜM ÖĞRETMENLERİ ÖĞRENCİYE ÇEVİR
-- ============================================

-- Profiles tablosunda role = 'teacher' olanları 'student' yap
UPDATE profiles
SET 
  role = 'student',
  updated_at = NOW()
WHERE role = 'teacher';

-- ============================================
-- 2. TEACHER_DETAILS KAYITLARINI SİL
-- ============================================

-- Teacher details tablosundaki tüm kayıtları sil
DELETE FROM teacher_details;

-- Alternatif: Sadece verileri temizle, kayıtları silme
-- UPDATE teacher_details
-- SET 
--   university = NULL,
--   department = NULL,
--   yks_rank = NULL,
--   is_approved = false,
--   updated_at = NOW();

-- ============================================
-- 3. STUDENT_DETAILS KAYITLARINI OLUŞTUR (OPSİYONEL)
-- ============================================

-- Eğer student_details tablosuna da kayıt eklemek istiyorsanız
-- Aşağıdaki kodu kullanın

-- Mevcut student role'ü olan kullanıcılar için student_details oluştur
INSERT INTO student_details (id, grade_level, created_at, updated_at)
SELECT 
  p.id,
  '12. Sınıf' as grade_level, -- Varsayılan sınıf seviyesi
  NOW() as created_at,
  NOW() as updated_at
FROM profiles p
WHERE p.role = 'student'
AND NOT EXISTS (
  SELECT 1 FROM student_details sd WHERE sd.id = p.id
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. SONUÇLARI KONTROL ET
-- ============================================

-- Öğretmen sayısını kontrol et (0 olmalı)
SELECT 
  COUNT(*) as "Öğretmen Sayısı",
  'Teacher count should be 0' as "Beklenen"
FROM profiles
WHERE role = 'teacher';

-- Öğrenci sayısını kontrol et
SELECT 
  COUNT(*) as "Öğrenci Sayısı"
FROM profiles
WHERE role = 'student';

-- Teacher details sayısını kontrol et (0 olmalı)
SELECT 
  COUNT(*) as "Teacher Details Sayısı",
  'Should be 0' as "Beklenen"
FROM teacher_details;

-- Tüm rolleri göster
SELECT 
  role,
  COUNT(*) as "Kullanıcı Sayısı"
FROM profiles
GROUP BY role
ORDER BY role;
