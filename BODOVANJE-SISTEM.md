# 🏆 Sistem Bodovanja i Leaderboard

## 🎯 Kako Funkcioniše

### Bodovanje po Brzini

Ko **brže** odgovori, više poena osvaja:

| Vreme | Poeni | Emoji | Opis |
|-------|-------|-------|------|
| **0-10s** | 🏆 **3** | Zlatna medalja | Pre prvog hint-a |
| **10-20s** | 🥈 **2** | Srebrna medalja | Posle prvog, pre drugog hint-a |
| **20-30s** | 🥉 **1** | Bronzana medalja | Posle drugog hint-a |
| **30s+** | ❌ **0** | Nema poena | Vreme isteklo |

### Primer

```
[Pitanje se pojavljuje - Timer: 0s]

🤖 Bot: Koji je glavni grad Srbije?

[Ana odgovara posle 5 sekundi]
Ana: Beograd
🤖 Bot: 🎉 Tačno, Ana! 🏆 +3 poena! (5s)

[Sledeće pitanje]

🤖 Bot: Ko je napisao Na Drini ćuprija?
💡 Hint (20%): Iv__ An____

[Petar odgovara posle 12 sekundi]
Petar: Ivo Andric
🤖 Bot: 🎉 Tačno, Petar! 🥈 +2 poena! (12s)
```

---

## 📊 Leaderboard

### Kako Otvoriti

Klikni dugme **"🏆 Leaderboard"** u header-u aplikacije.

### Šta Prikazuje

Leaderboard prikazuje **Top 10 igrača** sa:

1. **Rang** - 🥇 🥈 🥉 ili #4, #5...
2. **Username**
3. **Ukupno poena** - Glavni bodovni zbroj
4. **Broj tačnih odgovora**
5. **Breakdown** - Koliko puta 🏆/🥈/🥉

### Dizajn

- **Prvi mesto** - Zlatni gradient + zlatna ivica
- **Drugi mesto** - Srebrni gradient + srebrna ivica
- **Treći mesto** - Bronzani gradient + bronzana ivica
- **Ostali** - Siva pozadina

### Modal

- **Backdrop** - Zatamljenje pozadine
- **Close** - Klik van modala ili na "×" dugme
- **Responsive** - Radi na mobilnim uređajima
- **Scroll** - Ako ima više od 10 igrača

---

## 💾 Baza Podataka

### user_scores Tabela

```sql
CREATE TABLE user_scores (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  total_points INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  three_point_answers INTEGER DEFAULT 0,
  two_point_answers INTEGER DEFAULT 0,
  one_point_answers INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE
);
```

### upsert_user_score Funkcija

Automatski ažurira ili kreira score za korisnika:

```sql
SELECT upsert_user_score('Ana', 3);
-- Ana već postoji? Dodaj 3 poena
-- Ana ne postoji? Kreiraj sa 3 poena
```

### Index za Performance

```sql
CREATE INDEX idx_user_scores_total_points 
  ON user_scores(total_points DESC);
```

Omogućava brze queries za leaderboard (ORDER BY total_points).

---

## 🎨 UI Komponente

### Leaderboard Button

```tsx
<button className="px-4 py-2 bg-yellow-500 text-white rounded-lg">
  🏆 Leaderboard
</button>
```

**Pozicija**: Header, desno od "Čet Soba"

### Leaderboard Modal

**Struktura:**
- Header (žuto-narandžasti gradient)
- Content (scrollable lista igrača)
- Footer (objašnjenje bodovanja)

**Features:**
- Backdrop click to close
- Escape key to close (može se dodati)
- Auto refresh kad se otvori
- Loading state

### Points Display u Chat-u

Kad neko odgovori:

```
🎉 Tačno, Ana! 🏆 +3 poena! (5s)
🎉 Tačno, Petar! 🥈 +2 poena! (12s)
🎉 Tačno, Marko! 🥉 +1 poen! (25s)
```

---

## 🔧 Logika

### calculatePoints()

```typescript
function calculatePoints(timeElapsed: number): number {
  if (timeElapsed <= 10) return 3;
  if (timeElapsed <= 20) return 2;
  if (timeElapsed <= 30) return 1;
  return 0;
}
```

### saveUserScore()

```typescript
async function saveUserScore(username: string, points: number) {
  await supabase.rpc('upsert_user_score', {
    p_username: username,
    p_points: points
  });
}
```

**Poziva se odmah nakon što je odgovor tačan!**

### getLeaderboard()

```typescript
export async function getLeaderboard(limit = 10) {
  const { data } = await supabase
    .from('user_scores')
    .select('*')
    .order('total_points', { ascending: false })
    .limit(limit);
  return data;
}
```

---

## 📈 Statistike

### Šta se Prati

Za svakog korisnika:
- ✅ **Total Points** - Ukupan broj poena
- ✅ **Correct Answers** - Broj tačnih odgovora
- ✅ **3-Point Answers** - Broj zlatnih medalja
- ✅ **2-Point Answers** - Broj srebrnih medalja
- ✅ **1-Point Answers** - Broj bronzanih medalja
- ✅ **Last Updated** - Poslednja aktivnost

### Moguće Ekstenzije

Možeš dodati:
- **Average Time** - Prosečno vreme odgovora
- **Streak** - Uzastopni tačni odgovori
- **Win Rate** - Procenat tačnih odgovora
- **Category Stats** - Najbolja kategorija
- **Daily/Weekly Leaderboards** - Lestvice po periodu

---

## 🎮 User Experience

### Flow za Igrača

```
1. Pokrene kviz
2. Vidi pitanje
3. Odgovori brzo (npr. 7s)
4. Dobije: "🎉 Tačno, Ana! 🏆 +3 poena!"
5. Klikne "🏆 Leaderboard"
6. Vidi da je sada #1 na lestvici! 🎊
7. Zatvori modal
8. Nastavi da igra da osvoji još poena
```

### Motivacija

- **Instant Feedback** - Odmah vidiš koliko si osvojio
- **Visual Rewards** - Emoji medalje
- **Competition** - Vidiš gde si u odnosu na druge
- **Progress Tracking** - Broj tačnih odgovora raste

---

## 🔐 Sigurnost

### RLS Policies

```sql
-- Svi mogu da čitaju
CREATE POLICY "User scores are viewable by everyone"
  ON user_scores FOR SELECT USING (true);

-- Svi mogu da insert-uju
CREATE POLICY "Anyone can insert scores"
  ON user_scores FOR INSERT WITH CHECK (true);

-- Svi mogu da update-uju
CREATE POLICY "Anyone can update scores"
  ON user_scores FOR UPDATE USING (true);
```

### Zašto Svi Mogu da Update-uju?

Funkcija `upsert_user_score` je server-side i kontroliše logiku:
- Samo dodaje poene, ne može da oduzme
- Koristi username kao unique constraint
- Timestamp pokazuje poslednju aktivnost

**Alternativa**: Kreirati Supabase Edge Function za još bolju sigurnost.

---

## 🐛 Edge Cases

### Dva Korisnika Sa Istim Imenom

**Ne može se desiti** - `username` je UNIQUE u tabeli.

Prvi koji unese ime ga "zauzme".

### Korisnik Promeni Ime

Poeni ostaju na **starom** username-u.

Ako korisnik ponovno igra sa novim imenom, **novi profil** se kreira.

### Reset Poena

Ručno iz Supabase:

```sql
DELETE FROM user_scores WHERE username = 'Ana';
-- ili
UPDATE user_scores SET total_points = 0 WHERE username = 'Ana';
```

Ili dodaj "Reset" funkcionalnost u UI (opciono).

---

## 📱 Mobile Responsive

Leaderboard modal radi odlično na mobilnim:
- **max-w-2xl** - Ograničena širina
- **p-4** - Padding za touch targets
- **max-h-[80vh]** - Ne zaklanja ceo ekran
- **overflow-y-auto** - Scroll ako treba

---

## 🎨 Customization

### Promena Bodova

U `lib/quizBot.ts`:

```typescript
function calculatePoints(timeElapsed: number): number {
  if (timeElapsed <= 10) return 5; // Bilo 3
  if (timeElapsed <= 20) return 3; // Bilo 2
  if (timeElapsed <= 30) return 1; // Ostalo 1
  return 0;
}
```

### Promena Limita Leaderboard-a

U `components/Leaderboard.tsx`:

```typescript
const data = await getLeaderboard(20); // Bilo 10
```

### Promena Boja

Top 3 igrača imaju custom gradient:

```tsx
bg-gradient-to-r from-yellow-50 to-orange-50  // 1st
bg-gradient-to-r from-gray-50 to-gray-100     // 2nd  
bg-gradient-to-r from-orange-50 to-orange-100 // 3rd
```

---

## 🔮 Buduće Ideje

1. **Real-time Leaderboard Updates** - Refresh automatski kad neko osvoji poene
2. **Achievements** - Bedževi za specijalne podvige
3. **Tournaments** - Vremenski ograničena takmičenja
4. **Team Mode** - Timski bodovi
5. **Prize System** - Nagrade za top igrače
6. **Stats Dashboard** - Detaljna statistika za svakog igrača
7. **Social Sharing** - Podeli svoj score na društvenim mrežama

---

**Uživaj u takmičenju! 🏆🎉**

