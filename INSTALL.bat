@echo off
echo ================================================
echo   PulseSEO Installer
echo   AI-Powered SEO Audit Platform
echo ================================================
echo.

set "DESKTOP=%USERPROFILE%\Desktop"

echo Creating Desktop shortcut...
powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%DESKTOP%\PulseSEO.lnk'); $s.TargetPath = 'https://pulse-seo.vercel.app'; $s.Description = 'PulseSEO - SEO Audit Platform'; $s.Save()"

echo Creating Start Menu shortcut...
mkdir "%ProgramData%\Microsoft\Windows\Start Menu\Programs\PulseSEO" 2>nul
powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%ProgramData%\Microsoft\Windows\Start Menu\Programs\PulseSEO\PulseSEO.lnk'); $s.TargetPath = 'https://pulse-seo.vercel.app'; $s.Description = 'PulseSEO - SEO Audit Platform'; $s.Save()"

echo.
echo ================================================
echo   Installation Complete!
echo ================================================
echo.
echo Shortcuts created on Desktop and Start Menu!
echo.
echo Double-click PulseSEO to open in browser!
echo.
pause
