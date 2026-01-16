# 🚀 Build APK with Automatic Java Path Fix
# This script finds the correct Java installation and builds the APK

Write-Host "🔍 Finding Java installation..." -ForegroundColor Cyan

# Find Eclipse Adoptium Java installation
$javaBasePath = "C:\Program Files\Eclipse Adoptium"
if (Test-Path $javaBasePath) {
    $javaFolders = Get-ChildItem $javaBasePath -Directory | Where-Object { $_.Name -like "jdk-*" }
    
    if ($javaFolders.Count -gt 0) {
        $javaPath = $javaFolders[0].FullName
        $env:JAVA_HOME = $javaPath
        Write-Host "✅ JAVA_HOME set to: $javaPath" -ForegroundColor Green
    } else {
        Write-Host "❌ No JDK found in $javaBasePath" -ForegroundColor Red
        Write-Host "Please install Java from: https://adoptium.net/" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "❌ Eclipse Adoptium not found at: $javaBasePath" -ForegroundColor Red
    Write-Host "Checking for other Java installations..." -ForegroundColor Yellow
    
    # Try to find Java in other common locations
    $otherPaths = @(
        "C:\Program Files\Java",
        "C:\Program Files\OpenJDK",
        "C:\Program Files (x86)\Java"
    )
    
    $found = $false
    foreach ($path in $otherPaths) {
        if (Test-Path $path) {
            $javaFolders = Get-ChildItem $path -Directory | Where-Object { $_.Name -like "jdk*" }
            if ($javaFolders.Count -gt 0) {
                $javaPath = $javaFolders[0].FullName
                $env:JAVA_HOME = $javaPath
                Write-Host "✅ JAVA_HOME set to: $javaPath" -ForegroundColor Green
                $found = $true
                break
            }
        }
    }
    
    if (-not $found) {
        Write-Host "❌ No Java installation found!" -ForegroundColor Red
        Write-Host "Please install Java from: https://adoptium.net/" -ForegroundColor Yellow
        exit 1
    }
}

# Verify Java is working
Write-Host "`n🔍 Verifying Java installation..." -ForegroundColor Cyan
$javaVersion = & "$env:JAVA_HOME\bin\java.exe" -version 2>&1
Write-Host $javaVersion -ForegroundColor Gray

Write-Host "`n📦 Building Vite project..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Vite build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Vite build complete!" -ForegroundColor Green

Write-Host "`n🔄 Syncing Capacitor..." -ForegroundColor Cyan
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Capacitor sync failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Capacitor sync complete!" -ForegroundColor Green

Write-Host "`n🏗️ Building Android APK..." -ForegroundColor Cyan
Write-Host "This may take 2-5 minutes..." -ForegroundColor Yellow
Set-Location android
.\gradlew.bat assembleDebug
$buildResult = $LASTEXITCODE
Set-Location ..

if ($buildResult -ne 0) {
    Write-Host "❌ Android build failed!" -ForegroundColor Red
    Write-Host "`n💡 Try using Android Studio instead:" -ForegroundColor Yellow
    Write-Host "1. Open Android Studio" -ForegroundColor Gray
    Write-Host "2. Open the android folder" -ForegroundColor Gray
    Write-Host "3. Build > Build APK(s)" -ForegroundColor Gray
    exit 1
}

Write-Host "✅ Android build complete!" -ForegroundColor Green

# Copy APK to Downloads
$apkSource = "android\app\build\outputs\apk\debug\app-debug.apk"
$apkDest = "$env:USERPROFILE\Downloads\PrimeFlex-NEW-FIXED.apk"

if (Test-Path $apkSource) {
    Write-Host "`n📋 Copying APK to Downloads..." -ForegroundColor Cyan
    Copy-Item $apkSource $apkDest -Force
    Write-Host "✅ APK copied to: $apkDest" -ForegroundColor Green
    
    # Show APK info
    $apkInfo = Get-Item $apkDest
    Write-Host "`n📱 APK Information:" -ForegroundColor Cyan
    Write-Host "   Name: $($apkInfo.Name)" -ForegroundColor Gray
    Write-Host "   Size: $([math]::Round($apkInfo.Length/1MB,2)) MB" -ForegroundColor Gray
    Write-Host "   Created: $($apkInfo.LastWriteTime)" -ForegroundColor Gray
    
    # Open Downloads folder
    Write-Host "`n🎉 BUILD SUCCESSFUL!" -ForegroundColor Green
    Write-Host "Opening Downloads folder..." -ForegroundColor Cyan
    Start-Process explorer "$env:USERPROFILE\Downloads"
} else {
    Write-Host "❌ APK not found at: $apkSource" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ All done! Install PrimeFlex-NEW-FIXED.apk on your phone." -ForegroundColor Green
Write-Host "🎯 This APK includes:" -ForegroundColor Cyan
Write-Host "   ✅ NEW logo" -ForegroundColor Gray
Write-Host "   ✅ FIXED mobile notifications" -ForegroundColor Gray
Write-Host "   ✅ FIXED persistent login" -ForegroundColor Gray
