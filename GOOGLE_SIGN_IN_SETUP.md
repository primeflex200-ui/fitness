# Google Sign-In Setup Guide for Android

Google Sign-In has been implemented but requires configuration in Google Cloud Console. Follow these steps:

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Name it "PRIME FLEX" or similar

## Step 2: Enable Google Sign-In API

1. In Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Google Sign-In API" or "Google+ API"
3. Click **Enable**

## Step 3: Create OAuth 2.0 Credentials

### A. Create Web Client ID (for Supabase)

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Choose **Web application**
4. Name: "PRIME FLEX Web"
5. **Authorized redirect URIs:** Add your Supabase callback URL:
   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```
6. Click **Create**
7. **SAVE THE CLIENT ID** - you'll need it!

### B. Create Android Client ID

1. Click **Create Credentials** → **OAuth 2.0 Client ID** again
2. Choose **Android**
3. Name: "PRIME FLEX Android"
4. **Package name:** `com.primeflex.app`
5. **SHA-1 certificate fingerprint:** Get it using:

#### Get SHA-1 Fingerprint:

**For Debug APK:**
```bash
cd android
./gradlew signingReport
```
Look for "SHA1" under "Variant: debug"

**OR use keytool:**
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**For Release APK (if you have a keystore):**
```bash
keytool -list -v -keystore path/to/your/keystore.jks -alias your-alias
```

6. Paste the SHA-1 fingerprint
7. Click **Create**

## Step 4: Configure Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** → **Providers**
4. Find **Google** and enable it
5. Paste your **Web Client ID** from Step 3A
6. Paste your **Web Client Secret** (from Google Cloud Console)
7. Click **Save**

## Step 5: Update Your App Configuration

### Update `capacitor.config.ts`:

Replace `YOUR_WEB_CLIENT_ID` with your actual Web Client ID:

```typescript
GoogleAuth: {
  scopes: ['profile', 'email'],
  serverClientId: 'YOUR_ACTUAL_WEB_CLIENT_ID.apps.googleusercontent.com',
  forceCodeForRefreshToken: true
}
```

### Update `src/services/googleAuthService.ts`:

Replace `YOUR_WEB_CLIENT_ID` with your actual Web Client ID:

```typescript
GoogleAuth.initialize({
  clientId: 'YOUR_ACTUAL_WEB_CLIENT_ID.apps.googleusercontent.com',
  scopes: ['profile', 'email'],
  grantOfflineAccess: true,
});
```

## Step 6: Add Google Button to Auth Page

The Google Sign-In button needs to be added to your Auth page. I'll create that next.

## Step 7: Build and Test

```bash
npm run build
npx cap sync android
```

Then build APK in Android Studio and test!

## Troubleshooting

### "Sign in failed" or "Error 10"
- Check SHA-1 fingerprint is correct
- Make sure package name matches exactly: `com.primeflex.app`
- Verify Web Client ID is correct in both files

### "Invalid client"
- Web Client ID doesn't match
- Check Supabase Google provider is enabled

### "Redirect URI mismatch"
- Add Supabase callback URL to authorized redirect URIs in Google Cloud Console

## Important Notes

1. **Debug vs Release:** You need different SHA-1 fingerprints for debug and release builds
2. **Multiple SHA-1s:** You can add multiple SHA-1 fingerprints to the same Android OAuth client
3. **Web Client ID:** Use the WEB client ID in your app config, not the Android client ID

## Quick Reference

- **Package Name:** `com.primeflex.app`
- **Web Client ID Location:** Google Cloud Console → Credentials
- **SHA-1 Command:** `cd android && ./gradlew signingReport`
- **Supabase Callback:** `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
