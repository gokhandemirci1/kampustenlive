-- ============================================
-- ADMIN ROLE GÜNCELLEMESİ
-- ============================================
-- Bu SQL'i çalıştırarak admin@kampus.org kullanıcısının
-- role'ünü 'student'den 'admin'e güncelleyin

-- Admin role'ünü güncelle (ID ile)
UPDATE public.profiles
SET 
    role = 'admin'::user_role,
    full_name = COALESCE(full_name, 'Yönetici')
WHERE id = '969f5c9e-63cd-416f-bfbf-ed4f851f2a55';

-- Sonucu kontrol et
SELECT 
    p.id,
    u.email,
    p.role,
    p.full_name
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'admin@kampus.org' 
   OR p.id = '969f5c9e-63cd-416f-bfbf-ed4f851f2a55';

