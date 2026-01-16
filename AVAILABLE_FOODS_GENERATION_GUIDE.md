# Available Foods Generation - Complete Guide

## How It Works

When you add available foods and click "Generate Plan", the AI will create a meal plan using ONLY those foods.

## Step-by-Step Process

### Step 1: Add Available Foods

```
Food Item: [Chicken, Rice, Broccoli, Eggs, Milk]
           [Add] [Add] [Add] [Add] [Add]

Added Foods (5):
✓ Chicken
✓ Rice
✓ Broccoli
✓ Eggs
✓ Milk
```

### Step 2: Select Diet Type & Body Goal

```
Step 1: Choose Diet Type
[Vegetarian] or [Non-Vegetarian]

Step 2: Select Body Goal
[Fat Loss] [Lean Body] [Bulk Body] [Athletic]
```

### Step 3: Click "Generate AI Diet Plan"

```
[Generate AI Diet Plan] button
↓
AI processes:
- Available foods: Chicken, Rice, Broccoli, Eggs, Milk
- Diet type: Vegetarian/Non-Vegetarian
- Body goal: Fat Loss/Lean/Bulk/Athletic
- Calorie target: 1600/2100/2800/2400
- Macro targets: Protein/Carbs/Fats percentages
↓
AI generates 7-day plan using ONLY these 5 foods
```

### Step 4: View Generated Plan

```
Your Generated Diet Plan
🌱 Vegetarian | 📈 Bulk Body | 📋 5 foods used

Available Foods Used:
✓ Chicken  ✓ Rice  ✓ Broccoli  ✓ Eggs  ✓ Milk

Select Day:
[Monday] [Tuesday] [Wednesday] [Thursday]
[Friday] [Saturday] [Sunday]

Monday's Meal Plan:
Total: 1600 cal • P: 130g • C: 160g • F: 53g

Breakfast: Scrambled eggs with rice (300 cal)
Snack: Broccoli with milk sauce (150 cal)
Lunch: Grilled chicken with rice (400 cal)
Snack: Eggs with broccoli (150 cal)
Dinner: Chicken with rice and broccoli (350 cal)

(All meals use ONLY: Chicken, Rice, Broccoli, Eggs, Milk)
```

## What Happens Behind the Scenes

### AI Prompt Sent to OpenAI

```
You are a professional nutritionist. Generate a complete 7-day meal plan 
using ONLY the available foods provided.

Available Foods: Chicken, Rice, Broccoli, Eggs, Milk

Requirements:
- Diet Type: Vegetarian
- Goal: Bulk
- Daily Calories: 2800
- Daily Protein: 210g
- Daily Carbs: 350g
- Daily Fats: 93g
- MUST use ONLY foods from the available list
- Each day must have 5 meals (Breakfast, 2 Snacks, Lunch, Dinner)
- Include portion sizes
- Vary meals throughout the week

Generate a JSON response with this exact structure for all 7 days:
{
  "Monday": [
    {"meal": "Breakfast", "food": "...", "calories": 300, ...},
    ...
  ],
  ...
}

Return ONLY valid JSON, no additional text.
```

### AI Response

```json
{
  "Monday": [
    {
      "meal": "Breakfast",
      "food": "Scrambled eggs (3) with rice (1 cup)",
      "calories": 320,
      "protein": 18,
      "carbs": 40,
      "fats": 12
    },
    {
      "meal": "Snack",
      "food": "Broccoli (1 cup) with milk sauce",
      "calories": 150,
      "protein": 8,
      "carbs": 15,
      "fats": 6
    },
    ...
  ],
  "Tuesday": [...],
  ...
}
```

## Verification Checklist

### ✅ Foods Are Being Added
- [ ] Food input field shows placeholder text
- [ ] Can type food names
- [ ] "Add" button is clickable
- [ ] Foods appear as badges below input
- [ ] Can remove foods by clicking badge

### ✅ Plan Generation Uses Foods
- [ ] Click "Generate AI Diet Plan"
- [ ] Plan generates successfully
- [ ] "Available Foods Used" section shows added foods
- [ ] All meals in plan use only those foods
- [ ] No other foods appear in meals

### ✅ Meals Use Only Available Foods

**Example with 5 foods: Chicken, Rice, Broccoli, Eggs, Milk**

```
Monday Breakfast: Scrambled eggs with rice ✓
Monday Snack: Broccoli with milk ✓
Monday Lunch: Grilled chicken with rice ✓
Monday Snack: Eggs with broccoli ✓
Monday Dinner: Chicken with rice and broccoli ✓

All meals use ONLY: Chicken, Rice, Broccoli, Eggs, Milk
```

### ✅ Nutrition Targets Met

```
Daily Target: 2800 calories
Generated Plan: ~2800 calories ✓

Daily Protein Target: 210g
Generated Plan: ~210g ✓

Daily Carbs Target: 350g
Generated Plan: ~350g ✓

Daily Fats Target: 93g
Generated Plan: ~93g ✓
```

## Troubleshooting

### Issue: Plan Not Using Available Foods

**Symptoms:**
- Plan shows foods not in available list
- Meals contain ingredients not added

**Solutions:**
1. Check foods were actually added
   - Look for badges below input field
   - Verify count matches "📋 X foods used"

2. Verify foods are spelled correctly
   - "Chicken" not "chicken" (case doesn't matter for AI)
   - No extra spaces

3. Try regenerating
   - Click "Generate New"
   - Add foods again
   - Click "Generate AI Diet Plan"

4. Check API response
   - Open browser console (F12)
   - Look for error messages
   - Verify OpenAI API key is valid

### Issue: Plan Generated Without Foods

**Symptoms:**
- Plan shows random foods
- "Available Foods Used" section is empty
- Foods were added but not used

**Solutions:**
1. Verify foods were added
   - Check if badges appear
   - Count should match

2. Check if foods array is empty
   - If no foods added, standard plan generates
   - Add at least one food

3. Verify generation method
   - Should call `generateDietPlanFromAvailableFoods()`
   - Not `generateAIDietPlan()`

### Issue: Can't Add Foods

**Symptoms:**
- "Add" button doesn't work
- Foods don't appear in list
- Error messages appear

**Solutions:**
1. Check input field
   - Must have text
   - Can't be empty

2. Check for duplicates
   - Can't add same food twice
   - Remove and re-add if needed

3. Check browser console
   - Look for JavaScript errors
   - Verify no network issues

## Code Flow

```
User adds foods:
Chicken, Rice, Broccoli, Eggs, Milk
        ↓
User clicks "Generate AI Diet Plan"
        ↓
generatePlan() function called
        ↓
Check: availableFoods.length > 0?
        ↓
YES → Call generateDietPlanFromAvailableFoods()
        ↓
Pass: availableFoods, dietType, bodyGoal
        ↓
AI Service:
- Create prompt with food list
- Send to OpenAI API
- Parse response
- Return plan
        ↓
Plan displayed with:
- Available Foods section
- All meals using only those foods
- Nutrition targets met
```

## Expected Behavior

### With Available Foods

```
Input: Chicken, Rice, Broccoli, Eggs, Milk
Output: 7-day plan using ONLY these 5 foods
Result: Practical, achievable meal plan
```

### Without Available Foods

```
Input: (empty)
Output: Standard 7-day plan with common foods
Result: Generic meal plan
```

### With Allergies + Available Foods

```
Input Foods: Chicken, Rice, Broccoli, Eggs, Milk
Input Allergy: Milk
Output: Plan using Chicken, Rice, Broccoli, Eggs (no Milk)
Result: Safe, practical meal plan
```

## Performance

| Operation | Time | Status |
|-----------|------|--------|
| Add Food | < 100ms | Instant |
| Generate Plan | 5-15s | Normal |
| Display Plan | < 500ms | Fast |
| Switch Days | < 200ms | Smooth |

## Testing Scenarios

### Scenario 1: Basic Test
```
Foods: Chicken, Rice
Goal: Fat Loss
Expected: 7-day plan with only chicken and rice
```

### Scenario 2: Limited Foods
```
Foods: Eggs, Milk, Bread
Goal: Lean Body
Expected: 7-day plan with only eggs, milk, bread
```

### Scenario 3: Many Foods
```
Foods: Chicken, Rice, Broccoli, Eggs, Milk, Bread, Butter, Oats, Almonds, Yogurt
Goal: Bulk
Expected: 7-day plan with varied meals using these 10 foods
```

### Scenario 4: With Allergies
```
Foods: Chicken, Rice, Broccoli, Eggs, Milk
Allergy: Milk
Expected: Plan without dairy, using other 4 foods
```

## Summary

The Available Foods feature works by:
1. ✅ Collecting foods user has available
2. ✅ Passing them to AI with diet/goal info
3. ✅ AI generates plan using ONLY those foods
4. ✅ Plan is displayed with food list
5. ✅ User can manage allergies and refresh meals

All meals in the generated plan should use ONLY the foods you added!
