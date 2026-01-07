# 🪟 Supabase CLI - Windows Kurulum Rehberi

## ⚠️ ÖNEMLİ NOT

Supabase CLI artık `npm install -g supabase` ile kurulamıyor. Windows için aşağıdaki yöntemlerden birini kullanın:

---

## 📋 Yöntem 1: Scoop ile Kurulum (Önerilen)

### Adım 1: Scoop Kurun (Eğer yoksa)
PowerShell'i **Administrator** olarak açın ve çalıştırın:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
```

### Adım 2: Supabase CLI Kurun
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Adım 3: Kontrol Edin
```powershell
supabase --version
```

---

## 📋 Yöntem 2: NPM Paket Yöneticisi ile (npx kullanarak)

npx ile direkt kullanabilirsiniz (global kurulum gerekmez):

```powershell
npx supabase --version
```

Deploy için:
```powershell
npx supabase functions deploy agora-token
```

---

## 📋 Yöntem 3: Direct Binary Download

1. **GitHub Releases**'dan indirin: https://github.com/supabase/cli/releases
2. Windows için `.exe` dosyasını indirin
3. İndirilen dosyayı PATH'e ekleyin

---

## 📋 Yöntem 4: Chocolatey ile (Eğer varsa)

```powershell
choco install supabase
```

---

## ✅ Kurulum Sonrası

CLI kurulduktan sonra:

1. **Login olun:**
   ```powershell
   supabase login
   ```
   veya
   ```powershell
   npx supabase login
   ```

2. **Proje link edin:**
   ```powershell
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. **Secret'ları ekleyin:**
   ```powershell
   supabase secrets set AGORA_APP_ID=your_app_id
   supabase secrets set AGORA_APP_CERTIFICATE=your_certificate
   ```

4. **Deploy edin:**
   ```powershell
   supabase functions deploy agora-token
   ```

---

## 🎯 Hızlı Başlangıç (npx ile)

Eğer hiçbir paket yöneticisi kurmak istemiyorsanız, `npx` ile direkt kullanabilirsiniz:

```powershell
# Login
npx supabase login

# Link
npx supabase link --project-ref YOUR_PROJECT_REF

# Secrets
npx supabase secrets set AGORA_APP_ID=your_app_id
npx supabase secrets set AGORA_APP_CERTIFICATE=your_certificate

# Deploy
npx supabase functions deploy agora-token
```

---

**Hangi yöntemi tercih edersiniz?** 🤔

