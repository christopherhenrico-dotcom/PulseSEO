@echo off
echo ================================================
echo   PulseSEO Installer
echo   AI-Powered SEO Audit Platform
echo ================================================
echo.

set "INSTALL_DIR=%ProgramFiles%\PulseSEO"
set "DESKTOP=%USERPROFILE%\Desktop"

echo Installing to: %INSTALL_DIR%
echo.

if exist "%INSTALL_DIR%" (
    rmdir /s /q "%INSTALL_DIR%"
)

mkdir "%INSTALL_DIR%"

echo Copying files...
xcopy /e /y dist\* "%INSTALL_DIR%\"

echo Creating Desktop shortcut...
powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%DESKTOP%\PulseSEO.lnk'); $s.TargetPath = '%INSTALL_DIR%\index.html'; $s.WorkingDirectory = '%INSTALL_DIR%'; $s.Description = 'PulseSEO - SEO Audit Platform'; $s.Save()"

echo Creating Start Menu shortcut...
mkdir "%ProgramData%\Microsoft\Windows\Start Menu\Programs\PulseSEO" 2>nul
powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%ProgramData%\Microsoft\Windows\Start Menu\Programs\PulseSEO\PulseSEO.lnk'); $s.TargetPath = '%INSTALL_DIR%\index.html'; $s.WorkingDirectory = '%INSTALL_DIR%'; $s.Description = 'PulseSEO - SEO Audit Platform'; $s.Save()"

(
echo @echo off
echo rmdir /s /q "%INSTALL_DIR%"
echo del "%DESKTOP%\PulseSEO.lnk" 2^>nul
) > "%INSTALL_DIR%\Uninstall.bat"

echo.
echo ================================================
echo   Installation Complete!
echo ================================================
echo.
echo Location: %INSTALL_DIR%
echo.
echo IMPORTANT: Make sure to run as Administrator once
echo to ensure full permissions.
echo.
echo Double-click PulseSEO.lnk on Desktop to start!
echo.
echo NOTE: Requires internet connection to work.
echo.
pause
