import { supabase } from "@/integrations/supabase/client";

interface MealItem {
  meal: string;
  food: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface DietPlanData {
  [plan: string]: {
    [dietType: string]: {
      [day: string]: MealItem[];
    };
  };
}

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const generateDietPlanFromVideo = async (
  videoTitle: string,
  videoDescription: string,
  fitnessGoal: string,
  dietType: "veg" | "nonveg"
): Promise<DietPlanData> => {
  try {
    if (!OPENAI_API_KEY) {
      console.warn("OpenAI API key not configured");
      return getDefaultDietPlan();
    }

    const calorieTargets: Record<string, number> = {
      fatloss: 1600,
      lean: 2100,
      bulk: 2800,
      athletic: 2400
    };

    const targetCalories = calorieTargets[fitnessGoal] || 2000;

    const prompt = `You are a professional nutritionist and fitness expert. Based on the following information, generate a complete weekly meal plan.

Video Title: ${videoTitle}
Video Description: ${videoDescription}
Fitness Goal: ${fitnessGoal}
Diet Type: ${dietType === "veg" ? "Vegetarian" : "Non-Vegetarian"}
Target Daily Calories: ${targetCalories}

Generate a JSON response with the following structure for a 7-day meal plan:
{
  "Monday": [
    {"meal": "Breakfast", "food": "...", "calories": 300, "protein": 15, "carbs": 40, "fats": 8},
    {"meal": "Snack", "food": "...", "calories": 150, "protein": 5, "carbs": 20, "fats": 5},
    {"meal": "Lunch", "food": "...", "calories": 400, "protein": 25, "carbs": 50, "fats": 10},
    {"meal": "Snack", "food": "...", "calories": 150, "protein": 10, "carbs": 15, "fats": 5},
    {"meal": "Dinner", "food": "...", "calories": 350, "protein": 30, "carbs": 30, "fats": 12}
  ],
  "Tuesday": [...],
  "Wednesday": [...],
  "Thursday": [...],
  "Friday": [...],
  "Saturday": [...],
  "Sunday": [...]
}

Requirements:
- Each day should have 5 meals (Breakfast, 2 Snacks, Lunch, Dinner)
- Total daily calories should be approximately ${targetCalories}
- Meals should be ${dietType === "veg" ? "vegetarian" : "non-vegetarian"}
- Include realistic Indian and international foods
- Ensure balanced macros (protein 30-35%, carbs 40-45%, fats 20-25%)
- Make meals practical and easy to prepare
- Vary meals throughout the week for better adherence
- Include portion sizes in food descriptions

Return ONLY valid JSON, no additional text.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a professional nutritionist. Generate meal plans in valid JSON format only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      console.error("OpenAI API error:", response.statusText);
      return getDefaultDietPlan();
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse the JSON response
    const mealPlan = JSON.parse(content);

    // Format into the required structure
    const formattedPlan: DietPlanData = {
      fatloss: {
        veg: mealPlan,
        nonveg: mealPlan
      },
      lean: {
        veg: mealPlan,
        nonveg: mealPlan
      },
      bulk: {
        veg: mealPlan,
        nonveg: mealPlan
      },
      athletic: {
        veg: mealPlan,
        nonveg: mealPlan
      }
    };

    return formattedPlan;
  } catch (error) {
    console.error("Error generating diet plan:", error);
    return getDefaultDietPlan();
  }
};

const getDefaultDietPlan = (): DietPlanData => {
  const defaultMeals = {
    Monday: [
      { meal: "Breakfast", food: "Oats with berries", calories: 320, protein: 12, carbs: 48, fats: 8 },
      { meal: "Snack", food: "Apple with almonds", calories: 150, protein: 4, carbs: 20, fats: 6 },
      { meal: "Lunch", food: "Grilled chicken with rice", calories: 400, protein: 30, carbs: 50, fats: 10 },
      { meal: "Snack", food: "Greek yogurt", calories: 120, protein: 15, carbs: 12, fats: 2 },
      { meal: "Dinner", food: "Salmon with vegetables", calories: 350, protein: 35, carbs: 20, fats: 14 }
    ],
    Tuesday: [
      { meal: "Breakfast", food: "Eggs with toast", calories: 300, protein: 20, carbs: 32, fats: 10 },
      { meal: "Snack", food: "Banana with peanut butter", calories: 180, protein: 6, carbs: 24, fats: 8 },
      { meal: "Lunch", food: "Turkey wrap", calories: 400, protein: 32, carbs: 42, fats: 12 },
      { meal: "Snack", food: "Protein shake", calories: 150, protein: 20, carbs: 10, fats: 3 },
      { meal: "Dinner", food: "Grilled fish with broccoli", calories: 330, protein: 36, carbs: 18, fats: 12 }
    ],
    Wednesday: [
      { meal: "Breakfast", food: "Smoothie bowl", calories: 350, protein: 14, carbs: 52, fats: 10 },
      { meal: "Snack", food: "Mixed nuts", calories: 160, protein: 5, carbs: 12, fats: 12 },
      { meal: "Lunch", food: "Chicken salad", calories: 380, protein: 35, carbs: 28, fats: 14 },
      { meal: "Snack", food: "Cottage cheese", calories: 120, protein: 16, carbs: 8, fats: 3 },
      { meal: "Dinner", food: "Lean beef with sweet potato", calories: 400, protein: 38, carbs: 42, fats: 12 }
    ],
    Thursday: [
      { meal: "Breakfast", food: "Pancakes with berries", calories: 340, protein: 16, carbs: 48, fats: 10 },
      { meal: "Snack", food: "Orange with almonds", calories: 140, protein: 4, carbs: 18, fats: 6 },
      { meal: "Lunch", food: "Tuna salad", calories: 350, protein: 32, carbs: 24, fats: 12 },
      { meal: "Snack", food: "Protein bar", calories: 150, protein: 15, carbs: 16, fats: 5 },
      { meal: "Dinner", food: "Grilled chicken with quinoa", calories: 420, protein: 40, carbs: 48, fats: 10 }
    ],
    Friday: [
      { meal: "Breakfast", food: "Avocado toast", calories: 360, protein: 12, carbs: 42, fats: 16 },
      { meal: "Snack", food: "Berries with yogurt", calories: 130, protein: 12, carbs: 16, fats: 2 },
      { meal: "Lunch", food: "Turkey meatballs", calories: 400, protein: 36, carbs: 32, fats: 14 },
      { meal: "Snack", food: "Protein shake", calories: 160, protein: 18, carbs: 14, fats: 4 },
      { meal: "Dinner", food: "Baked cod with asparagus", calories: 340, protein: 38, carbs: 18, fats: 12 }
    ],
    Saturday: [
      { meal: "Breakfast", food: "Omelette with veggies", calories: 320, protein: 24, carbs: 20, fats: 14 },
      { meal: "Snack", food: "Apple with cheese", calories: 150, protein: 6, carbs: 18, fats: 8 },
      { meal: "Lunch", food: "Grilled shrimp with rice", calories: 420, protein: 32, carbs: 52, fats: 10 },
      { meal: "Snack", food: "Greek yogurt", calories: 140, protein: 16, carbs: 12, fats: 3 },
      { meal: "Dinner", food: "Chicken stir-fry", calories: 380, protein: 36, carbs: 36, fats: 12 }
    ],
    Sunday: [
      { meal: "Breakfast", food: "Granola with yogurt", calories: 340, protein: 14, carbs: 48, fats: 10 },
      { meal: "Snack", food: "Banana with almonds", calories: 160, protein: 5, carbs: 20, fats: 8 },
      { meal: "Lunch", food: "Lean beef salad", calories: 400, protein: 38, carbs: 28, fats: 14 },
      { meal: "Snack", food: "Protein shake", calories: 150, protein: 20, carbs: 10, fats: 3 },
      { meal: "Dinner", food: "Grilled fish with vegetables", calories: 360, protein: 36, carbs: 24, fats: 12 }
    ]
  };

  return {
    fatloss: { veg: defaultMeals, nonveg: defaultMeals },
    lean: { veg: defaultMeals, nonveg: defaultMeals },
    bulk: { veg: defaultMeals, nonveg: defaultMeals },
    athletic: { veg: defaultMeals, nonveg: defaultMeals }
  };
};

export const saveDietPlanToDatabase = async (
  userId: string,
  dietPlan: DietPlanData,
  videoId: string
) => {
  try {
    // Save to localStorage as fallback
    localStorage.setItem(`diet-plan-${userId}`, JSON.stringify(dietPlan));
    
    // Try to save to database if table exists
    try {
      const { error } = await (supabase as any)
        .from("diet_plans")
        .insert({
          user_id: userId,
          video_id: videoId,
          plan_data: dietPlan,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.warn("Database save failed, using localStorage:", error);
      }
    } catch (dbError) {
      console.warn("Database table not available, using localStorage:", dbError);
    }
    
    return true;
  } catch (error) {
    console.error("Error saving diet plan:", error);
    return false;
  }
};
