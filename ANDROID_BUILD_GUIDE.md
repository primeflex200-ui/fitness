# 📱 Android APK Build Guide - PRIME FLEX

## ✅ Setup Complete!

Your Android project has been created successfully!

---

## 🚀 Build APK Steps

### Option 1: Using Android Studio (Recommended)

#### Step 1: Open Android Studio
```bash
npx cap open android
```

This will open your project in Android Studio.

#### Step 2: Build APK
1. In Android Studio, click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Wait for build to complete (2-5 minutes)
3. Click **locate** when build finishes
4. APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

#### Step 3: Install on Phone
- Connect your phone via USB
- Enable USB Debugging on phone
- Click **Run** (green play button) in Android Studio
- Or manually install: `adb install app-debug.apk`

---

### Option 2: Command Line Build

#### Build Debug APK
```bash
cd android
./gradlew assembleDebug
```

APK Location: `android/app/build/outputs/apk/debug/app-debug.apk`

#### Build Release APK (For Play Store)
```bash
cd android
./gradlew assembleRelease
```

---

## 📦 For Play Store Submission

### Step 1: Generate Signing Key
```bash
keytool -genkey -v -keystore primeflex-release-key.keystore -alias primeflex -keyalg RSA -keysize 2048 -validity 10000
```

**IMPORTANT:** Save this keystore file and password safely! You'll need it for all future updates.

### Step 2: Configure Signing

Create `android/key.properties`:
```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=primeflex
storeFile=../primeflex-release-key.keystore
```

### Step 3: Update build.gradle

Add to `android/app/build.gradle` (before `android {`):
```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Add inside `android { buildTypes {`:
```gradle
release {
    signingConfig signingConfigs.release
    minifyEnabled false
    proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
}
```

Add inside `android {` (after `buildTypes {}`):
```gradle
signingConfigs {
    release {
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
        storePassword keystoreProperties['storePassword']
    }
}
```

### Step 4: Build Signed APK/AAB
```bash
cd android
./gradlew bundleRelease
```

**AAB Location:** `android/app/build/outputs/bundle/release/app-release.aab`

This AAB file is what you upload to Play Store!

---

## 📋 Play Store Requirements Checklist

### ✅ Technical Requirements (Already Done!)
- [x] App ID: `com.primeflex.app`
- [x] App Name: `PRIME FLEX`
- [x] Version: `3.1.0` (versionCode: 1)
- [x] Target SDK: 34 (Android 14)
- [x] Min SDK: 22 (Android 5.1)

### ⚠️ Assets Needed (You Need to Create)
- [ ] **App Icon** (512x512 PNG, no transparency)
- [ ] **Feature Graphic** (1024x500 PNG)
- [ ] **Screenshots** (at least 2, max 8)
  - Phone: 1080x1920 or 1080x2340
  - Tablet: 1200x1920 (optional)
- [ ] **Privacy Policy URL** (required!)
- [ ] **Short Description** (max 80 characters)
- [ ] **Full Description** (max 4000 characters)

### 📝 Store Listing Content

#### Short Description (80 chars)
```
AI-powered fitness coach with diet plans, workout tracking & supplement guide
```

#### Full Description (Sample)
```
🏋️ PRIME FLEX - Your Complete Fitness Companion

Transform your fitness journey with PRIME FLEX, the all-in-one fitness app powered by AI!

✨ KEY FEATURES:

🤖 AI Diet Plan Generator
• Personalized meal plans based on your goals
• Supports vegetarian & non-vegetarian diets
• Allergy management
• 1000+ food database with nutrition info

💪 Comprehensive Workout Tracking
• Strength training programs
• Cardio tracking with background timer
• Calisthenics routines
• Progress tracking with graphs

💊 Supplement Guide (100+ Q&As)
• Expert advice on supplements
• Safety information
• Dosage recommendations
• Instant answers to common questions

💧 Smart Water Reminders
• Custom interval notifications
• Daily intake tracking
• Progress monitoring

📊 Progress Tracking
• Weight tracking
• Body measurements
• Photo progress
• Workout history

🎯 Additional Features:
• Weekly workout scheduler
• Body fat calculator
• Mind-muscle connection training
• Video workout library
• Personalized recommendations

Perfect for:
✓ Beginners starting their fitness journey
✓ Intermediate gym-goers
✓ Advanced athletes
✓ Anyone looking to improve their health

Download PRIME FLEX today and start your transformation! 💪

---
Category: Health & Fitness
Content Rating: Everyone
```

---

## 🎨 Creating App Assets

### App Icon (512x512)
Use your existing logo or create one:
- No transparency
- High contrast
- Simple design
- Recognizable at small sizes

### Feature Graphic (1024x500)
Banner image showing:
- App name
- Key features
- Attractive visuals

### Screenshots
Take screenshots of:
1. Dashboard/Home screen
2. AI Diet Plan Generator
3. Workout tracking
4. Progress graphs
5. Supplement chatbot
6. Water reminder

---

## 🔐 Privacy Policy

You MUST have a privacy policy. Here's a template:

```
Privacy Policy for PRIME FLEX

Last updated: [DATE]

1. Information We Collect
- Account information (email, name)
- Fitness data (workouts, diet, progress)
- Usage data

2. How We Use Information
- Provide personalized fitness recommendations
- Track your progress
- Improve app functionality

3. Data Storage
- Stored securely on Supabase servers
- Encrypted in transit and at rest

4. Third-Party Services
- Supabase (database)
- OpenAI (AI features)

5. Your Rights
- Access your data
- Delete your account
- Export your data

6. Contact
[Your email address]
```

Host this on:
- Your website
- GitHub Pages
- Google Sites (free)

---

## 📱 Testing Before Submission

### Test Checklist:
- [ ] App installs successfully
- [ ] All features work offline (where applicable)
- [ ] No crashes on startup
- [ ] Login/signup works
- [ ] AI features work (with API keys)
- [ ] Notifications work
- [ ] Back button works correctly
- [ ] App doesn't request unnecessary permissions

---

## 🚀 Submission Process

### Step 1: Create Developer Account
- Go to: https://play.google.com/console
- Pay $25 one-time fee
- Complete registration

### Step 2: Create App
- Click "Create app"
- Fill in app details
- Select category: Health & Fitness
- Set content rating: Everyone

### Step 3: Upload Assets
- Upload all graphics
- Add screenshots
- Write descriptions
- Add privacy policy URL

### Step 4: Upload AAB
- Go to "Release" → "Production"
- Upload `app-release.aab`
- Fill in release notes

### Step 5: Submit for Review
- Review all information
- Submit for review
- Wait 1-7 days for approval

---

## 📊 Current App Status

### ✅ Ready:
- App functionality complete
- 100+ supplement Q&As
- AI diet plans
- Workout tracking
- Water reminders
- Body fat calculator
- Progress tracking
- User authentication

### ⚠️ Need to Add:
- Privacy policy URL
- App icon (512x512)
- Feature graphic
- Screenshots
- Store descriptions

---

## 💡 Tips for Success

1. **Test Thoroughly:** Install on multiple devices
2. **Good Screenshots:** Show best features
3. **Clear Description:** Highlight unique features (AI, 100 Q&As)
4. **Keywords:** Use relevant keywords in description
5. **Updates:** Plan regular updates to keep users engaged

---

## 🎯 Next Steps

1. **Now:** Build debug APK and test on your phone
2. **Today:** Create app icon and screenshots
3. **Tomorrow:** Write privacy policy
4. **This Week:** Create Play Store account
5. **Next Week:** Submit to Play Store!

---

## 📞 Need Help?

Common issues:
- **Gradle build fails:** Update Android Studio
- **APK too large:** Enable ProGuard/R8
- **App crashes:** Check logs with `adb logcat`

---

**Your app is ready for the Play Store! Just need the assets and privacy policy.** 🚀

Good luck with your launch! 💪
