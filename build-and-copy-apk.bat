@echo off
REM Prime Flex APK Builder - Builds APK and copies to Downloads folder
REM This script automates the entire build process

echo.
echo ========================================
echo   Prime Flex APK Builder
echo ========================================
echo.

REM Set colors for better visibility
color 0A

echo [1/6] Building web application...
echo.
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Web build failed!
    pause
    exit /b 1
)

echo.
echo [2/6] Syncing with Android...
echo.
call npx cap sync android
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Capacitor sync failed!
    pause
    exit /b 1
)

echo.
echo [3/6] Building Android APK...
echo.
cd android
call gradlew assembleRelease
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Android build failed!
    echo.
    echo Trying debug build instead...
    call gradlew assembleDebug
    if %errorlevel% neq 0 (
        echo ERROR: Debug build also failed!
        cd ..
        pause
        exit /b 1
    )
    set BUILD_TYPE=debug
) else (
    set BUILD_TYPE=release
)
cd ..

echo.
echo [4/6] Locating APK file...
echo.

REM Find the APK file
if "%BUILD_TYPE%"=="release" (
    set APK_PATH=android\app\build\outputs\apk\release\app-release.apk
    set APK_NAME=PrimeFlex-release.apk
) else (
    set APK_PATH=android\app\build\outputs\apk\debug\app-debug.apk
    set APK_NAME=PrimeFlex-debug.apk
)

if not exist "%APK_PATH%" (
    echo ERROR: APK file not found at %APK_PATH%
    echo.
    echo Searching for APK in other locations...
    dir /s /b android\app\build\outputs\apk\*.apk
    pause
    exit /b 1
)

echo Found APK: %APK_PATH%
echo.

echo [5/6] Copying APK to Downloads folder...
echo.

REM Get Downloads folder path
set DOWNLOADS=%USERPROFILE%\Downloads

REM Copy APK to Downloads
copy "%APK_PATH%" "%DOWNLOADS%\%APK_NAME%"
if %errorlevel% neq 0 (
    echo ERROR: Failed to copy APK to Downloads!
    pause
    exit /b 1
)

echo.
echo [6/6] Opening Downloads folder...
echo.
explorer "%DOWNLOADS%"

echo.
echo ========================================
echo   SUCCESS!
echo ========================================
echo.
echo APK Location: %DOWNLOADS%\%APK_NAME%
echo Build Type: %BUILD_TYPE%
echo.
echo You can now:
echo 1. Transfer the APK to your Android device
echo 2. Install it on your device
echo 3. Enjoy Prime Flex!
echo.
echo ========================================
echo.

pause
