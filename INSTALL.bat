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
    echo PulseSEO is already installed.
    echo Removing old installation...
    rmdir /s /q "%INSTALL_DIR%"
)

echo Creating installation directory...
mkdir "%INSTALL_DIR%"

echo Copying files...
xcopy /e /y dist\* "%INSTALL_DIR%\"

:: Create Start Menu shortcut with batch launcher
echo Creating shortcuts...
mkdir "%ProgramData%\Microsoft\Windows\Start Menu\Programs\PulseSEO" 2>nul

:: Create launcher that starts a local server
(
echo @echo off
echo title PulseSEO
echo cd /d "%%~dp0"
echo echo Starting PulseSEO...
echo echo.
echo if exist "node.exe" (
echo     node.exe -g 3000
echo ) else (
echo     npx -y serve -l 3000
echo )
echo pause
) > "%INSTALL_DIR%\PulseSEO.bat"

powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%DESKTOP%\PulseSEO.lnk'); $s.TargetPath = '%INSTALL_DIR%\PulseSEO.bat'; $s.WorkingDirectory = '%INSTALL_DIR%'; $s.Description = 'PulseSEO - SEO Audit Platform'; $s.Save()"

powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%ProgramData%\Microsoft\Windows\Start Menu\Programs\PulseSEO\PulseSEO.lnk'); $s.TargetPath = '%INSTALL_DIR%\PulseSEO.bat'; $s.WorkingDirectory = '%INSTALL_DIR%'; $s.Description = 'PulseSEO - SEO Audit Platform'; $s.Save()"

(
echo @echo off
echo echo Uninstalling PulseSEO...
echo taskkill /f /im node.exe 2^>nul
echo rmdir /s /q "%INSTALL_DIR%"
echo del "%DESKTOP%\PulseSEO.lnk" 2^>nul
echo echo PulseSEO has been uninstalled.
echo pause
) > "%INSTALL_DIR%\Uninstall.bat"

echo.
echo ================================================
echo   Installation Complete!
echo ================================================
echo.
echo PulseSEO has been installed to:
echo %INSTALL_DIR%
echo.
echo A shortcut has been created on your Desktop.
echo.
echo IMPORTANT: PulseSEO runs as a local web server.
echo A browser window will open automatically.
echo.
echo To run PulseSEO, double-click the shortcut
echo.
pause
