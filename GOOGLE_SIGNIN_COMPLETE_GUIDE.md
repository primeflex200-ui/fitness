# Complete Google Sign-In Setup Guide for PrimeFlex

## Overview
This guide will help you enable Google Sign-In in your PrimeFlex app. It takes about 10-15 minutes.

---

## Part 1: Get Your App's SHA-1 Fingerprint

### Step 1: Open Terminal/Command Prompt

Navigate to your project's android folder:
```bash
cd "C:\Users\ksair\Downloads\cursor project prime flex(main prime flex)\project-bolt-github-uarm9gkh\flex-zen-coach\android"
```

### Step 2: Run Signing Report

For Windows PowerShell:
```powershell
.\gradlew signingReport
```

For Windows CMD:
```cmd
gradlew signingReport
```

### Step 3: Find Your SHA-1

Look for the output under **Variant: debug**. You'll see something like:

```
Variant: debug
Config: debug
Store: C:\Users\ksair\.android\debug.keystore
Alias: AndroidDebugKey
MD5: 12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF
SHA1: A1:B2:C3:D4:E5:F6:G7:H8:I9:J0:K1:L2:M3:N4:O5:P6:Q7:R8:S9:T0
SHA-256: ...
```

**COPY THE SHA1 VALUE** - You'll need it later!

Example: `A1:B2:C3:D4:E5:F6:G7:H8:I9:J0:K1:L2:M3:N4:O5:P6:Q7:R8:S9:T0`

---

## Part 2: Google Cloud Console Setup

### Step 1: Go to Google Cloud Console

1. Open browser and go to: https://console.cloud.google.com/
2. Sign in with your Google account (use primeflex200@gmail.com or your preferred account)

### Step 2: Create a New Project

1. Click on the project dropdown at the top
2. Click **"New Project"**
3. Project name: `PrimeFlex`
4. Click **"Create"**
5. Wait for project to be created (takes a few seconds)
6. Make sure the new project is selected

### Step 3: Enable Google Sign-In API

1. In the left sidebar, go to **"APIs & Services"** → **"Library"**
2. Search for: `Google Sign-In API`
3. Click on it
4. Click **"Enable"**
5. Wait for it to enable

---

## Part 3: Create OAuth Credentials

### A. Create Web Client ID (for Supabase)

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. If prompted to configure consent screen:
   - Click **"Configure Consent Screen"**
   - Choose **"External"**
   - Click **"Create"**
   - Fill in:
     - App name: `PrimeFlex`
     - User support email: Your email
     - Developer contact: Your email
   - Click **"Save and Continue"**
   - Skip "Scopes" (click "Save and Continue")
   - Skip "Test users" (click "Save and Continue")
   - Click **"Back to Dashboard"**

4. Now create the OAuth client:
   - Click **"Create Credentials"** → **"OAuth client ID"**
   - Application type: **"Web application"**
   - Name: `PrimeFlex Web Client`
   
5. Add Authorized redirect URI:
   - Click **"+ Add URI"**
   - Enter: `https://qgdebpaplzjuasdwddjf.supabase.co/auth/v1/callback`
   - Click **"Create"**

6. **IMPORTANT:** A popup will show your credentials:
   - **Client ID** (looks like: `123456789-abc123def456.apps.googleusercontent.com`)
   - **Client Secret** (looks like: `GOCSPX-abc123def456`)
   - **COPY BOTH AND SAVE THEM SOMEWHERE SAFE!**

### B. Create Android Client ID

1. Still in **"Credentials"**, click **"Create Credentials"** → **"OAuth client ID"** again
2. Application type: **"Android"**
3. Name: `PrimeFlex Android`
4. Package name: `com.primeflex.app`
5. **SHA-1 certificate fingerprint:** Paste the SHA-1 you copied in Part 1
6. Click **"Create"**
7. You'll see a confirmation - click **"OK"**

---

## Part 4: Configure Supabase

### Step 1: Go to Supabase Dashboard

1. Open: https://supabase.com/dashboard
2. Sign in with your account
3. Select your project: `qgdebpaplzjuasdwddjf`

### Step 2: Enable Google Provider

1. In the left sidebar, go to **"Authentication"** → **"Providers"**
2. Find **"Google"** in the list
3. Toggle it **ON** (switch to enabled)

### Step 3: Add Your Credentials

1. In the Google provider settings:
   - **Client ID (for OAuth):** Paste your Web Client ID from Part 3A
   - **Client Secret (for OAuth):** Paste your Web Client Secret from Part 3A
2. Click **"Save"**

### Step 4: Verify Redirect URL

Make sure the redirect URL is:
```
https://qgdebpaplzjuasdwddjf.supabase.co/auth/v1/callback
```

This should already be set by Supabase.

---

## Part 5: Update Your App Code

### Step 1: Update capacitor.config.ts

1. Open: `project-bolt-github-uarm9gkh/flex-zen-coach/capacitor.config.ts`
2. Find line 20 (in the GoogleAuth section)
3. Replace `YOUR_WEB_CLIENT_ID.apps.googleusercontent.com` with your actual Web Client ID

**Before:**
```typescript
GoogleAuth: {
  scopes: ['profile', 'email'],
  serverClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  forceCodeForRefreshToken: true
}
```

**After:**
```typescript
GoogleAuth: {
  scopes: ['profile', 'email'],
  serverClientId: '123456789-abc123def456.apps.googleusercontent.com', // Your actual Client ID
  forceCodeForRefreshToken: true
}
```

### Step 2: Update googleAuthService.ts

1. Open: `project-bolt-github-uarm9gkh/flex-zen-coach/src/services/googleAuthService.ts`
2. Find line 8 (in the initialize section)
3. Replace `YOUR_WEB_CLIENT_ID.apps.googleusercontent.com` with your actual Web Client ID

**Before:**
```typescript
GoogleAuth.initialize({
  clientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  scopes: ['profile', 'email'],
  grantOfflineAccess: true,
});
```

**After:**
```typescript
GoogleAuth.initialize({
  clientId: '123456789-abc123def456.apps.googleusercontent.com', // Your actual Client ID
  scopes: ['profile', 'email'],
  grantOfflineAccess: true,
});
```

---

## Part 6: Rebuild Your App

### Step 1: Build the Web Assets

Open terminal in project folder:
```bash
cd "C:\Users\ksair\Downloads\cursor project prime flex(main prime flex)\project-bolt-github-uarm9gkh\flex-zen-coach"
npm run build
```

### Step 2: Sync to Android

```bash
npx cap sync android
```

### Step 3: Build APK

```bash
cd android
$env:JAVA_HOME="C:\Program Files\Java\jdk-21"
.\gradlew assembleDebug
```

### Step 4: Copy APK to Downloads

```bash
copy app\build\outputs\apk\debug\app-debug.apk $env:USERPROFILE\Downloads\PrimeFlex-GoogleEnabled.apk
```

---

## Part 7: Test Google Sign-In

### Step 1: Install New APK

1. Transfer `PrimeFlex-GoogleEnabled.apk` to your phone
2. Install it (uninstall old version first if needed)

### Step 2: Test Sign-In

1. Open the app
2. Click **"Sign in with Google"**
3. Select your Google account
4. Grant permissions
5. You should be redirected to the Dashboard!

---

## Troubleshooting

### Error: "Sign-in failed" or "Invalid client"

**Cause:** Client ID is incorrect or not matching

**Fix:**
1. Double-check the Web Client ID in both files matches exactly
2. Make sure you used the **Web Client ID**, not the Android Client ID
3. Verify the Client ID in Google Cloud Console

### Error: "Unauthorized" or "Redirect URI mismatch"

**Cause:** Redirect URI doesn't match

**Fix:**
1. Go to Google Cloud Console → Credentials
2. Click on your Web Client ID
3. Make sure Authorized redirect URI is: `https://qgdebpaplzjuasdwddjf.supabase.co/auth/v1/callback`
4. Save changes

### Error: "Package name mismatch"

**Cause:** Package name doesn't match

**Fix:**
1. Make sure Android OAuth client has package name: `com.primeflex.app`
2. Make sure SHA-1 is correct

### Error: "Developer Error" or "10"

**Cause:** SHA-1 fingerprint is missing or incorrect

**Fix:**
1. Go to Google Cloud Console → Credentials
2. Click on your Android OAuth client
3. Verify SHA-1 is correct
4. If wrong, delete and create new Android OAuth client with correct SHA-1

### Still Not Working?

1. **Clear app data** on your phone
2. **Uninstall and reinstall** the app
3. **Check Google Cloud Console** for any error logs
4. **Verify all steps** were completed correctly

---

## Quick Reference

### Your Project Details:
- **Package Name:** `com.primeflex.app`
- **Supabase URL:** `https://qgdebpaplzjuasdwddjf.supabase.co`
- **Redirect URI:** `https://qgdebpaplzjuasdwddjf.supabase.co/auth/v1/callback`

### Files to Update:
1. `capacitor.config.ts` (line 20)
2. `src/services/googleAuthService.ts` (line 8)

### Commands:
```bash
# Get SHA-1
cd android
.\gradlew signingReport

# Build app
cd ..
npm run build
npx cap sync android
cd android
$env:JAVA_HOME="C:\Program Files\Java\jdk-21"
.\gradlew assembleDebug
```

---

## Important Notes

1. **Use Web Client ID** in your app code, NOT the Android Client ID
2. **SHA-1 is required** for Android OAuth to work
3. **Different SHA-1 for release builds** - You'll need to add release SHA-1 when you publish
4. **Keep Client Secret secure** - Don't share it publicly
5. **Test on real device** - Google Sign-In may not work on emulators

---

## Summary Checklist

- [ ] Got SHA-1 fingerprint from `gradlew signingReport`
- [ ] Created Google Cloud project
- [ ] Enabled Google Sign-In API
- [ ] Created Web OAuth client with redirect URI
- [ ] Created Android OAuth client with SHA-1
- [ ] Copied Web Client ID and Secret
- [ ] Enabled Google provider in Supabase
- [ ] Added Client ID and Secret to Supabase
- [ ] Updated `capacitor.config.ts` with Client ID
- [ ] Updated `googleAuthService.ts` with Client ID
- [ ] Rebuilt app: `npm run build && npx cap sync android`
- [ ] Built APK: `gradlew assembleDebug`
- [ ] Tested on phone

---

## Need Help?

If you get stuck:
1. Check the Troubleshooting section above
2. Verify all steps were completed
3. Make sure Client IDs match exactly
4. Try clearing app data and reinstalling

Google Sign-In should work perfectly after following these steps!
