# AI Diet Editor - Complete Guide

## Overview
The AI Diet Editor is an intelligent meal planning tool that uses OpenAI's GPT to automatically generate nutritional information for foods and helps users create personalized weekly meal plans.

## Features

### 1. AI-Powered Food Lookup
- **Smart Nutrition Extraction**: Type any food name and the AI automatically fills in:
  - Calories
  - Protein (grams)
  - Carbohydrates (grams)
  - Fats (grams)
- **Caching System**: Previously looked up foods are cached in localStorage for instant retrieval
- **Fallback Values**: If API fails, sensible defaults are provided

### 2. Meal Management
- **Add Meals**: Use the AI assistant to add meals to any day
- **Edit Meals**: Click the edit icon to modify nutritional values
- **Delete Meals**: Remove meals with the trash icon
- **Meal Types**: Breakfast, Snack, Lunch, Dinner

### 3. Macro Tracking
- **Daily Totals**: Real-time calculation of:
  - Total calories
  - Total protein, carbs, fats
  - Macro percentages
- **Target Setting**: Customize daily macro targets
- **Progress Indicators**: Visual feedback on whether you're on track, over, or under targets

### 4. Weekly Planning
- **7-Day Navigation**: Switch between days with easy buttons
- **Persistent Storage**: All meals saved to localStorage
- **Day-by-Day Summary**: See each day's nutritional breakdown

## How to Use

### Adding a Meal
1. Select the meal type (Breakfast, Snack, Lunch, Dinner)
2. Type the food name in the input field
   - Examples: "Grilled chicken breast", "Brown rice", "Apple with almonds"
3. Press Enter or click the + button
4. AI fetches nutritional info and adds to the day

### Editing Macro Targets
1. Click the edit icon in the "Macro Targets" card
2. Update the target values:
   - Calories: Daily calorie goal
   - Protein: Daily protein goal (grams)
   - Carbs: Daily carbs goal (grams)
   - Fats: Daily fats goal (grams)
3. Click "Save Targets"

### Editing a Meal
1. Click the edit icon on any meal card
2. Modify the nutritional values
3. Click "Save" to confirm or "Cancel" to discard

### Removing a Meal
1. Click the trash icon on the meal card
2. Meal is immediately removed

## Macro Target Recommendations

### Fat Loss (1600 cal/day)
- Protein: 130g (32%)
- Carbs: 160g (40%)
- Fats: 53g (30%)

### Lean Bulk (2100 cal/day)
- Protein: 160g (30%)
- Carbs: 260g (50%)
- Fats: 70g (30%)

### Bulk (2800 cal/day)
- Protein: 210g (30%)
- Carbs: 350g (50%)
- Fats: 93g (30%)

### Athletic (2400 cal/day)
- Protein: 180g (30%)
- Carbs: 300g (50%)
- Fats: 80g (30%)

## Data Storage

### LocalStorage
- **diet-plan-{DAY}**: Stores meals for each day
- **macro-targets**: Stores your custom macro targets
- **food-nutrition-cache**: Caches AI responses for foods

### Database (Optional)
- Diet plans can be saved to Supabase for cloud backup
- Requires `diet_plans` table setup (see SQL file)

## API Requirements

### OpenAI API
- Set `VITE_OPENAI_API_KEY` in `.env`
- Uses GPT-3.5-turbo model
- Estimated cost: ~$0.001 per food lookup

## Tips & Tricks

1. **Portion Sizes**: Be specific with portions
   - "100g chicken breast" vs "chicken breast"
   - "1 cup cooked rice" vs "rice"

2. **Meal Combinations**: Add items separately for better tracking
   - Add "grilled chicken" then "brown rice" separately
   - Easier to edit individual components

3. **Weekly Planning**: Plan all 7 days at once
   - Use the day selector to navigate
   - Copy successful days to other days

4. **Macro Flexibility**: Adjust targets based on your goals
   - Lower carbs for keto-style diets
   - Higher protein for muscle building

## Troubleshooting

### AI Not Responding
- Check OpenAI API key in `.env`
- Verify API has available credits
- Check internet connection

### Meals Not Saving
- Check browser localStorage is enabled
- Clear cache if experiencing issues
- Meals auto-save to localStorage

### Incorrect Nutritional Info
- Edit the meal manually with correct values
- AI provides estimates; adjust as needed
- Use verified nutrition databases for accuracy

## Future Enhancements

- [ ] Meal plan templates
- [ ] Recipe suggestions based on macros
- [ ] Grocery list generation
- [ ] Barcode scanning for nutrition
- [ ] Integration with fitness trackers
- [ ] Meal prep scheduling
- [ ] Restaurant menu integration
