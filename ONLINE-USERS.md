# 👥 Online Korisnici - Sidebar

## 🎯 Funkcionalnost

Sidebar sa desne strane prikazuje **listu aktivnih korisnika** u real-time!

---

## ✨ Features

### Real-time Presence

Koristi **Supabase Realtime Presence** API:
- Automatski trackuje ko je online
- Instant update kad neko uđe/izađe
- Bez database queries - sve u memoriji
- WebSocket connection

### Šta Prikazuje

- **Broj korisnika** - "3 korisnika"
- **Lista sa avatar-ima** - Inicijal korisnika
- **Status indikator** - Zelena tačka (online)
- **"Vi" marker** - Highligh za trenutnog korisnika
- **Sorted by name** - Abecednim redom

---

## 🎨 Dizajn

### Dimenzije

- **Širina**: `w-48` (192px / 12rem)
- **Pozicija**: Desna strana, pored chat-a
- **Max container**: `max-w-6xl` (povećano sa 4xl)

### Boje i Stilovi

**Header:**
- Gradient pozadina: `from-indigo-50 to-purple-50`
- Animate pulse zelena tačka
- Broj korisnika ispod naslova

**User Item:**
- **Trenutni korisnik**: Indigo pozadina + border
- **Ostali**: Hover effect
- **Avatar**: Gradient (purple-pink) ili indigo za trenutnog
- **Status**: Zelena tačka dole desno

**Footer:**
- Siva pozadina
- "💬 Real-time chat" tekst

---

## 🔧 Kako Radi

### Supabase Presence

```typescript
const channel = supabase.channel('online-users');

// Subscribe to presence events
channel.on('presence', { event: 'sync' }, () => {
  const state = channel.presenceState();
  // Extract users from state
});

// Track current user
await channel.track({
  username: currentUsername,
  online_at: new Date().toISOString(),
});
```

### Flow

```
1. Component mount
   ↓
2. Subscribe to 'online-users' channel
   ↓
3. Track current user (channel.track())
   ↓
4. Listen for 'sync' events
   ↓
5. Update list on every sync
   ↓
6. Component unmount → untrack & cleanup
```

### Auto Cleanup

Kad korisnik zatvori tab ili refresh-uje:
- Supabase automatski **uklanja** iz presence
- Ostali korisnici vide update **odmah**
- Bez manual cleanup logike!

---

## 👤 User Card Komponenta

```tsx
<div className="flex items-center gap-2 p-2 rounded-lg">
  {/* Avatar */}
  <div className="relative">
    <div className="w-8 h-8 rounded-full bg-gradient">
      {username.charAt(0).toUpperCase()}
    </div>
    {/* Green status dot */}
    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full" />
  </div>

  {/* Username */}
  <div className="text-sm font-medium truncate">
    {username}
  </div>
</div>
```

---

## 📱 Responsive

### Desktop (>1024px)

- Sidebar vidljiv sa desne strane
- Chat + Sidebar zajedno

### Mobile (<1024px)

Sidebar možeš sakriti na mobilnim:

```tsx
<OnlineUsers 
  currentUsername={username}
  className="hidden lg:flex" 
/>
```

Ili dodaj toggle button za show/hide.

---

## 🎭 Animacije

### Pulse na Status Dot

```tsx
<span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
```

### Hover Effects

```tsx
hover:bg-gray-50  // Na user item-u
```

### Highlight za Trenutnog Korisnika

```tsx
bg-indigo-100 border border-indigo-300
```

---

## 🔄 Real-time Updates

### Scenario 1: Neko Uđe

```
Ana otvara chat
   ↓
Ana.track() se poziva
   ↓
Presence sync event
   ↓
Svi korisnici vide: "Ana je online" ✅
```

### Scenario 2: Neko Izađe

```
Petar zatvara tab
   ↓
Supabase automatski untrack
   ↓
Presence sync event
   ↓
Svi vide: "Petar je offline" ❌
```

### Scenario 3: Refresh

```
Marko refresh-uje stranicu
   ↓
Trenutno se untrack-uje
   ↓
Nova konekcija sa istim username-om
   ↓
Ostali korisnici vide Marka non-stop online ✅
```

---

## 🐛 Edge Cases

### Duplikat Username-a

**Ne može se desiti** jer:
- Username je unique u chatu
- localStorage čuva username
- Dva tab-a sa istim username-om → prikazuje se samo jednom

### Korisnik Ostavi Tab Otvoren

**Presence ostaje aktivan** sve dok je tab otvoren:
- WebSocket connection je živa
- Čak i ako ne piše ništa
- Prikazuje se kao "online"

### Network Disconnect

Supabase automatski:
- Detektuje disconnect
- Uklanja iz presence
- Reconnect kad se network vrati

---

## 💡 Ekstenzije

### 1. Status Messages

Dodaj "typing..." indikator:

```typescript
await channel.track({
  username: currentUsername,
  typing: true,  // Nova property
});
```

### 2. User Colors

Dodaj random boju za svakog korisnika:

```typescript
const colors = ['bg-red-400', 'bg-blue-400', 'bg-green-400'];
const userColor = colors[username.length % colors.length];
```

### 3. Away Status

Dodaj "idle" status posle 5 minuta neaktivnosti:

```typescript
let idleTimer = setTimeout(() => {
  channel.track({ username, status: 'idle' });
}, 5 * 60 * 1000);
```

### 4. User Count Badge

Dodaj badge na header:

```tsx
<div className="flex items-center gap-2">
  <h1>Čet Soba</h1>
  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">
    {onlineCount} online
  </span>
</div>
```

---

## 🎨 Customization

### Promena Širine

```tsx
// U OnlineUsers.tsx
<div className="w-56 bg-white...">  // Bilo w-48 (192px)
```

### Promena Boja

```tsx
// Avatar gradient
bg-gradient-to-br from-blue-400 to-cyan-400  // Umesto purple-pink
```

### Dodaj Scrollbar Styling

```css
.online-users-list::-webkit-scrollbar {
  width: 4px;
}
.online-users-list::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 2px;
}
```

---

## 📊 Performance

### Memory Usage

Presence state je lightweight:
- Samo username + timestamp
- Čuva se u memoriji (ne u bazi)
- Automatski cleanup

### Network

- WebSocket connection (ista kao za poruke)
- Minimalan bandwidth
- Samo delta updates (ne cela lista svaki put)

---

## 🔐 Privacy

### Šta se Trackuje

- ✅ Username
- ✅ Online timestamp
- ❌ IP adresa (ne)
- ❌ Location (ne)
- ❌ Device info (ne)

### Visibility

Svi korisnici vide:
- Ko je online
- Username-ove

**Privatnost**: Ako želiš anonimne korisnike, dodaj "Guest123" generisanje umesto username input-a.

---

## 🎯 User Experience

### Benefits

1. **Social Proof** - Vidiš da ima ljudi
2. **Engagement** - Znaš sa kim pričaš
3. **Competition** - Vidiš protivnike za kviz!
4. **Real-time Feel** - Osećaj živog chat-a

### Visual Hierarchy

- **Trenutni korisnik** - Istaknuto (indigo)
- **Ostali** - Neutral (gray/purple)
- **Status** - Zelena tačka (očigledna)

---

**Sada imaš pravi chat experience! 💬👥**

