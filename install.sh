#!/bin/bash
# PulseSEO Installer for Linux
# AI-Powered SEO Audit Platform

echo "================================================"
echo "  PulseSEO Installer"
echo "  AI-Powered SEO Audit Platform"
echo "================================================"
echo ""

INSTALL_DIR="$HOME/.local/share/pulseseo"
DESKTOP_FILE="$HOME/Desktop/pulseseo.desktop"

# Check if running from correct directory
if [ ! -d "dist" ]; then
    echo "Error: Run this from the PulseSEO directory"
    echo "Usage: ./install.sh"
    exit 1
fi

echo "Installing to: $INSTALL_DIR"
echo ""

# Create installation directory
mkdir -p "$INSTALL_DIR"

# Copy files
echo "Copying files..."
cp -r dist/* "$INSTALL_DIR/"

# Create launcher script that starts local server
cat > "$INSTALL_DIR/pulseseo.sh" << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
echo "Starting PulseSEO..."
echo ""
if command -v node &> /dev/null; then
    npx -y serve -l 3000 &
    sleep 3
    xdg-open http://localhost:3000
else
    echo "Node.js not found. Please install Node.js from nodejs.org"
    read -p "Press Enter to exit..."
    exit 1
fi
EOF
chmod +x "$INSTALL_DIR/pulseseo.sh"

# Create desktop shortcut
echo "Creating Desktop shortcut..."
cat > "$DESKTOP_FILE" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=PulseSEO
Comment=AI-Powered SEO Audit Platform
Exec=$INSTALL_DIR/pulseseo.sh
Icon=utilities-terminal
Terminal=true
Categories=Office;Utility;
EOF
chmod +x "$DESKTOP_FILE"

# Create application menu entry
MENU_DIR="$HOME/.local/share/applications"
mkdir -p "$MENU_DIR"
cp "$DESKTOP_FILE" "$MENU_DIR/pulseseo.desktop"

# Create uninstaller
echo "Creating uninstaller..."
cat > "$INSTALL_DIR/uninstall.sh" << 'EOF'
#!/bin/bash
echo "Uninstalling PulseSEO..."
pkill -f "serve -l 3000" 2>/dev/null || true
rm -rf "$INSTALL_DIR"
rm -f "$DESKTOP_FILE"
rm -f "$MENU_DIR/pulseseo.desktop"
echo "PulseSEO has been uninstalled."
EOF
chmod +x "$INSTALL_DIR/uninstall.sh"

echo ""
echo "================================================"
echo "  Installation Complete!"
echo "================================================"
echo ""
echo "PulseSEO has been installed to:"
echo "  $INSTALL_DIR"
echo ""
echo "A shortcut has been created on your Desktop."
echo ""
echo "To run PulseSEO:"
echo "  Double-click the Desktop shortcut"
echo "  A browser will open automatically"
echo ""
echo "To uninstall:"
echo "  $INSTALL_DIR/uninstall.sh"
echo ""
