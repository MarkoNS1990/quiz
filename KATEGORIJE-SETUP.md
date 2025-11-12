# 📂 Custom Category Feature - Uputstvo za podešavanje

## 🎯 Šta je novo?

Dodao sam sistem za filtriranje kviz pitanja po **custom oblastima (kategorijama)**. Korisnici mogu da:
- Izaberu specifične oblasti pre pokretanja kviza
- Pokrenu kviz sa svim pitanjima (default)
- Vide koje su oblasti odabrane tokom kviza

## 📋 Koraci za aktiviranje feature-a

### 1. Dodaj `custom_category` kolonu u `quiz_questions` tabelu

Otvori **Supabase Dashboard → SQL Editor** i izvrši:

```sql
-- Dodaj custom_category kolonu
ALTER TABLE quiz_questions 
ADD COLUMN IF NOT EXISTS custom_category TEXT DEFAULT NULL;

-- Dodaj index za brže filtriranje
CREATE INDEX IF NOT EXISTS idx_quiz_questions_custom_category 
ON quiz_questions(custom_category) 
WHERE custom_category IS NOT NULL;
```

**Fajl:** `add-custom-category-column.sql`

### 2. Dodaj `selected_categories` kolonu u `quiz_state` tabelu

U istom SQL Editoru, izvrši:

```sql
-- Dodaj selected_categories kolonu u quiz_state
ALTER TABLE quiz_state 
ADD COLUMN IF NOT EXISTS selected_categories TEXT[] DEFAULT NULL;
```

**Fajl:** `add-quiz-categories-to-state.sql`

### 3. Dodaj custom kategorije postojećim pitanjima (opciono)

Idi na **Supabase Dashboard → Table Editor → quiz_questions** i:
- Otvori pitanje za izmenu
- Postavi `custom_category` vrednost (npr. "Istorija", "Geografija", "Sport", "Muzika")
- Sačuvaj

**Ili** koristi SQL:

```sql
-- Primer: Označi sva pitanja sa category='Istorija' kao custom_category='Istorija'
UPDATE quiz_questions 
SET custom_category = 'Istorija' 
WHERE category = 'Istorija';

-- Dodaj još kategorija po potrebi...
UPDATE quiz_questions 
SET custom_category = 'Geografija' 
WHERE category = 'Geografija';
```

## 🎮 Kako koristiti?

### Na Web Aplikaciji:

1. **Pokreni kviz sa svim pitanjima:**
   - Klikni na **"🚀 Pokreni Kviz (Sve)"**

2. **Pokreni kviz sa određenim oblastima:**
   - Klikni na **"📂 Izaberi Oblasti"**
   - Otvoriće se dropdown sa svim dostupnim kategorijama
   - Čekiraj oblasti koje želiš (ili "Sve oblasti")
   - Klikni **"🚀 Pokreni Kviz"**

3. **Restart kviza:**
   - Kada je kviz aktivan, vidiš dugme **"🔄 Restart"**
   - Restart će zadržati iste kategorije koje si odabrao

### Poruke bota:

Kada pokreneš kviz sa odabranim oblastima, bot će prikazati:

```
🎮 Kviz počinje! Pripremite se... 🎯
📂 **Oblasti:** Istorija, Geografija
```

## 📊 Arhitektura

### Nove kolone u bazi:

1. **`quiz_questions.custom_category`** (TEXT, NULL)
   - Čuva naziv oblasti za svako pitanje
   - `NULL` = pitanje nema specifičnu oblast (može biti u "sve oblasti" modu)

2. **`quiz_state.selected_categories`** (TEXT[], NULL)
   - Čuva listu trenutno aktivnih oblasti u kvizu
   - `NULL` = sve oblasti uključene
   - `[]` = nijedna oblast (kviz se neće pokrenuti)
   - `['Istorija', 'Sport']` = samo te oblasti

### Novi fajlovi:

- `components/CategorySelector.tsx` - UI komponenta za izbor kategorija
- `add-custom-category-column.sql` - SQL skripta za dodavanje kolone u pitanja
- `add-quiz-categories-to-state.sql` - SQL skripta za dodavanje kolone u quiz_state

### Izmenjeni fajlovi:

- `lib/supabase.ts`:
  - Dodata `getCustomCategories()` funkcija
  - Ažurirani `QuizQuestion` i `QuizState` tipovi

- `lib/quizBot.ts`:
  - `getRandomQuizQuestion()` filtrira pitanja po kategorijama
  - `startQuiz(selectedCategories)` prima kategorije kao parametar
  - `restartQuiz()` čuva odabrane kategorije pri restartu

- `components/ChatRoom.tsx`:
  - Integrisana `CategorySelector` komponenta
  - `handleStartQuiz()` prima kategorije

## 🔍 Primer workflow-a:

1. Admin dodaje pitanja u bazu i postavlja `custom_category`:
   ```
   ID: 1, Question: "Ko je Nikola Tesla?", custom_category: "Istorija"
   ID: 2, Question: "Glavni grad Srbije?", custom_category: "Geografija"
   ID: 3, Question: "Šta je 2+2?", custom_category: NULL
   ```

2. Korisnik klikne "📂 Izaberi Oblasti" i vidi:
   - ✓ Istorija
   - ✓ Geografija

3. Korisnik odabere samo "Istorija" i pokrene kviz

4. Bot će postavljati samo pitanja gde `custom_category = 'Istorija'`

5. Ako korisnik restartuje kviz, ostaju samo pitanja iz "Istorija"

## ⚠️ Napomene:

- Ako u bazi **nema pitanja sa custom_category**, prikazaće se samo jedno dugme "🚀 Pokreni Kviz"
- Ako nijedna kategorija nije odabrana, kviz koristi **SVA pitanja** (uključujući i NULL kategorije)
- Kategorije se **automatski sortiraju** abecedno u UI-u
- Pitanja koja imaju `remove_question = true` se **ne prikazuju** u kategorijama

## 🚀 Sledeći koraci (opciono):

- Dodaj više kategorija u postojeća pitanja
- Kreiraj nove oblasti (npr. "Nauka", "Film", "Video Igre")
- Koristi bulk update za masovno dodavanje kategorija:
  ```sql
  UPDATE quiz_questions 
  SET custom_category = 'Sport' 
  WHERE question LIKE '%fudbal%' OR question LIKE '%košarka%';
  ```

