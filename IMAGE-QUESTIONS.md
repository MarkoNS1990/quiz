# 🖼️ Pitanja sa Slikama

## 📝 Šta je Dodato

Dodata je podrška za **pitanja sa slikama**! Sada možeš dodati slike u pitanja - savršeno za pitanja o zastavama, logotipima, znamenitostima, itd.

## ✨ Nova Funkcionalnost

### Pitanja sa Slikama

Bot sada može prikazati sliku kao deo pitanja:

```
📚 **Zastave** (lako)

Koja je ovo zastava?
🖼️ Slika: https://flagcdn.com/w320/rs.png

Napiši tačan odgovor! ✍️
```

### Kako Izgleda u Chat-u

```
🤖 Kviz Bot
📚 **Zastave** (lako)

Koja je ovo zastava?
🖼️ Slika: https://flagcdn.com/w320/rs.png

Napiši tačan odgovor! ✍️
```

Korisnik klikne na link, vidi sliku, i otkuca odgovor: "Srbija"

## 🔧 Tehničke Izmene

### 1. Nova Kolona u Bazi

**SQL Migration** (`add-image-url-column.sql`):
```sql
ALTER TABLE quiz_questions
ADD COLUMN IF NOT EXISTS image_url TEXT;
```

### 2. Ažuriran TypeScript Tip

**`lib/supabase.ts`**:
```typescript
export type QuizQuestion = {
  id: number;
  question: string;
  answer: string;
  image_url: string | null;  // ✨ NEW
  category: string | null;
  difficulty: 'lako' | 'srednje' | 'teško' | null;
  created_at: string;
};
```

### 3. Ažurirano Formatiranje Pitanja

**`lib/quizBot.ts`**:
```typescript
const quizMessage = `
📚 **${question.category || 'Kviz'}** ${question.difficulty ? `(${question.difficulty})` : ''}

${question.question}
${question.image_url ? `\n🖼️ Slika: ${question.image_url}` : ''}

Napiši tačan odgovor! ✍️
`.trim();
```

## 📋 Kako Dodati Pitanja sa Slikama

### Opcija 1: SQL Insert

```sql
INSERT INTO quiz_questions (question, answer, image_url, category, difficulty)
VALUES (
  'Koja je ovo zastava?',
  'Srbija',
  'https://flagcdn.com/w320/rs.png',
  'Zastave',
  'lako'
);
```

### Opcija 2: Supabase Table Editor

1. Otvori Supabase Dashboard
2. Table Editor → quiz_questions
3. Insert row
4. Popuni polja:
   - **question**: "Koja je ovo zastava?"
   - **answer**: "Srbija"
   - **image_url**: "https://flagcdn.com/w320/rs.png"
   - **category**: "Zastave"
   - **difficulty**: "lako"

## 🌍 Primer: Pitanja o Zastavama

Kreirao sam SQL script sa **30 pitanja o zastavama**!

**`flag-quiz-questions.sql`**:
- 10 lakih pitanja (popularne države)
- 10 srednjih pitanja (susedne države)
- 10 teških pitanja (manje poznate države)

### Korišćenje Free Flag API

Koristim **flagcdn.com** - besplatan CDN za zastave:

```
https://flagcdn.com/w320/{country-code}.png
```

**Primeri**:
- `https://flagcdn.com/w320/rs.png` - Srbija
- `https://flagcdn.com/w320/de.png` - Nemačka
- `https://flagcdn.com/w320/us.png` - SAD

**Dostupne veličine**:
- w20, w40, w80, w160, w320, w640, w1280

### Country Codes

| Država | Code | URL |
|--------|------|-----|
| Srbija | rs | https://flagcdn.com/w320/rs.png |
| Hrvatska | hr | https://flagcdn.com/w320/hr.png |
| Bosna i Hercegovina | ba | https://flagcdn.com/w320/ba.png |
| Crna Gora | me | https://flagcdn.com/w320/me.png |
| Nemačka | de | https://flagcdn.com/w320/de.png |
| Francuska | fr | https://flagcdn.com/w320/fr.png |
| Italija | it | https://flagcdn.com/w320/it.png |
| SAD | us | https://flagcdn.com/w320/us.png |

[Potpuna lista kodova](https://www.iso.org/obp/ui/#search/code/)

## 🎨 Drugi Tipovi Slika

### Logotipi Kompanija

```sql
INSERT INTO quiz_questions (question, answer, image_url, category, difficulty)
VALUES (
  'Koji je ovo brend?',
  'Apple',
  'https://example.com/logos/apple.png',
  'Logotipi',
  'lako'
);
```

### Znamenitosti

```sql
INSERT INTO quiz_questions (question, answer, image_url, category, difficulty)
VALUES (
  'Koja je ovo znamenitost?',
  'Eiffelov Toranj',
  'https://example.com/landmarks/eiffel-tower.jpg',
  'Znamenitosti',
  'srednje'
);
```

### Poznate Ličnosti

```sql
INSERT INTO quiz_questions (question, answer, image_url, category, difficulty)
VALUES (
  'Ko je ovo?',
  'Nikola Tesla',
  'https://example.com/people/nikola-tesla.jpg',
  'Poznate Ličnosti',
  'srednje'
);
```

### Životinje

```sql
INSERT INTO quiz_questions (question, answer, image_url, category, difficulty)
VALUES (
  'Koja je ovo životinja?',
  'Pingvin',
  'https://example.com/animals/penguin.jpg',
  'Životinje',
  'lako'
);
```

## 📱 Kako Radi u Praksi

### Scenario: Pitanje o Zastavi

1. **Bot postavlja pitanje**:
```
📚 **Zastave** (lako)

Koja je ovo zastava?
🖼️ Slika: https://flagcdn.com/w320/rs.png

Napiši tačan odgovor! ✍️
```

2. **Korisnik klikne na link**:
   - Link se otvara u novom tab-u
   - Vidi sliku zastave Srbije
   - Vraća se na chat

3. **Korisnik odgovara**:
   - Otkuca: "Srbija"
   - Bot potvrđuje tačan odgovor

4. **Bot čestita**:
```
🎉 Bravo, marko! Dobili ste 3 poena! 🏆
💯 Ukupno: 35 poena!

🏆 TOP3:
🥇 marko: 35 poena
🥈 ana: 28 poena
🥉 jovan: 15 poena
```

## 🔄 Primena Izmena

### 1. Primeni SQL Migration

**Supabase SQL Editor**:
```sql
-- Add image_url column
ALTER TABLE quiz_questions
ADD COLUMN IF NOT EXISTS image_url TEXT;
```

### 2. (Opciono) Dodaj Pitanja o Zastavama

**Supabase SQL Editor**:
```sql
-- Run the entire flag-quiz-questions.sql file
-- This adds 30 flag questions
```

### 3. Deploy na Vercel

Kod je već pushed na GitHub, Vercel će automatski deploy-ovati!

## 📊 Prednosti

✅ **Visual Learning** - Bolje za memoriju
✅ **Raznovrsnost** - Različiti tipovi pitanja
✅ **Engaged Users** - Interaktivnije od text-only pitanja
✅ **Skalabilnost** - Lako dodati nove kategorije
✅ **Free Resources** - Flagcdn.com i drugi free API-ji

## 🌐 Best Practices

### 1. Koristi CDN-ove
- Brže učitavanje
- Pouzdanije
- Nema potrebe za hosting-om

**Dobro** ✅:
```
https://flagcdn.com/w320/rs.png
```

**Loše** ❌:
```
file:///C:/Users/Desktop/flags/serbia.png
```

### 2. Optimalna Veličina Slike
- **320px width** je idealno za chat
- Ne previše velika (brzo učitavanje)
- Ne premala (dobra vidljivost)

### 3. Proveri Link Pre Dodavanja
- Otvori link u browser-u
- Proveri da li radi
- Proveri da li je slika jasna

### 4. Konzistentno Formatiranje Pitanja
```
Koja je ovo zastava?          ✅ Dobro
Ovo je zastava koje države?   ✅ Dobro
Pogodi zastavu                ❌ Nejasno
```

## 🧪 Testiranje

### Test Case 1: Pitanje sa Slikom
```sql
INSERT INTO quiz_questions (question, answer, image_url, category, difficulty)
VALUES ('Koja je ovo zastava?', 'Srbija', 'https://flagcdn.com/w320/rs.png', 'Zastave', 'lako');
```

**Očekivano**:
- Bot prikazuje pitanje
- Link je klikabilan
- Slika se otvara
- Odgovor "Srbija" se prihvata

### Test Case 2: Pitanje bez Slike
```sql
INSERT INTO quiz_questions (question, answer, image_url, category, difficulty)
VALUES ('Glavni grad Srbije?', 'Beograd', NULL, 'Geografija', 'lako');
```

**Očekivano**:
- Bot prikazuje pitanje
- Nema 🖼️ ikone
- Normalno text pitanje

### Test Case 3: Normalizacija Odgovora
Pitanje: "Koja je ovo zastava?" (Nemačka)
- "Nemačka" ✅
- "Nemacka" ✅
- "nemacka" ✅
- "NEMACKA" ✅

## 🚀 Buduće Ideje

### 1. Audio Pitanja
Dodati `audio_url` kolonu za muzičke kvizove

### 2. Video Pitanja
Dodati `video_url` kolonu za filmske scene

### 3. Multiple Images
Dodati JSON array za više slika

### 4. Image Gallerija
Prikazivati slike inline umesto link-a (možda sa img tag-om u HTML porukama)

## 📦 Fajlovi

- ✏️ `lib/supabase.ts` - Ažuriran `QuizQuestion` tip
- ✏️ `lib/quizBot.ts` - Ažurirano formatiranje pitanja
- 📄 `add-image-url-column.sql` - SQL migration
- 📄 `flag-quiz-questions.sql` - 30 pitanja o zastavama
- 📄 `IMAGE-QUESTIONS.md` - Ova dokumentacija

## 🔄 Commit

```bash
git add -A
git commit -m "Add support for image questions (flags, logos, etc)"
git push origin main
```

---

**Implementirano**: 10. Nov 2025  
**Feature**: Pitanja sa slikama (image_url kolona)  
**Primer**: 30 pitanja o zastavama  
**Free API**: flagcdn.com za zastave  
**Breaking Change**: NE - image_url je optional (nullable)

