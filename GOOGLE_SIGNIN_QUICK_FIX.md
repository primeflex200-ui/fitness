# Google Sign-In Quick Fix Guide

## Problem
Google Sign-In is not working because the OAuth credentials are not configured.

## Quick Solution (5 minutes)

### Step 1: Get Your SHA-1 Fingerprint

Open terminal in the project folder and run:

```bash
cd android
./gradlew signingReport
```

Look for the **SHA-1** under `Variant: debug` - it looks like:
```
SHA1: A1:B2:C3:D4:E5:F6:G7:H8:I9:J0:K1:L2:M3:N4:O5:P6:Q7:R8:S9:T0
```

**Copy this SHA-1 value!**

### Step 2: Go to Google Cloud Console

1. Visit: https://console.cloud.google.com/
2. Create a new project or select existing one
3. Name it: "PrimeFlex" or any name you want

### Step 3: Enable Google Sign-In API

1. Go to **APIs & Services** → **Library**
2. Search for "Google Sign-In API"
3. Click **Enable**

### Step 4: Create OAuth Credentials

#### A. Create Web Client ID (for Supabase):

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Choose **Web application**
4. Name: "PrimeFlex Web"
5. Add Authorized redirect URI:
   ```
   https://qgdebpaplzjuasdwddjf.supabase.co/auth/v1/callback
   ```
6. Click **Create**
7. **COPY THE CLIENT ID** (looks like: `123456789-abc.apps.googleusercontent.com`)
8. **COPY THE CLIENT SECRET**

#### B. Create Android Client ID:

1. Click **Create Credentials** → **OAuth client ID** again
2. Choose **Android**
3. Name: "PrimeFlex Android"
4. Package name: `com.primeflex.app`
5. **Paste your SHA-1** from Step 1
6. Click **Create**

### Step 5: Configure Supabase

1. Go to: https://supabase.com/dashboard/project/qgdebpaplzjuasdwddjf
2. Go to **Authentication** → **Providers**
3. Find **Google** and toggle it ON
4. Paste your **Web Client ID** from Step 4A
5. Paste your **Web Client Secret** from Step 4A
6. Click **Save**

### Step 6: Update Your App Code

#### Update `capacitor.config.ts`:

Replace line 20 with your Web Client ID:

```typescript
serverClientId: '123456789-abc.apps.googleusercontent.com', // Your actual Web Client ID
```

#### Update `src/services/googleAuthService.ts`:

Replace line 8 with your Web Client ID:

```typescript
clientId: '123456789-abc.apps.googleusercontent.com', // Your actual Web Client ID
```

### Step 7: Rebuild and Test

```bash
npm run build
npx cap sync android
cd android
$env:JAVA_HOME="C:\Program Files\Java\jdk-21"
.\gradlew assembleDebug
```

Copy the new APK to Downloads:
```bash
copy app\build\outputs\apk\debug\app-debug.apk $env:USERPROFILE\Downloads\PrimeFlex-GoogleFixed.apk
```

## Important Notes

1. **Use Web Client ID** in your app config, NOT the Android Client ID
2. **SHA-1 is required** for Android OAuth to work
3. **Package name must match exactly**: `com.primeflex.app`
4. **Different SHA-1 for release builds** - Add both if you plan to release

## Testing

1. Install the new APK on your phone
2. Click "Sign in with Google"
3. Select your Google account
4. Should redirect to dashboard

## Troubleshooting

### "Sign-in failed" or "Invalid client"
- Double-check the Web Client ID is correct in both files
- Make sure SHA-1 is added to Android OAuth client
- Verify package name is exactly `com.primeflex.app`

### "Unauthorized"
- Check Supabase Google provider is enabled
- Verify redirect URI is correct in Google Cloud Console

### Still not working?
- Try clearing app data on your phone
- Rebuild the app completely
- Check Google Cloud Console for any error logs

## Quick Reference

- **Package Name:** `com.primeflex.app`
- **Supabase URL:** `https://qgdebpaplzjuasdwddjf.supabase.co`
- **Redirect URI:** `https://qgdebpaplzjuasdwddjf.supabase.co/auth/v1/callback`
- **SHA-1 Command:** `cd android && ./gradlew signingReport`

## Alternative: Disable Google Sign-In Temporarily

If you want to disable Google Sign-In for now and only use email/password:

1. Open `src/pages/Auth.tsx`
2. Find the Google Sign-In buttons (around lines 545 and 740)
3. Add `disabled={true}` or comment them out
4. Rebuild the app

Users can still sign up and log in with email/password!
