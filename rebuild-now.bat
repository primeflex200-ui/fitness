@echo off
cd /d "%~dp0"
echo Building web app...
call npm run build
echo.
echo Syncing with Android...
call npx cap sync android
echo.
echo Building APK...
cd android
call gradlew assembleDebug
cd ..
echo.
echo Copying APK...
copy "android\app\build\outputs\apk\debug\app-debug.apk" "%USERPROFILE%\Downloads\PrimeFlex-NewLogo.apk"
echo.
echo DONE! Check Downloads folder.
explorer "%USERPROFILE%\Downloads"
pause
