# 🚀 Quick Start - Replace Prime Flex App Icon

## ⚡ Fastest Method (5 Minutes)

### Step 1: Run the Icon Generator
```bash
cd project-bolt-github-uarm9gkh\flex-zen-coach
generate-app-icons.bat
```

### Step 2: Choose Option 1 (Android Asset Studio)
- Browser will open automatically
- Upload your image: `C:\Users\ksair\OneDrive\Pictures\WhatsApp Image 2025-09-10 at 3.30.25 PM (1).jpeg`
- Adjust padding if needed
- Click "Download"
- Extract ZIP file

### Step 3: Copy Icons
Copy all `mipmap-*` folders from the extracted ZIP to:
```
project-bolt-github-uarm9gkh\flex-zen-coach\android\app\src\main\res\
```

Replace existing folders when prompted.

### Step 4: Rebuild App
```bash
npm run build
npx cap sync android
npx cap open android
```

### Step 5: Build APK
In Android Studio:
- Build > Build Bundle(s) / APK(s) > Build APK(s)

### Step 6: Install & Test
- Uninstall old Prime Flex app
- Install new APK
- Check home screen for new icon ✅

---

## 📋 Icon Sizes Reference

| Density | Size | Folder |
|---------|------|--------|
| mdpi | 48x48 | mipmap-mdpi |
| hdpi | 72x72 | mipmap-hdpi |
| xhdpi | 96x96 | mipmap-xhdpi |
| xxhdpi | 144x144 | mipmap-xxhdpi |
| xxxhdpi | 192x192 | mipmap-xxxhdpi |

---

## 🔧 Alternative Methods

### Method 2: Capacitor Assets (Automatic)
```bash
# Copy your image to resources folder
mkdir resources
copy "C:\Users\ksair\OneDrive\Pictures\WhatsApp Image 2025-09-10 at 3.30.25 PM (1).jpeg" resources\icon.png

# Generate icons
npx @capacitor/assets generate --android
```

### Method 3: ImageMagick (Command Line)
```bash
# Install ImageMagick first
choco install imagemagick

# Run generator
generate-app-icons.bat
# Choose option 2
```

---

## ✅ Verification Checklist

- [ ] Icons copied to all mipmap folders
- [ ] AndroidManifest.xml references `@mipmap/ic_launcher`
- [ ] App rebuilt with `npm run build`
- [ ] Synced with `npx cap sync android`
- [ ] APK built in Android Studio
- [ ] Old app uninstalled from device
- [ ] New APK installed
- [ ] New icon visible on home screen

---

## 🐛 Troubleshooting

**Icon not updating?**
- Uninstall old app completely
- Clear device cache
- Restart device
- Reinstall new APK

**Icon looks stretched?**
- Add more padding to source image
- Use Android Asset Studio to adjust

**Build errors?**
- Clean build: `cd android && ./gradlew clean`
- Sync again: `npx cap sync android`

---

## 📞 Need Help?

See detailed guide: `REPLACE_APP_ICON_GUIDE.md`

---

**Estimated Time**: 5-10 minutes
**Difficulty**: Easy
**Tools Needed**: Web browser (for Android Asset Studio)

🎉 Your new Prime Flex icon will look amazing!
