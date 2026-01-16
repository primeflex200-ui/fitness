# Google Sign-In Debug Steps

## New APK with Debug Logging

**File:** `C:\Users\ksair\Downloads\PrimeFlex-GoogleFixed-DEBUG.apk`

This version has detailed console logging to see exactly where the error occurs.

## How to See the Error

### Option 1: Use Chrome Remote Debugging (Easiest)

1. **Connect your phone** to computer via USB
2. **Enable USB Debugging** on your phone
3. **Open Chrome** on your computer
4. Go to: `chrome://inspect`
5. You should see your device
6. Click **"inspect"** next to your app
7. Try Google Sign-In in the app
8. Watch the Console tab for error messages

### Option 2: Use ADB Logcat

```bash
adb logcat | findstr "Google"
```

## Common Issues and Fixes

### Issue 1: "No ID token received"
**Cause:** Google Sign-In popup closed or cancelled
**Fix:** Make sure you complete the sign-in flow

### Issue 2: "Supabase sign-in error"
**Cause:** Supabase Google provider not configured
**Fix:** Check Supabase dashboard → Authentication → Providers → Google is enabled

### Issue 3: "Developer Error" or "Error 10"
**Cause:** SHA-1 mismatch or not propagated yet
**Fix:** Wait 10-15 minutes, then try again

### Issue 4: "Invalid client"
**Cause:** Client ID mismatch
**Fix:** Verify Web Client ID in Supabase matches: `514289536306-catbvaoa4rber85geliatnircnisp1nd.apps.googleusercontent.com`

## Check Supabase Configuration

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to **Authentication** → **Providers**
4. Find **Google**
5. Make sure:
   - ✅ Enabled (toggle is ON)
   - ✅ Client ID: `514289536306-catbvaoa4rber85geliatnircnisp1nd.apps.googleusercontent.com`
   - ✅ Client Secret: (your secret from Google Cloud)
   - ✅ Redirect URL: `https://qgdebpaplzjuasdwddjf.supabase.co/auth/v1/callback`

## Test Steps

1. Install `PrimeFlex-GoogleFixed-DEBUG.apk`
2. Open Chrome Remote Debugging
3. Try Google Sign-In
4. Check console for these messages:
   - "Starting Google Sign-In..."
   - "Google user received: ..."
   - "Attempting Supabase sign-in with ID token..."
   - "Supabase sign-in successful: ..." OR error message

## If You See "Google user received" but Then Error

This means Google Sign-In is working, but Supabase integration is failing.

**Check:**
1. Supabase Google provider is enabled
2. Client ID and Secret are correct in Supabase
3. Redirect URL is correct

## If You Don't See "Google user received"

This means Google Sign-In itself is failing.

**Check:**
1. Android OAuth client exists in Google Cloud
2. SHA-1 is correct: `9A:33:72:A8:4D:21:BD:42:D3:FC:F0:B8:45:C7:A9:70:47:50:78:B2`
3. Package name is correct: `com.primeflex.app`
4. Wait 10-15 minutes for Google to propagate

## Quick Checklist

- [ ] Android OAuth client created in Google Cloud ✅ (You confirmed this)
- [ ] SHA-1 correct: `9A:33:72:A8:4D:21:BD:42:D3:FC:F0:B8:45:C7:A9:70:47:50:78:B2`
- [ ] Package name: `com.primeflex.app`
- [ ] Waited 10-15 minutes after creating Android client
- [ ] Supabase Google provider enabled
- [ ] Supabase has correct Client ID and Secret
- [ ] Installed latest APK with debug logging
- [ ] Checked console logs during sign-in attempt

## Next Steps

1. Install the new debug APK
2. Use Chrome Remote Debugging to see console logs
3. Try Google Sign-In
4. Tell me the exact error message you see in the console
5. I can then fix the specific issue

The debug logging will show us exactly where it's failing!
