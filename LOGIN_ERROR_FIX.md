# 🔧 Login "Failed to Fetch" Error - SOLUTION

## 🚨 Problem
Getting "failed to fetch" error when trying to login.

---

## ✅ SOLUTIONS (Try in order)

### Solution 1: Add Your Site URL to Supabase (MOST COMMON)

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Select your project: `qgdebpaplzjuasdwddjf`

2. **Navigate to Authentication Settings:**
   - Click **Authentication** in left sidebar
   - Click **URL Configuration**

3. **Add Your Site URLs:**
   Add these URLs to **Site URL** and **Redirect URLs**:
   ```
   http://localhost:5173
   http://localhost:5174
   http://localhost:3000
   http://127.0.0.1:5173
   https://your-production-domain.com
   ```

4. **Save Changes** and try logging in again

---

### Solution 2: Check Environment Variables

1. **Verify .env file exists** in project root
2. **Check values are correct:**
   ```env
   VITE_SUPABASE_URL="https://qgdebpaplzjuasdwddjf.supabase.co"
   VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```

3. **Restart dev server** after any .env changes:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

---

### Solution 3: Test Supabase Connection

Run this test in browser console (F12):

```javascript
// Test Supabase connection
fetch('https://qgdebpaplzjuasdwddjf.supabase.co/rest/v1/', {
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnZGVicGFwbHpqdWFzZHdkZGpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MDIxNjYsImV4cCI6MjA3NjA3ODE2Nn0.98ThYWsTLPRV_cX_cVuC0fRHuQOuaFGrB0XB1HNULpI'
  }
})
.then(r => r.json())
.then(d => console.log('✅ Supabase connected:', d))
.catch(e => console.error('❌ Connection failed:', e));
```

**Expected Result:** Should see `✅ Supabase connected`

**If it fails:** Network/firewall issue or Supabase is down

---

### Solution 4: Check Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Try logging in
4. Look for error messages

**Common errors:**
- `CORS error` → Add site URL to Supabase (Solution 1)
- `Network error` → Check internet connection
- `401 Unauthorized` → Check API keys in .env

---

### Solution 5: Verify Supabase Project Status

1. Go to: https://status.supabase.com/
2. Check if all services are operational
3. If there's an outage, wait and try again later

---

### Solution 6: Clear Browser Cache & Cookies

1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Clear storage**
4. Check all boxes
5. Click **Clear site data**
6. Refresh page and try again

---

### Solution 7: Test with Different Browser

Try logging in with:
- Chrome (Incognito mode)
- Firefox (Private window)
- Edge

If it works in incognito → Browser extension is blocking it

---

## 🔍 Quick Diagnostic Checklist

Run through this checklist:

- [ ] Dev server is running (`npm run dev`)
- [ ] .env file exists in project root
- [ ] .env has correct VITE_SUPABASE_URL
- [ ] .env has correct VITE_SUPABASE_PUBLISHABLE_KEY
- [ ] Restarted dev server after .env changes
- [ ] Site URL added to Supabase dashboard
- [ ] No browser extensions blocking requests
- [ ] Internet connection is working
- [ ] Supabase status page shows all systems operational

---

## 🎯 Most Likely Cause

**90% of "failed to fetch" errors are caused by:**

1. **Missing site URL in Supabase** (Solution 1) ← START HERE
2. **Dev server not restarted after .env changes**
3. **Browser extension blocking requests**

---

## 🚀 Quick Fix Command

If you just updated .env, restart the server:

```bash
# Windows CMD
taskkill /F /IM node.exe
npm run dev

# Or just Ctrl+C in terminal and run:
npm run dev
```

---

## 📝 Test Account

If you need to test, create a new account:
- Email: test@example.com
- Password: Test@123456

Then try logging in with those credentials.

---

## 🆘 Still Not Working?

If none of these work, check:

1. **Firewall/Antivirus:** Might be blocking Supabase
2. **VPN:** Try disabling VPN
3. **Corporate Network:** Might block external APIs
4. **Supabase Project:** Verify project is not paused/deleted

---

## ✅ Success Indicators

You'll know it's fixed when:
- ✅ No "failed to fetch" error
- ✅ Login redirects to dashboard
- ✅ User session persists on refresh
- ✅ Toast shows "Welcome back!"

---

**Need more help?** Check browser console for specific error messages and share them for more targeted debugging.
