# Nove Izmene Kviza

## Šta je novo?

### 1. ⏰ Automatsko zaustavljanje kviza posle 5 minuta neaktivnosti

Kviz se sada **automatski zaustavlja** ako niko ne šalje poruke 5 minuta.

**Kako radi:**
- Svaki put kada neko pošalje poruku (bilo koji korisnik), tajmer se resetuje
- Ako 5 minuta prođe bez ikakve aktivnosti, kviz se automatski zaustavlja
- Bot šalje poruku: "⏰ Kviz je zaustavljen zbog neaktivnosti (5 minuta)"

**Napomena:** Ovo znači da aktivni chat čuva kviz aktivnim - čak i ako korisnici pričaju o drugim stvarima!

---

### 2. 🔒 Korisnici više ne mogu da zaustave kviz

Uklonili smo dugme "🛑 Zaustavi Kviz". 

**Razlog:** Samo inaktivnost (5 minuta) može da zaustavi kviz automatski.

**Šta korisnici vide:**
- Dugme "🤖 Pokreni Kviz" - kada kviz nije aktivan
- Dugme "🎮 Kviz Aktivan" (disabled/sivo) - kada je kviz u toku

---

### 3. 🚩 Označavanje "glupih" pitanja

Korisnici sada mogu da prijave pitanja koja smatraju lošim, netačnim ili konfuznim.

**Kako radi:**

1. Kada bot postavi pitanje (sa 📚 emoji-jem), pojavi se dugme **"🚩 Glupo pitanje"** ispod pitanja
2. Korisnik klikne na dugme
3. Pitanje se označava u bazi podataka
4. Ti možeš pregledati označena pitanja u Supabase database-u

**Gde se čuvaju flagged pitanja?**

U tabeli `quiz_questions`, kolona `remove_question`:
- `false` (default) - normalno pitanje
- `true` - označeno kao loše

**Kako pregledati označena pitanja:**

U Supabase SQL Editor:
```sql
-- Sva označena pitanja
SELECT * FROM quiz_questions 
WHERE remove_question = true;

-- Prebrojavanje označenih pitanja
SELECT COUNT(*) FROM quiz_questions 
WHERE remove_question = true;
```

**Brisanje označenih pitanja (ručno):**
```sql
-- Obriši sva pitanja označena kao loša
DELETE FROM quiz_questions 
WHERE remove_question = true;

-- Ili resetuj flag umesto brisanja
UPDATE quiz_questions 
SET remove_question = false 
WHERE remove_question = true;
```

---

## Setup Instrukcije

### Korak 1: Pokrenite SQL migraciju

Idite na **Supabase SQL Editor** i pokrenite:

```sql
-- Add remove_question column to quiz_questions table
ALTER TABLE quiz_questions 
ADD COLUMN IF NOT EXISTS remove_question BOOLEAN DEFAULT FALSE;

-- Create index for filtering out flagged questions
CREATE INDEX IF NOT EXISTS idx_quiz_questions_remove_question 
ON quiz_questions(remove_question) 
WHERE remove_question = FALSE;

-- Add RLS policy to allow anyone to update the remove_question field
CREATE POLICY IF NOT EXISTS "Anyone can flag questions for removal"
  ON quiz_questions FOR UPDATE
  USING (true)
  WITH CHECK (true);
```

Ili samo kopirajte sadržaj fajla `add-remove-question-column.sql` i pokrenite ga.

### Korak 2: Deploy izmene

```bash
# Commit i push kod
git add .
git commit -m "Add auto-stop quiz and flag question features"
git push

# Ako ste na Vercel, automatski će se deploy-ovati
# Ako ne, pokrenite build i deploy ručno
```

### Korak 3: Testirajte

1. **Test automatskog zaustavljanja:**
   - Pokrenite kviz
   - Ne šaljite poruke 5 minuta
   - Kviz bi trebao da se automatski zaustavi

2. **Test flag dugmeta:**
   - Pokrenite kviz
   - Kada se pojavi pitanje, kliknite "🚩 Glupo pitanje"
   - Proverite u bazi: `SELECT * FROM quiz_questions WHERE remove_question = true;`

---

## Dodatne Opcije

### Promena vremena neaktivnosti

Ako želite da promenite vreme sa 5 minuta na nešto drugo:

**U fajlu `lib/quizBot.ts`**, linija ~405:

```typescript
// Promenite 5 u željeni broj minuta
}, 5 * 60 * 1000); // 5 minutes
```

Primeri:
- `3 * 60 * 1000` - 3 minuta
- `10 * 60 * 1000` - 10 minuta
- `1 * 60 * 1000` - 1 minut (za testiranje)

### Automatsko filtriranje označenih pitanja

Ako ne želite da se označena pitanja više pojavljuju u kvizu, ažurirajte `getRandomQuizQuestion` funkciju:

**U `lib/quizBot.ts`**, linija ~70:

```typescript
const { data, error } = await supabase
  .from('quiz_questions')
  .select('*')
  .eq('remove_question', false) // Dodaj ovu liniju
  .order('id', { ascending: true });
```

### Brisanje starih flagged pitanja automatski

Možete kreirati cron job (na Pro planu) da briše stara označena pitanja:

```sql
-- Brisanje pitanja koja su označena više od 30 dana
CREATE OR REPLACE FUNCTION cleanup_flagged_questions()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM quiz_questions
  WHERE remove_question = true 
  AND created_at < NOW() - INTERVAL '30 days';
END;
$$;
```

---

## Tehnički Detalji

### Izmenjeni fajlovi:

1. **`lib/quizBot.ts`**
   - Promena inactivity timer-a sa 3 na 5 minuta
   - Ažuriranje stop poruke

2. **`lib/supabase.ts`**
   - Dodavanje `remove_question` u `QuizQuestion` tip
   - Nova funkcija `flagQuestionForRemoval()`

3. **`components/ChatRoom.tsx`**
   - Uklanjanje stop dugmeta
   - Dodavanje disabled stanja na start dugme
   - Praćenje `currentQuestionId` u state-u
   - Dodavanje "🚩 Glupo pitanje" dugmeta u prikaz pitanja

4. **SQL migracije:**
   - `add-remove-question-column.sql` - nova kolona i policy

---

## FAQ

**P: Šta ako korisnik označi pitanje greškom?**  
O: Možete ručno resetovati flag u bazi:
```sql
UPDATE quiz_questions 
SET remove_question = false 
WHERE id = [ID_PITANJA];
```

**P: Da li označena pitanja i dalje izlaze u kvizu?**  
O: Da, trenutno. Ako želite da ih filtrirate, sledite uputstvo u "Automatsko filtriranje označenih pitanja" sekciji iznad.

**P: Koliko često proveravati označena pitanja?**  
O: Preporučujemo jednom nedeljno. Pregledajte ih i odlučite da li da ih obrišete ili popravite.

**P: Može li admin da zaustavi kviz?**  
O: Trenutno ne postoji dugme za to. Ako je hitno potrebno, možete:
1. Ručno u Supabase: `UPDATE quiz_state SET is_active = false WHERE id = 1;`
2. Ili sačekati 5 minuta neaktivnosti

**P: Mogu li da vidim ko je označio pitanje?**  
O: Ne, trenutno samo vidite da je pitanje označeno. Ako vam je to potrebno, možete dodati `flagged_by` kolonu.

---

## Dodatak: Dodavanje flagged_by kolone (opciono)

Ako želite da znate KO je označio pitanje:

```sql
-- Dodaj kolonu koja čuva username korisnika koji je flagovao
ALTER TABLE quiz_questions 
ADD COLUMN flagged_by TEXT NULL;

-- Update funkciju u lib/supabase.ts
export async function flagQuestionForRemoval(questionId: number, username: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('quiz_questions')
      .update({ 
        remove_question: true,
        flagged_by: username  // Dodaj ovo
      })
      .eq('id', questionId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error flagging question:', error);
    return false;
  }
}
```

Zatim u `ChatRoom.tsx` promenite:
```typescript
handleFlagQuestion(currentQuestionId, username)  // Dodaj username parametar
```

