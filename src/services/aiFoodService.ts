const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const FOOD_CACHE_KEY = "food-nutrition-cache";

export interface FoodNutrition {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

// Get cached food nutrition
const getCachedNutrition = (foodName: string): FoodNutrition | null => {
  try {
    const cache = JSON.parse(localStorage.getItem(FOOD_CACHE_KEY) || "{}");
    return cache[foodName.toLowerCase()] || null;
  } catch {
    return null;
  }
};

// Cache food nutrition
const cacheNutrition = (foodName: string, nutrition: FoodNutrition) => {
  try {
    const cache = JSON.parse(localStorage.getItem(FOOD_CACHE_KEY) || "{}");
    cache[foodName.toLowerCase()] = nutrition;
    localStorage.setItem(FOOD_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn("Failed to cache nutrition:", error);
  }
};

export const getFoodNutritionFromAI = async (foodName: string): Promise<FoodNutrition> => {
  // Check cache first
  const cached = getCachedNutrition(foodName);
  if (cached) {
    return cached;
  }
  try {
    if (!OPENAI_API_KEY) {
      console.warn("OpenAI API key not configured");
      return getDefaultNutrition(foodName);
    }

    const prompt = `You are a nutrition expert. Given a food name, provide accurate nutritional information for a standard serving size.

Food: ${foodName}

Return ONLY a JSON object with this exact structure (no additional text):
{
  "name": "food name",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fats": number
}

Where:
- calories: total calories in the serving
- protein: grams of protein
- carbs: grams of carbohydrates
- fats: grams of fat

Use realistic, standard serving sizes. For example:
- 1 cup of cooked rice
- 1 medium apple
- 100g of chicken breast
- 1 slice of bread`;

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
            content: "You are a nutrition expert. Return ONLY valid JSON, no additional text."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    });

    if (!response.ok) {
      console.error("OpenAI API error:", response.statusText);
      return getDefaultNutrition(foodName);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    // Parse JSON response
    const nutrition = JSON.parse(content);
    
    const result = {
      name: nutrition.name || foodName,
      calories: Math.round(nutrition.calories || 0),
      protein: Math.round(nutrition.protein || 0),
      carbs: Math.round(nutrition.carbs || 0),
      fats: Math.round(nutrition.fats || 0)
    };

    // Cache the result
    cacheNutrition(foodName, result);
    
    return result;
  } catch (error) {
    console.error("Error getting food nutrition:", error);
    const defaultNutrition = getDefaultNutrition(foodName);
    cacheNutrition(foodName, defaultNutrition);
    return defaultNutrition;
  }
};

const getDefaultNutrition = (foodName: string): FoodNutrition => {
  return {
    name: foodName,
    calories: 300,
    protein: 15,
    carbs: 40,
    fats: 10
  };
};
