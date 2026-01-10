-- ============================================
-- BASIT: 12 ÖĞRETMEN VERİSİ EKLEME
-- ============================================
-- Bu script mevcut öğretmenlere test verileri ekler
-- Veya eğer öğretmen yoksa ilk 12 öğrenciyi öğretmen yapar

-- ÖNEMLİ: Bu script sadece mevcut kullanıcılara veri ekler
-- Yeni auth.users kullanıcısı oluşturmak için Supabase Dashboard kullanın

-- 1. Mevcut öğretmenleri onayla ve veri ekle
DO $$
DECLARE
  teacher_rec RECORD;
  i INTEGER := 0;
  teacher_names TEXT[] := ARRAY[
    'Ahmet Yılmaz',
    'Ayşe Demir',
    'Mehmet Kaya',
    'Fatma Şahin',
    'Ali Öztürk',
    'Zeynep Çelik',
    'Can Arslan',
    'Elif Aydın',
    'Burak Yıldız',
    'Selin Doğan',
    'Emre Koç',
    'Melisa Güneş'
  ];
  
  universities TEXT[] := ARRAY[
    'Boğaziçi Üniversitesi',
    'ODTÜ',
    'İTÜ',
    'Koç Üniversitesi',
    'Sabancı Üniversitesi',
    'Galatasaray Üniversitesi',
    'Hacettepe Üniversitesi',
    'Ankara Üniversitesi',
    'İstanbul Üniversitesi',
    'Bilkent Üniversitesi',
    'Yeditepe Üniversitesi',
    'Bahçeşehir Üniversitesi'
  ];
  
  departments TEXT[] := ARRAY[
    'Elektrik-Elektronik Mühendisliği',
    'Bilgisayar Mühendisliği',
    'Endüstri Mühendisliği',
    'Makine Mühendisliği',
    'Matematik',
    'Fizik',
    'Kimya',
    'İktisat',
    'İşletme',
    'Elektrik Elektronik Mühendisliği',
    'Diş Hekimliği',
    'Hukuk'
  ];
BEGIN
  -- Mevcut teacher role'ü olan kullanıcıları al
  FOR teacher_rec IN 
    SELECT p.id, p.full_name, p.role
    FROM profiles p
    WHERE p.role = 'teacher'
    ORDER BY p.created_at
    LIMIT 12
  LOOP
    i := i + 1;
    
    -- Teacher details oluştur veya güncelle
    INSERT INTO teacher_details (
      id,
      university,
      department,
      yks_rank,
      is_approved
    )
    VALUES (
      teacher_rec.id,
      universities[i],
      departments[i],
      floor(random() * 5000 + 1)::INTEGER,
      true
    )
    ON CONFLICT (id) DO UPDATE SET
      university = COALESCE(NULLIF(teacher_details.university, ''), EXCLUDED.university),
      department = COALESCE(NULLIF(teacher_details.department, ''), EXCLUDED.department),
      yks_rank = COALESCE(teacher_details.yks_rank, EXCLUDED.yks_rank),
      is_approved = true;
    
    -- İsim güncelle (eğer boşsa)
    UPDATE profiles
    SET full_name = COALESCE(NULLIF(full_name, ''), teacher_names[i])
    WHERE id = teacher_rec.id;
    
    EXIT WHEN i >= 12;
  END LOOP;
  
  -- Eğer öğretmen yoksa, ilk 12 kullanıcıyı öğretmen yap
  IF i < 12 THEN
    FOR teacher_rec IN 
      SELECT p.id, p.full_name
      FROM profiles p
      WHERE p.role != 'teacher' OR p.role IS NULL
      AND NOT EXISTS (SELECT 1 FROM teacher_details td WHERE td.id = p.id)
      ORDER BY p.created_at
      LIMIT (12 - i)
    LOOP
      i := i + 1;
      
      -- Role'ü teacher yap
      UPDATE profiles
      SET role = 'teacher',
          full_name = COALESCE(NULLIF(full_name, ''), teacher_names[i])
      WHERE id = teacher_rec.id;
      
      -- Teacher details oluştur
      INSERT INTO teacher_details (
        id,
        university,
        department,
        yks_rank,
        is_approved
      )
      VALUES (
        teacher_rec.id,
        universities[i],
        departments[i],
        floor(random() * 5000 + 1)::INTEGER,
        true
      )
      ON CONFLICT (id) DO UPDATE SET
        university = COALESCE(NULLIF(teacher_details.university, ''), EXCLUDED.university),
        department = COALESCE(NULLIF(teacher_details.department, ''), EXCLUDED.department),
        yks_rank = COALESCE(teacher_details.yks_rank, EXCLUDED.yks_rank),
        is_approved = true;
      
      EXIT WHEN i >= 12;
    END LOOP;
  END IF;
END $$;

-- Sonuçları göster
SELECT 
  p.full_name AS "İsim",
  td.university AS "Üniversite",
  td.department AS "Bölüm",
  td.yks_rank AS "YKS Sıralaması",
  td.is_approved AS "Onaylı"
FROM profiles p
INNER JOIN teacher_details td ON p.id = td.id
WHERE p.role = 'teacher'
AND td.is_approved = true
ORDER BY td.yks_rank
LIMIT 12;
