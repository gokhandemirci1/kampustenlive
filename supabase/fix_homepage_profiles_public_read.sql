-- Fix homepage profiles public read access
-- Anasayfada eğitmenleri göstermek için profiles'ı public okunabilir yap
-- Mevcut policy'yi güncelle

-- Mevcut policy'yi sil
DROP POLICY IF EXISTS "Users can read all profiles" ON profiles;

-- Herkes profiles'ı okuyabilir (public bilgiler için - anasayfada eğitmen gösterimi için)
CREATE POLICY "Anyone can read profiles"
    ON profiles FOR SELECT
    USING (true);
