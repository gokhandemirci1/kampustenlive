# ⚡ Supabase Edge Function - Hızlı Başlangıç

## 🎯 Hızlı Komutlar

### 1. Supabase CLI Kur (Eğer yoksa)
```powershell
npm install -g supabase
```

### 2. Login Ol
```powershell
supabase login
```

### 3. Proje Referans ID Bul
- Supabase Dashboard > Settings > General > Reference ID

### 4. Link Et
```powershell
supabase link --project-ref YOUR_PROJECT_REF_ID
```

### 5. Secret'ları Ekle
```powershell
supabase secrets set AGORA_APP_ID=your_app_id_here
supabase secrets set AGORA_APP_CERTIFICATE=your_app_certificate_here
```

### 6. Deploy Et
```powershell
supabase functions deploy agora-token
```

✅ **Tamamlandı!** Artık Edge Function hazır!

---

## 🔍 Hızlı Kontrol

Deploy sonrası:
1. Supabase Dashboard > Edge Functions > `agora-token`
2. Function URL'ini kopyalayın
3. Frontend otomatik kullanacak (`.env`'de `VITE_AGORA_TOKEN_SERVER_URL` yoksa)

---

**Detaylı rehber için:** `SUPABASE_EDGE_FUNCTION_KURULUM.md`

