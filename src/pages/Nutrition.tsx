import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Search, Pill, Info, User, Sparkles, Loader2, MessageCircle, Send, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getSupplementRecommendations } from "@/utils/personalization";
import { getFoodNutrition, type FoodNutrition } from "@/services/aiFoodNutritionService";
import { searchFood as searchFoodDB, getAllFoodNames } from "@/data/foodDatabase";
import { detailedSupplements, supplementsVsSteroids, generalSupplementInfo } from "@/data/supplementsData";
import { getSupplementAdvice, correctSupplementTypos, suggestedQuestions, type ChatMessage } from "@/services/aiSupplementAdvisor";

const foodMacros: Record<string, {
  protein: number;
  fiber: number;
  carbs: number;
  trans_fat: number;
  fat: number;
}> = {
  "paneer": { protein: 18, fiber: 0, carbs: 6, trans_fat: 0, fat: 20 },
  "rice": { protein: 2, fiber: 1, carbs: 28, trans_fat: 0, fat: 0.3 },
  "broccoli": { protein: 3, fiber: 3, carbs: 6, trans_fat: 0, fat: 0.4 },
  "milk": { protein: 3.4, fiber: 0, carbs: 5, trans_fat: 0, fat: 3.6 },
  "chicken breast": { protein: 31, fiber: 0, carbs: 0, trans_fat: 0, fat: 3.6 },
  "egg": { protein: 6, fiber: 0, carbs: 0.6, trans_fat: 0, fat: 5 },
  "oats": { protein: 13, fiber: 10, carbs: 67, trans_fat: 0, fat: 7 },
  "banana": { protein: 1.1, fiber: 2.6, carbs: 23, trans_fat: 0, fat: 0.3 },
  "almonds": { protein: 21, fiber: 12.5, carbs: 22, trans_fat: 0, fat: 49 },
  "sweet potato": { protein: 1.6, fiber: 3, carbs: 20, trans_fat: 0, fat: 0.1 },
  "salmon": { protein: 25, fiber: 0, carbs: 0, trans_fat: 0, fat: 13 },
  "greek yogurt": { protein: 10, fiber: 0, carbs: 3.6, trans_fat: 0, fat: 0.4 },
};

const supplements = [
  {
    name: "Whey Protein",
    description: "Fast-absorbing protein for muscle recovery and growth",
    benefits: ["Muscle building", "Quick absorption", "Post-workout recovery"],
    dosage: "20-30g per serving",
  },
  {
    name: "Creatine",
    description: "Improves strength, power, and muscle mass",
    benefits: ["Increased strength", "Better performance", "Muscle growth"],
    dosage: "3-5g daily",
    warning: "Check creatinine level before using creatine",
  },
  {
    name: "BCAAs",
    description: "Branched-chain amino acids for muscle recovery",
    benefits: ["Reduced muscle fatigue", "Enhanced recovery", "Muscle preservation"],
    dosage: "5-10g before/during workout",
  },
  {
    name: "Omega-3",
    description: "Essential fatty acids for heart and brain health",
    benefits: ["Heart health", "Reduced inflammation", "Brain function"],
    dosage: "1-3g daily",
  },
];

const Nutrition = () => {
  const { user } = useAuth();
  const [searchFood, setSearchFood] = useState("");
  const [macroResult, setMacroResult] = useState<typeof foodMacros[string] | null>(null);
  const [nutritionData, setnutritionData] = useState<FoodNutrition | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    age: number | null;
    fitness_goal: string | null;
    diet_type: string | null;
  }>({ age: null, fitness_goal: null, diet_type: null });
  const [personalizedSupplements, setPersonalizedSupplements] = useState<ReturnType<typeof getSupplementRecommendations>>([]);
  
  // Chat states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isAskingChatbot, setisAskingChatbot] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showNutritionInfo, setShowNutritionInfo] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("profiles")
      .select("age, fitness_goal, diet_type")
      .eq("id", user.id)
      .single();

    if (data && data.age && data.fitness_goal) {
      setUserProfile({
        age: data.age,
        fitness_goal: data.fitness_goal,
        diet_type: data.diet_type
      });

      const isVeg = data.diet_type === "veg";
      const recommendations = getSupplementRecommendations(data.age, data.fitness_goal, isVeg);
      setPersonalizedSupplements(recommendations);
    }
  };

  // Handle input change and show suggestions
  const handleInputChange = (value: string) => {
    setSearchFood(value);
    setNotFound(false);
    
    if (value.trim().length > 0) {
      // Get all food names and filter based on input
      const allFoods = getAllFoodNames();
      const filtered = allFoods.filter(food => 
        food.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5); // Show max 5 suggestions
      
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setSearchFood(suggestion);
    setShowSuggestions(false);
    // Auto-search when suggestion is clicked
    setTimeout(() => handleSearch(suggestion), 100);
  };

  const handleSearch = async (foodName?: string) => {
    const food = (foodName || searchFood).toLowerCase().trim();
    
    if (!food) {
      toast.error('Please enter a food name');
      return;
    }

    setSearching(true);
    setNotFound(false);
    setMacroResult(null);
    setnutritionData(null);
    setShowSuggestions(false);

    // First check comprehensive food database
    const dbFood = searchFoodDB(food);
    if (dbFood) {
      setnutritionData({
        food_name: dbFood.name,
        protein: dbFood.protein,
        carbs: dbFood.carbs,
        fat: dbFood.fat,
        fiber: dbFood.fiber,
        trans_fat: dbFood.trans_fat,
        calories: dbFood.calories,
        serving_size: "100g",
        vitamins: dbFood.vitamins,
        minerals: dbFood.minerals,
        health_benefits: dbFood.health_benefits
      });
      setSearching(false);
      toast.success(`Found ${dbFood.name}!`);
      return;
    }

    // If not in database, use AI as fallback
    try {
      console.log('🤖 Not in database, searching to search for:', searchFood);
      toast.info('Searching...', { duration: 2000 });
      
      const nutrition = await getFoodNutrition(searchFood);
      
      if (nutrition) {
        setnutritionData(nutrition);
        toast.success(`Found nutritional info for ${searchFood}!`);
      } else {
        setNotFound(true);
        toast.error('Food not found. Try a different name.');
      }
    } catch (error) {
      console.error('Error searching food:', error);
      toast.error('Error searching. Please try again.');
      setNotFound(true);
    } finally {
      setSearching(false);
    }
  };

  // Chat handlers
  const handleAskChatbot = async (question?: string) => {
    const userQuestion = question || chatInput.trim();
    
    if (!userQuestion) {
      toast.error('Please enter a question');
      return;
    }

    // Correct typos in user input
    const correctedQuestion = correctSupplementTypos(userQuestion);
    
    // Add user message to chat
    const userMessage: ChatMessage = { role: 'user', content: correctedQuestion };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setisAskingChatbot(true);

    try {
      const response = await getSupplementAdvice(correctedQuestion, chatMessages);
      
      // Add AI response to chat
      const chatbotMessage: ChatMessage = { role: 'assistant', content: response };
      setChatMessages(prev => [...prev, chatbotMessage]);
      
      // Show typo correction if needed
      if (correctedQuestion !== userQuestion) {
        toast.info(`Corrected: "${userQuestion}" → "${correctedQuestion}"`);
      }
    } catch (error: any) {
      console.error('Chat Error:', error);
      
      // Show error as a chatbot response instead of removing the message
      const errorMessage: ChatMessage = { 
        role: 'assistant', 
        content: error.message || 'Sorry, I couldn\'t process that question. Try asking about specific supplements like "whey protein" or "creatine".'
      };
      setChatMessages(prev => [...prev, errorMessage]);
      
      // Also show a toast for visibility
      toast.error('Using knowledge base - try specific supplement questions!', { duration: 3000 });
    } finally {
      setisAskingChatbot(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setChatInput(question);
    setShowChat(true);
    // Auto-send after a brief delay
    setTimeout(() => handleAskChatbot(question), 300);
  };

  const clearChat = () => {
    setChatMessages([]);
    toast.info('Chat cleared');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-primary">Nutrition Guide</h1>
              <p className="text-muted-foreground">Supplements & Macro Information</p>
            </div>
          </div>
          <button 
            onClick={() => setShowNutritionInfo(true)}
            className="hover:scale-110 transition-transform cursor-pointer"
            title="Why Nutrition is Important"
          >
            <Pill className="h-8 w-8 text-primary" />
          </button>
        </div>

        {/* Safety Warning */}
        <Card className="p-6 mb-6 border-primary/20 bg-primary/5">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-primary mb-2">Important Safety Notes</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Consult a doctor before taking any supplements</li>
                <li>• Check your creatinine level before using creatine</li>
                <li>• Start with minimum dosage and gradually increase</li>
                <li>• Stay hydrated when using supplements</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Smart Macro Info Search */}
        <Card className="p-6 mb-6 border-primary/30">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Smart Food Search</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Search for ANY food to see its nutritional breakdown - with autocomplete
          </p>
          <div className="relative">
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <Input
                  placeholder="Start typing... (e.g., Paneer, Pizza, Mango)"
                  value={searchFood}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !searching) {
                      handleSearch();
                    } else if (e.key === "Escape") {
                      setShowSuggestions(false);
                    }
                  }}
                  onFocus={() => {
                    if (suggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  disabled={searching}
                  className="pr-10"
                />
                {searchFood && !searching && (
                  <button
                    onClick={() => {
                      setSearchFood("");
                      setSuggestions([]);
                      setShowSuggestions(false);
                      setnutritionData(null);
                      setMacroResult(null);
                      setNotFound(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                )}
                
                {/* Autocomplete Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full px-4 py-2 text-left hover:bg-primary/10 transition-colors flex items-center gap-2 border-b border-border last:border-b-0"
                      >
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <span>{suggestion}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button onClick={() => handleSearch()} className="gap-2" disabled={searching}>
                {searching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </div>
            {suggestions.length > 0 && searchFood && !showSuggestions && (
              <p className="text-xs text-muted-foreground">
                💡 Tip: Click on suggestions or press Enter to search
              </p>
            )}
          </div>

          {/* Local Database Result */}
          {macroResult && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">Database</Badge>
                <span>Per 100g serving</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-4 rounded-lg bg-primary/10 text-center">
                  <p className="text-2xl font-bold text-primary">{macroResult.protein}g</p>
                  <p className="text-sm text-muted-foreground">Protein</p>
                </div>
                <div className="p-4 rounded-lg bg-primary/10 text-center">
                  <p className="text-2xl font-bold text-primary">{macroResult.carbs}g</p>
                  <p className="text-sm text-muted-foreground">Carbs</p>
                </div>
                <div className="p-4 rounded-lg bg-primary/10 text-center">
                  <p className="text-2xl font-bold text-primary">{macroResult.fat}g</p>
                  <p className="text-sm text-muted-foreground">Fat</p>
                </div>
                <div className="p-4 rounded-lg bg-primary/10 text-center">
                  <p className="text-2xl font-bold text-primary">{macroResult.fiber}g</p>
                  <p className="text-sm text-muted-foreground">Fiber</p>
                </div>
                <div className="p-4 rounded-lg bg-primary/10 text-center">
                  <p className="text-2xl font-bold text-primary">{macroResult.trans_fat}g</p>
                  <p className="text-sm text-muted-foreground">Trans Fat</p>
                </div>
              </div>
            </div>
          )}

          {/* AI Result with Extended Info */}
          {nutritionData && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Badge className="gap-1">
                    <Sparkles className="h-3 w-3" />
                    Smart
                  </Badge>
                  <span className="text-muted-foreground">Per {nutritionData.serving_size}</span>
                </div>
                {nutritionData.food_name && nutritionData.food_name.toLowerCase() !== searchFood.toLowerCase() && (
                  <div className="text-sm text-muted-foreground">
                    Showing results for: <span className="font-semibold text-primary">{nutritionData.food_name}</span>
                  </div>
                )}
              </div>
              
              {/* Main Macros */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 text-center">
                  <p className="text-2xl font-bold text-primary">{nutritionData.calories}</p>
                  <p className="text-sm text-muted-foreground">Calories</p>
                </div>
                <div className="p-4 rounded-lg bg-primary/10 text-center">
                  <p className="text-2xl font-bold text-primary">{nutritionData.protein}g</p>
                  <p className="text-sm text-muted-foreground">Protein</p>
                </div>
                <div className="p-4 rounded-lg bg-primary/10 text-center">
                  <p className="text-2xl font-bold text-primary">{nutritionData.carbs}g</p>
                  <p className="text-sm text-muted-foreground">Carbs</p>
                </div>
                <div className="p-4 rounded-lg bg-primary/10 text-center">
                  <p className="text-2xl font-bold text-primary">{nutritionData.fat}g</p>
                  <p className="text-sm text-muted-foreground">Fat</p>
                </div>
                <div className="p-4 rounded-lg bg-primary/10 text-center">
                  <p className="text-2xl font-bold text-primary">{nutritionData.fiber}g</p>
                  <p className="text-sm text-muted-foreground">Fiber</p>
                </div>
                <div className="p-4 rounded-lg bg-primary/10 text-center">
                  <p className="text-2xl font-bold text-primary">{nutritionData.trans_fat}g</p>
                  <p className="text-sm text-muted-foreground">Trans Fat</p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                {nutritionData.vitamins && nutritionData.vitamins.length > 0 && (
                  <div className="p-4 rounded-lg bg-card border border-border">
                    <p className="text-sm font-semibold mb-2">💊 Key Vitamins</p>
                    <div className="flex flex-wrap gap-1">
                      {nutritionData.vitamins.map((vitamin, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{vitamin}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {nutritionData.minerals && nutritionData.minerals.length > 0 && (
                  <div className="p-4 rounded-lg bg-card border border-border">
                    <p className="text-sm font-semibold mb-2">⚡ Key Minerals</p>
                    <div className="flex flex-wrap gap-1">
                      {nutritionData.minerals.map((mineral, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{mineral}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {nutritionData.health_benefits && nutritionData.health_benefits.length > 0 && (
                  <div className="p-4 rounded-lg bg-card border border-border">
                    <p className="text-sm font-semibold mb-2">✨ Health Benefits</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {nutritionData.health_benefits.map((benefit, i) => (
                        <li key={i}>• {benefit}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {notFound && (
            <div className="p-4 rounded-lg bg-destructive/10 text-center animate-fade-in">
              <p className="text-sm text-destructive font-semibold mb-2">Could not find nutritional information</p>
              <p className="text-xs text-muted-foreground">
                This might not be a food item. Try searching for actual foods like "chicken", "rice", "apple", etc.
              </p>
            </div>
          )}
        </Card>

        {/* Personalized Info */}
        {userProfile.age && userProfile.fitness_goal && (
          <Card className="mb-6 border-primary/50 bg-gradient-to-r from-primary/10 to-primary/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold mb-1">
                    💊 Your Personalized Supplement Plan
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Age: {userProfile.age} • Goal: {userProfile.fitness_goal?.replace('_', ' ').toUpperCase()} • 
                    Diet: {userProfile.diet_type === "veg" ? "Vegetarian" : "Non-Vegetarian"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supplements automatically filtered for your age and goals
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Supplements vs Steroids Comparison */}
        <Card className="mb-8 border-destructive/30 bg-gradient-to-r from-destructive/5 to-orange-500/5">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span>⚖️</span>
              <span>Supplements vs Steroids</span>
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Understanding the critical difference between safe supplements and dangerous steroids
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-border">
                    {supplementsVsSteroids.headers.map((header, i) => (
                      <th key={i} className="text-left p-3 font-bold text-sm">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {supplementsVsSteroids.rows.map((row, i) => (
                    <tr key={i} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-semibold text-sm">{row[0]}</td>
                      <td className="p-3 text-sm text-green-600 dark:text-green-400">{row[1]}</td>
                      <td className="p-3 text-sm text-destructive">{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm font-bold text-destructive mb-2">🚫 NEVER USE STEROIDS</p>
              <p className="text-xs text-muted-foreground">
                Steroids cause permanent damage to your liver, kidneys, heart, and hormonal system. 
                They are illegal and banned in sports. Always choose natural supplements and proper training!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* General Supplement Information */}
        <Card className="mb-6 border-primary/30 bg-primary/5">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>💊</span>
              <span>General Supplements in Gym Industry</span>
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="font-semibold text-green-600 dark:text-green-400 mb-3">✅ Advantages</p>
                <ul className="space-y-2">
                  {generalSupplementInfo.advantages.map((advantage, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{advantage}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <p className="font-semibold text-orange-600 dark:text-orange-400 mb-3">⚠️ Precautions</p>
                <ul className="space-y-2">
                  {generalSupplementInfo.precautions.map((precaution, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-orange-500 mt-0.5">•</span>
                      <span>{precaution}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Supplements Guide */}
        <h2 className="text-2xl font-bold mb-4">
          {personalizedSupplements.length > 0 ? "Your Recommended Supplements" : "Popular Supplements Guide"}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Complete guide with advantages and precautions for each supplement
        </p>

        <div className="grid md:grid-cols-1 gap-6">
          {detailedSupplements.map((supplement) => (
            <Card key={supplement.name} className="p-6 hover:border-primary/50 transition-colors border-l-4 border-l-primary">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{supplement.emoji}</span>
                  <div>
                    <h3 className="text-xl font-bold text-primary">{supplement.name}</h3>
                    <p className="text-sm text-muted-foreground">{supplement.description}</p>
                  </div>
                </div>
              </div>

              {supplement.warning && (
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive font-medium">⚠️ {supplement.warning}</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="font-semibold text-green-600 dark:text-green-400 mb-2 text-sm">✅ Advantages</p>
                  <ul className="space-y-1">
                    {supplement.advantages.map((advantage, i) => (
                      <li key={i} className="text-xs flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span>{advantage}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <p className="font-semibold text-orange-600 dark:text-orange-400 mb-2 text-sm">⚠️ Precautions</p>
                  <ul className="space-y-1">
                    {supplement.precautions.map((precaution, i) => (
                      <li key={i} className="text-xs flex items-start gap-2">
                        <span className="text-orange-500 mt-0.5">•</span>
                        <span>{precaution}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <p className="text-sm">
                  <span className="font-semibold">💊 Recommended Dosage:</span> {supplement.dosage}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Supplement Chatbot Chat */}
        <Card className="mt-8 border-primary/50 bg-gradient-to-br from-primary/10 via-purple-500/10 to-blue-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              {chatMessages.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearChat}>
                  Clear Chat
                </Button>
              )}
            </div>

            {/* Suggested Questions */}
            {chatMessages.length === 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  <p className="text-sm font-semibold">Suggested Questions:</p>
                </div>
                <div className="grid md:grid-cols-2 gap-2">
                  {suggestedQuestions.slice(0, 6).map((question, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className="justify-start text-left h-auto py-2 px-3 hover:bg-primary/10"
                      onClick={() => handleSuggestedQuestion(question)}
                    >
                      <span className="text-xs">{question}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Messages */}
            {chatMessages.length > 0 && (
              <div className="mb-4 space-y-4 max-h-96 overflow-y-auto p-4 bg-card/50 rounded-lg border border-border">
                {chatMessages.map((message, i) => (
                  <div
                    key={i}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isAskingChatbot && (
                  <div className="flex justify-start">
                    <div className="bg-muted p-3 rounded-lg">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Chat Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Ask about supplements... (e.g., 'Can I take cratine with protien?')"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isAskingChatbot) {
                    handleAskChatbot();
                  }
                }}
                disabled={isAskingChatbot}
                className="flex-1"
              />
              <Button
                onClick={() => handleAskChatbot()}
                disabled={isAskingChatbot || !chatInput.trim()}
                className="gap-2"
              >
                {isAskingChatbot ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Thinking...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Ask
                  </>
                )}
              </Button>
            </div>

            {/* Info Footer */}
            <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-xs text-muted-foreground flex items-start gap-2">
                <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>
                  This chatbot provides general information. Always consult a healthcare professional 
                  before starting any supplement regimen, especially if you have medical conditions.
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Nutrition Benefits Dialog */}
      <Dialog open={showNutritionInfo} onOpenChange={setShowNutritionInfo}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
              <Pill className="h-6 w-6" />
              Why Nutrition is Important for Human Body
            </DialogTitle>
            <DialogDescription>
              Understanding the vital role of proper nutrition in your health and fitness journey
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {/* Energy & Performance */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                ⚡ Energy & Performance
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Provides fuel for daily activities and intense workouts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Improves athletic performance and endurance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Maintains stable blood sugar levels throughout the day</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Reduces fatigue and increases stamina</span>
                </li>
              </ul>
            </div>

            {/* Muscle Growth & Recovery */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                💪 Muscle Growth & Recovery
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Protein builds and repairs muscle tissue after workouts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Speeds up recovery time between training sessions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Prevents muscle breakdown during calorie deficit</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Supports lean muscle mass development</span>
                </li>
              </ul>
            </div>

            {/* Immune System */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                🛡️ Immune System Support
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Strengthens immune system to fight infections</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Vitamins and minerals support white blood cell production</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Reduces inflammation and promotes healing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Protects against chronic diseases</span>
                </li>
              </ul>
            </div>

            {/* Brain Function */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                🧠 Brain Function & Mental Health
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Improves focus, concentration, and cognitive performance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Supports mood regulation and reduces stress</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Omega-3 fatty acids enhance brain health</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Prevents cognitive decline with age</span>
                </li>
              </ul>
            </div>

            {/* Weight Management */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                ⚖️ Weight Management
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Helps achieve and maintain healthy body weight</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Regulates metabolism and hormone balance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Controls appetite and reduces cravings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Supports sustainable fat loss while preserving muscle</span>
                </li>
              </ul>
            </div>

            {/* Bone & Joint Health */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                🦴 Bone & Joint Health
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Calcium and vitamin D strengthen bones</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Prevents osteoporosis and bone fractures</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Reduces joint pain and inflammation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Supports cartilage health and mobility</span>
                </li>
              </ul>
            </div>

            {/* Heart Health */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                ❤️ Heart & Cardiovascular Health
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Lowers cholesterol and blood pressure</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Reduces risk of heart disease and stroke</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Improves blood circulation and oxygen delivery</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Supports healthy blood vessel function</span>
                </li>
              </ul>
            </div>

            {/* Longevity */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                🌟 Longevity & Quality of Life
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Increases lifespan and healthy aging</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Maintains energy levels as you age</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Prevents age-related diseases</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Improves overall quality of life and well-being</span>
                </li>
              </ul>
            </div>

            {/* Key Takeaway */}
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm font-semibold text-primary mb-2">💡 Key Takeaway</p>
              <p className="text-sm text-muted-foreground">
                Proper nutrition is the foundation of health, fitness, and longevity. Combined with regular exercise, 
                adequate sleep, and stress management, good nutrition helps you achieve your fitness goals and live a 
                healthier, more energetic life!
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Nutrition;

