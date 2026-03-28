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

# Make files executable
chmod +x "$INSTALL_DIR/index.html" 2>/dev/null || true

# Create desktop shortcut
echo "Creating Desktop shortcut..."
cat > "$DESKTOP_FILE" << 'EOF'
[Desktop Entry]
Version=1.0
Type=Application
Name=PulseSEO
Comment=AI-Powered SEO Audit Platform
Exec=xdg-open INSTALL_DIR_PLACEHOLDER/index.html
Icon=utilities-terminal
Terminal=false
Categories=Office;Utility;
EOF

sed -i "s|INSTALL_DIR_PLACEHOLDER|$INSTALL_DIR|g" "$DESKTOP_FILE"
chmod +x "$DESKTOP_FILE"

# Create application menu entry
MENU_DIR="$HOME/.local/share/applications"
mkdir -p "$MENU_DIR"
cp "$DESKTOP_FILE" "$MENU_DIR/pulseseo.desktop"

# Create uninstaller
echo "Creating uninstaller..."
cat > "$INSTALL_DIR/uninstall.sh" << EOF
#!/bin/bash
echo "Uninstalling PulseSEO..."
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
echo "  1. Double-click the Desktop shortcut, OR"
echo "  2. Open: $INSTALL_DIR/index.html in your browser"
echo ""
echo "To uninstall:"
echo "  $INSTALL_DIR/uninstall.sh"
echo ""
