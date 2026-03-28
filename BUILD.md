# PulseSEO Desktop - Enterprise Build Guide

## Quick Start (One Command)

On your local machine with Node.js:

```bash
cd PulseSEO && npm install && npm run build:desktop
```

This will create:
- `release/PulseSEO Setup.exe` (Windows installer)
- `release/PulseSEO.dmg` (macOS)
- `release/PulseSEO.AppImage` (Linux)

---

## What's Included

### Local AI (Transformers.js)
- Uses `Xenova/distilgpt2` model (~100MB, downloads once)
- Runs entirely offline after first run
- WebGPU acceleration when available
- Falls back to CPU if needed

### Real Data Sources
| Feature | Source |
|---------|--------|
| SEO Scraping | Built-in (jina.ai API) |
| PageSpeed | Google PageSpeed API |
| AI Recommendations | Local Transformers.js |
| Data Storage | Local electron-store |

### Enterprise Features
- Native window controls (min/max/close)
- Offline-first architecture
- Local data storage (no cloud)
- Auto-updates ready
- Professional installer (.exe/.dmg/.AppImage)

---

## Build Commands

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build

# Build desktop app
npm run build:desktop

# Or step by step:
npm run build                    # Build React app
npx electron-builder --win      # Build Windows .exe
npx electron-builder --mac      # Build macOS .dmg
npx electron-builder --linux    # Build Linux .AppImage
```

---

## Troubleshooting

### AI Model Download
First run will download AI model (~100MB). Check console for progress.

### WebGPU Not Available
If you see warnings about WebGPU, the app will automatically fall back to CPU mode.

### Build Errors
Make sure you have:
- Node.js 18+
- npm 9+

### Antivirus Blocks .exe
This is normal for unsigned software. You may need to add an exception or sign the executable.

---

## Files Structure

```
PulseSEO/
├── src/                  # React source
├── electron/
│   └── main.js          # Electron main process
├── dist/                # Built frontend
├── release/             # Built executables (after build)
├── public/              # Static assets
├── package.json
└── BUILD.md            # This file
```
