/**
 * Comprehensive Food Nutrition Database
 * All values per 100g serving
 */

export interface FoodData {
  name: string;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  trans_fat: number;
  calories: number;
  vitamins: string[];
  minerals: string[];
  health_benefits: string[];
}

export const foodDatabase: Record<string, FoodData> = {
  // Dairy & Protein
  "paneer": {
    name: "Paneer",
    protein: 18,
    carbs: 6,
    fat: 20,
    fiber: 0,
    trans_fat: 0,
    calories: 265,
    vitamins: ["Vitamin A", "Vitamin D", "Vitamin B12"],
    minerals: ["Calcium", "Phosphorus", "Zinc"],
    health_benefits: ["High in protein for muscle building", "Rich in calcium for bone health", "Good source of healthy fats"]
  },
  "milk": {
    name: "Milk",
    protein: 3.4,
    carbs: 5,
    fat: 3.6,
    fiber: 0,
    trans_fat: 0,
    calories: 61,
    vitamins: ["Vitamin D", "Vitamin B12", "Vitamin A"],
    minerals: ["Calcium", "Phosphorus", "Potassium"],
    health_benefits: ["Excellent calcium source", "Supports bone health", "Complete protein source"]
  },
  "greek yogurt": {
    name: "Greek Yogurt",
    protein: 10,
    carbs: 3.6,
    fat: 0.4,
    fiber: 0,
    trans_fat: 0,
    calories: 59,
    vitamins: ["Vitamin B12", "Riboflavin"],
    minerals: ["Calcium", "Phosphorus", "Potassium"],
    health_benefits: ["High protein content", "Probiotic benefits", "Low in fat"]
  },
  "curd": {
    name: "Curd (Yogurt)",
    protein: 3.5,
    carbs: 4.7,
    fat: 4.3,
    fiber: 0,
    trans_fat: 0,
    calories: 60,
    vitamins: ["Vitamin B12", "Riboflavin"],
    minerals: ["Calcium", "Phosphorus"],
    health_benefits: ["Probiotic for gut health", "Aids digestion", "Good calcium source"]
  },
  "cheese": {
    name: "Cheese",
    protein: 25,
    carbs: 1.3,
    fat: 33,
    fiber: 0,
    trans_fat: 0,
    calories: 402,
    vitamins: ["Vitamin A", "Vitamin B12"],
    minerals: ["Calcium", "Phosphorus", "Zinc"],
    health_benefits: ["High protein", "Rich in calcium", "Good for bones"]
  },

  // Meat & Poultry
  "chicken breast": {
    name: "Chicken Breast",
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    trans_fat: 0,
    calories: 165,
    vitamins: ["Vitamin B6", "Niacin", "Vitamin B12"],
    minerals: ["Phosphorus", "Selenium", "Zinc"],
    health_benefits: ["Lean protein source", "Supports muscle growth", "Low in fat"]
  },
  "chicken": {
    name: "Chicken",
    protein: 27,
    carbs: 0,
    fat: 14,
    fiber: 0,
    trans_fat: 0,
    calories: 239,
    vitamins: ["Vitamin B6", "Niacin"],
    minerals: ["Phosphorus", "Selenium"],
    health_benefits: ["High protein", "Supports muscle growth", "Rich in B vitamins"]
  },
  "egg": {
    name: "Egg",
    protein: 13,
    carbs: 1.1,
    fat: 11,
    fiber: 0,
    trans_fat: 0,
    calories: 155,
    vitamins: ["Vitamin A", "Vitamin D", "Vitamin B12"],
    minerals: ["Iron", "Phosphorus", "Selenium"],
    health_benefits: ["Complete protein source", "Rich in choline", "Supports eye health"]
  },
  "mutton": {
    name: "Mutton",
    protein: 25,
    carbs: 0,
    fat: 21,
    fiber: 0,
    trans_fat: 0,
    calories: 294,
    vitamins: ["Vitamin B12", "Niacin"],
    minerals: ["Iron", "Zinc", "Phosphorus"],
    health_benefits: ["High in iron", "Rich in protein", "Good for muscle building"]
  },

  // Fish & Seafood
  "salmon": {
    name: "Salmon",
    protein: 25,
    carbs: 0,
    fat: 13,
    fiber: 0,
    trans_fat: 0,
    calories: 208,
    vitamins: ["Vitamin D", "Vitamin B12", "Vitamin B6"],
    minerals: ["Selenium", "Phosphorus", "Potassium"],
    health_benefits: ["Rich in omega-3 fatty acids", "Supports heart health", "Anti-inflammatory properties"]
  },
  "fish": {
    name: "Fish",
    protein: 22,
    carbs: 0,
    fat: 5,
    fiber: 0,
    trans_fat: 0,
    calories: 136,
    vitamins: ["Vitamin D", "Vitamin B12"],
    minerals: ["Selenium", "Iodine"],
    health_benefits: ["High in omega-3", "Supports brain health", "Good protein source"]
  },
  "tuna": {
    name: "Tuna",
    protein: 30,
    carbs: 0,
    fat: 1,
    fiber: 0,
    trans_fat: 0,
    calories: 132,
    vitamins: ["Vitamin D", "Vitamin B12"],
    minerals: ["Selenium", "Phosphorus"],
    health_benefits: ["Very high protein", "Low in fat", "Rich in omega-3"]
  },

  // Soy Products
  "soy chunks": {
    name: "Soy Chunks",
    protein: 52,
    carbs: 33,
    fat: 0.5,
    fiber: 13,
    trans_fat: 0,
    calories: 345,
    vitamins: ["Vitamin B6", "Folate", "Vitamin K"],
    minerals: ["Iron", "Calcium", "Magnesium"],
    health_benefits: ["Extremely high in protein", "Low in fat", "Rich in fiber"]
  },
  "soya chunks": {
    name: "Soy Chunks",
    protein: 52,
    carbs: 33,
    fat: 0.5,
    fiber: 13,
    trans_fat: 0,
    calories: 345,
    vitamins: ["Vitamin B6", "Folate", "Vitamin K"],
    minerals: ["Iron", "Calcium", "Magnesium"],
    health_benefits: ["Extremely high in protein", "Low in fat", "Rich in fiber"]
  },
  "tofu": {
    name: "Tofu",
    protein: 8,
    carbs: 1.9,
    fat: 4.8,
    fiber: 0.3,
    trans_fat: 0,
    calories: 76,
    vitamins: ["Vitamin B1", "Folate"],
    minerals: ["Calcium", "Iron", "Magnesium"],
    health_benefits: ["Good plant protein", "Low in calories", "Rich in calcium"]
  },
  "soy milk": {
    name: "Soy Milk",
    protein: 3.3,
    carbs: 6,
    fat: 1.8,
    fiber: 0.6,
    trans_fat: 0,
    calories: 54,
    vitamins: ["Vitamin B12", "Vitamin D"],
    minerals: ["Calcium", "Iron"],
    health_benefits: ["Lactose-free", "Plant-based protein", "Fortified with vitamins"]
  },

  // Grains & Cereals
  "rice": {
    name: "Rice",
    protein: 2.7,
    carbs: 28,
    fat: 0.3,
    fiber: 0.4,
    trans_fat: 0,
    calories: 130,
    vitamins: ["Thiamin", "Niacin"],
    minerals: ["Manganese", "Selenium"],
    health_benefits: ["Quick energy source", "Easy to digest", "Gluten-free"]
  },
  "brown rice": {
    name: "Brown Rice",
    protein: 2.6,
    carbs: 23,
    fat: 0.9,
    fiber: 1.8,
    trans_fat: 0,
    calories: 111,
    vitamins: ["Thiamin", "Niacin", "Vitamin B6"],
    minerals: ["Manganese", "Selenium", "Magnesium"],
    health_benefits: ["High in fiber", "Whole grain benefits", "Supports digestion"]
  },
  "oats": {
    name: "Oats",
    protein: 13,
    carbs: 67,
    fat: 7,
    fiber: 10,
    trans_fat: 0,
    calories: 389,
    vitamins: ["Thiamin", "Folate"],
    minerals: ["Manganese", "Phosphorus", "Magnesium"],
    health_benefits: ["High in fiber", "Lowers cholesterol", "Sustained energy"]
  },
  "wheat": {
    name: "Wheat",
    protein: 13,
    carbs: 71,
    fat: 1.5,
    fiber: 12,
    trans_fat: 0,
    calories: 340,
    vitamins: ["Thiamin", "Niacin"],
    minerals: ["Manganese", "Selenium"],
    health_benefits: ["High in fiber", "Good energy source", "Rich in B vitamins"]
  },
  "quinoa": {
    name: "Quinoa",
    protein: 14,
    carbs: 64,
    fat: 6,
    fiber: 7,
    trans_fat: 0,
    calories: 368,
    vitamins: ["Folate", "Vitamin B6"],
    minerals: ["Manganese", "Magnesium", "Iron"],
    health_benefits: ["Complete protein", "Gluten-free", "High in minerals"]
  },
  "roti": {
    name: "Roti (Chapati)",
    protein: 3.1,
    carbs: 18,
    fat: 0.4,
    fiber: 2.7,
    trans_fat: 0,
    calories: 71,
    vitamins: ["Thiamin", "Niacin"],
    minerals: ["Iron", "Magnesium"],
    health_benefits: ["Whole grain", "Good fiber source", "Low in fat"]
  },
  "bread": {
    name: "Bread",
    protein: 9,
    carbs: 49,
    fat: 3.2,
    fiber: 2.7,
    trans_fat: 0,
    calories: 265,
    vitamins: ["Thiamin", "Folate"],
    minerals: ["Iron", "Selenium"],
    health_benefits: ["Quick energy", "Fortified with vitamins", "Convenient carb source"]
  },

  // Legumes & Pulses
  "dal": {
    name: "Dal (Lentils)",
    protein: 9,
    carbs: 20,
    fat: 0.4,
    fiber: 8,
    trans_fat: 0,
    calories: 116,
    vitamins: ["Folate", "Thiamin"],
    minerals: ["Iron", "Phosphorus", "Potassium"],
    health_benefits: ["High in protein", "Rich in fiber", "Good iron source"]
  },
  "lentils": {
    name: "Lentils",
    protein: 9,
    carbs: 20,
    fat: 0.4,
    fiber: 8,
    trans_fat: 0,
    calories: 116,
    vitamins: ["Folate", "Thiamin"],
    minerals: ["Iron", "Phosphorus"],
    health_benefits: ["High in protein", "Rich in fiber", "Supports heart health"]
  },
  "chickpeas": {
    name: "Chickpeas",
    protein: 19,
    carbs: 61,
    fat: 6,
    fiber: 17,
    trans_fat: 0,
    calories: 364,
    vitamins: ["Folate", "Vitamin B6"],
    minerals: ["Iron", "Magnesium", "Phosphorus"],
    health_benefits: ["High in protein and fiber", "Supports digestion", "Good for weight management"]
  },
  "rajma": {
    name: "Rajma (Kidney Beans)",
    protein: 8.7,
    carbs: 22.8,
    fat: 0.5,
    fiber: 6.4,
    trans_fat: 0,
    calories: 127,
    vitamins: ["Folate", "Thiamin"],
    minerals: ["Iron", "Potassium", "Magnesium"],
    health_benefits: ["High in protein", "Rich in fiber", "Supports heart health"]
  },

  // Vegetables
  "broccoli": {
    name: "Broccoli",
    protein: 2.8,
    carbs: 7,
    fat: 0.4,
    fiber: 2.6,
    trans_fat: 0,
    calories: 34,
    vitamins: ["Vitamin C", "Vitamin K", "Folate"],
    minerals: ["Potassium", "Iron", "Calcium"],
    health_benefits: ["Rich in antioxidants", "Supports immune system", "Anti-inflammatory"]
  },
  "spinach": {
    name: "Spinach",
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4,
    fiber: 2.2,
    trans_fat: 0,
    calories: 23,
    vitamins: ["Vitamin A", "Vitamin C", "Vitamin K"],
    minerals: ["Iron", "Calcium", "Magnesium"],
    health_benefits: ["High in iron", "Rich in antioxidants", "Supports eye health"]
  },
  "tomato": {
    name: "Tomato",
    protein: 0.9,
    carbs: 3.9,
    fat: 0.2,
    fiber: 1.2,
    trans_fat: 0,
    calories: 18,
    vitamins: ["Vitamin C", "Vitamin K", "Folate"],
    minerals: ["Potassium", "Manganese"],
    health_benefits: ["Rich in lycopene", "Supports heart health", "Low in calories"]
  },
  "potato": {
    name: "Potato",
    protein: 2,
    carbs: 17,
    fat: 0.1,
    fiber: 2.2,
    trans_fat: 0,
    calories: 77,
    vitamins: ["Vitamin C", "Vitamin B6"],
    minerals: ["Potassium", "Manganese"],
    health_benefits: ["Good energy source", "High in potassium", "Versatile carb"]
  },
  "sweet potato": {
    name: "Sweet Potato",
    protein: 1.6,
    carbs: 20,
    fat: 0.1,
    fiber: 3,
    trans_fat: 0,
    calories: 86,
    vitamins: ["Vitamin A", "Vitamin C", "Vitamin B6"],
    minerals: ["Potassium", "Manganese"],
    health_benefits: ["High in vitamin A", "Rich in fiber", "Supports immune system"]
  },
  "carrot": {
    name: "Carrot",
    protein: 0.9,
    carbs: 10,
    fat: 0.2,
    fiber: 2.8,
    trans_fat: 0,
    calories: 41,
    vitamins: ["Vitamin A", "Vitamin K", "Vitamin C"],
    minerals: ["Potassium", "Manganese"],
    health_benefits: ["Excellent for eye health", "Rich in beta-carotene", "Supports immune system"]
  },
  "cucumber": {
    name: "Cucumber",
    protein: 0.7,
    carbs: 3.6,
    fat: 0.1,
    fiber: 0.5,
    trans_fat: 0,
    calories: 15,
    vitamins: ["Vitamin K", "Vitamin C"],
    minerals: ["Potassium", "Magnesium"],
    health_benefits: ["Hydrating", "Low in calories", "Supports skin health"]
  },
  "onion": {
    name: "Onion",
    protein: 1.1,
    carbs: 9.3,
    fat: 0.1,
    fiber: 1.7,
    trans_fat: 0,
    calories: 40,
    vitamins: ["Vitamin C", "Folate"],
    minerals: ["Potassium", "Manganese"],
    health_benefits: ["Anti-inflammatory", "Supports heart health", "Rich in antioxidants"]
  },
  "capsicum": {
    name: "Capsicum (Bell Pepper)",
    protein: 1,
    carbs: 6,
    fat: 0.3,
    fiber: 2.1,
    trans_fat: 0,
    calories: 31,
    vitamins: ["Vitamin C", "Vitamin A", "Vitamin B6"],
    minerals: ["Potassium", "Folate"],
    health_benefits: ["Very high in vitamin C", "Supports immune system", "Low in calories"]
  },

  // Fruits
  "banana": {
    name: "Banana",
    protein: 1.1,
    carbs: 23,
    fat: 0.3,
    fiber: 2.6,
    trans_fat: 0,
    calories: 89,
    vitamins: ["Vitamin B6", "Vitamin C"],
    minerals: ["Potassium", "Manganese"],
    health_benefits: ["Quick energy source", "High in potassium", "Supports heart health"]
  },
  "apple": {
    name: "Apple",
    protein: 0.3,
    carbs: 14,
    fat: 0.2,
    fiber: 2.4,
    trans_fat: 0,
    calories: 52,
    vitamins: ["Vitamin C", "Vitamin K"],
    minerals: ["Potassium", "Copper"],
    health_benefits: ["High in fiber", "Supports heart health", "Good for digestion"]
  },
  "orange": {
    name: "Orange",
    protein: 0.9,
    carbs: 12,
    fat: 0.1,
    fiber: 2.4,
    trans_fat: 0,
    calories: 47,
    vitamins: ["Vitamin C", "Folate", "Thiamin"],
    minerals: ["Potassium", "Calcium"],
    health_benefits: ["Very high in vitamin C", "Boosts immunity", "Supports skin health"]
  },
  "mango": {
    name: "Mango",
    protein: 0.8,
    carbs: 15,
    fat: 0.4,
    fiber: 1.6,
    trans_fat: 0,
    calories: 60,
    vitamins: ["Vitamin C", "Vitamin A", "Folate"],
    minerals: ["Potassium", "Copper"],
    health_benefits: ["Rich in vitamin C", "Supports immune system", "Good for digestion"]
  },
  "papaya": {
    name: "Papaya",
    protein: 0.5,
    carbs: 11,
    fat: 0.3,
    fiber: 1.7,
    trans_fat: 0,
    calories: 43,
    vitamins: ["Vitamin C", "Vitamin A", "Folate"],
    minerals: ["Potassium", "Magnesium"],
    health_benefits: ["Aids digestion", "Rich in antioxidants", "Supports immune system"]
  },
  "watermelon": {
    name: "Watermelon",
    protein: 0.6,
    carbs: 8,
    fat: 0.2,
    fiber: 0.4,
    trans_fat: 0,
    calories: 30,
    vitamins: ["Vitamin C", "Vitamin A"],
    minerals: ["Potassium", "Magnesium"],
    health_benefits: ["Hydrating", "Low in calories", "Rich in lycopene"]
  },
  "grapes": {
    name: "Grapes",
    protein: 0.7,
    carbs: 18,
    fat: 0.2,
    fiber: 0.9,
    trans_fat: 0,
    calories: 69,
    vitamins: ["Vitamin C", "Vitamin K"],
    minerals: ["Potassium", "Copper"],
    health_benefits: ["Rich in antioxidants", "Supports heart health", "Anti-inflammatory"]
  },
  "strawberry": {
    name: "Strawberry",
    protein: 0.7,
    carbs: 7.7,
    fat: 0.3,
    fiber: 2,
    trans_fat: 0,
    calories: 32,
    vitamins: ["Vitamin C", "Folate", "Manganese"],
    minerals: ["Potassium", "Magnesium"],
    health_benefits: ["Very high in vitamin C", "Rich in antioxidants", "Supports heart health"]
  },
  "blueberry": {
    name: "Blueberry",
    protein: 0.7,
    carbs: 14,
    fat: 0.3,
    fiber: 2.4,
    trans_fat: 0,
    calories: 57,
    vitamins: ["Vitamin C", "Vitamin K"],
    minerals: ["Manganese", "Copper"],
    health_benefits: ["Highest antioxidant content", "Supports brain health", "Anti-aging properties"]
  },
  "pineapple": {
    name: "Pineapple",
    protein: 0.5,
    carbs: 13,
    fat: 0.1,
    fiber: 1.4,
    trans_fat: 0,
    calories: 50,
    vitamins: ["Vitamin C", "Manganese"],
    minerals: ["Copper", "Folate"],
    health_benefits: ["Contains bromelain enzyme", "Aids digestion", "Anti-inflammatory"]
  },
  "kiwi": {
    name: "Kiwi",
    protein: 1.1,
    carbs: 15,
    fat: 0.5,
    fiber: 3,
    trans_fat: 0,
    calories: 61,
    vitamins: ["Vitamin C", "Vitamin K", "Vitamin E"],
    minerals: ["Potassium", "Copper"],
    health_benefits: ["Extremely high in vitamin C", "Aids digestion", "Supports immune system"]
  },
  "pomegranate": {
    name: "Pomegranate",
    protein: 1.7,
    carbs: 19,
    fat: 1.2,
    fiber: 4,
    trans_fat: 0,
    calories: 83,
    vitamins: ["Vitamin C", "Vitamin K", "Folate"],
    minerals: ["Potassium", "Copper"],
    health_benefits: ["Powerful antioxidants", "Anti-inflammatory", "Supports heart health"]
  },
  "guava": {
    name: "Guava",
    protein: 2.6,
    carbs: 14,
    fat: 1,
    fiber: 5.4,
    trans_fat: 0,
    calories: 68,
    vitamins: ["Vitamin C", "Folate", "Vitamin A"],
    minerals: ["Potassium", "Manganese"],
    health_benefits: ["Highest vitamin C content", "High in fiber", "Supports immunity"]
  },
  "lychee": {
    name: "Lychee",
    protein: 0.8,
    carbs: 17,
    fat: 0.4,
    fiber: 1.3,
    trans_fat: 0,
    calories: 66,
    vitamins: ["Vitamin C", "Vitamin B6"],
    minerals: ["Potassium", "Copper"],
    health_benefits: ["Rich in vitamin C", "Supports skin health", "Antioxidant properties"]
  },
  "dragon fruit": {
    name: "Dragon Fruit",
    protein: 1.2,
    carbs: 13,
    fat: 0.4,
    fiber: 3,
    trans_fat: 0,
    calories: 60,
    vitamins: ["Vitamin C", "Vitamin B1", "Vitamin B2"],
    minerals: ["Iron", "Magnesium"],
    health_benefits: ["Rich in antioxidants", "Supports digestion", "Low in calories"]
  },
  "passion fruit": {
    name: "Passion Fruit",
    protein: 2.2,
    carbs: 23,
    fat: 0.7,
    fiber: 10,
    trans_fat: 0,
    calories: 97,
    vitamins: ["Vitamin C", "Vitamin A"],
    minerals: ["Iron", "Potassium"],
    health_benefits: ["Very high in fiber", "Rich in antioxidants", "Supports immunity"]
  },
  "peach": {
    name: "Peach",
    protein: 0.9,
    carbs: 10,
    fat: 0.3,
    fiber: 1.5,
    trans_fat: 0,
    calories: 39,
    vitamins: ["Vitamin C", "Vitamin A"],
    minerals: ["Potassium", "Copper"],
    health_benefits: ["Supports skin health", "Rich in antioxidants", "Low in calories"]
  },
  "plum": {
    name: "Plum",
    protein: 0.7,
    carbs: 11,
    fat: 0.3,
    fiber: 1.4,
    trans_fat: 0,
    calories: 46,
    vitamins: ["Vitamin C", "Vitamin K"],
    minerals: ["Potassium", "Copper"],
    health_benefits: ["Rich in antioxidants", "Supports bone health", "Aids digestion"]
  },
  "cherry": {
    name: "Cherry",
    protein: 1,
    carbs: 16,
    fat: 0.2,
    fiber: 2.1,
    trans_fat: 0,
    calories: 63,
    vitamins: ["Vitamin C", "Vitamin A"],
    minerals: ["Potassium", "Copper"],
    health_benefits: ["Anti-inflammatory", "Supports sleep", "Rich in antioxidants"]
  },
  "apricot": {
    name: "Apricot",
    protein: 1.4,
    carbs: 11,
    fat: 0.4,
    fiber: 2,
    trans_fat: 0,
    calories: 48,
    vitamins: ["Vitamin A", "Vitamin C"],
    minerals: ["Potassium", "Copper"],
    health_benefits: ["High in vitamin A", "Supports eye health", "Rich in fiber"]
  },
  "pear": {
    name: "Pear",
    protein: 0.4,
    carbs: 15,
    fat: 0.1,
    fiber: 3.1,
    trans_fat: 0,
    calories: 57,
    vitamins: ["Vitamin C", "Vitamin K"],
    minerals: ["Potassium", "Copper"],
    health_benefits: ["High in fiber", "Supports digestion", "Low in calories"]
  },
  "avocado": {
    name: "Avocado",
    protein: 2,
    carbs: 9,
    fat: 15,
    fiber: 7,
    trans_fat: 0,
    calories: 160,
    vitamins: ["Vitamin K", "Folate", "Vitamin C"],
    minerals: ["Potassium", "Magnesium"],
    health_benefits: ["Healthy fats", "High in potassium", "Supports heart health"]
  },
  "coconut": {
    name: "Coconut",
    protein: 3.3,
    carbs: 15,
    fat: 33,
    fiber: 9,
    trans_fat: 0,
    calories: 354,
    vitamins: ["Vitamin C", "Folate"],
    minerals: ["Manganese", "Copper", "Iron"],
    health_benefits: ["Rich in MCT fats", "Supports metabolism", "Antimicrobial properties"]
  },
  "fig": {
    name: "Fig",
    protein: 0.8,
    carbs: 19,
    fat: 0.3,
    fiber: 2.9,
    trans_fat: 0,
    calories: 74,
    vitamins: ["Vitamin K", "Vitamin B6"],
    minerals: ["Potassium", "Calcium", "Magnesium"],
    health_benefits: ["High in fiber", "Rich in minerals", "Supports bone health"]
  },
  "dates": {
    name: "Dates",
    protein: 1.8,
    carbs: 75,
    fat: 0.2,
    fiber: 6.7,
    trans_fat: 0,
    calories: 277,
    vitamins: ["Vitamin B6", "Niacin"],
    minerals: ["Potassium", "Magnesium", "Copper"],
    health_benefits: ["Natural sweetener", "High in energy", "Rich in minerals"]
  },
  "cantaloupe": {
    name: "Cantaloupe",
    protein: 0.8,
    carbs: 8,
    fat: 0.2,
    fiber: 0.9,
    trans_fat: 0,
    calories: 34,
    vitamins: ["Vitamin A", "Vitamin C"],
    minerals: ["Potassium", "Folate"],
    health_benefits: ["High in vitamin A", "Hydrating", "Low in calories"]
  },
  "honeydew": {
    name: "Honeydew Melon",
    protein: 0.5,
    carbs: 9,
    fat: 0.1,
    fiber: 0.8,
    trans_fat: 0,
    calories: 36,
    vitamins: ["Vitamin C", "Vitamin B6"],
    minerals: ["Potassium", "Copper"],
    health_benefits: ["Hydrating", "Low in calories", "Supports skin health"]
  },
  "grapefruit": {
    name: "Grapefruit",
    protein: 0.8,
    carbs: 11,
    fat: 0.1,
    fiber: 1.6,
    trans_fat: 0,
    calories: 42,
    vitamins: ["Vitamin C", "Vitamin A"],
    minerals: ["Potassium", "Calcium"],
    health_benefits: ["Supports weight loss", "High in vitamin C", "Boosts metabolism"]
  },
  "lemon": {
    name: "Lemon",
    protein: 1.1,
    carbs: 9,
    fat: 0.3,
    fiber: 2.8,
    trans_fat: 0,
    calories: 29,
    vitamins: ["Vitamin C", "Vitamin B6"],
    minerals: ["Potassium", "Calcium"],
    health_benefits: ["Very high in vitamin C", "Aids digestion", "Alkalizing effect"]
  },
  "lime": {
    name: "Lime",
    protein: 0.7,
    carbs: 11,
    fat: 0.2,
    fiber: 2.8,
    trans_fat: 0,
    calories: 30,
    vitamins: ["Vitamin C", "Folate"],
    minerals: ["Potassium", "Calcium"],
    health_benefits: ["High in vitamin C", "Supports immunity", "Aids digestion"]
  },
  "tangerine": {
    name: "Tangerine",
    protein: 0.8,
    carbs: 13,
    fat: 0.3,
    fiber: 1.8,
    trans_fat: 0,
    calories: 53,
    vitamins: ["Vitamin C", "Vitamin A"],
    minerals: ["Potassium", "Calcium"],
    health_benefits: ["Rich in vitamin C", "Supports immunity", "Easy to peel"]
  },
  "blackberry": {
    name: "Blackberry",
    protein: 1.4,
    carbs: 10,
    fat: 0.5,
    fiber: 5.3,
    trans_fat: 0,
    calories: 43,
    vitamins: ["Vitamin C", "Vitamin K"],
    minerals: ["Manganese", "Copper"],
    health_benefits: ["Very high in fiber", "Rich in antioxidants", "Supports brain health"]
  },
  "raspberry": {
    name: "Raspberry",
    protein: 1.2,
    carbs: 12,
    fat: 0.7,
    fiber: 6.5,
    trans_fat: 0,
    calories: 52,
    vitamins: ["Vitamin C", "Vitamin K"],
    minerals: ["Manganese", "Magnesium"],
    health_benefits: ["Extremely high in fiber", "Rich in antioxidants", "Anti-inflammatory"]
  },
  "cranberry": {
    name: "Cranberry",
    protein: 0.4,
    carbs: 12,
    fat: 0.1,
    fiber: 4.6,
    trans_fat: 0,
    calories: 46,
    vitamins: ["Vitamin C", "Vitamin E"],
    minerals: ["Manganese", "Copper"],
    health_benefits: ["Supports urinary health", "Rich in antioxidants", "Anti-bacterial"]
  },
  "persimmon": {
    name: "Persimmon",
    protein: 0.6,
    carbs: 18,
    fat: 0.2,
    fiber: 3.6,
    trans_fat: 0,
    calories: 70,
    vitamins: ["Vitamin A", "Vitamin C"],
    minerals: ["Manganese", "Potassium"],
    health_benefits: ["High in vitamin A", "Rich in antioxidants", "Supports eye health"]
  },
  "jackfruit": {
    name: "Jackfruit",
    protein: 1.7,
    carbs: 23,
    fat: 0.6,
    fiber: 1.5,
    trans_fat: 0,
    calories: 95,
    vitamins: ["Vitamin C", "Vitamin A"],
    minerals: ["Potassium", "Magnesium"],
    health_benefits: ["Good meat substitute", "Rich in fiber", "Supports immunity"]
  },
  "starfruit": {
    name: "Starfruit (Carambola)",
    protein: 1,
    carbs: 7,
    fat: 0.3,
    fiber: 2.8,
    trans_fat: 0,
    calories: 31,
    vitamins: ["Vitamin C", "Vitamin B5"],
    minerals: ["Potassium", "Copper"],
    health_benefits: ["Low in calories", "Rich in antioxidants", "Supports digestion"]
  },
  "custard apple": {
    name: "Custard Apple",
    protein: 2.1,
    carbs: 24,
    fat: 0.6,
    fiber: 4.4,
    trans_fat: 0,
    calories: 94,
    vitamins: ["Vitamin C", "Vitamin B6"],
    minerals: ["Potassium", "Magnesium"],
    health_benefits: ["Rich in antioxidants", "Supports heart health", "High in fiber"]
  },
  "rambutan": {
    name: "Rambutan",
    protein: 0.7,
    carbs: 21,
    fat: 0.2,
    fiber: 0.9,
    trans_fat: 0,
    calories: 82,
    vitamins: ["Vitamin C", "Folate"],
    minerals: ["Iron", "Calcium"],
    health_benefits: ["Rich in vitamin C", "Supports immunity", "Exotic tropical fruit"]
  },
  "mangosteen": {
    name: "Mangosteen",
    protein: 0.4,
    carbs: 18,
    fat: 0.6,
    fiber: 1.8,
    trans_fat: 0,
    calories: 73,
    vitamins: ["Vitamin C", "Folate"],
    minerals: ["Potassium", "Magnesium"],
    health_benefits: ["Powerful antioxidants", "Anti-inflammatory", "Supports immunity"]
  },
  "durian": {
    name: "Durian",
    protein: 1.5,
    carbs: 27,
    fat: 5.3,
    fiber: 3.8,
    trans_fat: 0,
    calories: 147,
    vitamins: ["Vitamin C", "Thiamin", "Vitamin B6"],
    minerals: ["Potassium", "Manganese"],
    health_benefits: ["High in energy", "Rich in nutrients", "Unique tropical fruit"]
  },
  "tamarind": {
    name: "Tamarind",
    protein: 2.8,
    carbs: 63,
    fat: 0.6,
    fiber: 5.1,
    trans_fat: 0,
    calories: 239,
    vitamins: ["Vitamin C", "Thiamin"],
    minerals: ["Potassium", "Magnesium", "Iron"],
    health_benefits: ["Aids digestion", "Rich in antioxidants", "Anti-inflammatory"]
  },

  // Nuts & Seeds
  "almonds": {
    name: "Almonds",
    protein: 21,
    carbs: 22,
    fat: 49,
    fiber: 12.5,
    trans_fat: 0,
    calories: 579,
    vitamins: ["Vitamin E", "Riboflavin"],
    minerals: ["Magnesium", "Calcium", "Iron"],
    health_benefits: ["High in healthy fats", "Rich in vitamin E", "Supports heart health"]
  },
  "peanuts": {
    name: "Peanuts",
    protein: 26,
    carbs: 16,
    fat: 49,
    fiber: 8.5,
    trans_fat: 0,
    calories: 567,
    vitamins: ["Niacin", "Folate", "Vitamin E"],
    minerals: ["Magnesium", "Phosphorus", "Zinc"],
    health_benefits: ["High in protein", "Rich in healthy fats", "Good energy source"]
  },
  "cashews": {
    name: "Cashews",
    protein: 18,
    carbs: 30,
    fat: 44,
    fiber: 3.3,
    trans_fat: 0,
    calories: 553,
    vitamins: ["Vitamin K", "Thiamin"],
    minerals: ["Magnesium", "Phosphorus", "Zinc"],
    health_benefits: ["Rich in minerals", "Supports bone health", "Good for heart"]
  },
  "walnuts": {
    name: "Walnuts",
    protein: 15,
    carbs: 14,
    fat: 65,
    fiber: 6.7,
    trans_fat: 0,
    calories: 654,
    vitamins: ["Folate", "Vitamin B6"],
    minerals: ["Magnesium", "Phosphorus", "Manganese"],
    health_benefits: ["High in omega-3", "Supports brain health", "Anti-inflammatory"]
  },
  "chia seeds": {
    name: "Chia Seeds",
    protein: 17,
    carbs: 42,
    fat: 31,
    fiber: 34,
    trans_fat: 0,
    calories: 486,
    vitamins: ["Thiamin", "Niacin"],
    minerals: ["Calcium", "Phosphorus", "Manganese"],
    health_benefits: ["Very high in fiber", "Rich in omega-3", "Supports digestion"]
  },
  "flax seeds": {
    name: "Flax Seeds",
    protein: 18,
    carbs: 29,
    fat: 42,
    fiber: 27,
    trans_fat: 0,
    calories: 534,
    vitamins: ["Thiamin", "Vitamin B6"],
    minerals: ["Magnesium", "Phosphorus", "Manganese"],
    health_benefits: ["High in omega-3", "Rich in fiber", "Supports heart health"]
  },

  // Others
  "honey": {
    name: "Honey",
    protein: 0.3,
    carbs: 82,
    fat: 0,
    fiber: 0.2,
    trans_fat: 0,
    calories: 304,
    vitamins: ["Riboflavin", "Niacin"],
    minerals: ["Calcium", "Iron", "Potassium"],
    health_benefits: ["Natural sweetener", "Antibacterial properties", "Quick energy source"]
  },
  "olive oil": {
    name: "Olive Oil",
    protein: 0,
    carbs: 0,
    fat: 100,
    fiber: 0,
    trans_fat: 0,
    calories: 884,
    vitamins: ["Vitamin E", "Vitamin K"],
    minerals: ["Iron", "Potassium"],
    health_benefits: ["Heart-healthy fats", "Anti-inflammatory", "Rich in antioxidants"]
  },
  "peanut butter": {
    name: "Peanut Butter",
    protein: 25,
    carbs: 20,
    fat: 50,
    fiber: 6,
    trans_fat: 0,
    calories: 588,
    vitamins: ["Niacin", "Vitamin E"],
    minerals: ["Magnesium", "Phosphorus"],
    health_benefits: ["High in protein", "Good energy source", "Rich in healthy fats"]
  },
  "whey protein": {
    name: "Whey Protein",
    protein: 80,
    carbs: 5,
    fat: 2,
    fiber: 0,
    trans_fat: 0,
    calories: 354,
    vitamins: ["Vitamin B12", "Riboflavin"],
    minerals: ["Calcium", "Phosphorus"],
    health_benefits: ["Very high in protein", "Fast absorption", "Supports muscle growth"]
  }
};

/**
 * Search for food in database (case-insensitive, handles variations)
 */
export function searchFood(query: string): FoodData | null {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Direct match
  if (foodDatabase[normalizedQuery]) {
    return foodDatabase[normalizedQuery];
  }
  
  // Search for partial matches
  const keys = Object.keys(foodDatabase);
  for (const key of keys) {
    if (key.includes(normalizedQuery) || normalizedQuery.includes(key)) {
      return foodDatabase[key];
    }
  }
  
  return null;
}

/**
 * Get all food names for autocomplete
 */
export function getAllFoodNames(): string[] {
  return Object.values(foodDatabase).map(food => food.name);
}
