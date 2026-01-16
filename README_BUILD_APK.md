# 📱 Build Prime Flex APK - Quick Guide

## 🚀 Easiest Way (One Click)

### Option 1: Quick Build (Recommended)
Double-click: **`build-apk-simple.bat`**

This will:
1. Build your web app
2. Sync with Android
3. Build the APK
4. Copy to Downloads folder
5. Open Downloads folder

**Time**: 5-10 minutes

---

### Option 2: Full Build (With Logs)
Double-click: **`build-and-copy-apk.bat`**

Same as Option 1 but with detailed progress logs and tries release build first.

**Time**: 5-15 minutes

---

### Option 3: Copy Existing APK
If you already built the APK before, just double-click: **`copy-existing-apk.bat`**

This will find and copy your existing APK to Downloads.

**Time**: 5 seconds

---

## 📂 Where is the APK?

After running the script, your APK will be at:
```
C:\Users\ksair\Downloads\PrimeFlex.apk
```

The Downloads folder will open automatically!

---

## 📱 Install on Your Device

### Method 1: USB Cable
1. Connect phone to PC
2. Copy `PrimeFlex.apk` to phone
3. Open file on phone
4. Install

### Method 2: Google Drive
1. Upload APK to Google Drive
2. Download on phone
3. Install

### Method 3: Email
1. Email APK to yourself
2. Download on phone
3. Install

### Method 4: ADB (Developer)
```bash
adb install "%USERPROFILE%\Downloads\PrimeFlex.apk"
```

---

## ⚙️ Requirements

Before building, make sure you have:
- ✅ Node.js installed
- ✅ npm dependencies installed (`npm install`)
- ✅ Android Studio (optional but recommended)
- ✅ Java JDK

---

## 🐛 Troubleshooting

### Build Failed?

**Try this:**
```bash
cd project-bolt-github-uarm9gkh\flex-zen-coach
npm install
npm run build
npx cap sync android
```

Then run the build script again.

### APK Not Found?

Check these locations manually:
```
android\app\build\outputs\apk\debug\app-debug.apk
android\app\build\outputs\apk\release\app-release.apk
```

### Can't Install on Phone?

Enable "Unknown Sources" in phone settings:
- Settings > Security > Unknown Sources (enable)

---

## 📊 Build Scripts Comparison

| Script | Speed | Use Case |
|--------|-------|----------|
| `build-apk-simple.bat` | Fast | Quick testing |
| `build-and-copy-apk.bat` | Medium | Production build |
| `copy-existing-apk.bat` | Instant | Already built |

---

## ✅ Quick Checklist

- [ ] Run build script
- [ ] Wait for completion (5-10 min)
- [ ] Check Downloads folder
- [ ] Transfer APK to phone
- [ ] Install on phone
- [ ] Enjoy Prime Flex!

---

## 🎯 Expected Output

After successful build:
```
========================================
  SUCCESS!
========================================

APK Location: C:\Users\ksair\Downloads\PrimeFlex.apk
Build Type: debug

You can now:
1. Transfer the APK to your Android device
2. Install it on your device
3. Enjoy Prime Flex!
```

---

## 📞 Need Help?

See detailed guide: **`BUILD_APK_GUIDE.md`**

---

**Ready?** Just double-click `build-apk-simple.bat` and wait! 🚀
