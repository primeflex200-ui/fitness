# AI Diet Plan Generator - Setup & Implementation Guide

## Overview
The AI Diet Plan Generator is a comprehensive system that creates personalized 7-day meal plans based on:
- **Diet Type**: Vegetarian or Non-Vegetarian
- **Body Goal**: Fat Loss, Lean Body, Bulk Body, or Athletic
- **AI-Powered**: Uses OpenAI GPT-3.5-turbo for intelligent meal planning
- **Cloud Storage**: Saves plans to Supabase storage bucket

## Features

### 1. Diet Type Selection
- **Vegetarian**: Plant-based meals with dairy and eggs
- **Non-Vegetarian**: Includes meat, fish, and poultry

### 2. Body Goal Options
| Goal | Daily Calories | Protein | Carbs | Fats | Purpose |
|------|---|---|---|---|---|
| Fat Loss | 1600 | 35% | 40% | 25% | Lose weight while preserving muscle |
| Lean Body | 2100 | 30% | 50% | 20% | Build lean muscle with minimal fat |
| Bulk Body | 2800 | 30% | 50% | 20% | Maximize muscle gain |
| Athletic | 2400 | 30% | 50% | 20% | Optimize performance |

### 3. Generated Plan Structure
Each plan includes:
- 7-day meal plan (Monday-Sunday)
- 5 meals per day (Breakfast, 2 Snacks, Lunch, Dinner)
- Nutritional information per meal (calories, protein, carbs, fats)
- Total daily macros
- Portion sizes included in food descriptions

## Setup Instructions

### Step 1: Create Storage Bucket

Run the SQL in Supabase SQL Editor:
```sql
-- From setup-diet-plans-bucket.sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('diet-plans', 'diet-plans', false)
ON CONFLICT (id) DO NOTHING;
```

### Step 2: Set Up RLS Policies

Execute the RLS policies from `setup-diet-plans-bucket.sql` to ensure:
- Users can only view their own diet plans
- Users can only upload to their own folder
- Users can only delete their own files

### Step 3: Create Diet Plans Table (Optional)

For database storage of plan metadata:
```sql
-- From create-diet-plans-table.sql
CREATE TABLE IF NOT EXISTS diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id TEXT,
  plan_data JSONB NOT NULL,
  storage_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Step 4: Verify Environment Variables

Ensure `.env` contains:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_key
VITE_OPENAI_API_KEY=your_openai_key
```

## Usage Flow

### For Users

1. **Navigate to Diet Plans**
   - Click "Diet Plans" from dashboard
   - Click "Generate Plan" button

2. **Select Diet Type**
   - Choose Vegetarian or Non-Vegetarian

3. **Select Body Goal**
   - Choose from Fat Loss, Lean Body, Bulk Body, or Athletic
   - View calorie and macro targets

4. **Generate Plan**
   - Click "Generate AI Diet Plan"
   - Wait for AI to create personalized meals

5. **Save or Download**
   - **Save to Cloud**: Uploads to Supabase storage
   - **Download JSON**: Saves locally as JSON file
   - **Generate New**: Create another plan

### For Developers

#### Key Files

1. **AIDietPlanGenerator.tsx** - Main UI component
   - Diet type selection
   - Body goal selection
   - Plan display and management

2. **aiDietPlanGenerator.ts** - Service layer
   - `generateAIDietPlan()` - Creates plan via OpenAI
   - `uploadDietPlanToStorage()` - Uploads to Supabase
   - `saveDietPlanMetadata()` - Saves metadata to database

3. **Diet.tsx** - Updated with AI generator link

4. **App.tsx** - Route: `/ai-diet-plan`

#### API Integration

The service uses OpenAI GPT-3.5-turbo with:
- Temperature: 0.7 (balanced creativity)
- Max tokens: 2500
- Model: gpt-3.5-turbo

#### Storage Structure

Plans are stored in Supabase with path:
```
diet-plans/{user_id}/{bodyGoal}-{dietType}-{timestamp}.json
```

Example:
```
diet-plans/550e8400-e29b-41d4-a716-446655440000/bulk-nonveg-1701234567890.json
```

## File Formats

### Generated Plan JSON
```json
{
  "dietType": "veg",
  "bodyGoal": "bulk",
  "plan": {
    "Monday": [
      {
        "meal": "Breakfast",
        "food": "Oats with berries and almonds",
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

## Error Handling

### API Failures
- If OpenAI API fails, returns default meal plan
- Graceful fallback with standard meals

### Storage Failures
- Attempts to save to database
- Falls back to localStorage if needed
- User can still download JSON locally

### Network Issues
- Automatic retry on timeout
- User-friendly error messages via toast notifications

## Performance Considerations

1. **Generation Time**: 5-15 seconds (depends on API)
2. **File Size**: ~15-20 KB per plan
3. **Storage**: Minimal (plans are JSON)
4. **API Costs**: ~$0.01-0.02 per plan generation

## Customization

### Modify Calorie Targets
Edit `getCalorieTargets()` in `aiDietPlanGenerator.ts`:
```typescript
const targets: Record<string, number> = {
  fatloss: 1600,  // Adjust here
  lean: 2100,
  bulk: 2800,
  athletic: 2400
};
```

### Modify Macro Ratios
Edit `getMacroRatios()` in `aiDietPlanGenerator.ts`:
```typescript
fatloss: { protein: 0.35, carbs: 0.40, fats: 0.25 }
```

### Customize AI Prompt
Edit the prompt in `generateAIDietPlan()` to:
- Add dietary restrictions
- Include specific foods
- Adjust meal timing
- Add preparation instructions

## Troubleshooting

### Plan Not Generating
- Check OpenAI API key is valid
- Verify API has available credits
- Check internet connection
- Review browser console for errors

### Upload Failing
- Verify Supabase bucket exists
- Check RLS policies are set correctly
- Ensure user is authenticated
- Check storage quota

### Incorrect Macros
- AI provides estimates; adjust manually if needed
- Use verified nutrition databases for accuracy
- Edit meals in the editor before saving

## Future Enhancements

- [ ] Meal plan templates library
- [ ] Recipe suggestions with instructions
- [ ] Grocery list generation
- [ ] Barcode scanning for nutrition
- [ ] Integration with fitness trackers
- [ ] Meal prep scheduling
- [ ] Restaurant menu integration
- [ ] Allergy/preference filters
- [ ] Meal swapping suggestions
- [ ] Progress tracking with plans

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Verify all setup steps completed
4. Check Supabase dashboard for storage/database status
