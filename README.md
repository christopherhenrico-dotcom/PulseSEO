# PulseSEO — AI-Powered SEO Audit Platform (Source Code)

**A production-ready, white-label SEO audit tool. Local AI. No API keys. No monthly fees.**

**Live Demo:** [https://pulse-seo.vercel.app](https://pulse-seo.vercel.app) *(click "Try Live Demo" to explore)*

---

## What You're Buying

Full source code for a working SEO audit platform that you can rebrand, deploy, and sell as your own. Built with React, TypeScript, and local AI — runs entirely in the browser with zero external API dependencies.

**What this means for you or your clients:**
- No SEMrush subscription ($130-$500/mo)
- No BrightLocal subscription ($29-$79/mo)
- No OpenAI API key
- No Google Cloud setup
- Deploy it once, use it forever

---

## What's Included

| Piece | Details |
|-------|---------|
| **Web App** | Full React SPA — deploy anywhere (Vercel, Netlify, Firebase) |
| **Desktop Apps** | Tauri builds for Windows (.exe), macOS (.dmg), Linux (.AppImage) |
| **Mobile Apps** | Capacitor config for iOS + Android |
| **PWA** | Service worker, manifest, installable from browser |
| **Local AI Engine** | Transformers.js — runs inference client-side, no server needed |
| **SEO Analysis Engine** | 1,127 lines — scrapes websites, detects 13+ frameworks, generates reports |
| **White-Label System** | Logo, brand name, colors, contact info, watermark toggle |
| **Client Management** | CRUD clients, link audits to clients, audit counts |
| **PDF Export** | jsPDF + html2canvas — download any report as PDF |
| **Bulk Audit** | Paste a list of businesses, process them sequentially |
| **Report Templates** | 2 templates (Standard active, Executive planned) |

---

## Feature Breakdown

### SEO Audit Engine (`src/services/seoService.ts`)

**Real checks (scraped from live websites):**
- Title tag presence + length validation (50-60 chars)
- Meta description presence + length validation (150-160 chars)
- H1 tag presence + count validation
- Image alt text coverage
- Schema markup detection (JSON-LD)
- Open Graph tag validation
- Word count threshold (300+ words)
- Internal link count
- HTTPS enforcement check
- Robots.txt existence
- XML sitemap detection
- Mobile viewport meta tag
- Framework detection (Next.js, React, Vue, Angular, Svelte, Nuxt, Gatsby, Hugo, Jekyll, WordPress, Shopify, Wix, Squarespace)
- Rendering mode detection (SSR / SSG / CSR)

**AI-generated content (Transformers.js, local inference):**
- Optimized Google Business Profile description
- 3 post content ideas per audit
- Review response examples

**Simulated data (realistic but not from live APIs):**
- Keyword rankings (30-day daily data)
- Traffic metrics (sessions, users, channels, devices)
- Conversion data (daily, by page, by source)
- Visibility metrics (impressions, clicks, CTR, position)

### Report UI (4 tabs)

| Tab | Contents |
|-----|----------|
| **Summary** | Executive summary (AI-written), 6 KPI cards with trends, quick wins, recommendations (Critical / High / Technical), optimized GMB description, AI post ideas, AI review responses |
| **Visibility** | Impressions/clicks/CTR/position overview, 14-day daily trend chart, top keywords table, branded vs non-branded keywords |
| **Traffic** | Sessions/users/new users/conversions/revenue, channel breakdown bars, device breakdown bars, monthly trend chart, landing page performance table |
| **Conversions** | Conversions/transactions/revenue/rate, daily conversion trend chart, top converting pages, traffic source conversions |

### White-Label Branding

- Upload logo (PNG/JPG/SVG) — renders in sidebar, landing page, reports
- Set brand name — replaces "PulseSEO" everywhere
- Pick primary color — affects buttons, accents, chart bars
- Set support email + website — appears in report footers
- Toggle watermark on/off
- Dark / light theme toggle

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | React 18.3 + TypeScript 5.7 |
| **Build** | Vite 5.4 |
| **Desktop** | Tauri 2.x (Rust backend, ~5MB installer) |
| **Mobile** | Capacitor 7 (iOS + Android) |
| **Styling** | Tailwind CSS 3.4 + CSS custom properties (glassmorphism design system) |
| **Animation** | Framer Motion 12.x |
| **Icons** | Lucide React (60+ icons) |
| **AI** | Transformers.js 3.x (ONNX models, runs in-browser) |
| **PDF** | jsPDF 2.x + html2canvas 1.4 |
| **Hosting** | Any static host (Vercel, Netlify, Firebase, S3) |
| **State** | React useState + localStorage |

**~4,900 lines of platform code** (excluding services: ~3,500 lines)

---

## Current Limitations (Honest)

| Limitation | Impact | Effort to Fix |
|------------|--------|---------------|
| Keyword data is simulated | Reports show realistic but non-real ranking data | Medium — integrate DataForSEO or SerpAPI |
| No backlink analysis | Missing a core SEO ranking factor | High — needs Ahrefs/Majestic API |
| No competitor tracking | Can't benchmark against competitors | Medium — add competitor domain input + comparison |
| CORS limits scraping | Some websites block client-side fetch | Medium — add optional CORS proxy |
| No scheduled reports | Can't automate report delivery | Medium — add email service (SendGrid) |
| No client portals | Clients can't self-serve | Medium — add auth + shareable links |
| Traffic data is simulated | GA/GSC integration would provide real data | High — needs Google API OAuth flow |
| localStorage limits storage | Can't store hundreds of audits | Medium — add Firestore |
| No auth system | App is open, no login | Low — add Firebase Auth |
| No tests | Zero unit/E2E tests | Medium — add Vitest + Playwright |

---

## Recommended Roadmap

This is what the next owner could build to turn this into a $500+/month SaaS:

### Phase 1: Foundation (0-3 months)
- Add Firebase Authentication (email + Google OAuth)
- Cloud storage for audits via Firestore
- Audit deletion + client editing/deletion
- React error boundaries + loading skeletons
- Unit tests (80% coverage with Vitest)
- Fix CORS scraping via proxy service

### Phase 2: Real Data (3-6 months)
- Real keyword data via DataForSEO API ($0.01-$0.05 per query)
- Google Search Console integration (free API)
- Competitor domain comparison (side-by-side score cards)
- Backlink checking via API
- Scheduled PDF reports via email (SendGrid)

### Phase 3: Agency Features (6-12 months)
- Client portals (shareable report links, no login required for viewing)
- Team management (multi-user, roles, permissions)
- Custom report template builder (drag-and-drop)
- Lead generation widget (embeddable audit form for agency websites)
- REST API for third-party integrations

### Phase 4: Scale (12+ months)
- White-label mobile app builds (custom Capacitor config per customer)
- Custom domain support (CNAME-based)
- Enterprise SSO (SAML/OIDC)
- Marketplace for third-party add-ons

---

## Getting Started

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Build desktop apps (requires Tauri CLI)
npm run build:desktop
```

Open [http://localhost:3000](http://localhost:3000)

---

## What You Get

- Full source code (GitHub repo transfer)
- All 4 deployment targets configured (web, Windows, macOS, Linux)
- This README with roadmap
- Live demo you can show clients immediately

---

## Pricing

**$2,500** — Full source code, all platforms, lifetime updates.

No monthly fees. No subscriptions. No API keys required to run.

For comparison: SEMrush alone costs $2,400/year. This is a one-time purchase.

---

## Contact

Serious buyers: Reach out through the marketplace listing.

---

## License

MIT
