@echo off
echo ========================================
echo   Quick APK Build with New Icon
echo ========================================
echo.
echo This will build APK with your new logo
echo Time: 3-5 minutes
echo.
pause

echo.
echo Building APK...
echo.

cd android
call gradlew assembleDebug
cd ..

echo.
echo Copying to Downloads...
echo.

set TIMESTAMP=%date:~-4%%date:~3,2%%date:~0,2%-%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%

copy "android\app\build\outputs\apk\debug\app-debug.apk" "%USERPROFILE%\Downloads\PrimeFlex-NewIcon.apk"

echo.
echo ========================================
echo   DONE!
echo ========================================
echo.
echo APK saved to Downloads folder as:
echo PrimeFlex-NewIcon.apk
echo.
echo Opening Downloads folder...
explorer "%USERPROFILE%\Downloads"

echo.
pause
