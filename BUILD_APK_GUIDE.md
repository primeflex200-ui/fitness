# 📱 Build Prime Flex APK - Complete Guide

## 🚀 Quick Method (Automated)

### Option 1: Use the Build Script (Easiest)

Just double-click one of these files:

1. **`build-apk-simple.bat`** - Quick build (debug APK)
2. **`build-and-copy-apk.bat`** - Full build (release APK with detailed logs)

The script will:
- ✅ Build your web app
- ✅ Sync with Android
- ✅ Build the APK
- ✅ Copy APK to your Downloads folder
- ✅ Open Downloads folder automatically

**Time**: 5-10 minutes (depending on your computer)

---

## 🛠️ Manual Method

If you prefer to build manually:

### Step 1: Build Web App
```bash
cd project-bolt-github-uarm9gkh\flex-zen-coach
npm run build
```

### Step 2: Sync with Android
```bash
npx cap sync android
```

### Step 3: Build APK

**Option A: Using Gradle (Command Line)**
```bash
cd android
gradlew assembleDebug
cd ..
```

The APK will be at:
```
android\app\build\outputs\apk\debug\app-debug.apk
```

**Option B: Using Android Studio (GUI)**
```bash
npx cap open android
```

Then in Android Studio:
1. Build > Build Bundle(s) / APK(s) > Build APK(s)
2. Wait for build to complete
3. Click "locate" in the notification

### Step 4: Copy to Downloads
```bash
copy "android\app\build\outputs\apk\debug\app-debug.apk" "%USERPROFILE%\Downloads\PrimeFlex.apk"
```

---

## 📦 Build Types

### Debug APK (Faster)
- **Build time**: 3-5 minutes
- **File size**: Larger (~50-80 MB)
- **Use for**: Testing, development
- **Command**: `gradlew assembleDebug`

### Release APK (Optimized)
- **Build time**: 5-10 minutes
- **File size**: Smaller (~20-40 MB)
- **Use for**: Production, distribution
- **Command**: `gradlew assembleRelease`
- **Note**: Requires signing key

---

## 🔐 Signing Your APK (For Release)

If you want to create a signed release APK:

### Step 1: Check if you have a signing key
```
android\app\primeflex-release-key.jks
```

### Step 2: Build signed APK
```bash
cd android
gradlew assembleRelease
cd ..
```

### Step 3: Find signed APK
```
android\app\build\outputs\apk\release\app-release.apk
```

---

## 📍 APK Output Locations

After building, your APK will be in one of these locations:

### Debug APK:
```
android\app\build\outputs\apk\debug\app-debug.apk
```

### Release APK:
```
android\app\build\outputs\apk\release\app-release.apk
```

### After Script Runs:
```
C:\Users\ksair\Downloads\PrimeFlex.apk
```

---

## 📱 Install APK on Your Device

### Method 1: USB Cable
1. Connect your Android device to PC
2. Enable USB file transfer
3. Copy APK to device
4. Open file manager on device
5. Tap the APK file
6. Allow installation from unknown sources if prompted
7. Install

### Method 2: Google Drive / Cloud
1. Upload APK to Google Drive
2. Open Drive on your device
3. Download and install

### Method 3: Direct Transfer Apps
- Use apps like **Send Anywhere**
- Use apps like **ShareIt**
- Use **Bluetooth** file transfer

### Method 4: ADB (Developer Method)
```bash
adb install "%USERPROFILE%\Downloads\PrimeFlex.apk"
```

---

## 🔍 Troubleshooting

### Build Failed?

**Error: "npm not found"**
```bash
# Install Node.js from: https://nodejs.org/
```

**Error: "gradlew not found"**
```bash
# Make sure you're in the project directory
cd project-bolt-github-uarm9gkh\flex-zen-coach
```

**Error: "Android SDK not found"**
```bash
# Install Android Studio first
# Then set ANDROID_HOME environment variable
```

**Error: "Build failed with errors"**
```bash
# Clean build and try again
cd android
gradlew clean
gradlew assembleDebug
cd ..
```

### APK Not in Downloads?

Check these locations:
```
android\app\build\outputs\apk\debug\app-debug.apk
android\app\build\outputs\apk\release\app-release.apk
```

Manually copy:
```bash
copy "android\app\build\outputs\apk\debug\app-debug.apk" "%USERPROFILE%\Downloads\PrimeFlex.apk"
```

### Installation Failed on Device?

**Enable Unknown Sources:**
1. Settings > Security
2. Enable "Unknown Sources" or "Install Unknown Apps"
3. Try installing again

**Not Enough Space:**
- Free up space on device
- Uninstall old version first

**Parse Error:**
- APK might be corrupted
- Rebuild the APK
- Try transferring again

---

## 📊 Build Time Estimates

| Build Type | First Build | Subsequent Builds |
|------------|-------------|-------------------|
| Debug | 5-10 min | 2-5 min |
| Release | 10-15 min | 5-10 min |

*Times vary based on computer specs*

---

## ✅ Build Checklist

Before building:
- [ ] Node.js installed
- [ ] npm dependencies installed (`npm install`)
- [ ] Android Studio installed (optional but recommended)
- [ ] Java JDK installed
- [ ] Enough disk space (~2-3 GB free)

After building:
- [ ] APK file exists
- [ ] APK copied to Downloads
- [ ] APK size is reasonable (20-80 MB)
- [ ] Ready to transfer to device

---

## 🎯 Quick Commands Reference

```bash
# Full build process
npm run build
npx cap sync android
cd android
gradlew assembleDebug
cd ..

# Copy to Downloads
copy "android\app\build\outputs\apk\debug\app-debug.apk" "%USERPROFILE%\Downloads\PrimeFlex.apk"

# Open Downloads folder
explorer "%USERPROFILE%\Downloads"
```

---

## 📞 Need Help?

If you encounter issues:

1. **Check build logs** for error messages
2. **Clean build**: `cd android && gradlew clean`
3. **Reinstall dependencies**: `npm install`
4. **Update Capacitor**: `npm install @capacitor/core @capacitor/cli`
5. **Check Android Studio** for more detailed errors

---

## 🎉 Success!

Once you see:
```
BUILD SUCCESSFUL
```

Your APK is ready in the Downloads folder!

Transfer it to your device and install Prime Flex! 🚀

---

**Estimated Total Time**: 5-15 minutes
**Difficulty**: Easy (with scripts) / Medium (manual)
**Output**: PrimeFlex.apk in Downloads folder
