# PulseSEO - AI-Powered Local SEO Audit Tool

**For sale: The complete source code for a production-ready, white-label SEO audit platform that runs as a desktop application with local AI.**

This is a unique opportunity to acquire a fully-featured SEO audit and reporting tool. Built with **Tauri (Rust)** + **React**, it runs as a native desktop app with a local AI model (SEOCRATE-4B-Q4_K_M), providing in-depth analysis without any server costs, API keys, or monthly fees.

## Key Features

*   **Desktop Application:** Native Windows/Mac/Linux executables via Tauri. No browser required, works offline.
*   **100% White-Label:** Easily customize branding, logo, colors, and fonts to match your agency.
*   **Local AI (SEOCRATE-4B):** Runs locally using Q4_K_M quantization (~2.5GB VRAM). No cloud APIs, complete privacy.
*   **Professional Reports:** 4-tab SEO reports matching enterprise tools (Whatagraph-style): Summary, Visibility, Traffic, Conversions.
*   **Client Management:** Onboard and manage clients, assign SEO reports.
*   **Export to PDF:** Create branded PDF reports for clients.

## Getting Started (Web Version)

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Building the Desktop App

### Prerequisites

1.  **Node.js 18+** and **npm**
2.  **Rust** (latest stable):
    ```bash
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
    source ~/.cargo/env
    ```
3.  **Build tools** (Windows: Visual Studio Build Tools, Linux: `build-essential`, Mac: Xcode)

### Build Steps

```bash
# Install dependencies
npm install

# Build frontend
npm run build

# Build desktop app
npm run tauri:build
```

The executable will be in `src-tauri/target/release/bundle/`.

### Running in Development Mode

```bash
npm run tauri:dev
```

## AI Model Setup

For full AI capabilities, place the SEOcrate-4B GGUF model in:

```
src-tauri/models/seocrate-4b-q4_k_m.gguf
```

The app works without the model using intelligent rule-based fallbacks.

## Project Structure

```
PulseSEO/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── services/          # AI and SEO services
│   └── types.ts           # TypeScript types
├── src-tauri/             # Tauri/Rust backend
│   ├── src/
│   │   ├── main.rs       # Entry point
│   │   ├── lib.rs        # Tauri commands
│   │   └── ai.rs         # Local AI integration
│   └── Cargo.toml        # Rust dependencies
├── dist/                  # Built frontend
└── package.json
```

## Customization

All customization is in `src/types.ts` → `DEFAULT_WHITE_LABEL`:
- Brand name, logo, colors, fonts
- Support email, website

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS 4, Framer Motion
- **Backend:** Tauri 2 (Rust)
- **AI:** Local inference with llama.cpp (SEOCRATE-4B-Q4_K_M)
- **Reports:** Professional 4-tab SEO reports

## License

MIT - Full rights to use, modify, and resell.
