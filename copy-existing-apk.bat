@echo off
REM Copy Existing APK to Downloads - No rebuild needed

echo.
echo ========================================
echo   Copy Existing APK to Downloads
echo ========================================
echo.

set DOWNLOADS=%USERPROFILE%\Downloads

echo Searching for existing APK files...
echo.

REM Check for release APK
if exist "android\app\build\outputs\apk\release\app-release.apk" (
    echo Found: Release APK
    set APK_PATH=android\app\build\outputs\apk\release\app-release.apk
    set APK_NAME=PrimeFlex-release.apk
    goto :copy
)

REM Check for debug APK
if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
    echo Found: Debug APK
    set APK_PATH=android\app\build\outputs\apk\debug\app-debug.apk
    set APK_NAME=PrimeFlex-debug.apk
    goto :copy
)

REM No APK found
echo.
echo ERROR: No APK file found!
echo.
echo You need to build the APK first.
echo Run one of these scripts:
echo   - build-apk-simple.bat (quick build)
echo   - build-and-copy-apk.bat (full build)
echo.
pause
exit /b 1

:copy
echo.
echo Copying APK to Downloads...
copy "%APK_PATH%" "%DOWNLOADS%\%APK_NAME%"

if %errorlevel% neq 0 (
    echo ERROR: Failed to copy APK!
    pause
    exit /b 1
)

echo.
echo SUCCESS!
echo.
echo APK copied to: %DOWNLOADS%\%APK_NAME%
echo.
echo Opening Downloads folder...
explorer "%DOWNLOADS%"

echo.
pause
