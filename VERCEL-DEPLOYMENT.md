# 🚀 Vercel Deployment Guide

Vodič za postavljanje Chat aplikacije na Vercel.

## 📋 Pre nego što počneš

Proveri da imaš:
- ✅ Supabase projekat sa konfigurisanom bazom
- ✅ SQL šema pokrenuta (`new-serbian-quiz-schema.sql`)
- ✅ Supabase URL i anon key

## 🔧 Korak 1: Pripremi Git Repository

### 1.1 Inicijalizuj Git (ako već nije)

```bash
cd chat-app
git init
git add .
git commit -m "Initial commit - Chat app with Quiz Bot"
```

### 1.2 Kreiraj GitHub Repository

1. Idi na [GitHub](https://github.com)
2. Klikni na **"New repository"**
3. Ime: `chat-app-kviz` (ili bilo koje ime)
4. **Ne** dodavaj README, .gitignore ili licencu
5. Klikni **"Create repository"**

### 1.3 Push na GitHub

```bash
git remote add origin https://github.com/TVOJ-USERNAME/chat-app-kviz.git
git branch -M main
git push -u origin main
```

## 🌐 Korak 2: Deploy na Vercel

### 2.1 Idi na Vercel

1. Idi na [vercel.com](https://vercel.com)
2. Prijavi se sa svojim GitHub nalogom
3. Klikni **"Add New..."** → **"Project"**

### 2.2 Import Repository

1. Izaberi svoj GitHub repository (`chat-app-kviz`)
2. Vercel će automatski detektovati Next.js projekat
3. **Root Directory**: ostavi prazno (ili stavi `chat-app` ako je u podfolderu)

### 2.3 Configure Project

**Framework Preset**: Next.js (automatski detektovano)

**Build and Output Settings**:
- Build Command: `npm run build` (default)
- Output Directory: `.next` (default)
- Install Command: `npm install` (default)

**Ostavi sve default vrednosti!**

### 2.4 Dodaj Environment Variables

U sekciji **Environment Variables**, dodaj:

**1. NEXT_PUBLIC_SUPABASE_URL**
```
Value: https://jvaqbuhjcwcmovvetref.supabase.co
```
(tvoj Supabase URL)

**2. NEXT_PUBLIC_SUPABASE_ANON_KEY**
```
Value: tvoj-anon-key-ovde
```
(tvoj Supabase anon key)

⚠️ **VAŽNO**: Obe promenljive moraju imati prefiks `NEXT_PUBLIC_`

### 2.5 Deploy

1. Klikni **"Deploy"**
2. Čekaj 1-2 minuta
3. 🎉 Gotovo!

## 🔗 Korak 3: Testiranje

### 3.1 Otvori App

Nakon deployments:
1. Klikni na deployment link (npr. `your-app.vercel.app`)
2. Testuj:
   - ✅ Unesi username
   - ✅ Pošalji poruku
   - ✅ Pokreni kviz
   - ✅ Odgovori na pitanje

### 3.2 Proveri da Supabase radi

Otvori browser console (F12) i proveri:
- Da nema grešaka
- "Subscription status: SUBSCRIBED" poruka

## 🔄 Korak 4: Ažuriranje Aplikacije

Svaki put kad želiš da updejtuješ app:

```bash
# Napravi izmene u kodu
git add .
git commit -m "Opis izmene"
git push
```

Vercel će **automatski** deployovati novu verziju! 🚀

## 🎨 Opciono: Custom Domain

### Dodavanje Custom Domena

1. Idi na Vercel Dashboard
2. Izaberi svoj projekat
3. **Settings** → **Domains**
4. Dodaj svoj domen (npr. `kviz.mojdomen.rs`)
5. Prati uputstva za DNS konfiguraciju

## 🐛 Troubleshooting

### Problem: "Build Failed"

**Rešenje**: Proveri package.json i dependencies
```bash
# Lokalno testiraj build
npm run build
```

### Problem: Environment Variables nisu dostupne

**Rešenje**:
1. Idi na Vercel Dashboard → tvoj projekat
2. **Settings** → **Environment Variables**
3. Proveri da su obe promenljive dodate
4. **Redeploy** projekat

### Problem: Real-time ne radi

**Rešenje**:
1. Proveri Supabase Realtime je omogućen za `messages` tabelu
2. Idi na Supabase: **Database** → **Replication**
3. Omogući `messages` tabelu

### Problem: 404 Not Found

**Rešenje**:
- Proveri da je Root Directory pravilno postavljen
- Ako je projekat u podfolderu, stavi putanju (npr. `chat-app`)

### Problem: API Keys vidljivi u kodu

**Odgovor**: To je OK! ✅
- `NEXT_PUBLIC_` promenljive su namenjene za klijent
- Supabase koristi Row Level Security (RLS)
- Podaci su zaštićeni politikama u bazi

## 📊 Vercel Analytics (Opciono)

Omogući analytics za praćenje:
1. Vercel Dashboard → tvoj projekat
2. **Analytics** tab
3. Klikni **"Enable"**

Dobijaš:
- 📈 Broj poseta
- 🌍 Geografska lokacija korisnika
- ⚡ Performance metrics

## 💰 Pricing

**Hobby Plan (FREE)**:
- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- ✅ 100GB bandwidth/mesec
- ✅ Custom domains

**Više nego dovoljno za ovu aplikaciju!**

## 🔒 Sigurnost

### Best Practices

1. **Nikad ne commituj `.env.local`**
   - Already in `.gitignore` ✅

2. **Koristi Environment Variables u Vercelu**
   - Ne hardkoduj API keys ✅

3. **Supabase RLS je enabled**
   - Proveri da su politike aktivne ✅

4. **HTTPS je automatski**
   - Vercel dodaje SSL sertifikat ✅

## 🎯 Quick Commands

```bash
# Check git status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Your message"

# Push to GitHub (triggers auto-deploy)
git push

# Check logs
vercel logs
```

## 📱 Testiranje na Mobilnom

1. Otvori deployment URL na telefonu
2. Radi kao Progressive Web App (PWA)
3. Možeš dodati na Home Screen

## 🚀 Production Checklist

Pre nego što podeliš link:

- [ ] Supabase baza je konfigurisana
- [ ] RLS politike su omogućene
- [ ] Environment variables su dodate u Vercel
- [ ] Deployment je uspešan (zelena ✓)
- [ ] Testiran je na desktopu
- [ ] Testiran je na mobilnom
- [ ] Real-time messaging radi
- [ ] Kviz bot funkcioniše

## 🔗 Korisni Linkovi

- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://supabase.com/dashboard
- GitHub Repo: https://github.com/TVOJ-USERNAME/chat-app-kviz
- Live App: https://your-app.vercel.app

---

**Srećno! 🎉**

Ako imaš problema, proveri Vercel logs:
```bash
vercel logs your-app-url
```

