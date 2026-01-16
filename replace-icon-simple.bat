@echo off
REM Simple Icon Replacement Guide for Prime Flex

echo.
echo ========================================
echo   Prime Flex Icon Replacement
echo ========================================
echo.
echo Your new logo image is at:
echo C:\Users\ksair\OneDrive\Pictures\WhatsApp Image 2025-09-10 at 3.30.25 PM (1).jpeg
echo.
echo ========================================
echo   EASIEST METHOD - Follow These Steps:
echo ========================================
echo.
echo 1. Open your web browser
echo.
echo 2. Go to: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
echo.
echo 3. Click "Image" tab
echo.
echo 4. Click "Choose File" and select your logo image
echo.
echo 5. Adjust padding (10-20%%) to center your logo
echo.
echo 6. Click "Download" button
echo.
echo 7. Extract the downloaded ZIP file
echo.
echo 8. Copy all "mipmap-*" folders from the ZIP to:
echo    %~dp0android\app\src\main\res\
echo.
echo 9. Replace existing folders when prompted
echo.
echo 10. Run: build-apk-simple.bat to rebuild with new icon
echo.
echo ========================================
echo.
echo Press any key to open Android Asset Studio in browser...
pause > nul

start https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html

echo.
echo Browser opened! Follow the steps above.
echo.
echo After downloading and extracting the ZIP:
echo - Copy the mipmap folders to: %~dp0android\app\src\main\res\
echo - Then run: build-apk-simple.bat
echo.
pause
