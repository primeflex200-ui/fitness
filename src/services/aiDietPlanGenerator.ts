import { supabase } from "@/integrations/supabase/client";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export interface DietPlan {
  [day: string]: Array<{
    meal: string;
    food: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  }>;
}

export interface GeneratedDietPlan {
  dietType: "veg" | "nonveg";
  bodyGoal: "fatloss" | "lean" | "bulk" | "athletic";
  plan: DietPlan;
  createdAt: string;
}

const getCalorieTargets = (goal: string): number => {
  const targets: Record<string, number> = {
    fatloss: 1600,
    lean: 2100,
    bulk: 2800,
    athletic: 2400
  };
  return targets[goal] || 2000;
};

const getMacroRatios = (goal: string): { protein: number; carbs: number; fats: number } => {
  const ratios: Record<string, { protein: number; carbs: number; fats: number }> = {
    fatloss: { protein: 0.35, carbs: 0.40, fats: 0.25 },
    lean: { protein: 0.30, carbs: 0.50, fats: 0.20 },
    bulk: { protein: 0.30, carbs: 0.50, fats: 0.20 },
    athletic: { protein: 0.30, carbs: 0.50, fats: 0.20 }
  };
  return ratios[goal] || { protein: 0.30, carbs: 0.45, fats: 0.25 };
};

export const generateAIDietPlan = async (
  dietType: "veg" | "nonveg",
  bodyGoal: "fatloss" | "lean" | "bulk" | "athletic"
): Promise<GeneratedDietPlan> => {
  try {
    if (!OPENAI_API_KEY) {
      console.warn("OpenAI API key not configured");
      return getDefaultDietPlan(dietType, bodyGoal);
    }

    const calorieTarget = getCalorieTargets(bodyGoal);
    const macroRatios = getMacroRatios(bodyGoal);

    const proteinCals = calorieTarget * macroRatios.protein;
    const carbsCals = calorieTarget * macroRatios.carbs;
    const fatsCals = calorieTarget * macroRatios.fats;

    const proteinGrams = Math.round(proteinCals / 4);
    const carbsGrams = Math.round(carbsCals / 4);
    const fatsGrams = Math.round(fatsCals / 9);

    const goalDescriptions: Record<string, string> = {
      fatloss: "fat loss with high protein to preserve muscle",
      lean: "lean muscle gain with balanced macros",
      bulk: "muscle gain with higher calories and carbs",
      athletic: "athletic performance with balanced nutrition"
    };

    const prompt = `You are a professional nutritionist and fitness expert. Generate a complete 7-day meal plan.

Requirements:
- Diet Type: ${dietType === "veg" ? "Vegetarian" : "Non-Vegetarian"}
- Goal: ${goalDescriptions[bodyGoal]}
- Daily Calories: ${calorieTarget}
- Daily Protein: ${proteinGrams}g
- Daily Carbs: ${carbsGrams}g
- Daily Fats: ${fatsGrams}g

Generate a JSON response with this exact structure for all 7 days:
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
- Each day must have exactly 5 meals (Breakfast, 2 Snacks, Lunch, Dinner)
- Total daily calories should be approximately ${calorieTarget}
- Meals should be ${dietType === "veg" ? "vegetarian" : "non-vegetarian"}
- Include realistic Indian and international foods
- Vary meals throughout the week for better adherence
- Include portion sizes in food descriptions
- Ensure macros match the targets as closely as possible

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
        max_tokens: 2500
      })
    });

    if (!response.ok) {
      console.error("OpenAI API error:", response.statusText);
      return getDefaultDietPlan(dietType, bodyGoal);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    const mealPlan = JSON.parse(content);

    return {
      dietType,
      bodyGoal,
      plan: mealPlan,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error generating diet plan:", error);
    return getDefaultDietPlan(dietType, bodyGoal);
  }
};

export const uploadDietPlanToStorage = async (
  userId: string,
  dietPlan: GeneratedDietPlan
): Promise<string | null> => {
  try {
    const fileName = `diet-plans/${userId}/${dietPlan.bodyGoal}-${dietPlan.dietType}-${Date.now()}.json`;
    
    const { data, error } = await supabase.storage
      .from("diet-plans")
      .upload(fileName, JSON.stringify(dietPlan, null, 2), {
        contentType: "application/json",
        upsert: false
      });

    if (error) {
      console.error("Storage upload error:", error);
      return null;
    }

    return data?.path || null;
  } catch (error) {
    console.error("Error uploading diet plan:", error);
    return null;
  }
};

export const saveDietPlanMetadata = async (
  userId: string,
  dietPlan: GeneratedDietPlan,
  storagePath: string | null
) => {
  try {
    const { error } = await (supabase as any)
      .from("diet_plans")
      .insert({
        user_id: userId,
        plan_data: dietPlan,
        storage_path: storagePath,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.warn("Database save failed:", error);
    }
    return true;
  } catch (error) {
    console.warn("Error saving metadata:", error);
    return true; // Still consider it success if storage worked
  }
};

export interface MealItem {
  meal: string;
  food: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface Recipe {
  name: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: number;
  servings: number;
  difficulty: "Easy" | "Medium" | "Hard";
}

export const generateAlternativeMeal = async (
  currentMeal: MealItem,
  dietType: "veg" | "nonveg",
  bodyGoal: string
): Promise<MealItem> => {
  try {
    if (!OPENAI_API_KEY) {
      console.warn("OpenAI API key not configured");
      return getDefaultAlternativeMeal(currentMeal);
    }

    const calorieTarget = getCalorieTargets(bodyGoal);
    const macroRatios = getMacroRatios(bodyGoal);

    const proteinCals = calorieTarget * macroRatios.protein;
    const carbsCals = calorieTarget * macroRatios.carbs;
    const fatsCals = calorieTarget * macroRatios.fats;

    const proteinGrams = Math.round(proteinCals / 4);
    const carbsGrams = Math.round(carbsCals / 4);
    const fatsGrams = Math.round(fatsCals / 9);

    const prompt = `You are a professional nutritionist. Generate ONE alternative meal to replace "${currentMeal.food}" for a ${currentMeal.meal.toLowerCase()}.

Requirements:
- Diet Type: ${dietType === "veg" ? "Vegetarian" : "Non-Vegetarian"}
- Meal Type: ${currentMeal.meal}
- Target Calories: ~${currentMeal.calories}
- Target Protein: ~${currentMeal.protein}g
- Target Carbs: ~${currentMeal.carbs}g
- Target Fats: ~${currentMeal.fats}g
- Must be DIFFERENT from: "${currentMeal.food}"
- Include portion size in the food description

Return ONLY valid JSON with this structure (no additional text):
{
  "meal": "${currentMeal.meal}",
  "food": "alternative food name with portion",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fats": number
}`;

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
            content: "You are a professional nutritionist. Return ONLY valid JSON, no additional text."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      console.error("OpenAI API error:", response.statusText);
      return getDefaultAlternativeMeal(currentMeal);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    const alternativeMeal = JSON.parse(content);

    return {
      meal: alternativeMeal.meal || currentMeal.meal,
      food: alternativeMeal.food || currentMeal.food,
      calories: Math.round(alternativeMeal.calories || currentMeal.calories),
      protein: Math.round(alternativeMeal.protein || currentMeal.protein),
      carbs: Math.round(alternativeMeal.carbs || currentMeal.carbs),
      fats: Math.round(alternativeMeal.fats || currentMeal.fats)
    };
  } catch (error) {
    console.error("Error generating alternative meal:", error);
    return getDefaultAlternativeMeal(currentMeal);
  }
};

export const generateDietPlanFromAvailableFoods = async (
  availableFoods: string[],
  dietType: "veg" | "nonveg",
  bodyGoal: "fatloss" | "lean" | "bulk" | "athletic"
): Promise<GeneratedDietPlan> => {
  try {
    if (!OPENAI_API_KEY) {
      console.warn("OpenAI API key not configured");
      return getDefaultDietPlan(dietType, bodyGoal);
    }

    const calorieTarget = getCalorieTargets(bodyGoal);
    const macroRatios = getMacroRatios(bodyGoal);

    const proteinCals = calorieTarget * macroRatios.protein;
    const carbsCals = calorieTarget * macroRatios.carbs;
    const fatsCals = calorieTarget * macroRatios.fats;

    const proteinGrams = Math.round(proteinCals / 4);
    const carbsGrams = Math.round(carbsCals / 4);
    const fatsGrams = Math.round(fatsCals / 9);

    const foodList = availableFoods.join(", ");

    const prompt = `You are a professional nutritionist. Generate a complete 7-day meal plan using ONLY the available foods provided.

Available Foods: ${foodList}

Requirements:
- Diet Type: ${dietType === "veg" ? "Vegetarian" : "Non-Vegetarian"}
- Goal: ${bodyGoal}
- Daily Calories: ${calorieTarget}
- Daily Protein: ${proteinGrams}g
- Daily Carbs: ${carbsGrams}g
- Daily Fats: ${fatsGrams}g
- MUST use ONLY foods from the available list
- Each day must have 5 meals (Breakfast, 2 Snacks, Lunch, Dinner)
- Include portion sizes
- Vary meals throughout the week

Generate a JSON response with this exact structure for all 7 days:
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
            content: "You are a professional nutritionist. Generate meal plans using ONLY provided foods. Return ONLY valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2500
      })
    });

    if (!response.ok) {
      console.error("OpenAI API error:", response.statusText);
      return getDefaultDietPlan(dietType, bodyGoal);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    const mealPlan = JSON.parse(content);

    return {
      dietType,
      bodyGoal,
      plan: mealPlan,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error generating diet plan from available foods:", error);
    return getDefaultDietPlan(dietType, bodyGoal);
  }
};

export const generateRecipe = async (mealName: string): Promise<Recipe> => {
  try {
    if (!OPENAI_API_KEY) {
      console.warn("OpenAI API key not configured");
      return getDefaultRecipe(mealName);
    }

    const prompt = `You are an expert Indian chef. Create a DETAILED, SPECIFIC recipe for: "${mealName}"

RETURN ONLY VALID JSON - NO OTHER TEXT BEFORE OR AFTER.

{
  "name": "Exact dish name",
  "ingredients": [
    "EXACT quantity with unit (e.g., 200g soya chunks, 2 tbsp oil, 1 tsp salt, 1 tsp chilli powder, 1 tsp garam masala)",
    "EXACT quantity with unit",
    "EXACT quantity with unit",
    "continue with ALL ingredients"
  ],
  "instructions": [
    "SPECIFIC action with quantities (e.g., Heat 2 tbsp oil in a pan over medium-high heat)",
    "SPECIFIC action (e.g., Add 200g soya chunks and fry for 3-4 minutes until golden)",
    "SPECIFIC action (e.g., Add 1 tsp salt, 1 tsp chilli powder, 1 tsp garam masala and mix well)",
    "SPECIFIC action (e.g., Continue frying for 2-3 minutes until crispy and well-coated)",
    "SPECIFIC action (e.g., Serve hot with lemon juice or yogurt)"
  ],
  "cookingTime": realistic number in minutes,
  "servings": 1,
  "difficulty": "Easy" or "Medium" or "Hard"
}

MANDATORY RULES:
1. EVERY ingredient MUST have exact quantity (grams, ml, tbsp, tsp, pieces)
2. EVERY instruction MUST be specific with exact quantities and times
3. NO generic text like "Ingredient 1", "Cook according to preference", "Use fresh ingredients"
4. Instructions MUST describe EXACTLY what to do, not general advice
5. Include specific cooking temperatures or heat levels when relevant
6. Include specific cooking times for each step
7. Return ONLY the JSON object, nothing else, no markdown, no extra text`;

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
            content: "You are a professional chef. You MUST return ONLY valid JSON with no additional text. The JSON must be properly formatted and parseable."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      console.error("OpenAI API error:", response.statusText);
      return getDefaultRecipe(mealName);
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    if (content.startsWith("```json")) {
      content = content.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    } else if (content.startsWith("```")) {
      content = content.replace(/^```\n?/, "").replace(/\n?```$/, "");
    }
    
    const recipe = JSON.parse(content);

    // Validate recipe has real data - strict validation
    const hasPlaceholderIngredients = !recipe.ingredients || 
      recipe.ingredients.length === 0 || 
      recipe.ingredients.some((ing: string) => 
        ing.includes("Ingredient") || 
        ing.includes("ingredient") ||
        ing === "Prepare all necessary ingredients" ||
        ing === "Use fresh, quality ingredients" ||
        ing === "Follow standard cooking techniques"
      );

    const hasPlaceholderInstructions = !recipe.instructions || 
      recipe.instructions.length === 0 || 
      recipe.instructions.some((inst: string) => 
        inst.includes("Step") && inst.includes("Description") ||
        inst.includes("Gather and prepare") ||
        inst.includes("Cook according to") ||
        inst.includes("Season to taste") ||
        inst.includes("standard methods")
      );

    if (hasPlaceholderIngredients || hasPlaceholderInstructions) {
      console.warn("Recipe has placeholder content, using default for:", mealName);
      return getDefaultRecipe(mealName);
    }

    return {
      name: recipe.name || mealName,
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
      instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
      cookingTime: Math.max(5, Math.min(60, recipe.cookingTime || 30)),
      servings: recipe.servings || 1,
      difficulty: ["Easy", "Medium", "Hard"].includes(recipe.difficulty) ? recipe.difficulty : "Easy"
    };
  } catch (error) {
    console.error("Error generating recipe:", error);
    return getDefaultRecipe(mealName);
  }
};

const getDefaultRecipe = (mealName: string): Recipe => {
  // Create realistic default recipes based on meal name
  const lowerName = mealName.toLowerCase();
  
  if (lowerName.includes("apple") && lowerName.includes("peanut")) {
    return {
      name: "Apple with Peanut Butter",
      ingredients: [
        "1 medium apple",
        "2 tablespoons natural peanut butter",
        "Optional: 1 teaspoon honey"
      ],
      instructions: [
        "Wash and slice the apple into thin slices",
        "Spread peanut butter evenly on each slice",
        "Drizzle with honey if desired",
        "Serve immediately"
      ],
      cookingTime: 5,
      servings: 1,
      difficulty: "Easy"
    };
  }
  
  if (lowerName.includes("oat") || lowerName.includes("berr")) {
    return {
      name: "Oats with Berries and Almonds",
      ingredients: [
        "1 cup rolled oats",
        "1.5 cups milk or water",
        "0.5 cup mixed berries (fresh or frozen)",
        "0.25 cup sliced almonds",
        "1 tablespoon honey",
        "Pinch of salt"
      ],
      instructions: [
        "Bring milk to a boil in a pot",
        "Add oats and salt, stir well",
        "Reduce heat and simmer for 5 minutes, stirring occasionally",
        "Add berries and cook for 2 more minutes",
        "Transfer to bowl and top with almonds",
        "Drizzle with honey and serve"
      ],
      cookingTime: 10,
      servings: 1,
      difficulty: "Easy"
    };
  }
  
  if (lowerName.includes("egg")) {
    return {
      name: "Scrambled Eggs with Toast",
      ingredients: [
        "2 large eggs",
        "2 slices whole wheat bread",
        "1 tablespoon butter",
        "Salt and pepper to taste",
        "Optional: fresh herbs"
      ],
      instructions: [
        "Heat butter in a non-stick pan over medium heat",
        "Crack eggs into a bowl and beat lightly",
        "Pour eggs into pan and scramble until cooked through (3-4 minutes)",
        "Toast bread until golden brown",
        "Season eggs with salt and pepper",
        "Plate eggs and toast together, serve hot"
      ],
      cookingTime: 10,
      servings: 1,
      difficulty: "Easy"
    };
  }
  
  if (lowerName.includes("chicken") && lowerName.includes("rice")) {
    return {
      name: "Grilled Chicken with Rice",
      ingredients: [
        "150g chicken breast",
        "1 cup cooked rice",
        "2 tablespoons olive oil",
        "2 cloves garlic, minced",
        "Salt and pepper to taste",
        "Optional: lemon juice"
      ],
      instructions: [
        "Season chicken breast with salt and pepper",
        "Heat olive oil in a grill pan over medium-high heat",
        "Grill chicken 6-7 minutes per side until cooked through",
        "Let rest for 2 minutes, then slice",
        "Serve chicken over cooked rice",
        "Drizzle with lemon juice if desired"
      ],
      cookingTime: 20,
      servings: 1,
      difficulty: "Easy"
    };
  }
  
  if (lowerName.includes("soya") || lowerName.includes("soy")) {
    return {
      name: "Soya Chunks Fry",
      ingredients: [
        "200g soya chunks (meal maker)",
        "3 tablespoons vegetable oil",
        "1 teaspoon salt",
        "1 teaspoon chilli powder",
        "1 teaspoon garam masala",
        "0.5 teaspoon turmeric powder",
        "2 cloves garlic, minced",
        "1 small onion, finely chopped",
        "Optional: fresh coriander leaves"
      ],
      instructions: [
        "Soak soya chunks in hot water for 5 minutes, then squeeze out excess water",
        "Heat 3 tablespoons oil in a pan over medium-high heat",
        "Add minced garlic and chopped onion, fry for 1 minute until fragrant",
        "Add the soaked soya chunks and fry for 4-5 minutes, stirring occasionally",
        "Add 1 teaspoon salt, 1 teaspoon chilli powder, 0.5 teaspoon turmeric powder, and 1 teaspoon garam masala",
        "Mix well and continue frying for 3-4 minutes until the soya chunks are golden and crispy",
        "Garnish with fresh coriander leaves if desired",
        "Serve hot as a snack or side dish"
      ],
      cookingTime: 15,
      servings: 1,
      difficulty: "Easy"
    };
  }
  
  // More comprehensive fallback recipes
  if (lowerName.includes("dal") || lowerName.includes("lentil")) {
    return {
      name: "Dal with Roti",
      ingredients: [
        "1 cup dried lentils",
        "4 cups water",
        "1 teaspoon turmeric powder",
        "1 teaspoon salt",
        "2 tablespoons ghee or oil",
        "1 teaspoon cumin seeds",
        "2 cloves garlic, minced",
        "1 small onion, chopped",
        "2 green chillies, chopped"
      ],
      instructions: [
        "Rinse lentils and add to a pot with 4 cups water",
        "Bring to boil and add 1 teaspoon turmeric powder",
        "Simmer for 20-25 minutes until lentils are soft",
        "Heat 2 tablespoons ghee in a separate pan",
        "Add 1 teaspoon cumin seeds and let them crackle",
        "Add minced garlic, chopped onion, and green chillies, fry for 2 minutes",
        "Pour this tempering into the cooked dal",
        "Add 1 teaspoon salt and mix well",
        "Serve hot with roti or rice"
      ],
      cookingTime: 30,
      servings: 1,
      difficulty: "Easy"
    };
  }

  if (lowerName.includes("paneer") || lowerName.includes("cottage")) {
    return {
      name: "Paneer Tikka",
      ingredients: [
        "200g paneer (cottage cheese), cubed",
        "0.5 cup yogurt",
        "2 tablespoons oil",
        "1 tablespoon ginger-garlic paste",
        "1 teaspoon red chilli powder",
        "0.5 teaspoon turmeric powder",
        "1 teaspoon garam masala",
        "1 teaspoon salt",
        "1 tablespoon lemon juice",
        "1 bell pepper, cubed",
        "1 onion, cubed"
      ],
      instructions: [
        "Mix yogurt with ginger-garlic paste, red chilli powder, turmeric, garam masala, salt, and lemon juice",
        "Marinate paneer cubes in this mixture for 15 minutes",
        "Heat 2 tablespoons oil in a pan over high heat",
        "Thread paneer, bell pepper, and onion alternately on skewers",
        "Grill or pan-fry for 3-4 minutes on each side until golden",
        "Serve hot with mint chutney and lemon wedges"
      ],
      cookingTime: 25,
      servings: 1,
      difficulty: "Medium"
    };
  }

  if (lowerName.includes("rice") && !lowerName.includes("chicken")) {
    return {
      name: "Steamed Rice",
      ingredients: [
        "1 cup basmati rice",
        "2 cups water",
        "1 teaspoon salt",
        "1 tablespoon ghee or oil",
        "2-3 green cardamom pods",
        "1 bay leaf"
      ],
      instructions: [
        "Rinse rice under cold water until water runs clear",
        "Heat 1 tablespoon ghee in a pot over medium heat",
        "Add cardamom pods and bay leaf, let them crackle for 30 seconds",
        "Add rinsed rice and stir for 1-2 minutes",
        "Add 2 cups water and 1 teaspoon salt",
        "Bring to boil, then reduce heat to low",
        "Cover and simmer for 15-18 minutes until water is absorbed",
        "Fluff with a fork and serve hot"
      ],
      cookingTime: 20,
      servings: 1,
      difficulty: "Easy"
    };
  }

  if (lowerName.includes("roti") || lowerName.includes("bread")) {
    return {
      name: "Whole Wheat Roti",
      ingredients: [
        "1 cup whole wheat flour",
        "0.5 cup water",
        "0.5 teaspoon salt",
        "1 tablespoon oil"
      ],
      instructions: [
        "Mix whole wheat flour with salt in a bowl",
        "Add 1 tablespoon oil and mix well",
        "Gradually add water and knead into a soft dough",
        "Let dough rest for 15 minutes",
        "Divide into 4 equal portions and roll into thin circles",
        "Heat a tawa (griddle) over high heat",
        "Place roti on tawa and cook for 30 seconds on each side",
        "Press with a cloth to puff up, then serve hot"
      ],
      cookingTime: 20,
      servings: 4,
      difficulty: "Easy"
    };
  }

  if (lowerName.includes("curry") || lowerName.includes("sabzi")) {
    return {
      name: "Vegetable Curry",
      ingredients: [
        "2 cups mixed vegetables (carrots, peas, beans)",
        "2 tablespoons oil",
        "1 onion, chopped",
        "2 tomatoes, chopped",
        "1 tablespoon ginger-garlic paste",
        "1 teaspoon cumin seeds",
        "1 teaspoon coriander powder",
        "0.5 teaspoon turmeric powder",
        "1 teaspoon red chilli powder",
        "1 teaspoon salt",
        "0.5 cup water"
      ],
      instructions: [
        "Heat 2 tablespoons oil in a pan over medium heat",
        "Add 1 teaspoon cumin seeds and let them crackle",
        "Add chopped onion and fry until golden (3-4 minutes)",
        "Add ginger-garlic paste and fry for 1 minute",
        "Add chopped tomatoes and cook until soft (3-4 minutes)",
        "Add coriander powder, turmeric, and red chilli powder",
        "Add mixed vegetables and stir well",
        "Add 0.5 cup water and 1 teaspoon salt",
        "Simmer for 10-12 minutes until vegetables are cooked",
        "Serve hot with roti or rice"
      ],
      cookingTime: 25,
      servings: 1,
      difficulty: "Easy"
    };
  }

  // Generic fallback - should rarely be used now
  return {
    name: mealName,
    ingredients: [
      "2 tablespoons oil or ghee",
      "1 onion, chopped",
      "2 cloves garlic, minced",
      "Salt and spices to taste",
      "Main ingredient as per dish"
    ],
    instructions: [
      "Heat oil in a pan over medium heat",
      "Add onion and garlic, fry until golden",
      "Add main ingredients and spices",
      "Cook until done, stirring occasionally",
      "Adjust seasoning and serve hot"
    ],
    cookingTime: 20,
    servings: 1,
    difficulty: "Easy"
  };
};

const getDefaultAlternativeMeal = (currentMeal: MealItem): MealItem => {
  const alternatives: Record<string, Record<string, MealItem>> = {
    Breakfast: {
      "Oats with berries": { meal: "Breakfast", food: "Scrambled eggs with toast", calories: 300, protein: 20, carbs: 32, fats: 10 },
      "Scrambled eggs with toast": { meal: "Breakfast", food: "Pancakes with berries", calories: 340, protein: 16, carbs: 48, fats: 10 },
      "Pancakes with berries": { meal: "Breakfast", food: "Smoothie bowl with granola", calories: 350, protein: 14, carbs: 52, fats: 10 }
    },
    Snack: {
      "Apple with peanut butter": { meal: "Snack", food: "Banana with almonds", calories: 160, protein: 5, carbs: 20, fats: 8 },
      "Banana with almonds": { meal: "Snack", food: "Mixed nuts", calories: 160, protein: 5, carbs: 12, fats: 12 },
      "Mixed nuts": { meal: "Snack", food: "Greek yogurt with honey", calories: 150, protein: 12, carbs: 18, fats: 3 }
    },
    Lunch: {
      "Paneer tikka with rice": { meal: "Lunch", food: "Chickpea curry with rice", calories: 400, protein: 32, carbs: 42, fats: 12 },
      "Chickpea curry with rice": { meal: "Lunch", food: "Vegetable biryani", calories: 380, protein: 35, carbs: 28, fats: 14 },
      "Vegetable biryani": { meal: "Lunch", food: "Paneer tikka with rice", calories: 400, protein: 30, carbs: 50, fats: 10 }
    },
    Dinner: {
      "Dal with roti": { meal: "Dinner", food: "Lentil soup with bread", calories: 350, protein: 35, carbs: 30, fats: 12 },
      "Lentil soup with bread": { meal: "Dinner", food: "Vegetable curry with rice", calories: 360, protein: 36, carbs: 24, fats: 12 },
      "Vegetable curry with rice": { meal: "Dinner", food: "Dal with roti", calories: 350, protein: 35, carbs: 30, fats: 12 }
    }
  };

  const mealAlternatives = alternatives[currentMeal.meal];
  if (mealAlternatives) {
    const keys = Object.keys(mealAlternatives);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return mealAlternatives[randomKey];
  }

  return currentMeal;
};

const getDefaultDietPlan = (dietType: "veg" | "nonveg", bodyGoal: string): GeneratedDietPlan => {
  const defaultPlan: DietPlan = {
    Monday: [
      { meal: "Breakfast", food: "Oats with berries and almonds", calories: 320, protein: 12, carbs: 48, fats: 8 },
      { meal: "Snack", food: "Apple with peanut butter", calories: 150, protein: 4, carbs: 20, fats: 6 },
      { meal: "Lunch", food: dietType === "veg" ? "Paneer tikka with brown rice" : "Grilled chicken with brown rice", calories: 400, protein: 30, carbs: 50, fats: 10 },
      { meal: "Snack", food: "Greek yogurt with honey", calories: 120, protein: 15, carbs: 12, fats: 2 },
      { meal: "Dinner", food: dietType === "veg" ? "Dal with roti and vegetables" : "Grilled fish with broccoli", calories: 350, protein: 35, carbs: 30, fats: 12 }
    ],
    Tuesday: [
      { meal: "Breakfast", food: "Eggs with whole wheat toast", calories: 300, protein: 20, carbs: 32, fats: 10 },
      { meal: "Snack", food: "Banana with almonds", calories: 180, protein: 6, carbs: 24, fats: 8 },
      { meal: "Lunch", food: dietType === "veg" ? "Chickpea curry with rice" : "Turkey wrap with vegetables", calories: 400, protein: 32, carbs: 42, fats: 12 },
      { meal: "Snack", food: "Protein shake", calories: 150, protein: 20, carbs: 10, fats: 3 },
      { meal: "Dinner", food: dietType === "veg" ? "Tofu stir-fry with noodles" : "Grilled fish with sweet potato", calories: 330, protein: 36, carbs: 18, fats: 12 }
    ],
    Wednesday: [
      { meal: "Breakfast", food: "Smoothie bowl with granola", calories: 350, protein: 14, carbs: 52, fats: 10 },
      { meal: "Snack", food: "Mixed nuts", calories: 160, protein: 5, carbs: 12, fats: 12 },
      { meal: "Lunch", food: dietType === "veg" ? "Vegetable biryani" : "Chicken biryani", calories: 380, protein: 35, carbs: 28, fats: 14 },
      { meal: "Snack", food: "Cottage cheese", calories: 120, protein: 16, carbs: 8, fats: 3 },
      { meal: "Dinner", food: dietType === "veg" ? "Lentil soup with bread" : "Lean beef with sweet potato", calories: 400, protein: 38, carbs: 42, fats: 12 }
    ],
    Thursday: [
      { meal: "Breakfast", food: "Pancakes with berries", calories: 340, protein: 16, carbs: 48, fats: 10 },
      { meal: "Snack", food: "Orange with almonds", calories: 140, protein: 4, carbs: 18, fats: 6 },
      { meal: "Lunch", food: dietType === "veg" ? "Vegetable pulao" : "Tuna salad", calories: 350, protein: 32, carbs: 24, fats: 12 },
      { meal: "Snack", food: "Protein bar", calories: 150, protein: 15, carbs: 16, fats: 5 },
      { meal: "Dinner", food: dietType === "veg" ? "Vegetable curry with quinoa" : "Grilled chicken with quinoa", calories: 420, protein: 40, carbs: 48, fats: 10 }
    ],
    Friday: [
      { meal: "Breakfast", food: "Avocado toast on whole grain", calories: 360, protein: 12, carbs: 42, fats: 16 },
      { meal: "Snack", food: "Berries with yogurt", calories: 130, protein: 12, carbs: 16, fats: 2 },
      { meal: "Lunch", food: dietType === "veg" ? "Vegetable fried rice" : "Turkey meatballs with rice", calories: 400, protein: 36, carbs: 32, fats: 14 },
      { meal: "Snack", food: "Protein shake", calories: 160, protein: 18, carbs: 14, fats: 4 },
      { meal: "Dinner", food: dietType === "veg" ? "Vegetable soup with bread" : "Baked cod with asparagus", calories: 340, protein: 38, carbs: 18, fats: 12 }
    ],
    Saturday: [
      { meal: "Breakfast", food: "Omelette with vegetables", calories: 320, protein: 24, carbs: 20, fats: 14 },
      { meal: "Snack", food: "Apple with cheese", calories: 150, protein: 6, carbs: 18, fats: 8 },
      { meal: "Lunch", food: dietType === "veg" ? "Vegetable khichdi" : "Grilled shrimp with rice", calories: 420, protein: 32, carbs: 52, fats: 10 },
      { meal: "Snack", food: "Greek yogurt", calories: 140, protein: 16, carbs: 12, fats: 3 },
      { meal: "Dinner", food: dietType === "veg" ? "Vegetable stir-fry" : "Chicken stir-fry", calories: 380, protein: 36, carbs: 36, fats: 12 }
    ],
    Sunday: [
      { meal: "Breakfast", food: "Granola with yogurt", calories: 340, protein: 14, carbs: 48, fats: 10 },
      { meal: "Snack", food: "Banana with almonds", calories: 160, protein: 5, carbs: 20, fats: 8 },
      { meal: "Lunch", food: dietType === "veg" ? "Vegetable curry with bread" : "Lean beef salad", calories: 400, protein: 38, carbs: 28, fats: 14 },
      { meal: "Snack", food: "Protein shake", calories: 150, protein: 20, carbs: 10, fats: 3 },
      { meal: "Dinner", food: dietType === "veg" ? "Vegetable soup" : "Grilled fish with vegetables", calories: 360, protein: 36, carbs: 24, fats: 12 }
    ]
  };

  return {
    dietType,
    bodyGoal: bodyGoal as "fatloss" | "lean" | "bulk" | "athletic",
    plan: defaultPlan,
    createdAt: new Date().toISOString()
  };
};
