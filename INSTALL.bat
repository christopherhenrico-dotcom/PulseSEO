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

:: Check if folder exists
if exist "%INSTALL_DIR%" (
    echo PulseSEO is already installed.
    echo Removing old installation...
    rmdir /s /q "%INSTALL_DIR%"
)

:: Create installation directory
echo Creating installation directory...
mkdir "%INSTALL_DIR%"

:: Copy files
echo Copying files...
xcopy /e /y dist\* "%INSTALL_DIR%\"

:: Create shortcut
echo Creating Desktop shortcut...
powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%DESKTOP%\PulseSEO.lnk'); $s.TargetPath = '%INSTALL_DIR%\index.html'; $s.WorkingDirectory = '%INSTALL_DIR%'; $s.Description = 'PulseSEO - SEO Audit Platform'; $s.Save()"

:: Create Start Menu shortcut
echo Creating Start Menu shortcut...
mkdir "%ProgramData%\Microsoft\Windows\Start Menu\Programs\PulseSEO" 2>nul
powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%ProgramData%\Microsoft\Windows\Start Menu\Programs\PulseSEO\PulseSEO.lnk'); $s.TargetPath = '%INSTALL_DIR%\index.html'; $s.WorkingDirectory = '%INSTALL_DIR%'; $s.Description = 'PulseSEO - SEO Audit Platform'; $s.Save()"

:: Register uninstaller
echo Creating uninstaller...
(
echo @echo off
echo echo Uninstalling PulseSEO...
echo rmdir /s /q "%INSTALL_DIR%"
echo del "%DESKTOP%\PulseSEO.lnk" 2^>nul
echo rmdir /s /q "%ProgramData%\Microsoft\Windows\Start Menu\Programs\PulseSEO" 2^>nul
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
echo To run PulseSEO, double-click the shortcut
echo or open: %INSTALL_DIR%\index.html
echo.
pause
