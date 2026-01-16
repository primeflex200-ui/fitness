@echo off
title Building Prime Flex APK
color 0A

echo.
echo ============================================
echo   FINAL BUILD - Prime Flex with New Logo
echo ============================================
echo.
echo This will take 5-10 minutes.
echo Please DO NOT close this window!
echo.
echo Press any key to start...
pause > nul

echo.
echo ============================================
echo   Step 1/3: Building Android APK
echo ============================================
echo.

cd android
gradlew.bat assembleDebug --stacktrace

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ============================================
    echo   BUILD FAILED!
    echo ============================================
    echo.
    echo Check the error messages above.
    echo.
    pause
    exit /b 1
)

cd ..

echo.
echo ============================================
echo   Step 2/3: Checking APK
echo ============================================
echo.

if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
    echo ✓ APK file found!
) else (
    echo × APK file NOT found!
    echo Build may have failed.
    pause
    exit /b 1
)

echo.
echo ============================================
echo   Step 3/3: Copying to Downloads
echo ============================================
echo.

set "FILENAME=PrimeFlex-FINAL-%date:~-4%%date:~3,2%%date:~0,2%-%time:~0,2%%time:~3,2%.apk"
set "FILENAME=%FILENAME: =0%"

copy "android\app\build\outputs\apk\debug\app-debug.apk" "%USERPROFILE%\Downloads\%FILENAME%"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo   SUCCESS!
    echo ============================================
    echo.
    echo APK saved as:
    echo %FILENAME%
    echo.
    echo Location: Downloads folder
    echo.
    echo Opening Downloads folder...
    start explorer "%USERPROFILE%\Downloads"
    echo.
    echo ============================================
) else (
    echo.
    echo × Failed to copy APK
)

echo.
echo Press any key to exit...
pause > nul
