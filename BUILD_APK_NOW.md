# 🚀 BUILD APK NOW - Complete Guide

## ⚠️ IMPORTANT: Your Current APK is OLD!

All APKs in Downloads with timestamp **Dec 19, 23:32:27** are the SAME old version:
- ❌ OLD logo (not your new one)
- ❌ BROKEN mobile notifications
- ❌ Missing persistent login fixes

**You MUST rebuild to get:**
- ✅ NEW logo
- ✅ FIXED mobile notifications
- ✅ FIXED persistent login

---

## 🎯 EASIEST METHOD: Use Android Studio

### Step 1: Open Android Studio
1. Launch **Android Studio**
2. Click **"Open"** (NOT "New Project")
3. Navigate to: `C:\Users\ksair\Downloads\cursor project prime flex(main prime flex)\project-bolt-github-uarm9gkh\flex-zen-coach\android`
4. Click **"OK"**

### Step 2: Wait for Gradle Sync
- Android Studio will automatically sync Gradle
- Wait for "Gradle sync finished" message (bottom right)
- This may take 2-5 minutes first time

### Step 3: Build APK
1. Click **Build** menu (top menu bar)
2. Click **Build Bundle(s) / APK(s)**
3. Click **Build APK(s)**
4. Wait for build to complete (2-5 minutes)
5. You'll see: **"APK(s) generated successfully"**

### Step 4: Locate APK
1. Click **"locate"** in the success notification
2. OR manually go to: `android\app\build\outputs\apk\debug\app-debug.apk`

### Step 5: Copy to Downloads
1. Right-click `app-debug.apk`
2. Click **Copy**
3. Open **Downloads** folder
4. Paste and rename to: `PrimeFlex-NEW-FIXED.apk`

---

## 🔧 ALTERNATIVE: Fix Java Path & Build

If you want to use command line, the issue is Java path. Here's the fix:

### Option A: Use PowerShell Script

Run this in PowerShell:

```powershell
cd "C:\Users\ksair\Downloads\cursor project prime flex(main prime flex)\project-bolt-github-uarm9gkh\flex-zen-coach"

# Find correct Java path
$javaPath = Get-ChildItem "C:\Program Files\Eclipse Adoptium" -Directory | 
            Where-Object { $_.Name -like "jdk-*" } | 
            Select-Object -First 1 -ExpandProperty FullName

# Set Java Home
$env:JAVA_HOME = $javaPath
Write-Host "✅ JAVA_HOME set to: $javaPath"

# Build
npm run build
npx cap sync android
cd android
.\gradlew.bat assembleDebug

# Copy to Downloads
Copy-Item "app\build\outputs\apk\debug\app-debug.apk" "$env:USERPROFILE\Downloads\PrimeFlex-NEW-FIXED.apk"
explorer "$env:USERPROFILE\Downloads"
```

### Option B: Set Java Path Manually

1. Open **System Properties** → **Environment Variables**
2. Find **JAVA_HOME** variable
3. Change from: `C:\Program Files\Eclipse Adoptium\jdk-21.x.x.x-hotspot`
4. Change to actual path like: `C:\Program Files\Eclipse Adoptium\jdk-21.0.5.11-hotspot`
5. Click **OK** and restart terminal

---

## ✅ How to Verify New APK

After building, check the APK timestamp:

```powershell
Get-Item "$env:USERPROFILE\Downloads\PrimeFlex-NEW-FIXED.apk" | Select-Object Name, LastWriteTime
```

**Should show TODAY'S date** (not Dec 19, 23:32:27)

---

## 📱 Testing on Phone

1. **Uninstall old app** from phone (important!)
2. **Install new APK**: `PrimeFlex-NEW-FIXED.apk`
3. **Open app** - should see NEW logo
4. **Go to Water page**
5. **Click "Save Reminder Settings"** - should work!
6. **Click "Start Water Reminders"** - should work!
7. **Grant notification permission**
8. **Close app completely**
9. **Wait for interval time**
10. **Receive notifications!** 🎉

---

## 🆘 If Build Still Fails

### Check Java Installation:
```powershell
java -version
```

Should show: `openjdk version "21.x.x"`

### Check Gradle:
```powershell
cd android
.\gradlew.bat --version
```

### Last Resort:
Use Android Studio method above - it handles all paths automatically!

---

## 📋 Summary

**Recommended**: Use Android Studio (easiest, most reliable)
**Alternative**: Fix Java path and use command line
**Result**: New APK with all fixes in Downloads folder

🎯 **Your goal**: Get `PrimeFlex-NEW-FIXED.apk` with today's timestamp in Downloads!
