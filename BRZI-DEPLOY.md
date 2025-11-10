# ⚡ Brzi Deploy na Vercel (5 minuta)

## Opcija 1: Preko GitHub (Preporučeno)

### 1️⃣ Push na GitHub

```bash
cd chat-app
git init
git add .
git commit -m "Initial commit"
```

Napravi novi repo na GitHub, pa:

```bash
git remote add origin https://github.com/TVOJ-USERNAME/TVOJ-REPO.git
git push -u origin main
```

### 2️⃣ Deploy na Vercel

1. Idi na [vercel.com](https://vercel.com) i prijavi se
2. Klikni **"Add New Project"**
3. Izaberi svoj GitHub repo
4. Dodaj **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://jvaqbuhjcwcmovvetref.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `tvoj-anon-key`
5. Klikni **"Deploy"**

**Gotovo! 🎉**

---

## Opcija 2: Vercel CLI (Brže)

### 1️⃣ Instaliraj Vercel CLI

```bash
npm i -g vercel
```

### 2️⃣ Login

```bash
vercel login
```

### 3️⃣ Deploy

```bash
cd chat-app
vercel
```

Odgovori na pitanja:
- Set up and deploy? **Y**
- Which scope? *izaberi svoj account*
- Link to existing project? **N**
- Project name? **chat-app** (ili bilo šta)
- Directory? **./** (samo Enter)
- Override settings? **N**

### 4️⃣ Dodaj Environment Variables

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
```
Unesi: `https://jvaqbuhjcwcmovvetref.supabase.co`

```bash
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Unesi tvoj anon key

### 5️⃣ Redeploy sa Environment Variables

```bash
vercel --prod
```

**Gotovo! 🎉**

---

## 🔧 Environment Variables

Proveri da imaš ove vrednosti iz Supabase:

1. Idi na [Supabase Dashboard](https://supabase.com/dashboard)
2. Tvoj projekat → **Settings** → **API**
3. Kopiraj:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 🎯 Posle Deploya

Tvoja aplikacija je live na:
```
https://tvoj-projekat.vercel.app
```

### Testiranje:
1. ✅ Unesi username
2. ✅ Pošalji poruku
3. ✅ Pokreni kviz
4. ✅ Proveri real-time messaging (otvori u 2 tab-a)

---

## 🔄 Update Aplikacije

Svaki `git push` automatski redeploy-uje! 🚀

```bash
git add .
git commit -m "Update"
git push
```

**Ili sa Vercel CLI:**

```bash
vercel --prod
```

---

## 🐛 Problemi?

### Build greška
```bash
# Testiraj lokalno
npm run build
```

### Environment variables ne rade
```bash
vercel env ls
vercel env pull
```

### Real-time ne radi
- Proveri Supabase Replication je omogućen za `messages` tabelu

---

Za detaljnije uputstvo, vidi **VERCEL-DEPLOYMENT.md**

