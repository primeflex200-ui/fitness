# Fix "Something Went Wrong" Error - Google Sign-In

## The Problem
You're getting "Something went wrong, please try again" because the **Android OAuth Client** is missing in Google Cloud Console.

## The Solution (5 Minutes)

### Step 1: Open Google Cloud Console

1. Open your browser
2. Go to: **https://console.cloud.google.com/**
3. Sign in with your Google account
4. Make sure your PrimeFlex project is selected (top left dropdown)

### Step 2: Go to Credentials

1. In the left sidebar, click **"APIs & Services"**
2. Click **"Credentials"**
3. You should see your existing Web Client ID

### Step 3: Create Android OAuth Client

1. Click the **"+ CREATE CREDENTIALS"** button at the top
2. Select **"OAuth client ID"**
3. You'll see a form

### Step 4: Fill in the Form

**IMPORTANT:** Make sure you select **"Android"** as the application type!

Fill in exactly:

```
Application type: Android  ← MUST BE ANDROID, NOT WEB!

Name: PrimeFlex Android

Package name: com.primeflex.app

SHA-1 certificate fingerprint: 
9A:33:72:A8:4D:21:BD:42:D3:FC:F0:B8:45:C7:A9:70:47:50:78:B2
```

### Step 5: Create

1. Click **"CREATE"** button
2. You'll see a confirmation popup
3. Click **"OK"**

### Step 6: Verify You Have Both Clients

After creating, you should see **TWO** OAuth 2.0 Client IDs:

```
✅ Web client (Type: Web application)
   - Client ID: 514289536306-catbvaoa4rber85geliatnircnisp1nd.apps.googleusercontent.com
   - Used for: localhost, Supabase

✅ Android client (Type: Android)
   - Package: com.primeflex.app
   - SHA-1: 9A:33:72:A8:4D:21:BD:42:D3:FC:F0:B8:45:C7:A9:70:47:50:78:B2
   - Used for: Mobile app
```

### Step 7: Wait 5-10 Minutes

Google needs time to propagate the changes. Be patient!

### Step 8: Test Again

1. **Uninstall** the old app from your phone
2. **Install** `PrimeFlex-GoogleWorking.apk`
3. Open the app
4. Click **"Sign in with Google"**
5. Select your Google account
6. Should work now! ✅

---

## Visual Guide

### What You Should See in Google Cloud Console:

**Before (Current State):**
```
Credentials Page
└── OAuth 2.0 Client IDs
    └── Web client ✅ (You have this)
        └── 514289536306-catbvaoa4rber85geliatnircnisp1nd.apps.googleusercontent.com
```

**After (What You Need):**
```
Credentials Page
└── OAuth 2.0 Client IDs
    ├── Web client ✅ (Already have)
    │   └── 514289536306-catbvaoa4rber85geliatnircnisp1nd.apps.googleusercontent.com
    │
    └── Android client ✅ (Need to create)
        └── com.primeflex.app
        └── SHA-1: 9A:33:72:A8:4D:21:BD:42:D3:FC:F0:B8:45:C7:A9:70:47:50:78:B2
```

---

## Common Mistakes to Avoid

### ❌ WRONG: Selecting "Web application"
```
Application type: Web application  ← WRONG!
```

### ✅ CORRECT: Selecting "Android"
```
Application type: Android  ← CORRECT!
```

### ❌ WRONG: Wrong package name
```
Package name: com.example.app  ← WRONG!
```

### ✅ CORRECT: Exact package name
```
Package name: com.primeflex.app  ← CORRECT!
```

### ❌ WRONG: Missing or wrong SHA-1
```
SHA-1: (empty)  ← WRONG!
SHA-1: AB:CD:EF:...  ← WRONG!
```

### ✅ CORRECT: Your exact SHA-1
```
SHA-1: 9A:33:72:A8:4D:21:BD:42:D3:FC:F0:B8:45:C7:A9:70:47:50:78:B2  ← CORRECT!
```

---

## Why This Error Happens

When you click "Sign in with Google" on mobile:

1. **App sends request** to Google with:
   - Package name: `com.primeflex.app`
   - SHA-1 fingerprint: `9A:33:72:A8:4D:21:BD:42:D3:FC:F0:B8:45:C7:A9:70:47:50:78:B2`

2. **Google checks** its database:
   - "Do I have an Android OAuth client for this package + SHA-1?"
   - If NO → **Error: "Something went wrong"**
   - If YES → Allow sign-in ✅

3. **Currently:** Google says NO because you haven't created the Android OAuth client yet

4. **After you create it:** Google will say YES and sign-in will work!

---

## Troubleshooting

### Still Getting Error After Creating Android Client?

1. **Wait longer:** Sometimes takes 10-15 minutes
2. **Check SHA-1:** Make sure it's exactly: `9A:33:72:A8:4D:21:BD:42:D3:FC:F0:B8:45:C7:A9:70:47:50:78:B2`
3. **Check package name:** Must be exactly: `com.primeflex.app`
4. **Verify you created Android type:** Not Web type
5. **Clear app data:** Settings → Apps → PrimeFlex → Clear Data
6. **Reinstall app:** Uninstall and install again

### How to Check if Android Client is Created?

1. Go to Google Cloud Console → Credentials
2. Look for an OAuth 2.0 Client ID with:
   - Type: **Android**
   - Package: `com.primeflex.app`
3. If you see it, you're good! Just wait a few minutes.

### Different Error Messages?

- **"Developer Error"** = SHA-1 not added or wrong
- **"Error 10"** = SHA-1 not added or wrong
- **"Invalid client"** = Client ID mismatch (shouldn't happen now)
- **"Something went wrong"** = Android OAuth client missing

---

## Quick Checklist

- [ ] Opened Google Cloud Console
- [ ] Selected PrimeFlex project
- [ ] Went to APIs & Services → Credentials
- [ ] Clicked "+ CREATE CREDENTIALS"
- [ ] Selected "OAuth client ID"
- [ ] Chose **"Android"** as application type
- [ ] Entered name: `PrimeFlex Android`
- [ ] Entered package: `com.primeflex.app`
- [ ] Entered SHA-1: `9A:33:72:A8:4D:21:BD:42:D3:FC:F0:B8:45:C7:A9:70:47:50:78:B2`
- [ ] Clicked "CREATE"
- [ ] Waited 5-10 minutes
- [ ] Uninstalled old app
- [ ] Installed new APK
- [ ] Tested Google Sign-In

---

## Summary

**The error happens because:** Android OAuth client is missing in Google Cloud Console

**The fix:** Create Android OAuth client with your SHA-1 fingerprint

**Time needed:** 5 minutes to create + 5-10 minutes for Google to update

**Your info:**
- Package: `com.primeflex.app`
- SHA-1: `9A:33:72:A8:4D:21:BD:42:D3:FC:F0:B8:45:C7:A9:70:47:50:78:B2`
- Client ID: `514289536306-catbvaoa4rber85geliatnircnisp1nd.apps.googleusercontent.com`

Go create the Android OAuth client now and Google Sign-In will work!
