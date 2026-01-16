import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export interface FoodNutrition {
  food_name?: string;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  trans_fat: number;
  calories: number;
  serving_size: string;
  vitamins?: string[];
  minerals?: string[];
  health_benefits?: string[];
}

/**
 * Get nutritional information for any food using AI
 * @param foodName - Name of the food to search
 * @returns Nutritional information or null if not found
 */
export async function getFoodNutrition(foodName: string): Promise<FoodNutrition | null> {
  try {
    console.log('🔍 Searching nutrition for:', foodName);

    const prompt = `You are an intelligent nutrition expert AI. A user searched for: "${foodName}"

CRITICAL INSTRUCTIONS - READ CAREFULLY:
1. "Soy chunks", "Soya chunks", "Textured vegetable protein" are ALL REAL FOODS - provide nutrition data!
2. If spelling is wrong, FIGURE OUT the food (e.g., "paner" = "paneer", "chiken" = "chicken")
3. Be VERY LENIENT - if it could possibly be a food, provide the data
4. Common foods you MUST recognize:
   - Soy chunks / Soya chunks / TVP (textured vegetable protein)
   - Paneer / Paner
   - Tofu / Soya paneer
   - All vegetables, fruits, grains, meats, dairy
   - All Indian, Chinese, Western foods
5. ONLY return error for things that are DEFINITELY not food (car, phone, table, computer)

Provide detailed nutritional information per 100g serving.

Return ONLY a valid JSON object (no markdown, no explanation):
{
  "food_name": "<corrected food name>",
  "protein": <number>,
  "carbs": <number>,
  "fat": <number>,
  "fiber": <number>,
  "trans_fat": <number>,
  "calories": <number>,
  "serving_size": "100g",
  "vitamins": ["Vitamin A", "Vitamin C", "Vitamin D"],
  "minerals": ["Iron", "Calcium", "Zinc"],
  "health_benefits": ["benefit 1", "benefit 2"]
}

EXAMPLES THAT MUST WORK:
- "soy chunks" → Soy Chunks (protein: 52, carbs: 33, fat: 0.5, fiber: 13, calories: 345)
- "soya chunks" → Soy Chunks (same as above)
- "paner" → Paneer
- "chiken" → Chicken

ONLY return {"error": "Not a food item"} for non-food items like "car", "phone", "laptop".`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an intelligent nutrition database API that understands typos and food variations. Return only valid JSON, no markdown formatting. Be helpful and smart about interpreting user input.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 600
    });

    const content = response.choices[0]?.message?.content?.trim();
    
    if (!content) {
      console.error('❌ No response from AI');
      return null;
    }

    console.log('📦 AI Response:', content);

    // Remove markdown code blocks if present
    let jsonContent = content;
    if (content.startsWith('```')) {
      jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }

    const data = JSON.parse(jsonContent);

    if (data.error) {
      console.log('⚠️ First attempt failed, trying simpler prompt...');
      
      // Try again with a simpler, more direct prompt
      const simplePrompt = `Give me nutrition data for "${foodName}" per 100g. Return JSON only:
{
  "food_name": "name",
  "protein": number,
  "carbs": number,
  "fat": number,
  "fiber": number,
  "trans_fat": number,
  "calories": number,
  "serving_size": "100g",
  "vitamins": ["list"],
  "minerals": ["list"],
  "health_benefits": ["list"]
}`;

      const retryResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a nutrition database. Return only JSON.' },
          { role: 'user', content: simplePrompt }
        ],
        temperature: 0.2,
        max_tokens: 600
      });

      const retryContent = retryResponse.choices[0]?.message?.content?.trim();
      if (retryContent) {
        let retryJson = retryContent;
        if (retryContent.startsWith('```')) {
          retryJson = retryContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        }
        const retryData = JSON.parse(retryJson);
        if (!retryData.error) {
          console.log('✅ Retry successful! Nutrition data retrieved for:', retryData.food_name || foodName);
          return retryData;
        }
      }
      
      console.log('❌ Not a food item after retry');
      return null;
    }

    console.log('✅ Nutrition data retrieved for:', data.food_name || foodName);
    return data;

  } catch (error) {
    console.error('❌ Error fetching nutrition data:', error);
    return null;
  }
}

/**
 * Get nutritional comparison between two foods
 */
export async function compareFoods(food1: string, food2: string): Promise<{
  food1: FoodNutrition | null;
  food2: FoodNutrition | null;
  comparison: string;
} | null> {
  try {
    const [nutrition1, nutrition2] = await Promise.all([
      getFoodNutrition(food1),
      getFoodNutrition(food2)
    ]);

    if (!nutrition1 || !nutrition2) {
      return null;
    }

    // Generate comparison
    const prompt = `Compare these two foods nutritionally:
Food 1: ${food1} - Protein: ${nutrition1.protein}g, Carbs: ${nutrition1.carbs}g, Fat: ${nutrition1.fat}g, Calories: ${nutrition1.calories}kcal
Food 2: ${food2} - Protein: ${nutrition2.protein}g, Carbs: ${nutrition2.carbs}g, Fat: ${nutrition2.fat}g, Calories: ${nutrition2.calories}kcal

Provide a brief 2-3 sentence comparison highlighting which is better for different fitness goals.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a nutrition expert providing concise food comparisons.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    const comparison = response.choices[0]?.message?.content?.trim() || '';

    return {
      food1: nutrition1,
      food2: nutrition2,
      comparison
    };

  } catch (error) {
    console.error('Error comparing foods:', error);
    return null;
  }
}
