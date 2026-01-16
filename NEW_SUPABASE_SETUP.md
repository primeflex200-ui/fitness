# New Supabase Project Setup

## ✅ Step 1: Updated .env File
Your app is now connected to the new Supabase project!

**New Project URL:** `https://gcgkvnmqgqddtbfqecwg.supabase.co`

---

## 🔧 Step 2: Update Google Cloud Console

You need to update the redirect URL in Google Cloud Console:

### Go to Google Cloud Console:
**https://console.cloud.google.com/apis/credentials**

### Update Web Client:
1. Click on your **Web Client** (514289536306-...)
2. Under **"Authorized redirect URIs"**, remove the old one
3. Add the new one: `https://gcgkvnmqgqddtbfqecwg.supabase.co/auth/v1/callback`
4. Click **"Save"**

---

## 🔐 Step 3: Configure Google Sign-In in Supabase

### Go to your Supabase project:
**https://supabase.com/dashboard/project/gcgkvnmqgqddtbfqecwg/auth/providers**

### Enable Google Provider:
1. Find **"Google"** in the list
2. Toggle it **ON**
3. Fill in:
   - **Client ID:** `514289536306-catbvaoa4rber85geliatnircnisp1nd.apps.googleusercontent.com`
   - **Client Secret:** (Get this from Google Cloud Console - click on your Web Client to see it)
4. Click **"Save"**

---

## 📊 Step 4: Set Up Database Tables

Go to your Supabase SQL Editor:
**https://supabase.com/dashboard/project/gcgkvnmqgqddtbfqecwg/sql/new**

Copy and paste this SQL script:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    age INTEGER,
    gender TEXT,
    height NUMERIC,
    weight NUMERIC,
    fitness_goal TEXT,
    diet_type TEXT,
    phone_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Create diet_plans table
CREATE TABLE IF NOT EXISTS public.diet_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL,
    diet_type TEXT,
    body_goal TEXT,
    plan_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own diet plans"
    ON public.diet_plans FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diet plans"
    ON public.diet_plans FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diet plans"
    ON public.diet_plans FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own diet plans"
    ON public.diet_plans FOR DELETE
    USING (auth.uid() = user_id);

-- Create progress_tracking table
CREATE TABLE IF NOT EXISTS public.progress_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    weight NUMERIC,
    body_fat_percentage NUMERIC,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.progress_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
    ON public.progress_tracking FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
    ON public.progress_tracking FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
    ON public.progress_tracking FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
    ON public.progress_tracking FOR DELETE
    USING (auth.uid() = user_id);

-- Create trainer_videos table
CREATE TABLE IF NOT EXISTS public.trainer_videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    category TEXT,
    duration INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.trainer_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view trainer videos"
    ON public.trainer_videos FOR SELECT
    TO authenticated
    USING (true);

-- Create feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own feedback"
    ON public.feedback FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create community_messages table
CREATE TABLE IF NOT EXISTS public.community_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view community messages"
    ON public.community_messages FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can insert own messages"
    ON public.community_messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);
```

Click **"Run"** to execute the script.

---

## 🔄 Step 5: Rebuild Your App

Now rebuild the app with the new Supabase connection:

```bash
cd "C:\Users\ksair\Downloads\cursor project prime flex(main prime flex)\project-bolt-github-uarm9gkh\flex-zen-coach"

npm run build
npx cap sync android
cd android
$env:JAVA_HOME="C:\Program Files\Java\jdk-21"
.\gradlew assembleDebug
copy app\build\outputs\apk\debug\app-debug.apk $env:USERPROFILE\Downloads\PrimeFlex-NewSupabase.apk
```

---

## ✅ Checklist

- [x] Updated .env file with new Supabase URL and key
- [ ] Updated Google Cloud Console redirect URL
- [ ] Enabled Google provider in Supabase
- [ ] Added Client ID and Secret to Supabase
- [ ] Ran database setup SQL script
- [ ] Rebuilt the app
- [ ] Tested Google Sign-In

---

## Summary

**New Supabase Project:** gcgkvnmqgqddtbfqecwg
**New Project URL:** https://gcgkvnmqgqddtbfqecwg.supabase.co
**New Redirect URL:** https://gcgkvnmqgqddtbfqecwg.supabase.co/auth/v1/callback

Follow the steps above and Google Sign-In will work!
