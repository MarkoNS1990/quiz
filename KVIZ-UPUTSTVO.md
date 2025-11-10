# 🤖 Kviz Bot - Uputstvo

Kompletan vodič za novi sistem kviza sa slobodnim odgovorima!

## 🎯 Šta je Novo?

### Slobodni Odgovori
- ❌ **Više nema A/B/C/D** opcija
- ✅ **Upiši tačan odgovor** direktno u čet
- 🎯 Sistem automatski prepoznaje tačan odgovor

### Sistem Hintova
KvizBot automatski pomaže sa hintovima:

1. **20 sekundi** - Otkriva 20% slova odgovora
   - Primer: `B______`
   
2. **40 sekundi** - Otkriva 50% slova odgovora
   - Primer: `Beogr__`
   
3. **60 sekundi** - Automatski prikazuje tačan odgovor i prelazi na sledeće pitanje

### Prepoznavanje Srpskih Karaktera
Bot razume i ćirilicu i latinicu:
- `C` = `Č` = `Ć`
- `S` = `Š`
- `Z` = `Ž`
- `D` = `Đ`

**Primeri:**
- Možeš pisati: `Novak Djokovic` ili `Novak Đoković` ✅
- Možeš pisati: `cevapi` ili `ćevapi` ✅
- Možeš pisati: `Sumarice` ili `Šumarice` ✅

## 🚀 Kako Koristiti

### 1. Pokreni Kviz
Klikni na dugme **"🤖 Pokreni Kviz"**

Bot će postaviti prvo pitanje:

```
📚 Geografija (lako)

Koji je glavni grad Srbije?

💡 Hint: Grad na ušću Save i Dunava

Napiši tačan odgovor! ✍️
```

### 2. Odgovori
Samo upiši odgovor u čet:
- `Beograd` ✅
- `beograd` ✅
- `BEOGRAD` ✅
- `Belgrade` ❌

### 3. Dobij Feedback
Bot će odgovoriti:
- 🎉 **Tačno!** - Prelazi na sledeće pitanje za 2 sekunde
- 🤔 **Blizu si!** - Pokušaj ponovo (ako si 40-70% blizu)
- 💡 **Hintovi** - Automatski nakon 20s i 40s

### 4. Zaustavi Kviz
Klikni **"🛑 Zaustavi Kviz"** kad želiš da prestaneš

## 📚 Kategorije Pitanja

Trenutno ima 30+ pitanja u sledećim kategorijama:

- 🌍 **Geografija** - Gradovi, reke, planine
- 📜 **Istorija** - Vladari, datumi, događaji
- 🎨 **Kultura** - Književnost, umetnost, muzika
- ⚽ **Sport** - Sportisti, klubovi, dostignuća
- 🍽️ **Hrana** - Tradicionalna jela i pića
- 🌲 **Priroda** - Nacionalni parkovi, reke, planine
- 🗣️ **Jezik** - Pravopis, gramatika, reforma
- 🎬 **Zabava** - Film, muzika, moderna kultura

## 🎨 Boje Poruka

Bot koristi različite boje za različite poruke:

| Tip Poruke | Boja | Opis |
|------------|------|------|
| Pitanje | 💜 Purple-Pink | Normalna pitanja |
| Hint | 💛 Yellow-Orange | Hintovi (20%, 50%) |
| Vreme isteklo | ❤️ Red-Pink | Kada prodje 60 sekundi |
| Tačno | 💜 Purple-Pink | Potvrda tačnog odgovora |

## 🧠 Kako Radi Prepoznavanje?

### 1. Normalizacija Teksta
Bot pretvara sve odgovore u isti format:
- Mala slova
- Bez dijakritika (č→c, ć→c, š→s, ž→z, đ→d)
- Bez specijalnih karaktera

### 2. Tri Nivoa Poređenja

**100% Tačno** - Identičan odgovor
```
Pitanje: Koji je glavni grad Srbije?
Odgovor: Beograd ✅
```

**90% Tačno** - Sadrži tačan odgovor
```
Pitanje: Ko je napisao Na Drini ćuprija?
Odgovor: Ivo Andric ✅
Odgovor: Andric ✅
```

**70%+ Tačno** - Većina reči se poklapa
```
Pitanje: Koja je najpoznatija srpska rakija?
Odgovor: sljivovica ✅
Odgovor: sljiva ✅ (blizu)
```

### 3. Feedback

- **70%+** → Tačno! 🎉
- **40-70%** → Blizu si! 🤔
- **<40%** → Bez odgovora (pokušaj opet)

## ⚙️ Tehnički Detalji

### Timer System

```
t=0s   - Pitanje se pojavljuje
t=20s  - Prvi nagoveštaj (20% slova)
t=40s  - Drugi nagoveštaj (50% slova)
t=60s  - Vreme isteklo, prikaži odgovor, sledeće pitanje
```

### SessionStorage

Bot koristi sessionStorage za praćenje:
- `currentQuizAnswer` - Tačan odgovor
- `currentQuizId` - ID pitanja
- `quizActive` - Da li je kviz aktivan
- `questionStartTime` - Vreme početka pitanja

### Automatsko Nastavljanje

Dok je kviz aktivan, bot automatski:
1. Čeka 2 sekunde nakon tačnog odgovora
2. Postavlja novo pitanje
3. Ponavlja proces

## 📝 Dodavanje Novih Pitanja

### Direktno u Supabase

1. Idi na **Table Editor** → `quiz_questions`
2. Klikni **Insert row**
3. Popuni polja:

```
question: "Koji grad se zove srpska Atina?"
answer: "Novi Sad"
hint: "Glavni grad Vojvodine"
category: "Geografija"
difficulty: "srednje"
```

### Putem SQL-a

```sql
INSERT INTO quiz_questions (question, answer, hint, category, difficulty) 
VALUES 
('Koji je najveći grad na svetu?', 'Tokio', 'Glavni grad Japana', 'Geografija', 'srednje');
```

## 🎮 Primeri Igranja

### Primer 1: Brz Odgovor

```
🤖 Kviz Bot:
📚 Sport (lako)
Koji teniser je osvojio najviše Grend Slem titula?
Napiši tačan odgovor! ✍️

Marko: Novak Djokovic

🤖 Kviz Bot: 🎉 Tačno, Marko! Bravo! 👏 (3s)
```

### Primer 2: Sa Hintovima

```
🤖 Kviz Bot:
📚 Kultura (teško)
Ko je kompozovao Tamo daleko?
Napiši tačan odgovor! ✍️

[20 sekundi prolazi]

🤖 Kviz Bot: 💡 Hint (20%): Dj______ Ma________

[20 sekundi prolazi]

🤖 Kviz Bot: 💡 Hint (50%): Djordj_____ Marinko___

Petar: Djordje Marinkovic

🤖 Kviz Bot: 🎉 Tačno, Petar! Bravo! 👏 (45s)
```

### Primer 3: Vreme Isteklo

```
🤖 Kviz Bot:
📚 Istorija (teško)
U kojoj godini je Srbija postala nezavisna od Turske?
Napiši tačan odgovor! ✍️

[60 sekundi prolazi]

🤖 Kviz Bot: ⏰ Vreme je isteklo! Tačan odgovor je: **1878**

[2 sekunde kasnije - novo pitanje]
```

## 🐛 Troubleshooting

### Bot ne reaguje na odgovore

**Proveri:**
- Da li je kviz aktivan? (dugme treba da kaže "Zaustavi Kviz")
- Osvežii stranicu (Ctrl+Shift+R)
- Proveri browser console (F12) za greške

### Hintovi se ne pojavljuju

**Proveri:**
- Pitanje mora biti aktivno (manje od 60s)
- Proveri da li timer radi u konzoli
- Možda si odgovorio pre nego što se timer aktivirao

### Bot prihvata pogrešne odgovore

**Razlog:**
- Sistem je namerno fleksibilan
- Prihvata varijacije (70% poklapanje)
- Ignoriše dijakritike za lakše kucanje

## 💡 Saveti za Igru

1. **Brzo razmišljaj** - Imaš 60 sekundi
2. **Koristi hintove** - Pomažu posle 20s
3. **Ne brini za pravopis** - Bot razume varijacije
4. **Igraju i drugi** - Ko prvi odgovori!
5. **Ne gubi vreme** - Posle 60s automatski prelazi

## 🔮 Buduće Funkcije (Ideje)

- 🏆 Leaderboard sistem
- ⚡ Streak brojač (uzastopni tačni odgovori)
- 🎁 Bonus pitanja za bonus poene
- 👥 Tim mod (timski kviz)
- 🎲 Random kategorija mod
- 🔥 Speed round (kraći tajmeri)

---

**Srećno igranje! 🎉**

