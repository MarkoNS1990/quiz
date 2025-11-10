# 👥 Online Korisnici - Modal Dugme

## 📝 Šta je Dodato

Umesto sidebar-a koji je zauzimao previše prostora, sada se online korisnici prikazuju kroz dugme i modal popup.

## ✨ Nove Funkcionalnosti

### Dugme u Header-u

- **Pozicija**: Header pored Leaderboard dugmeta
- **Tekst**: "👥 3 korisnika" (dinamički broj)
- **Boja**: Zelena (`bg-green-500`)
- **Funkcija**: Otvara modal sa listom

### Modal Popup

- **Prikaz**: Centriran modal (w-80, zaokruženi uglovi)
- **Header**: Gradient indigo-purple sa brojem korisnika
- **Lista**: 
  - Avatar sa inicijalom
  - Zeleni status indicator (online)
  - Highlight za trenutnog korisnika (indigo pozadina, "Vi")
- **Zatvaranje**: X dugme ili klik na backdrop

## 🔧 Tehničke Izmene

### `components/OnlineUsers.tsx`
- Promenjeno iz sidebar komponente u modal komponentu
- Dodati props: `isOpen`, `onClose`, `onCountChange`
- Modal sa backdrop-om za zatvaranje
- Notifikacija parent komponente o broju online korisnika

### `components/ChatRoom.tsx`
- Dodati state: `showOnlineUsers`, `onlineCount`
- Novo dugme u header-u za prikaz online korisnika
- Vraćeno `max-w-6xl` → `max-w-4xl` (više prostora za chat)
- Uklonjen sidebar iz layout-a

## 📦 Struktura

```tsx
// Parent Component (ChatRoom.tsx)
const [showOnlineUsers, setShowOnlineUsers] = useState(false);
const [onlineCount, setOnlineCount] = useState(0);

// Dugme u header-u
<button onClick={() => setShowOnlineUsers(true)}>
  👥 {onlineCount} korisnika
</button>

// Modal komponenta
<OnlineUsers
  currentUsername={username}
  isOpen={showOnlineUsers}
  onClose={() => setShowOnlineUsers(false)}
  onCountChange={setOnlineCount}
/>
```

## 🎨 Dizajn

### Dugme
- Zelena boja (`bg-green-500`)
- Hover: `bg-green-600`
- Font: Semibold
- Flex layout sa icon-om i tekstom

### Modal
- Širina: 320px (w-80)
- Max visina: 80vh
- Backdrop: Crni sa 50% opacity
- Shadow: `shadow-2xl`
- Zaokruženi uglovi: `rounded-2xl`

### Avatar
- Veličina: 40px (w-10 h-10)
- Boja: Indigo za trenutnog korisnika, purple-pink gradient za druge
- Status dot: Zeleni (w-3 h-3) sa white border

## 🚀 Kako Radi

1. **Presence Tracking**:
   - Supabase Realtime Presence
   - Channel: `online-users`
   - Automatski track/untrack pri mount/unmount

2. **Count Update**:
   - `onCountChange` callback prosleđuje broj korisnika parent-u
   - Parent ažurira dugme sa aktuelnim brojem

3. **Real-time Sync**:
   - Presence event: `sync`
   - Automatsko ažuriranje liste pri promeni
   - Sortiranje abecednim redom

## 📊 Prednosti u odnosu na Sidebar

✅ **Više prostora** - Chat sada zauzima punu širinu
✅ **Bolja mobilna podrška** - Modal se lepo prilagođava malim ekranima
✅ **Vizualni fokus** - Modal privlači pažnju kada je potrebno
✅ **Brojač na prvi pogled** - Odmah vidiš koliko je korisnika online bez otvaranja liste

## 🔄 Commit

```bash
git commit -m "Replace online users sidebar with button and modal popup"
```

Pushed to: `main`

---

**Implementirano**: 10. Nov 2025  
**Razlog**: Sidebar zauzimao previše prostora
**Rešenje**: Modal popup sa dugmetom u header-u

