@echo off
REM Prime Flex App Icon Generator - Batch Script
REM This opens the PowerShell script with execution policy bypass

echo.
echo ========================================
echo   Prime Flex App Icon Generator
echo ========================================
echo.

powershell.exe -ExecutionPolicy Bypass -File "%~dp0generate-app-icons.ps1"

pause
