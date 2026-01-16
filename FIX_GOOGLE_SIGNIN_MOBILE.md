# Fix Google Sign-In on Mobile App

## Problem
Google Sign-In works on localhost but NOT on the mobile app.

## Your SHA-1 Fingerprint
```
9A:33:72:A8:4D:21:BD:42:D3:FC:F0:B8:45:C7:A9:70:47:50:78:B2
```

## Quick Fix (5 minutes)

### Step 1: Go to Google Cloud Console

1. Open: https://console.cloud.google.com/
2. Select your PrimeFlex project
3. Go to **"APIs & Services"** → **"Credentials"**

### Step 2: Check if Android OAuth Client Exists

Look for an OAuth 2.0 Client ID with type **"Android"**

#### If Android Client EXISTS:
1. Click on the Android OAuth client name
2. Check if SHA-1 fingerprint is: `9A:33:72:A8:4D:21:BD:42:D3:FC:F0:B8:45:C7:A9:70:47:50:78:B2`
3. If it's different or missing, click **"Edit"**
4. Update the SHA-1 to: `9A:33:72:A8:4D:21:BD:42:D3:FC:F0:B8:45:C7:A9:70:47:50:78:B2`
5. Click **"Save"**

#### If Android Client DOES NOT EXIST:
1. Click **"Create Credentials"** → **"OAuth client ID"**
2. Application type: **"Android"**
3. Name: `PrimeFlex Android`
4. Package name: `com.primeflex.app`
5. SHA-1 certificate fingerprint: `9A:33:72:A8:4D:21:BD:42:D3:FC:F0:B8:45:C7:A9:70:47:50:78:B2`
6. Click **"Create"**

### Step 3: Verify Package Name

Make sure the package name is exactly: `com.primeflex.app`

### Step 4: Wait 5 Minutes

Google needs a few minutes to propagate the changes.

### Step 5: Test on Mobile

1. Uninstall the old app from your phone
2. Install the latest APK: `PrimeFlex-FINAL.apk`
3. Open the app
4. Click **"Sign in with Google"**
5. It should work now!

---

## Why This Happens

- **Localhost:** Uses Web Client ID (works in browser)
- **Mobile App:** Needs Android Client ID with SHA-1 fingerprint
- **SHA-1:** Identifies your app to Google (security measure)

Without the SHA-1 in Google Cloud Console, Google rejects the sign-in request from the mobile app.

---

## Troubleshooting

### Still Not Working?

1. **Double-check SHA-1:** Make sure it's exactly `9A:33:72:A8:4D:21:BD:42:D3:FC:F0:B8:45:C7:A9:70:47:50:78:B2`
2. **Check Package Name:** Must be `com.primeflex.app`
3. **Wait longer:** Sometimes takes up to 10 minutes for Google to update
4. **Clear app data:** Settings → Apps → PrimeFlex → Clear Data
5. **Reinstall app:** Uninstall and install again

### Error: "Developer Error" or "Error 10"

This means SHA-1 is missing or incorrect in Google Cloud Console.

**Fix:** Add the SHA-1 fingerprint to your Android OAuth client.

### Error: "Sign-in failed"

This could mean:
- SHA-1 not added yet
- Package name mismatch
- Need to wait a few more minutes

---

## Quick Checklist

- [ ] Opened Google Cloud Console
- [ ] Selected PrimeFlex project
- [ ] Went to Credentials
- [ ] Created/Updated Android OAuth client
- [ ] Added SHA-1: `9A:33:72:A8:4D:21:BD:42:D3:FC:F0:B8:45:C7:A9:70:47:50:78:B2`
- [ ] Verified package name: `com.primeflex.app`
- [ ] Waited 5 minutes
- [ ] Uninstalled old app
- [ ] Installed new APK
- [ ] Tested Google Sign-In

---

## Summary

The issue is that Google Sign-In on mobile requires an **Android OAuth client** with your app's **SHA-1 fingerprint** in Google Cloud Console.

Just add the SHA-1 to Google Cloud Console and wait 5 minutes. Then Google Sign-In will work on mobile!

Your SHA-1: `9A:33:72:A8:4D:21:BD:42:D3:FC:F0:B8:45:C7:A9:70:47:50:78:B2`
