#!/bin/bash
# PulseSEO Installer for macOS
# AI-Powered SEO Audit Platform

echo "================================================"
echo "  PulseSEO Installer"
echo "  AI-Powered SEO Audit Platform"
echo "================================================"
echo ""

INSTALL_DIR="/Applications/PulseSEO.app"

# Check if running from correct directory
if [ ! -d "dist" ]; then
    echo "Error: Run this from the PulseSEO directory"
    echo "Double-click 'Install.command' in the PulseSEO folder"
    echo ""
    echo "Alternatively, run in terminal:"
    echo "  cd /path/to/PulseSEO"
    echo "  ./install.command"
    read -p "Press Enter to exit..."
    exit 1
fi

echo "Installing to: $INSTALL_DIR"
echo ""

# Copy files to Applications
echo "Copying files..."
cp -r dist "$INSTALL_DIR/Contents/WebApp"

# Create Info.plist
mkdir -p "$INSTALL_DIR/Contents"
cat > "$INSTALL_DIR/Contents/Info.plist" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleName</key>
    <string>PulseSEO</string>
    <key>CFBundleDisplayName</key>
    <string>PulseSEO</string>
    <key>CFBundleIdentifier</key>
    <string>com.pulseseo.app</string>
    <key>CFBundleVersion</key>
    <string>1.0</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleExecutable</key>
    <string>MacOS/open</string>
    <key>CFBundleIconFile</key>
    <string></string>
    <key>LSMinimumSystemVersion</key>
    <string>10.15</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>NSHumanReadableCopyright</key>
    <string>Copyright © 2024 PulseSEO. All rights reserved.</string>
</dict>
</plist>
EOF

# Create MacOS launcher script
mkdir -p "$INSTALL_DIR/Contents/MacOS"
cat > "$INSTALL_DIR/Contents/MacOS/open" << 'EOF'
#!/bin/bash
open "${BASH_SOURCE%/*}/../WebApp/index.html"
EOF
chmod +x "$INSTALL_DIR/Contents/MacOS/open"

# Create application shortcut in /Applications (requires sudo for system-wide, or just copy)
echo ""
echo "Note: To install system-wide, drag PulseSEO to /Applications"
echo "Or keep it here and double-click to run."
echo ""

# Copy to user Applications
cp -r "$INSTALL_DIR" "$HOME/Applications/"

echo ""
echo "================================================"
echo "  Installation Complete!"
echo "================================================"
echo ""
echo "PulseSEO has been installed!"
echo ""
echo "To run PulseSEO:"
echo "  1. Open: $HOME/Applications/PulseSEO"
echo "  2. Or search for 'PulseSEO' in Spotlight"
echo ""
echo "To uninstall:"
echo "  rm -rf $HOME/Applications/PulseSEO"
echo "  rm -rf $INSTALL_DIR"
echo ""

read -p "Press Enter to open PulseSEO..."
open "$HOME/Applications/PulseSEO/Contents/MacOS/open"
