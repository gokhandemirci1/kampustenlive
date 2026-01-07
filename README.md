# Kampusten.org - YKS Özel Ders Platformu

Modern, minimalist ve ferah bir tasarıma sahip YKS özel ders platformu.

## Teknoloji Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide React, React Router DOM
- **Backend**: Supabase (Auth, Postgres DB, Storage, Realtime)

## Kurulum

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. Supabase Yapılandırması

1. `.env.example` dosyasını `.env` olarak kopyalayın:
```bash
cp .env.example .env
```

2. `.env` dosyasını açın ve Supabase bilgilerinizi girin:
   - Supabase Dashboard'a gidin: https://app.supabase.com
   - Projenizi seçin
   - Settings > API bölümüne gidin
   - **Project URL** ve **anon public key** değerlerini kopyalayın
   - `.env` dosyasına yapıştırın:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Supabase Veritabanı Kurulumu

1. Supabase Dashboard > SQL Editor'e gidin
2. `supabase/schema.sql` dosyasının içeriğini kopyalayın
3. SQL Editor'de çalıştırın

### 4. Uygulamayı Başlatın

```bash
npm run dev
```

## Proje Yapısı

```
src/
├── components/     # Yeniden kullanılabilir bileşenler
├── pages/         # Sayfa bileşenleri
├── lib/           # Supabase client ve helper fonksiyonlar
├── utils/         # Utility fonksiyonlar (toast, vb.)
├── App.jsx        # Ana uygulama ve routing
└── main.jsx       # Giriş noktası
```

## Supabase Kullanımı

Supabase client'ı `src/lib/supabase.js` dosyasından import edebilirsiniz:

```javascript
import { supabase, getCurrentUser, getUserProfile } from '../lib/supabase'

// Örnek kullanım
const user = await getCurrentUser()
const profile = await getUserProfile(user.id)
```

## Önemli Notlar

- `.env` dosyası `.gitignore`'da olduğu için commit edilmeyecektir
- **Service Role Key**'i asla frontend'de kullanmayın!
- Supabase anon key güvenli bir şekilde frontend'de kullanılabilir (RLS ile korunur)

