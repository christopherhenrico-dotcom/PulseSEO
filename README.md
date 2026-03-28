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

## 📦 Distribution Files

### Windows
- Run `INSTALL.bat` - Creates desktop shortcut, Start Menu entry

### Linux
- Run `install.sh` - Creates desktop shortcut, app menu entry

### macOS
- Run `install.command` - Creates Applications folder shortcut

### Portable
- Just open `dist/index.html` in any browser

---

## 🔧 Build from Source

```bash
# Install dependencies
npm install

# Build for production
npm run build
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
