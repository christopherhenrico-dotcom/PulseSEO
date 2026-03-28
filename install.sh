#!/bin/bash
# PulseSEO Installer for Linux

echo "================================================"
echo "  PulseSEO Installer"
echo "================================================"

DESKTOP="$HOME/Desktop/pulse-seo.desktop"

echo "Creating Desktop shortcut..."

cat > "$DESKTOP" << 'EOF'
[Desktop Entry]
Version=1.0
Type=Application
Name=PulseSEO
Comment=AI-Powered SEO Audit Platform
Exec=xdg-open https://pulse-seo.vercel.app
Icon=utilities-terminal
Categories=Office;
EOF

chmod +x "$DESKTOP"

echo ""
echo "================================================"
echo "  Done!"
echo "================================================"
echo ""
echo "Double-click PulseSEO on Desktop to open!"
