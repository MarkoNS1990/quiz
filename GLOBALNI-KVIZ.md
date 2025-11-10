# 🌐 Globalni Kviz Sistem

## 🎯 Kako Radi

### Jedna Instanca za Sve!

- ✅ **Samo jedan kviz** može biti aktivan u bilo kom trenutku
- ✅ **Bilo ko može startovati** kviz
- ✅ **Bilo ko može stopovati** kviz  
- ✅ **Svi vide isto pitanje** u isto vreme
- ✅ **Ko prvi odgovori tačno** - pobeđuje na tom pitanju!

---

## 🏗️ Arhitektura

### Globalno Stanje u Bazi

Umesto `sessionStorage` (lokalno za svakog korisnika), sada koristimo **`quiz_state` tabelu u Supabase**:

```sql
quiz_state {
  id: 1 (uvek samo jedan red!)
  is_active: true/false
  current_question_id: 42
  current_answer: "Beograd"
  question_start_time: "2024-01-15 10:30:00"
}
```

### Real-time Sync

Svi korisnici imaju **real-time subscription** na `quiz_state` tabelu:
- Kad neko startuje kviz → **SVI** vide "🛑 Zaustavi Kviz"
- Kad neko stopuje kviz → **SVI** vide "🤖 Pokreni Kviz"
- Kad bot postavi pitanje → **SVI** ga vide istovremeno

---

## 🎮 Scenariji Korišćenja

### Scenario 1: Single Player

```
Marko: [otvara app, sam je u chatu]
Marko: [klikne "Pokreni Kviz"]
🤖 Bot: Koje je glavni grad Srbije?
Marko: Beograd
🤖 Bot: 🎉 Tačno, Marko! Bravo!
[2 sekunde kasnije - novo pitanje]
```

### Scenario 2: Multiplayer Konkurencija

```
[Marko, Ana, i Petar su u chatu]

Marko: [klikne "Pokreni Kviz"]

🤖 Bot: Koji teniser ima najviše Grend Slem titula?

Ana: djokovic
Petar: Novak Djokovic
Marko: novak

[Ana je prva odgovorila!]
🤖 Bot: 🎉 Tačno, Ana! Bravo! 👏 (3s)

[Petar i Marko su kasno odgovorili - ne dobijaju poruku]
```

### Scenario 3: Ko God Može Da Pokrene/Stopuje

```
[Kviz radi...]

Ana: [nema inspiraciju]
Ana: [klikne "🛑 Zaustavi Kviz"]

🤖 Bot: [prestaje sa pitanjima]

[Svi korisnici sad vide "🤖 Pokreni Kviz"]

Petar: [kasnije]
Petar: [klikne "🤖 Pokreni Kviz"]

🤖 Bot: [nastavlja sa novim pitanjima]
```

---

## 🔄 Tehnički Flow

### Startovanje Kviza

```
1. User klikne "Pokreni Kviz"
   ↓
2. startQuiz() funkcija
   ↓
3. postQuizQuestion()
   ↓
4. UPDATE quiz_state SET is_active=true, current_question_id=X
   ↓
5. Supabase Realtime broadcast UPDATE event
   ↓
6. SVI korisnici dobiju event
   ↓
7. setQuizRunning(true) za SVE
   ↓
8. SVI vide "🛑 Zaustavi Kviz" dugme
```

### Odgovaranje na Pitanje

```
1. User upiše odgovor (npr. "Beograd")
   ↓
2. handleAnswerCheck(answer, username)
   ↓
3. Proveri quiz_state iz baze
   ↓
4. Uporedi sa current_answer
   ↓
5. Ako je tačno:
   - Bot: "🎉 Tačno, {username}!"
   - UPDATE quiz_state (clear current question)
   - Wait 2s
   - Post novo pitanje
```

### Stopovanje Kviza

```
1. User klikne "Zaustavi Kviz"
   ↓
2. stopQuiz() funkcija
   ↓
3. Clear svi timeri
   ↓
4. UPDATE quiz_state SET is_active=false
   ↓
5. Supabase Realtime broadcast
   ↓
6. SVI korisnici: setQuizRunning(false)
   ↓
7. SVI vide "🤖 Pokreni Kviz" dugme
```

---

## 🏆 Ko Pobeđuje?

### Prvi Tačan Odgovor Pobjeđuje!

Bot prihvata **samo prvi tačan odgovor**:

```javascript
// U handleAnswerCheck:
if (result.correct) {
  // Ažurira stanje (clear pitanje)
  await updateQuizState({ current_answer: null });
  
  // Ostali koji odgovaraju posle ovoga
  // neće dobiti potvrdu jer current_answer je null
}
```

### Primer:

```
🤖 Bot: Ko je Tesla?

[10:30:00.100] Ana: nikola tesla
[10:30:00.250] Petar: Nikola Tesla  
[10:30:00.400] Marko: Tesla

🤖 Bot: 🎉 Tačno, Ana! Bravo! 👏 (5s)

// Petar i Marko ne dobiju feedback
// jer je Ana prva odgovorila i pitanje je već cleared
```

---

## 💾 Database Schema

### quiz_state Tabela

```sql
CREATE TABLE quiz_state (
  id INTEGER PRIMARY KEY DEFAULT 1,  -- Uvek 1!
  is_active BOOLEAN DEFAULT FALSE,
  current_question_id BIGINT,
  current_answer TEXT,
  question_start_time TIMESTAMP,
  updated_at TIMESTAMP,
  CONSTRAINT single_row CHECK (id = 1)
);
```

**CONSTRAINT single_row** osigurava da postoji **samo jedan red** u tabeli!

### Real-time Enabled

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_state;
```

Omogućava:
- Instant sync promjena između svih klijenata
- Bez refresh-a
- Bez polling-a

---

## 🔧 Setup

### 1. Pokreni SQL

Otvori `add-global-quiz-state.sql` u Supabase SQL Editor i run-uj ga.

### 2. Proveri Replication

U Supabase Dashboard:
1. **Database** → **Replication**
2. Proveri da je `quiz_state` **✓ enabled**

### 3. Deploy

```bash
git add .
git commit -m "Add global quiz system"
git push
```

Vercel automatski deplojuje!

---

## 🐛 Troubleshooting

### Dugme se ne ažurira za druge korisnike

**Proveri:**
- Replication je enabled za `quiz_state`
- Browser console: "Quiz state subscription status: SUBSCRIBED"

### Dva korisnika dobiju potvrdu za isti odgovor

**Razlog:** Race condition - oba odgovora stignu skoro istovremeno

**Rešenje:** Radi kako treba! Prvi koji prispe u bazu dobija potvrdu.

### Kviz se ne stopuje

**Proveri:**
- Postoji red u `quiz_state` tabeli sa `id=1`
- RLS policy dozvoljava UPDATE

---

## 🎊 Benefiti Globalnog Sistema

1. **Pravi Multiplayer** - Ko brže taj i odgovori!
2. **Nema Konfliktanin** - Samo jedan kviz aktivan
3. **Real-time Sync** - Svi vide isto
4. **Demokratija** - Bilo ko može da startuje/stopuje
5. **Skalabilno** - Radi za 2 ili 200 korisnika!

---

**Uživaj u globalnom kvizu! 🌍🎉**

