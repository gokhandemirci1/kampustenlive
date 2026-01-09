-- ============================================
-- GÜVENLİ: ÖĞRETMENLERİ ÖĞRENCİYE ÇEVİRME
-- ============================================
-- Bu script tüm öğretmen kayıtlarını öğrenciye çevirir
-- GÜVENLİ: Önce kontrol eder, sonra günceller

-- ============================================
-- ADIM 1: MEVCUT DURUMU KONTROL ET
-- ============================================

SELECT 
  'ÖNCE KONTROL' as "AŞAMA",
  role,
  COUNT(*) as "Kullanıcı Sayısı"
FROM profiles
GROUP BY role
ORDER BY role;

SELECT 
  'Teacher Details Sayısı' as "Kontrol",
  COUNT(*) as "Kayıt Sayısı"
FROM teacher_details;

-- ============================================
-- ADIM 2: ÖĞRETMENLERİ ÖĞRENCİYE ÇEVİR
-- ============================================

BEGIN;

-- Profiles tablosunda role = 'teacher' olanları 'student' yap
UPDATE profiles
SET 
  role = 'student',
  updated_at = NOW()
WHERE role = 'teacher';

-- Sonucu kontrol et
SELECT 
  'GÜNCELLEME SONRASI' as "AŞAMA",
  role,
  COUNT(*) as "Kullanıcı Sayısı"
FROM profiles
GROUP BY role
ORDER BY role;

-- Eğer sonuçlar doğruysa COMMIT, değilse ROLLBACK yapın
-- COMMIT;
-- ROLLBACK;

-- ============================================
-- ADIM 3: TEACHER_DETAILS KAYITLARINI SİL
-- ============================================

-- Teacher details tablosundaki tüm kayıtları sil
DELETE FROM teacher_details;

-- Sonucu kontrol et
SELECT 
  'Teacher Details Silindi' as "Kontrol",
  COUNT(*) as "Kalan Kayıt Sayısı (0 olmalı)"
FROM teacher_details;

-- Eğer sonuçlar doğruysa COMMIT, değilse ROLLBACK yapın
-- COMMIT;
-- ROLLBACK;

-- ============================================
-- ADIM 4: STUDENT_DETAILS OLUŞTUR (OPSİYONEL)
-- ============================================

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

-- Sonucu kontrol et
SELECT 
  'Student Details Oluşturuldu' as "Kontrol",
  COUNT(*) as "Toplam Student Details Sayısı"
FROM student_details;

-- ============================================
-- ADIM 5: FİNAL KONTROL
-- ============================================

SELECT 
  'FİNAL DURUM' as "AŞAMA",
  role,
  COUNT(*) as "Kullanıcı Sayısı"
FROM profiles
GROUP BY role
ORDER BY role;

-- Eğer her şey doğruysa COMMIT yapın
COMMIT;

-- Veya geri almak isterseniz:
-- ROLLBACK;
