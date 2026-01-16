@echo off
REM Simple APK Builder - Quick build and copy to Downloads

echo.
echo Building Prime Flex APK...
echo.

REM Build web app
echo Step 1: Building web app...
call npm run build

REM Sync with Android
echo.
echo Step 2: Syncing with Android...
call npx cap sync android

REM Build APK
echo.
echo Step 3: Building APK (this may take a few minutes)...
cd android
call gradlew assembleDebug
cd ..

REM Copy to Downloads
echo.
echo Step 4: Copying to Downloads...
set DOWNLOADS=%USERPROFILE%\Downloads
copy "android\app\build\outputs\apk\debug\app-debug.apk" "%DOWNLOADS%\PrimeFlex.apk"

REM Open Downloads folder
echo.
echo Done! Opening Downloads folder...
explorer "%DOWNLOADS%"

echo.
echo APK saved as: %DOWNLOADS%\PrimeFlex.apk
echo.
pause
