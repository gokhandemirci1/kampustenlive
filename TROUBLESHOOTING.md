# Sorun Giderme Rehberi

## Sayfa Açılmıyor Sorunları

### 1. Development Server Başlatma

Terminal'de şu komutu çalıştırın:
```bash
npm run dev
```

Çıktı şöyle olmalı:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 2. Port Kullanımda Hatası

Eğer port kullanımda hatası alıyorsanız:
```bash
# Port'u değiştir
npm run dev -- --port 3000
```

### 3. .env Dosyası Eksik

`.env` dosyası oluşturun:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Tarayıcı Konsol Hataları

F12 > Console sekmesinde hataları kontrol edin:
- Supabase bağlantı hatası
- Import hataları
- Syntax hataları

### 5. Node Modules Sorunu

```bash
# node_modules'ı sil ve yeniden yükle
rm -rf node_modules
npm install
npm run dev
```

### 6. Vite Cache Sorunu

```bash
# Vite cache'ini temizle
rm -rf node_modules/.vite
npm run dev
```

## Yaygın Hatalar

### "Cannot find module"
- `npm install` çalıştırın

### "Port already in use"
- Farklı bir port kullanın veya çalışan process'i durdurun

### "Supabase connection error"
- `.env` dosyasını kontrol edin
- Supabase URL ve Key'in doğru olduğundan emin olun

### "404 Not Found"
- Route'ları kontrol edin
- Browser'da doğru URL'yi açtığınızdan emin olun


