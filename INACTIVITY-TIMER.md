# ⏰ Auto-Stop Timer za Kviz

## 🎯 Funkcionalnost

Kviz se **automatski zaustavlja** ako niko ne piše **3 minuta**.

---

## 🔄 Kako Radi

### Timer Reset na Svaku Poruku

```
User šalje poruku
   ↓
resetInactivityTimer() se poziva
   ↓
Clear postojeći timer
   ↓
Start novi 3-minutni timer
   ↓
Ako niko ne piše 3 minute
   ↓
🤖 Bot: "⏰ Kviz je zaustavljen zbog neaktivnosti (3 minute)"
   ↓
stopQuiz() se poziva automatski
```

### Scenario 1: Aktivni Chat

```
10:00 - Kviz startuje
10:01 - Ana odgovara → Timer resetovan na 13:01
10:02 - Petar odgovara → Timer resetovan na 13:02
10:03 - Marko odgovara → Timer resetovan na 13:03
... (nastavlja se)
```

Kviz **nikad ne stopuje** jer su korisnici aktivni!

### Scenario 2: Neaktivan Chat

```
10:00 - Kviz startuje → Timer: 13:00
10:01 - Ana odgovara → Timer: 13:01
[... tišina ...]
13:01 - TIMEOUT! 
🤖 Bot: "⏰ Kviz je zaustavljen zbog neaktivnosti"
Kviz se stopuje automatski
```

---

## 🎨 Floating Button

### Uvek Vidljiv

Dugme za kviz je sada **fixed position** u donjem desnom uglu:

- 📍 **Position**: `fixed bottom-24 right-4`
- ✨ **Shadow**: `shadow-2xl`
- 🎭 **Hover Effect**: Scale 1.1x
- 💫 **Animation**: Pulse za "Zaustavi Kviz"

### Zašto Fixed Position?

1. **Uvek dostupan** - Ne mora da scroll-uješ gore
2. **Ne zaklanja chat** - U uglu, ne smeta
3. **Vizuelno istaknuto** - Lako ga pronađeš
4. **Mobile friendly** - Radi i na telefonu

---

## 🔧 Konfiguracija

### Promena Timeout Vremena

U `lib/quizBot.ts`:

```typescript
// Trenutno: 3 minuta
inactivityTimer = setTimeout(async () => {
  // ...
}, 3 * 60 * 1000);

// Za 5 minuta promeni na:
}, 5 * 60 * 1000);

// Za 1 minut:
}, 1 * 60 * 1000);
```

---

## 📊 Kada se Timer Reset-uje?

Timer se **resetuje** na svaku korisničku poruku:

✅ **Reset-uje se:**
- User šalje bilo koju poruku
- User odgovara na pitanje
- User upisuje random text

❌ **NE reset-uje se:**
- Bot šalje poruku
- Bot postavlja pitanje
- Bot šalje hint
- Bot javlja vreme isteklo

---

## 💡 Dodatne Opcije

### Notifikacija Pre Stopa

Možeš dodati warning 30 sekundi pre:

```typescript
// Warning timer - 2.5 minuta
setTimeout(async () => {
  await postBotMessage('⚠️ Kviz će se zaustaviti za 30 sekundi zbog neaktivnosti!');
}, 2.5 * 60 * 1000);

// Actual stop - 3 minuta
setTimeout(async () => {
  await postBotMessage('⏰ Kviz je zaustavljen zbog neaktivnosti.');
  await stopQuiz();
}, 3 * 60 * 1000);
```

### Disable Timer za Admin

```typescript
export function resetInactivityTimer(isAdmin: boolean = false): void {
  if (isAdmin) return; // Admin bypass
  
  // ... rest of code
}
```

---

## 🎮 UI Dizajn

### Floating Button Styles

```css
/* Fixed position - uvek na istom mestu */
position: fixed;
bottom: 6rem;  /* 24 * 0.25rem = 6rem */
right: 1rem;   /* 4 * 0.25rem = 1rem */
z-index: 50;   /* Iznad svega */

/* Shadow za dubinu */
box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* Hover animation */
transform: scale(1.1);
transition: all 0.2s;
```

### Mobile Responsive

Button automatski radi na mobilnim:
- Touch friendly (dovoljno veliki)
- Ne zaklanja input field (24 = 6rem razmaka)
- Shadow je vidljiv na malim ekranima

---

## 🐛 Edge Cases

### Šta ako korisnik brzo refresh-uje?

Timer se **restartuje** jer se komponenta unmount/mount.

### Šta ako dva korisnika pišu istovremeno?

Timer se **resetuje na svaku poruku**, tako da radi kako treba.

### Šta ako bot sam sebi odgovara?

Bot poruke **NE reset-uju timer** - samo user poruke!

---

## 📈 Metrike (Opciono)

Možeš trackirati koliko često se kviz auto-stopuje:

```typescript
let autoStopCount = 0;

inactivityTimer = setTimeout(async () => {
  autoStopCount++;
  console.log(`Auto-stop #${autoStopCount}`);
  // ...
}, 3 * 60 * 1000);
```

---

**Kviz je sad pametniji! 🧠⏰**

