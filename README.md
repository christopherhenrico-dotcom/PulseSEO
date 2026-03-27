# PulseSEO - Local SEO Audit Tool

A powerful, free, browser-based SEO audit and reporting tool. No API keys, no per-request costs, no cloud dependencies - everything runs locally in the browser using Transformers.js.

## Features

- **Website Scraping** - Automatically extracts SEO data from any website
  - Title, meta tags, headings, keywords
  - Schema markup detection
  - Image alt text coverage
  - Internal/external link analysis
  - Open Graph and social meta tags

- **SEO Scoring** - Calculates score based on 20+ ranking factors
  - Title tag optimization
  - Meta description length
  - Heading structure
  - Content depth
  - Schema markup presence
  - Mobile-friendliness indicators

- **Actionable Recommendations** - Rule-based suggestions for improvements

- **GMB Tools** - Google Business Profile optimization
  - Optimized business descriptions
  - Post ideas
  - Review response templates

- **Keyword Extraction** - Analyzes content for target keywords

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS 4
- Transformers.js (Hugging Face)
- Framer Motion

## No API Required

This tool uses local ML models via Transformers.js - no external APIs needed. The first run downloads model files (~22MB), then runs entirely in the browser.

## License

MIT