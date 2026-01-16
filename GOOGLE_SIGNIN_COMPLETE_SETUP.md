# Google Sign-In - Complete Setup Instructions

Google Sign-In has been implemented in your app! However, it requires configuration in Google Cloud Console to work. Follow these steps carefully:

## ✅ What's Already Done

1. ✅ Google Auth plugin installed
2. ✅ Google Sign-In button added to Auth page
3. ✅ Google Auth service created
4. ✅ Capacitor config updated
5. ✅ App synced with Android

## 🔧 What You Need To Do

### Step 1: Get SHA-1 Fingerprint

Run this command to get your SHA-1 fingerprint:

```bash
cd android
./gradlew signingReport
```

Look for output like this:
```
Variant: debug
Config: debug
Store: ~/.android/debug.keystore
Alias: AndroidDebugKey
MD5: XX:XX:XX...
SHA1: AA:BB:CC:DD:EE:FF:11:22:33:44:55:66:77:88:99:00:AA:BB:CC:DD
SHA-256: ...
```

**Copy the SHA1 value!**

### Step 2: Create Google Cloud Project

1. Go to https://console.cloud.google.com/
2. Create new project: "PRIME FLEX"
3. Enable "Google Sign-In API"

### Step 3: Create OAuth Credentials

#### A. Web Client ID (for Supabase):

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Name: "PRIME FLEX Web"
5. Authorized redirect URIs: Add your Supabase callback:
   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```
6. Click **Create**
7. **SAVE THE CLIENT ID** (looks like: `123456789-abc.apps.googleusercontent.com`)

#### B. Android Client ID:

1. Click **Create Credentials** → **OAuth 2.0 Client ID** again
2. Application type: **Android**
3. Name: "PRIME FLEX Android"
4. Package name: `com.primeflex.app`
5. SHA-1 fingerprint: **Paste the SHA-1 from Step 1**
6. Click **Create**

### Step 4: Configure Supabase

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Authentication** → **Providers**
4. Find **Google** and toggle it ON
5. Enter your **Web Client ID** from Step 3A
6. Enter your **Web Client Secret** (from Google Cloud Console)
7. Click **Save**

### Step 5: Update App Configuration

#### Update `capacitor.config.ts`:

Replace `YOUR_WEB_CLIENT_ID` with your actual Web Client ID:

```typescript
GoogleAuth: {
  scopes: ['profile', 'email'],
  serverClientId: '123456789-abc.apps.googleusercontent.com', // Your actual Web Client ID
  forceCodeForRefreshToken: true
}
```

#### Update `src/services/googleAuthService.ts`:

Replace `YOUR_WEB_CLIENT_ID` with your actual Web Client ID:

```typescript
GoogleAuth.initialize({
  clientId: '123456789-abc.apps.googleusercontent.com', // Your actual Web Client ID
  scopes: ['profile', 'email'],
  grantOfflineAccess: true,
});
```

### Step 6: Rebuild and Test

```bash
npm run build
npx cap sync android
```

Then open in Android Studio and build APK.

## 🧪 Testing

1. Install the APK on your phone
2. Open the app
3. Go to Login page
4. Click "Continue with Google"
5. Select your Google account
6. Grant permissions
7. You should be logged in!

## ❌ Troubleshooting

### Error: "Sign in failed" or "Error 10"
- **Cause:** SHA-1 fingerprint doesn't match
- **Fix:** Double-check SHA-1 in Google Cloud Console matches your keystore

### Error: "Invalid client"
- **Cause:** Web Client ID is wrong
- **Fix:** Verify the Client ID in both config files matches Google Cloud Console

### Error: "Redirect URI mismatch"
- **Cause:** Supabase callback URL not added to Google OAuth
- **Fix:** Add `https://YOUR_PROJECT.supabase.co/auth/v1/callback` to authorized redirect URIs

### Button does nothing
- **Cause:** Configuration not updated
- **Fix:** Make sure you replaced `YOUR_WEB_CLIENT_ID` in both files

## 📝 Quick Checklist

- [ ] Got SHA-1 fingerprint
- [ ] Created Google Cloud project
- [ ] Created Web OAuth client
- [ ] Created Android OAuth client with SHA-1
- [ ] Enabled Google provider in Supabase
- [ ] Added Web Client ID and Secret to Supabase
- [ ] Updated `capacitor.config.ts` with Web Client ID
- [ ] Updated `googleAuthService.ts` with Web Client ID
- [ ] Rebuilt app: `npm run build && npx cap sync android`
- [ ] Tested on phone

## 🎯 Important Notes

1. **Use Web Client ID** in your app config, NOT the Android Client ID
2. **SHA-1 is required** for Android OAuth to work
3. **Different SHA-1 for debug/release** - Add both if you have a release keystore
4. **Package name must match:** `com.primeflex.app`

## 📞 Need Help?

If Google Sign-In still doesn't work after following all steps:
1. Check Android Logcat for error messages
2. Verify all Client IDs match
3. Ensure SHA-1 is correct
4. Try regenerating OAuth credentials

Good luck! 🚀
