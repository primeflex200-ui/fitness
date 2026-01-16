# Build APK with Automatic Java Path Fix

Write-Host "Finding Java installation..." -ForegroundColor Cyan

# Find Eclipse Adoptium Java installation
$javaBasePath = "C:\Program Files\Eclipse Adoptium"
if (Test-Path $javaBasePath) {
    $javaFolders = Get-ChildItem $javaBasePath -Directory | Where-Object { $_.Name -like "jdk-*" }
    
    if ($javaFolders.Count -gt 0) {
        $javaPath = $javaFolders[0].FullName
        $env:JAVA_HOME = $javaPath
        Write-Host "JAVA_HOME set to: $javaPath" -ForegroundColor Green
    } else {
        Write-Host "No JDK found in $javaBasePath" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Eclipse Adoptium not found" -ForegroundColor Red
    exit 1
}

# Verify Java
Write-Host "Verifying Java..." -ForegroundColor Cyan
& "$env:JAVA_HOME\bin\java.exe" -version

Write-Host "Building Vite project..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Syncing Capacitor..." -ForegroundColor Cyan
npx cap sync android
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Building Android APK (this takes 2-5 minutes)..." -ForegroundColor Cyan
Set-Location android
.\gradlew.bat assembleDebug
$buildResult = $LASTEXITCODE
Set-Location ..

if ($buildResult -ne 0) {
    Write-Host "Android build failed!" -ForegroundColor Red
    exit 1
}

# Copy APK to Downloads
$apkSource = "android\app\build\outputs\apk\debug\app-debug.apk"
$apkDest = "$env:USERPROFILE\Downloads\PrimeFlex-NEW-FIXED.apk"

if (Test-Path $apkSource) {
    Write-Host "Copying APK to Downloads..." -ForegroundColor Cyan
    Copy-Item $apkSource $apkDest -Force
    
    $apkInfo = Get-Item $apkDest
    Write-Host "APK created successfully!" -ForegroundColor Green
    Write-Host "Location: $apkDest" -ForegroundColor Gray
    Write-Host "Size: $([math]::Round($apkInfo.Length/1MB,2)) MB" -ForegroundColor Gray
    Write-Host "Time: $($apkInfo.LastWriteTime)" -ForegroundColor Gray
    
    Start-Process explorer "$env:USERPROFILE\Downloads"
} else {
    Write-Host "APK not found!" -ForegroundColor Red
    exit 1
}
