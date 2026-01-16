# 🎨 Replace Prime Flex App Icon - Complete Guide

## 📋 Overview
This guide will help you replace the current Prime Flex launcher icon with your new logo.

**Source Image**: `C:\Users\ksair\OneDrive\Pictures\WhatsApp Image 2025-09-10 at 3.30.25 PM (1).jpeg`

---

## 🚀 Quick Method (Recommended)

### Option 1: Use Android Asset Studio (Easiest)

1. **Go to Android Asset Studio**:
   - Visit: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html

2. **Upload Your Image**:
   - Click "Image" tab
   - Click "Choose File"
   - Select: `C:\Users\ksair\OneDrive\Pictures\WhatsApp Image 2025-09-10 at 3.30.25 PM (1).jpeg`

3. **Configure Settings**:
   - **Name**: `ic_launcher`
   - **Trim**: Yes (to remove extra whitespace)
   - **Padding**: 10-20% (adjust to center your logo)
   - **Shape**: None (for square icon) or Circle/Rounded Square
   - **Background Color**: Choose your brand color or transparent

4. **Preview & Download**:
   - Preview how it looks on different devices
   - Click "Download" button
   - Extract the downloaded ZIP file

5. **Copy Icons to Your Project**:
   ```
   Extract the ZIP and copy all folders to:
   project-bolt-github-uarm9gkh\flex-zen-coach\android\app\src\main\res\
   
   This will replace:
   - mipmap-mdpi/
   - mipmap-hdpi/
   - mipmap-xhdpi/
   - mipmap-xxhdpi/
   - mipmap-xxxhdpi/
   - mipmap-anydpi-v26/
   ```

6. **Rebuild Your App**:
   ```bash
   cd project-bolt-github-uarm9gkh/flex-zen-coach
   npm run build
   npx cap sync android
   npx cap open android
   ```

7. **Build APK in Android Studio**:
   - Build > Build Bundle(s) / APK(s) > Build APK(s)
   - Install the new APK on your device

---

## 🛠️ Option 2: Manual Method (Using Image Editor)

If you prefer to create icons manually:

### Required Icon Sizes:

| Density | Folder | Size (px) | File Name |
|---------|--------|-----------|-----------|
| mdpi | mipmap-mdpi | 48 x 48 | ic_launcher.png |
| hdpi | mipmap-hdpi | 72 x 72 | ic_launcher.png |
| xhdpi | mipmap-xhdpi | 96 x 96 | ic_launcher.png |
| xxhdpi | mipmap-xxhdpi | 144 x 144 | ic_launcher.png |
| xxxhdpi | mipmap-xxxhdpi | 192 x 192 | ic_launcher.png |

### Round Icons (Optional but Recommended):

| Density | Folder | Size (px) | File Name |
|---------|--------|-----------|-----------|
| mdpi | mipmap-mdpi | 48 x 48 | ic_launcher_round.png |
| hdpi | mipmap-hdpi | 72 x 72 | ic_launcher_round.png |
| xhdpi | mipmap-xhdpi | 96 x 96 | ic_launcher_round.png |
| xxhdpi | mipmap-xxhdpi | 144 x 144 | ic_launcher_round.png |
| xxxhdpi | mipmap-xxxhdpi | 192 x 192 | ic_launcher_round.png |

### Steps:

1. **Open Your Image in Photo Editor** (Photoshop, GIMP, Paint.NET, etc.)

2. **Prepare Base Image**:
   - Resize to 512x512 px (master size)
   - Center your logo
   - Add padding around edges (10-20%)
   - Save as PNG with transparent background

3. **Create All Sizes**:
   - Resize to each required size
   - Maintain aspect ratio
   - Keep centered
   - Save as PNG

4. **Copy to Project**:
   ```
   Copy each icon to its respective folder:
   
   android/app/src/main/res/mipmap-mdpi/ic_launcher.png (48x48)
   android/app/src/main/res/mipmap-hdpi/ic_launcher.png (72x72)
   android/app/src/main/res/mipmap-xhdpi/ic_launcher.png (96x96)
   android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png (144x144)
   android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png (192x192)
   ```

---

## 🔧 Option 3: Use ImageMagick (Command Line)

If you have ImageMagick installed:

### Install ImageMagick:
```bash
# Download from: https://imagemagick.org/script/download.php
# Or use Chocolatey:
choco install imagemagick
```

### Run This Script:

Save this as `generate-icons.bat` in your project root:

```batch
@echo off
echo Generating Prime Flex App Icons...

set SOURCE="C:\Users\ksair\OneDrive\Pictures\WhatsApp Image 2025-09-10 at 3.30.25 PM (1).jpeg"
set OUTPUT_DIR="android\app\src\main\res"

echo Creating mdpi icons (48x48)...
magick %SOURCE% -resize 48x48 -gravity center -extent 48x48 %OUTPUT_DIR%\mipmap-mdpi\ic_launcher.png
magick %SOURCE% -resize 48x48 -gravity center -extent 48x48 %OUTPUT_DIR%\mipmap-mdpi\ic_launcher_round.png

echo Creating hdpi icons (72x72)...
magick %SOURCE% -resize 72x72 -gravity center -extent 72x72 %OUTPUT_DIR%\mipmap-hdpi\ic_launcher.png
magick %SOURCE% -resize 72x72 -gravity center -extent 72x72 %OUTPUT_DIR%\mipmap-hdpi\ic_launcher_round.png

echo Creating xhdpi icons (96x96)...
magick %SOURCE% -resize 96x96 -gravity center -extent 96x96 %OUTPUT_DIR%\mipmap-xhdpi\ic_launcher.png
magick %SOURCE% -resize 96x96 -gravity center -extent 96x96 %OUTPUT_DIR%\mipmap-xhdpi\ic_launcher_round.png

echo Creating xxhdpi icons (144x144)...
magick %SOURCE% -resize 144x144 -gravity center -extent 144x144 %OUTPUT_DIR%\mipmap-xxhdpi\ic_launcher.png
magick %SOURCE% -resize 144x144 -gravity center -extent 144x144 %OUTPUT_DIR%\mipmap-xxhdpi\ic_launcher_round.png

echo Creating xxxhdpi icons (192x192)...
magick %SOURCE% -resize 192x192 -gravity center -extent 192x192 %OUTPUT_DIR%\mipmap-xxxhdpi\ic_launcher.png
magick %SOURCE% -resize 192x192 -gravity center -extent 192x192 %OUTPUT_DIR%\mipmap-xxxhdpi\ic_launcher_round.png

echo Done! Icons generated successfully.
pause
```

Then run:
```bash
cd project-bolt-github-uarm9gkh\flex-zen-coach
generate-icons.bat
```

---

## 📱 Option 4: Use Capacitor Assets Generator

### Install the Plugin:
```bash
npm install -g @capacitor/assets
```

### Prepare Your Icon:
1. Copy your image to: `project-bolt-github-uarm9gkh/flex-zen-coach/resources/icon.png`
2. Make sure it's at least 1024x1024 px

### Generate Icons:
```bash
cd project-bolt-github-uarm9gkh/flex-zen-coach
npx capacitor-assets generate --android
```

This will automatically generate all required icon sizes!

---

## ✅ Verify AndroidManifest.xml

Your AndroidManifest.xml is already correctly configured:

```xml
<application
    android:icon="@mipmap/ic_launcher"
    android:roundIcon="@mipmap/ic_launcher_round"
    ...>
```

No changes needed here! ✅

---

## 🏗️ Build & Test

After replacing the icons:

### 1. Clean Build:
```bash
cd project-bolt-github-uarm9gkh/flex-zen-coach

# Clean previous builds
npm run build

# Sync with Android
npx cap sync android

# Open in Android Studio
npx cap open android
```

### 2. In Android Studio:
```
1. Build > Clean Project
2. Build > Rebuild Project
3. Build > Build Bundle(s) / APK(s) > Build APK(s)
```

### 3. Install on Device:
```
1. Uninstall old Prime Flex app from device
2. Install new APK
3. Check home screen for new icon
```

---

## 🎯 Icon Design Best Practices

### Do's:
✅ Use PNG format with transparency
✅ Center your logo with padding
✅ Use high-resolution source (1024x1024+)
✅ Test on multiple devices
✅ Keep design simple and recognizable
✅ Use consistent branding colors

### Don'ts:
❌ Don't stretch or distort the image
❌ Don't use text that's too small
❌ Don't use complex gradients (may not scale well)
❌ Don't forget to test on different Android versions
❌ Don't use copyrighted images without permission

---

## 🔍 Troubleshooting

### Icon Not Updating on Device?

**Solution 1**: Clear app data
```
Settings > Apps > Prime Flex > Storage > Clear Data
Uninstall and reinstall the app
```

**Solution 2**: Clean build
```bash
cd android
./gradlew clean
cd ..
npx cap sync android
```

**Solution 3**: Restart device
```
Sometimes Android caches icons - restart your device
```

### Icon Looks Stretched?

**Solution**: Add padding to your source image
- Open image in editor
- Add 10-20% padding around all sides
- Re-export and regenerate icons

### Icon Has White Background?

**Solution**: Ensure transparency
- Save as PNG with transparent background
- Don't use JPEG (doesn't support transparency)

---

## 📂 File Locations

### Current Icon Files:
```
android/app/src/main/res/
├── mipmap-mdpi/
│   ├── ic_launcher.png (48x48)
│   ├── ic_launcher_foreground.png
│   └── ic_launcher_round.png (48x48)
├── mipmap-hdpi/
│   ├── ic_launcher.png (72x72)
│   ├── ic_launcher_foreground.png
│   └── ic_launcher_round.png (72x72)
├── mipmap-xhdpi/
│   ├── ic_launcher.png (96x96)
│   ├── ic_launcher_foreground.png
│   └── ic_launcher_round.png (96x96)
├── mipmap-xxhdpi/
│   ├── ic_launcher.png (144x144)
│   ├── ic_launcher_foreground.png
│   └── ic_launcher_round.png (144x144)
├── mipmap-xxxhdpi/
│   ├── ic_launcher.png (192x192)
│   ├── ic_launcher_foreground.png
│   └── ic_launcher_round.png (192x192)
└── mipmap-anydpi-v26/
    ├── ic_launcher.xml
    └── ic_launcher_round.xml
```

### AndroidManifest.xml:
```
android/app/src/main/AndroidManifest.xml
```

---

## 🎨 Recommended Tools

1. **Android Asset Studio** (Online, Free)
   - https://romannurik.github.io/AndroidAssetStudio/

2. **App Icon Generator** (Online, Free)
   - https://appicon.co/

3. **Capacitor Assets** (CLI, Free)
   - `npm install -g @capacitor/assets`

4. **ImageMagick** (CLI, Free)
   - https://imagemagick.org/

5. **GIMP** (Desktop, Free)
   - https://www.gimp.org/

6. **Photoshop** (Desktop, Paid)
   - Professional option

---

## ✨ Quick Checklist

- [ ] Prepare source image (1024x1024 px recommended)
- [ ] Generate all icon sizes (mdpi to xxxhdpi)
- [ ] Copy icons to mipmap folders
- [ ] Verify AndroidManifest.xml references
- [ ] Clean build project
- [ ] Sync with Capacitor
- [ ] Build APK in Android Studio
- [ ] Uninstall old app from device
- [ ] Install new APK
- [ ] Verify new icon appears on home screen

---

## 📞 Need Help?

If you encounter issues:
1. Check that all icon files are PNG format
2. Verify file names match exactly (ic_launcher.png)
3. Ensure icons are in correct folders
4. Try clean build and reinstall
5. Check Android Studio build logs for errors

---

**Status**: Ready to implement
**Estimated Time**: 10-15 minutes
**Difficulty**: Easy

🎉 Your new Prime Flex icon will look great on the home screen!
