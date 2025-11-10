# 🏴 80 Jako Teških Pitanja o Zastavama

## 📋 Pregled

**Fajl**: `hard-flag-questions-80.sql`  
**Broj pitanja**: 80  
**Nivo**: Teško  
**Kategorija**: Zastave

## 🌍 Podela po Regionima

### 🌍 Afrika (20 pitanja)
Male i egzotične afričke zemlje koje nisu često na vestima:
- Burkina Faso, Benin, Bocvana, Burundi
- Kamerun, Zelenortska Ostrva, Džibuti
- Ekvatorijalna Gvineja, Eritreja, Gabon
- Gambija, Gvineja, Gvineja-Bisao
- Lesoto, Malavi, Mauritanija
- Mozambik, Niger, Ruanda, Sijera Leone

### 🌏 Azija i Pacifik (20 pitanja)
Udaljene i male azijske i pacifičke zemlje:
- **Azija**: Laos, Kambodža, Mjanmar, Bangladeš, Butan, Brunej
- **Centralna Azija**: Turkmenistan, Uzbekistan, Kirgistan, Tadžikistan, Mongolija
- **Pacifik**: Papua Nova Gvineja, Fidži, Samoa, Tonga, Vanuatu, Solomonska Ostrva, Palau, Mikronezija, Maršalska Ostrva

### 🌎 Srednja/Južna Amerika + Karibi (20 pitanja)
Male centralno i južnoameričke države i karipska ostrva:
- **Srednja Amerika**: Belize, Gvatemala, Honduras, Nikaragva, El Salvador, Kostarika, Panama
- **Južna Amerika**: Gvajana, Surinam, Paragvaj, Urugvaj
- **Karibi**: Jamajka, Trinidad i Tobago, Barbados, Sveta Lucija, Grenada, Sveti Vincent i Grenadini, Antigva i Barbuda, Dominika, Sveti Kristofor i Nevis

### 🕌 Bliski Istok i Severna Afrika (10 pitanja)
Bliskoistočne zemlje koje često mešaju:
- Jemen, Oman, Katar, Bahrein, Kuvajt
- Jordan, Liban, Sirija
- Libija, Alžir

### 🇪🇺 Baltik i Kavkaz (10 pitanja)
Male evropske i kavkaske zemlje:
- **Baltik**: Estonija, Letonija, Litvanija
- **Istočna Evropa**: Moldavija, Belorusija
- **Kavkaz**: Gruzija, Jermenija, Azerbejdžan
- **Ostalo**: Kazahstan, Malta

## 🎯 Zašto su Ova Pitanja Teška?

1. **Male zemlje** - Retko se spominju u vestima
2. **Slične zastave** - Mnoge imaju sličnu kombinaciju boja
3. **Nepoznata geografija** - Prosečan čovek ne zna gde se nalaze
4. **Komplikovana imena** - Teško zapamtljiva imena
5. **Retka prepoznatljivost** - Ne viđaju se često u medijima

## 📊 Primeri Teških Kombinacija

### Teško Razlikovati
- **Honduras vs El Salvador vs Nikaragva** - Sve imaju plavo-belo-plavo
- **Gvineja vs Mali** - Gotovo identične boje
- **Rumunija vs Čad** - Potpuno identične (različite samo proporcije)
- **Indonezija vs Monako** - Iste crveno-bele

### Egzotične Zastave
- **Mozambik** - Jedina zastava sa AK-47 puškom
- **Butan** - Zmaj na zastavi
- **Turkmenistan** - Komplikovani tepih motivi
- **Papua Nova Gvineja** - Rajska ptica

## 📋 Kako Dodati u Bazu

### Supabase SQL Editor

1. Otvori Supabase Dashboard
2. SQL Editor (leva strana)
3. New Query
4. Kopiraj i paste sadržaj iz `hard-flag-questions-80.sql`
5. Run (Ctrl+Enter)

### Provera

```sql
-- Proveri da li su pitanja dodata
SELECT COUNT(*) FROM quiz_questions WHERE difficulty = 'teško' AND category = 'Zastave';

-- Trebalo bi da vidiš broj (80 + prethodna teška pitanja)
```

## 🎮 Gameplay Tips

### Za Igrače
- Obratite pažnju na **kombinaciju boja**
- Zapamtite **poziciju zvezda/simbola**
- **Horizontalni vs vertikalni** redosledi boja
- Ima li **grb/amblem** na zastavi?

### Za Admin-a
- Možeš kombinovati sa lakšim pitanjima
- Nasumični odabir će mešati sve težine
- Igrači će biti izazovati ovim pitanjima!

## 🔄 Integracija sa Kvizom

Ova pitanja će automatski biti uključena u kviz pošto su u istoj tabeli (`quiz_questions`). Bot nasumično bira pitanja, pa će ova teška pitanja izaći sa istom verovatnoćom kao i druga.

### Ako Želiš Samo Teška Pitanja

Možeš modifikovati `lib/quizBot.ts`:

```typescript
// Izmeni getRandomQuizQuestion() funkciju
const { data, error } = await supabase
  .from('quiz_questions')
  .select('*')
  .eq('difficulty', 'teško')  // Samo teška pitanja
  .order('id', { ascending: false });
```

## 📊 Statistike

- **Ukupno pitanja**: 80
- **Prosečna dužina imena**: 10-15 karaktera
- **Regiona**: 5 (Afrika, Azija/Pacifik, Amerika/Karibi, Bliski Istok, Baltik/Kavkaz)
- **Image source**: flagcdn.com (free CDN)
- **Image size**: 320px width (optimalno)

## 🏆 Izazov za Igrače

Ova pitanja su **JAKO TEŠKA**. Očekuj:
- ❌ Puno netačnih odgovora
- ⏰ Česta timeout-a
- 🤔 Puno "Šta je ovo?" reakcija
- 💡 Potreba za hintovima

**Savršeno za igrače koji žele ekstremni izazov!** 🔥

## 📦 Fajlovi

- 📄 `hard-flag-questions-80.sql` - 80 teških pitanja o zastavama
- 📄 `flag-quiz-questions.sql` - Prethodnih 30 lakših/srednjih pitanja
- 📄 `IMAGE-QUESTIONS.md` - Dokumentacija za slike u pitanjima

---

**Kreirano**: 10. Nov 2025  
**Total Flag Questions**: 110 (30 easy/medium + 80 hard)  
**API**: flagcdn.com  
**Free to use**: Da ✅

