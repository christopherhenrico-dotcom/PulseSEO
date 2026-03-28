# PulseSEO - Enterprise SEO Audit Platform

**For sale: Complete source code for a production-ready SEO audit platform.**

---

## ⚠️ DEV OPS & DEPLOYMENT - READ BEFORE BUYING

This is a **working prototype** with full functionality, but needs some love before production:

### What's Working ✅
- `npm run dev` - Runs perfectly locally
- `npm run build` - Builds successfully
- Website scraping (Jina AI) 
- PageSpeed API integration
- Local AI with Transformers.js (fallback to rule-based)
- Client management & bulk audits
- White-label customization
- PDF report generation
- Dark/Light themes
- Electron desktop app builds

### Buyer Must Complete 🔧
1. **Vercel Deployment** - Already pushed to GitHub, connect Vercel to auto-deploy
2. **API Keys** - Replace placeholder keys in code:
   - `src/services/seoService.ts` - Google PageSpeed API key (line ~360)
   - Or use environment variables
3. **Transformers.js** - Local AI works but is heavy; consider cloud AI API for production
4. **Electron Build** - Run `npm run build:desktop` locally (requires Node 18+)
5. **SSL/HTTPS** - Vercel provides automatically
6. **Analytics** - Add Google Analytics / Plausible if desired

### Known Minor Issues (Low Priority)
- CSS warnings in IDE (non-blocking)
- Transformer.js initial load is slow (works fine, just ~3-5s first load)

---

## Quick Start (Run Now - Web Version)

```bash
npm install
npm run dev
```

Open http://localhost:3000

---

## Build Desktop App (Enterprise)

On your local machine:

```bash
npm install
npm run build:desktop
```

Creates:
- `release/PulseSEO Setup.exe` (Windows)
- `release/PulseSEO.dmg` (macOS)
- `release/PulseSEO.AppImage` (Linux)

---

## What's Included

### ✅ Real Data
- Website SEO scraping (jina.ai API)
- PageSpeed Insights (Google API)
- Local AI recommendations (Transformers.js)

### ✅ Desktop Features
- Native window (min/max/close)
- Offline-first
- Local storage
- Professional installer

### ✅ Reports (Whatagraph-style)
- Summary tab
- Visibility tab  
- Traffic tab
- Conversions tab

### ✅ White-Label
- Custom logo
- Custom colors
- Custom brand name

---

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS 3.4
- Transformers.js (local AI)
- Electron (desktop app)
- jsPDF + html2canvas (reports)

---

## Build Requirements

- Node.js 18+
- npm 9+

---

## Suggested Sale Price

**Quick Sale: $500-1,500** 

Comparable projects on SellMyApp/CodeCanyon with this feature set sell for $200-3000 depending on documentation quality and marketplace.

**Includes:**
- Full source code
- This README
- Basic setup instructions
- GitHub repo (transfer included)

---

## Contact

Serious buyers: Open an issue on GitHub or contact through marketplace listing.

---

## License

MIT
