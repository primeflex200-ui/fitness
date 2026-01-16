# 📋 Quick Reference Card - Video Upload System

## 🎬 Upload Video in 3 Steps

```
1. Go to: http://localhost:8080/prime-flex-full-system
2. Fill: Title, Trainer, Category, Video file
3. Click: Upload Video ✓
```

## 🔗 Important Routes

| Route | Purpose |
|-------|---------|
| `/prime-flex-full-system` | Admin panel + upload |
| `/test-supabase` | Test configuration |
| `/feedback` | User feedback form |
| `/community` | Community chat |

## 📝 Setup Checklist

```
1. Create .env with Supabase credentials
2. Create bucket: trainer-videos
3. Create 3 database tables
4. Test at /test-supabase ✓
5. Upload video ✓
```

## 🆔 Admin Access

```
Email: primeflex200@gmail.com
Can: Upload videos, manage content, delete posts
```

## 📂 Required Supabase Resources

| Type | Name | Public? |
|------|------|---------|
| Bucket | trainer-videos | ✅ Yes |
| Table | workout_videos | - |
| Table | feedback | - |
| Table | community_posts | - |

## 🔧 Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

## 🧪 Testing

```
Automated: /test-supabase → Run Tests
Manual: /prime-flex-full-system → Upload video
Console: F12 → look for [Upload] logs
```

## 📊 Video Upload Specs

| Property | Max | Format |
|----------|-----|--------|
| Title | 200 chars | Text |
| Trainer | 100 chars | Text |
| Video | 500 MB | MP4/MOV/AVI/WEBM |
| Thumbnail | 5 MB | JPG/PNG/WEBP |

## ❌ Common Errors

| Error | Fix |
|-------|-----|
| Bucket not found | Create `trainer-videos` bucket |
| Table not found | Run CREATE TABLE SQL |
| Env not loading | Restart `npm run dev` |
| Upload fails | Check console [Upload] logs |

## 🔍 Debugging Steps

```
1. Open DevTools: F12
2. Check Console tab
3. Look for [Upload] prefix logs
4. Check Supabase dashboard for data
5. Review VIDEO_UPLOAD_CHECKLIST.md
```

## 📚 Documentation Quick Links

| Document | When to Use |
|----------|------------|
| README_VIDEO_UPLOAD.md | Start here |
| VIDEO_UPLOAD_CHECKLIST.md | Setup verification |
| SUPABASE_SETUP.md | Configuration guide |
| ARCHITECTURE_FLOW.md | Visual diagrams |
| VIDEO_UPLOAD_SUMMARY.md | Technical details |

## 🎯 Success Indicators

✅ `/test-supabase` shows all green  
✅ Video uploads without errors  
✅ Video appears in list  
✅ Console shows: `[Video Upload] Video metadata saved successfully`  
✅ Supabase dashboard shows video  

## 🚀 Quick Start Command

```bash
# After .env setup:
npm run dev
# Then visit:
http://localhost:8080/test-supabase
```

## 📞 Need Help?

1. Check `/test-supabase` for issues
2. Review browser console (F12)
3. See VIDEO_UPLOAD_CHECKLIST.md
4. Check SUPABASE_SETUP.md

## 🎬 Upload Flow (Simple)

```
Select Video
    ↓
Fill Form
    ↓
Click Upload
    ↓
Wait 5 seconds
    ↓
Success ✓
    ↓
See video in list
```

## 💾 Files Modified

- ✅ PrimeFlexFullSystem.tsx
- ✅ SupabaseTestPage.tsx (new)
- ✅ types.ts
- ✅ App.tsx

## 🔐 Security Notes

- Only `primeflex200@gmail.com` can upload
- Videos are publicly viewable
- Check Supabase RLS policies

## ⚡ Performance

- Upload time: Depends on file size
- Real-time sync: ~1 second
- Thumbnail: Optional, doesn't block upload

---

**Keep this handy! Reference it while setting up.** ⭐
