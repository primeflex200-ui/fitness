# AI Diet Plan Generator - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Create Storage Bucket
Go to Supabase Dashboard → Storage → Create new bucket:
- **Name**: `diet-plans`
- **Public**: OFF (private)

### 2. Run SQL Setup
Copy and paste into Supabase SQL Editor:

```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('diet-plans', 'diet-plans', false)
ON CONFLICT (id) DO NOTHING;

-- Create diet_plans table
CREATE TABLE IF NOT EXISTS diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_data JSONB NOT NULL,
  storage_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own plans"
  ON diet_plans FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plans"
  ON diet_plans FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plans"
  ON diet_plans FOR DELETE USING (auth.uid() = user_id);
```

### 3. Verify Environment
Check `.env` has:
```
VITE_OPENAI_API_KEY=sk-proj-...
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

## 📱 User Flow

```
Dashboard
    ↓
Diet Page
    ↓
"Generate Plan" Button
    ↓
AI Diet Plan Generator
    ├─ Select Diet Type (Veg/Non-Veg)
    ├─ Select Body Goal (Fat Loss/Lean/Bulk/Athletic)
    ├─ Click "Generate AI Diet Plan"
    ├─ View 7-Day Plan
    └─ Save to Cloud or Download
```

## 🎯 Body Goals at a Glance

| Goal | Calories | Best For |
|------|----------|----------|
| 💪 Fat Loss | 1600 | Losing weight |
| 🏋️ Lean Body | 2100 | Building lean muscle |
| 📈 Bulk Body | 2800 | Maximum muscle gain |
| ⚡ Athletic | 2400 | Performance & endurance |

## 📂 File Structure

```
src/
├── pages/
│   ├── AIDietPlanGenerator.tsx    ← Main UI
│   └── Diet.tsx                   ← Updated with link
├── services/
│   └── aiDietPlanGenerator.ts     ← API & Storage
└── App.tsx                        ← Route added
```

## 🔗 Routes

- **Diet Page**: `/diet`
- **AI Generator**: `/ai-diet-plan`

## 💾 Storage Path Format

```
diet-plans/{user_id}/{bodyGoal}-{dietType}-{timestamp}.json

Example:
diet-plans/550e8400-e29b-41d4-a716-446655440000/bulk-nonveg-1701234567890.json
```

## ⚙️ Configuration

### Calorie Targets (in `aiDietPlanGenerator.ts`)
```typescript
const targets = {
  fatloss: 1600,
  lean: 2100,
  bulk: 2800,
  athletic: 2400
};
```

### Macro Ratios (in `aiDietPlanGenerator.ts`)
```typescript
fatloss: { protein: 0.35, carbs: 0.40, fats: 0.25 }
lean: { protein: 0.30, carbs: 0.50, fats: 0.20 }
bulk: { protein: 0.30, carbs: 0.50, fats: 0.20 }
athletic: { protein: 0.30, carbs: 0.50, fats: 0.20 }
```

## 🧪 Testing

### Test Generation
1. Go to `/ai-diet-plan`
2. Select "Vegetarian" + "Fat Loss"
3. Click "Generate AI Diet Plan"
4. Should see 7-day plan in 5-15 seconds

### Test Upload
1. After generation, click "Save to Cloud"
2. Check Supabase Storage → diet-plans bucket
3. Should see new JSON file

### Test Download
1. After generation, click "Download JSON"
2. File should download as `diet-plan-{goal}-{type}.json`

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Plan not generating | Check OpenAI API key & credits |
| Upload failing | Verify bucket exists & RLS policies |
| Incorrect macros | AI provides estimates; edit manually |
| Slow generation | Normal (5-15s); check internet |

## 📊 Generated Plan Structure

```json
{
  "dietType": "veg",
  "bodyGoal": "bulk",
  "plan": {
    "Monday": [
      {
        "meal": "Breakfast",
        "food": "Oats with berries",
        "calories": 320,
        "protein": 12,
        "carbs": 48,
        "fats": 8
      }
    ]
  },
  "createdAt": "2024-01-15T10:30:00Z"
}
```

## 🎨 UI Components Used

- Button (hero, outline variants)
- Card (with header, content, description)
- Badge (for labels)
- Tabs (for body goals)
- Icons (Sparkles, Leaf, Drumstick, etc.)

## 🔐 Security

- ✅ RLS policies enforce user isolation
- ✅ Users can only access their own plans
- ✅ Storage bucket is private
- ✅ Authentication required

## 📈 Performance

- Generation: 5-15 seconds
- File size: ~15-20 KB
- API cost: ~$0.01-0.02 per plan
- Storage: Minimal (JSON files)

## 🚀 Next Steps

1. ✅ Create storage bucket
2. ✅ Run SQL setup
3. ✅ Test generation
4. ✅ Test upload
5. ✅ Deploy to production

## 📞 Support

Check these files for more info:
- `AI_DIET_PLAN_SETUP.md` - Detailed setup
- `AI_DIET_EDITOR_GUIDE.md` - Diet editor features
- `create-diet-plans-table.sql` - Database schema
- `setup-diet-plans-bucket.sql` - Storage setup
