# Supabase Storage Kurulumu

## Content Images Bucket Oluşturma

1. Supabase Dashboard'a gidin: https://app.supabase.com
2. Projenizi seçin
3. Sol menüden **Storage** sekmesine tıklayın
4. **"New bucket"** butonuna tıklayın
5. Bucket bilgilerini girin:
   - **Name**: `content-images`
   - **Public bucket**: ✅ İşaretleyin (görsellerin erişilebilir olması için)
6. **"Create bucket"** butonuna tıklayın

## Storage Policies (RLS)

Bucket oluşturulduktan sonra, aşağıdaki policy'leri ekleyin:

### 1. Authenticated users can upload images
```sql
CREATE POLICY "Authenticated users can upload content images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'content-images');
```

### 2. Anyone can read images (public bucket)
```sql
CREATE POLICY "Anyone can read content images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'content-images');
```

### 3. Authenticated users can delete their own images
```sql
CREATE POLICY "Authenticated users can delete own content images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'content-images' AND (storage.foldername(name))[1] = auth.uid()::text);
```

**Not**: Bu policy'ler Supabase Dashboard > Storage > Policies bölümünden de eklenebilir.

---

## Course Images Bucket Oluşturma

1. Supabase Dashboard'a gidin: https://app.supabase.com
2. Projenizi seçin
3. Sol menüden **Storage** sekmesine tıklayın
4. **"New bucket"** butonuna tıklayın
5. Bucket bilgilerini girin:
   - **Name**: `course-images`
   - **Public bucket**: ✅ İşaretleyin (görsellerin erişilebilir olması için)
6. **"Create bucket"** butonuna tıklayın

## Course Images Storage Policies (RLS)

Bucket oluşturulduktan sonra, aşağıdaki policy'leri ekleyin:

### 1. Authenticated users can upload course images
```sql
CREATE POLICY "Authenticated users can upload course images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'course-images');
```

### 2. Anyone can read course images (public bucket)
```sql
CREATE POLICY "Anyone can read course images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'course-images');
```

### 3. Authenticated users can delete their own course images
```sql
CREATE POLICY "Authenticated users can delete own course images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'course-images' AND (storage.foldername(name))[1] = auth.uid()::text);
```

---

## Avatars Bucket Oluşturma

1. Supabase Dashboard'a gidin: https://app.supabase.com
2. Projenizi seçin
3. Sol menüden **Storage** sekmesine tıklayın
4. **"New bucket"** butonuna tıklayın
5. Bucket bilgilerini girin:
   - **Name**: `avatars`
   - **Public bucket**: ✅ İşaretleyin (profil resimlerinin erişilebilir olması için)
6. **"Create bucket"** butonuna tıklayın

## Avatars Storage Policies (RLS)

Bucket oluşturulduktan sonra, aşağıdaki policy'leri ekleyin:

### 1. Authenticated users can upload their own avatars
```sql
CREATE POLICY "Authenticated users can upload own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
```

### 2. Anyone can read avatars (public bucket)
```sql
CREATE POLICY "Anyone can read avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

### 3. Authenticated users can update their own avatars
```sql
CREATE POLICY "Authenticated users can update own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
```

### 4. Authenticated users can delete their own avatars
```sql
CREATE POLICY "Authenticated users can delete own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
```
