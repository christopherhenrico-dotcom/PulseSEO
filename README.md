# PulseSEO - AI-Powered Local SEO Audit Platform

A production-ready SEO audit tool with professional Whatagraph-style reports.

---

## 🚀 Quick Start (Run Now)

```bash
npm install
npm run dev
```

Open http://localhost:3000

---

## 📦 Distribution

### Option 1: Windows Installer
```bash
npm run build
```
Then run `INSTALL.bat` to create a Windows installation.

### Option 2: Portable Version
The `dist/` folder contains a portable version:
- Upload to any web server
- Or run locally: `npx serve dist`
- Or just open `dist/index.html` in a browser

### Option 3: Desktop App (PWA)
The app is a Progressive Web App:
1. Open in Chrome/Edge
2. Click "Install" icon in address bar
3. Runs like a native desktop app

---

## 🔧 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview build
npm run preview
```

---

## 🔑 Features

### SEO Analysis (REAL DATA)
- Website scraping via browserless.io
- SEO score calculation (0-100)
- On-page analysis: title, meta, headings, images, links
- Framework detection (Next.js, React, WordPress, etc.)
- Schema.org detection

### Professional Reports
- **Summary Tab**: Executive summary, KPIs, recommendations
- **Visibility Tab**: Impressions, clicks, CTR, keywords
- **Traffic Tab**: Sessions by channel/device, landing pages
- **Conversions Tab**: Conversion metrics, top pages

### White-Label
Customize in `src/types.ts`:
- Brand name
- Logo
- Colors
- Support email

---

## 🛠️ Tech Stack

- React 19 + TypeScript
- Vite (build tool)
- Tailwind CSS 4
- Framer Motion (animations)

---

## 📝 API Note

The Whatagraph-style reports use simulated traffic/conversion data because real Google Search Console / Google Analytics data requires API authentication. The core SEO analysis (score, recommendations, content analysis) uses REAL data from website scraping.

---

## 📄 License

MIT - Use, modify, and resell freely.

---

## ❓ Support

For issues, check:
1. Website is publicly accessible (not Cloudflare blocked)
2. JavaScript is enabled
3. CORS is not blocking browserless.io
