# 🏷️ Meta Tags & OpenGraph

## 📝 Šta je Dodato

Dodati su kompletni meta tags, OpenGraph i Twitter Card tags za bolju prezentaciju na društvenim mrežama i u search engine-ima.

## ✨ Nove Funkcionalnosti

### Meta Tags
- **Title**: "🎯 Kosingasi Kviz"
- **Description**: "Real-time multiplayer kviz sa pitanjima na srpskom jeziku. Takmičite se sa prijateljima i osvojite najviše poena!"

### OpenGraph Tags
- **og:title**: "🎯 Kosingasi Kviz"
- **og:description**: Puni opis kviza
- **og:type**: "website"
- **og:locale**: "sr_RS" (srpski jezik)
- **og:site_name**: "Kosingasi Kviz"
- **og:image**: High-quality quiz image (1200x630px)

### Twitter Card
- **twitter:card**: "summary_large_image"
- **twitter:title**: "🎯 Kosingasi Kviz"
- **twitter:description**: Puni opis
- **twitter:image**: Isti image kao OpenGraph

### OpenGraph Image
- **URL**: `https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=1200&h=630&fit=crop&q=80`
- **Dimenzije**: 1200x630px (optimalno za Facebook, Twitter, LinkedIn)
- **Alt Text**: "Kosingasi Kviz - Multiplayer Quiz Game"
- **Kvalitet**: Profesionalna fotografija sa Unsplash

## 🔧 Tehničke Izmene

### `app/layout.tsx`

```typescript
export const metadata: Metadata = {
  title: "🎯 Kosingasi Kviz",
  description: "Real-time multiplayer kviz sa pitanjima na srpskom jeziku. Takmičite se sa prijateljima i osvojite najviše poena!",
  openGraph: {
    title: "🎯 Kosingasi Kviz",
    description: "Real-time multiplayer kviz sa pitanjima na srpskom jeziku. Takmičite se sa prijateljima i osvojite najviše poena!",
    type: "website",
    locale: "sr_RS",
    siteName: "Kosingasi Kviz",
    images: [
      {
        url: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=1200&h=630&fit=crop&q=80",
        width: 1200,
        height: 630,
        alt: "Kosingasi Kviz - Multiplayer Quiz Game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "🎯 Kosingasi Kviz",
    description: "Real-time multiplayer kviz sa pitanjima na srpskom jeziku. Takmičite se sa prijateljima i osvojite nejvise poena!",
    images: ["https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=1200&h=630&fit=crop&q=80"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};
```

## 🌐 Kako se Koristi

### Facebook Share
Kada korisnik podeli link na Facebook-u, prikazuje se:
- 🎯 **Kosingasi Kviz** (naslov)
- Opis sa ključnim informacijama
- Velika slika sa kvizom

### Twitter Share
Kada korisnik podeli link na Twitter-u, prikazuje se:
- Large image card (1200x630px)
- Pun naslov i opis
- Profesionalna slika

### LinkedIn Share
- Profesionalni prikaz sa OpenGraph tags
- Visok kvalitet slike
- Pun opis i naslov

### Google Search
- Prikaz u search rezultatima sa emotikonom 🎯
- Rich snippet sa opisom
- Bolji CTR (Click-Through Rate)

### Browser Tab
- Tab title: "🎯 Kosingasi Kviz"
- Emoji pomaže u prepoznavanju taba

## 📊 Prednosti

✅ **SEO Optimizacija** - Bolji ranking u search engine-ima
✅ **Social Media Preview** - Profesionalni izgled pri deljenju
✅ **Brand Identity** - 🎯 emoji kao vizualni identifikator
✅ **Multi-platform** - Podrška za Facebook, Twitter, LinkedIn
✅ **Lokalizacija** - Serbian locale (sr_RS)
✅ **High Quality Image** - 1200x630px profesionalna fotografija

## 🖼️ OpenGraph Image Detalji

### Image Source
- **Provider**: Unsplash (free high-quality images)
- **ID**: photo-1606326608606-aa0b62935f2b
- **Theme**: Quiz/Trivia/Question marks
- **License**: Free to use (Unsplash License)

### Optimizacija
- **Width**: 1200px (Facebook recommended)
- **Height**: 630px (1.91:1 aspect ratio)
- **Format**: JPEG optimized
- **Quality**: 80% (balans između kvaliteta i file size-a)
- **Fit**: Crop (najbolje se prilagođava različitim platformama)

### Alternativne Opcije
Ako želiš da promeniš image, možeš koristiti:
1. Drugu Unsplash fotografiju
2. Custom image u `/public` folderu
3. OG Image Generator servise (vercel/og-image, etc.)

## 🔄 Testiranje

### Debug Tools
1. **Facebook Debugger**: https://developers.facebook.com/tools/debug/
   - Unesi URL i vidi kako izgleda preview
   
2. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
   - Testiraj Twitter card prikaz
   
3. **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/
   - Proveri kako izgleda na LinkedIn-u

### Local Testing
```bash
# Browser tab
Otvori app i vidi 🎯 emoji u tab-u

# View source
curl http://localhost:3000 | grep "og:"
```

## 📱 Responsive Preview

### Desktop Share
```
┌────────────────────────────────┐
│  [Quiz Image - 1200x630px]     │
├────────────────────────────────┤
│  🎯 Kosingasi Kviz             │
│  Real-time multiplayer kviz... │
└────────────────────────────────┘
```

### Mobile Share
```
┌───────────────┐
│  [Quiz Image] │
├───────────────┤
│ 🎯 Kosingasi  │
│    Kviz       │
│ Real-time...  │
└───────────────┘
```

## 🚀 Best Practices

### Implementirano ✅
- Title sa emotikonom (branding)
- Description sa ključnim informacijama
- High-quality image (1200x630px)
- Locale tag (sr_RS)
- Twitter card support
- Alt text za accessibility

### Buduće Izmene 🔮
- [ ] Custom OG image sa branding-om
- [ ] Favicon set (16x16, 32x32, 180x180)
- [ ] Apple touch icon
- [ ] Manifest.json za PWA
- [ ] Structured data (Schema.org)

## 🔄 Commit

```bash
git commit -m "Add meta tags, OpenGraph, and Twitter cards for Kosingasi Kviz"
```

Pushed to: `main`

---

**Implementirano**: 10. Nov 2025  
**Razlog**: Bolji izgled pri deljenju na društvenim mrežama i SEO  
**Image**: Unsplash professional quiz photo  
**Platforme**: Facebook, Twitter, LinkedIn, Google  
**Locale**: sr_RS (Serbian)

