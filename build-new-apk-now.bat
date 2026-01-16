@echo off
echo ========================================
echo   Building FRESH APK with New Logo
echo ========================================
echo.
echo This will create a completely new APK
echo Time: 5-10 minutes
echo.
pause

echo.
echo [1/5] Cleaning old build...
cd android
call gradlew clean
echo.

echo [2/5] Building web app...
cd ..
call npm run build
echo.

echo [3/5] Syncing with Android...
call npx cap sync android
echo.

echo [4/5] Building NEW APK...
cd android
call gradlew assembleDebug
cd ..
echo.

echo [5/5] Copying to Downloads with timestamp...
set TIMESTAMP=%date:~-4%%date:~3,2%%date:~0,2%-%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%

copy "android\app\build\outputs\apk\debug\app-debug.apk" "%USERPROFILE%\Downloads\PrimeFlex-NewLogo-%TIMESTAMP%.apk"

echo.
echo ========================================
echo   DONE!
echo ========================================
echo.
echo New APK created with timestamp in filename
echo Check Downloads folder!
echo.
explorer "%USERPROFILE%\Downloads"

pause
