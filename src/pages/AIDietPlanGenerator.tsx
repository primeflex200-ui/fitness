import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Sparkles, Leaf, Drumstick, Loader2, RefreshCw, Plus, Trash2, ChefHat, Clock, Users, X, Calendar, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { generateAIDietPlan, uploadDietPlanToStorage, saveDietPlanMetadata, GeneratedDietPlan, generateAlternativeMeal, MealItem, generateDietPlanFromAvailableFoods, generateRecipe, Recipe } from "@/services/aiDietPlanGenerator";

type DietType = "veg" | "nonveg";
type BodyGoal = "fatloss" | "lean" | "bulk" | "athletic";
type GenerationStep = "diet-type" | "body-goal" | "available-foods" | "generated";

const AIDietPlanGenerator = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<GenerationStep>("diet-type");
  const [selectedDietType, setSelectedDietType] = useState<DietType | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<BodyGoal | null>(null);
  const [availableFoods, setAvailableFoods] = useState<string[]>([]);
  const [foodInput, setFoodInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedDietPlan | null>(null);
  const [refreshingMeal, setRefreshingMeal] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState("");
  const [showAllergyPanel, setShowAllergyPanel] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    console.log("AIDietPlanGenerator mounted. User:", user);
  }, [user]);

  const bodyGoals = [
    {
      id: "fatloss",
      label: "Fat Loss",
      description: "Lose weight while preserving muscle",
      calories: "1600 cal/day",
      macros: "35% Protein, 40% Carbs, 25% Fats"
    },
    {
      id: "lean",
      label: "Lean Body",
      description: "Build lean muscle with minimal fat gain",
      calories: "2100 cal/day",
      macros: "30% Protein, 50% Carbs, 20% Fats"
    },
    {
      id: "bulk",
      label: "Bulk Body",
      description: "Maximize muscle gain with controlled fat",
      calories: "2800 cal/day",
      macros: "30% Protein, 50% Carbs, 20% Fats"
    },
    {
      id: "athletic",
      label: "Athletic",
      description: "Optimize performance and endurance",
      calories: "2400 cal/day",
      macros: "30% Protein, 50% Carbs, 20% Fats"
    }
  ];

  const addFood = () => {
    if (!foodInput.trim()) {
      toast.error("Please enter a food item");
      return;
    }
    if (availableFoods.includes(foodInput.trim())) {
      toast.error("This food is already added");
      return;
    }
    setAvailableFoods([...availableFoods, foodInput.trim()]);
    setFoodInput("");
    toast.success(`${foodInput} added!`);
  };

  const removeFood = (food: string) => {
    setAvailableFoods(availableFoods.filter(f => f !== food));
    toast.info(`${food} removed`);
  };

  const addAllergy = () => {
    if (!allergyInput.trim()) {
      toast.error("Please enter an allergy");
      return;
    }
    if (allergies.includes(allergyInput.trim())) {
      toast.error("This allergy is already added");
      return;
    }
    setAllergies([...allergies, allergyInput.trim()]);
    setAllergyInput("");
    toast.success(`${allergyInput} added to allergies!`);
  };

  const removeAllergy = (allergy: string) => {
    setAllergies(allergies.filter(a => a !== allergy));
    toast.info(`${allergy} removed from allergies`);
  };

  const removeMealsWithAllergy = (allergy: string) => {
    if (!generatedPlan) return;

    const updatedPlan = { ...generatedPlan };
    const allergyLower = allergy.toLowerCase();

    Object.keys(updatedPlan.plan).forEach((day) => {
      updatedPlan.plan[day] = updatedPlan.plan[day].filter(
        (meal) => !meal.food.toLowerCase().includes(allergyLower)
      );
    });

    setGeneratedPlan(updatedPlan);
    toast.success(`All meals containing ${allergy} have been removed!`);
  };

  const generatePlan = async () => {
    if (!selectedDietType || !selectedGoal) {
      toast.error("Please select both diet type and body goal");
      return;
    }

    setLoading(true);
    try {
      let plan;
      if (availableFoods.length > 0) {
        plan = await generateDietPlanFromAvailableFoods(availableFoods, selectedDietType, selectedGoal);
      } else {
        plan = await generateAIDietPlan(selectedDietType, selectedGoal);
      }
      setGeneratedPlan(plan);
      setCurrentStep("generated");
      setSelectedDay("Monday");
      toast.success("Diet plan generated successfully!");
    } catch (error) {
      toast.error("Failed to generate diet plan");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };



  const refreshMeal = async (day: string, mealIndex: number, currentMeal: MealItem) => {
    if (!generatedPlan || !selectedDietType || !selectedGoal) return;

    const mealKey = `${day}-${mealIndex}`;
    setRefreshingMeal(mealKey);

    try {
      const alternativeMeal = await generateAlternativeMeal(currentMeal, selectedDietType, selectedGoal);
      
      // Update the plan with the new meal
      const updatedPlan = { ...generatedPlan };
      updatedPlan.plan[day][mealIndex] = alternativeMeal;
      setGeneratedPlan(updatedPlan);
      
      toast.success(`${currentMeal.meal} replaced with alternative!`);
    } catch (error) {
      toast.error("Failed to generate alternative meal");
      console.error(error);
    } finally {
      setRefreshingMeal(null);
    }
  };

  const viewRecipe = async (mealName: string) => {
    setLoadingRecipe(true);
    try {
      const recipe = await generateRecipe(mealName);
      setSelectedRecipe(recipe);
      toast.success("Recipe loaded!");
    } catch (error) {
      toast.error("Failed to load recipe");
      console.error(error);
    } finally {
      setLoadingRecipe(false);
    }
  };

  const saveDietPlan = async () => {
    if (!generatedPlan) {
      toast.error("Please generate a plan first");
      return;
    }

    setSaving(true);
    try {
      // Get current user directly from Supabase
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !currentUser) {
        console.error("Auth error:", authError);
        toast.error("Please login first");
        setSaving(false);
        return;
      }

      // Include diet_type and body_goal in the plan_data
      const planDataWithMetadata = {
        dietType: generatedPlan.dietType,
        bodyGoal: generatedPlan.bodyGoal,
        plan: generatedPlan.plan,
        createdAt: generatedPlan.createdAt
      };

      console.log("Saving diet plan for user:", currentUser.id);

      // Save to database
      const { data, error } = await supabase
        .from("diet_plans")
        .insert({
          user_id: currentUser.id,
          plan_data: planDataWithMetadata,
          created_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error("Error saving diet plan:", error);
        toast.error(`Failed to save: ${error.message}`);
        return;
      }

      console.log("Diet plan saved successfully:", data);
      toast.success("Diet plan saved successfully! 🎉");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to save diet plan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/diet">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">AI Diet Plan Generator</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Intro */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Generate Your Perfect Diet Plan</h1>
          <p className="text-muted-foreground">
            AI-powered meal planning tailored to your diet preference and fitness goals
          </p>
        </div>

        {currentStep !== "generated" ? (
          <>
            {/* Diet Type Selection */}
            <Card className="mb-8 border-primary/50 bg-gradient-to-br from-primary/10 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="w-5 h-5" />
                  Step 1: Choose Your Diet Type
                </CardTitle>
                <CardDescription>Select whether you prefer vegetarian or non-vegetarian meals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant={selectedDietType === "veg" ? "hero" : "outline"}
                    onClick={() => setSelectedDietType("veg")}
                    className="h-24 flex flex-col items-center justify-center gap-2"
                  >
                    <Leaf className="w-6 h-6" />
                    <span className="text-base font-semibold">Vegetarian</span>
                    <span className="text-xs text-muted-foreground">Plant-based meals</span>
                  </Button>
                  <Button
                    variant={selectedDietType === "nonveg" ? "hero" : "outline"}
                    onClick={() => setSelectedDietType("nonveg")}
                    className="h-24 flex flex-col items-center justify-center gap-2"
                  >
                    <Drumstick className="w-6 h-6" />
                    <span className="text-base font-semibold">Non-Vegetarian</span>
                    <span className="text-xs text-muted-foreground">Includes meat & fish</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Body Goal Selection */}
            <Card className="mb-8 border-primary/50 bg-gradient-to-br from-primary/10 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Step 2: Select Your Body Goal
                </CardTitle>
                <CardDescription>Choose the fitness goal that matches your objectives</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bodyGoals.map((goal) => (
                    <Button
                      key={goal.id}
                      variant={selectedGoal === goal.id ? "hero" : "outline"}
                      onClick={() => setSelectedGoal(goal.id as BodyGoal)}
                      className="h-auto p-4 flex flex-col items-start justify-start text-left"
                    >
                      <div className="font-semibold text-base mb-1">{goal.label}</div>
                      <div className="text-xs text-muted-foreground mb-2">{goal.description}</div>
                      <div className="text-xs space-y-1">
                        <div className="font-medium">{goal.calories}</div>
                        <div className="text-muted-foreground">{goal.macros}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Available Foods Input */}
            <Card className="mb-8 border-primary/50 bg-gradient-to-br from-primary/10 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🛒 Step 3: Enter Available Foods (Optional)
                </CardTitle>
                <CardDescription>
                  Add foods available to you. AI will create a plan using only these items. Leave empty to generate a standard plan.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label htmlFor="food-input" className="text-sm mb-2 block">Food Item</Label>
                      <Input
                        id="food-input"
                        placeholder="e.g., Chicken, Rice, Broccoli, Eggs..."
                        value={foodInput}
                        onChange={(e) => setFoodInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addFood()}
                      />
                    </div>
                    <Button
                      onClick={addFood}
                      variant="hero"
                      size="sm"
                      className="mt-6"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>

                  {availableFoods.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">Added Foods ({availableFoods.length}):</p>
                      <div className="flex flex-wrap gap-2">
                        {availableFoods.map((food) => (
                          <Badge
                            key={food}
                            variant="outline"
                            className="px-3 py-2 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                            onClick={() => removeFood(food)}
                          >
                            {food}
                            <Trash2 className="w-3 h-3 ml-2" />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <div className="flex gap-4">
              <Button
                onClick={generatePlan}
                disabled={!selectedDietType || !selectedGoal || loading}
                size="lg"
                className="flex-1"
                variant="hero"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Plan...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate AI Diet Plan
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Generated Plan Display */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Your Generated Diet Plan</h2>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      {generatedPlan.dietType === "veg" ? "🌱 Vegetarian" : "🍖 Non-Vegetarian"}
                    </Badge>
                    <Badge variant="outline">
                      {generatedPlan.bodyGoal === "fatloss"
                        ? "💪 Fat Loss"
                        : generatedPlan.bodyGoal === "lean"
                        ? "🏋️ Lean Body"
                        : generatedPlan.bodyGoal === "bulk"
                        ? "📈 Bulk Body"
                        : "⚡ Athletic"}
                    </Badge>
                    {availableFoods.length > 0 && (
                      <Badge variant="secondary">
                        📋 {availableFoods.length} foods used
                      </Badge>
                    )}
                    {allergies.length > 0 && (
                      <Badge variant="destructive">
                        ⚠️ {allergies.length} allergies
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setShowAllergyPanel(!showAllergyPanel)} variant="outline">
                    {showAllergyPanel ? "Hide" : "Manage"} Allergies
                  </Button>
                  <Button 
                    onClick={saveDietPlan} 
                    variant="hero"
                    disabled={saving}
                    className="gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Save Plan
                      </>
                    )}
                  </Button>
                  <Button onClick={() => setCurrentStep("diet-type")} variant="outline">
                    Generate New
                  </Button>
                </div>
              </div>
            </div>

            {/* Available Foods Display */}
            {availableFoods.length > 0 && (
              <Card className="mb-6 border-primary/50 bg-gradient-to-br from-primary/10 to-transparent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🛒 Available Foods Used
                  </CardTitle>
                  <CardDescription>
                    Your plan is generated using these available foods
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {availableFoods.map((food) => (
                      <Badge key={food} variant="outline" className="px-3 py-2 text-sm">
                        ✓ {food}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Allergy Management Panel */}
            {showAllergyPanel && (
              <Card className="mb-6 border-destructive/50 bg-gradient-to-br from-destructive/10 to-transparent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    ⚠️ Manage Allergies & Food Restrictions
                  </CardTitle>
                  <CardDescription>
                    Add foods you're allergic to or want to avoid. All meals containing these items will be removed from your plan.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label htmlFor="allergy-input" className="text-sm mb-2 block">Food to Avoid</Label>
                        <Input
                          id="allergy-input"
                          placeholder="e.g., Milk, Peanuts, Gluten, Eggs..."
                          value={allergyInput}
                          onChange={(e) => setAllergyInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addAllergy()}
                        />
                      </div>
                      <Button
                        onClick={addAllergy}
                        variant="hero"
                        size="sm"
                        className="mt-6"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>

                    {allergies.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-sm font-semibold">Foods to Avoid ({allergies.length}):</p>
                        <div className="space-y-2">
                          {allergies.map((allergy) => (
                            <div
                              key={allergy}
                              className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-destructive/30"
                            >
                              <span className="font-medium">{allergy}</span>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => removeMealsWithAllergy(allergy)}
                                  className="text-xs"
                                >
                                  Remove Meals
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeAllergy(allergy)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Day Selector */}
            <Card className="mb-6 border-primary/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">Select Day:</span>
                  {Object.keys(generatedPlan.plan).map((day) => (
                    <Button
                      key={day}
                      variant={selectedDay === day ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDay(day)}
                      className="whitespace-nowrap"
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Single Day Plan Display */}
            {selectedDay && generatedPlan.plan[selectedDay] && (
              <div className="space-y-4 mb-8">
                {(() => {
                  const meals = generatedPlan.plan[selectedDay];
                  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
                  const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);
                  const totalCarbs = meals.reduce((sum, m) => sum + m.carbs, 0);
                  const totalFats = meals.reduce((sum, m) => sum + m.fats, 0);

                  return (
                    <>
                      {/* Day Summary Card */}
                      <Card className="border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5">
                        <CardHeader>
                          <CardTitle className="text-2xl">{selectedDay}'s Meal Plan</CardTitle>
                          <CardDescription>
                            Total: {totalCalories} cal • P: {totalProtein}g • C: {totalCarbs}g • F: {totalFats}g
                          </CardDescription>
                        </CardHeader>
                      </Card>

                      {/* Meals for the Day */}
                      <div className="space-y-3">
                        {meals.map((meal, idx) => {
                          const mealKey = `${selectedDay}-${idx}`;
                          const isRefreshing = refreshingMeal === mealKey;
                          
                          return (
                            <Card key={idx} className="border-border hover:border-primary transition-all">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge variant="outline" className="text-base px-3 py-1">
                                        {meal.meal}
                                      </Badge>
                                    </div>
                                    <h3 className="text-lg font-semibold mb-3">{meal.food}</h3>
                                    <div className="grid grid-cols-4 gap-3">
                                      <div className="p-2 bg-card/50 rounded-lg">
                                        <p className="text-xs text-muted-foreground">Calories</p>
                                        <p className="text-lg font-bold text-primary">{meal.calories}</p>
                                      </div>
                                      <div className="p-2 bg-card/50 rounded-lg">
                                        <p className="text-xs text-muted-foreground">Protein</p>
                                        <p className="text-lg font-bold">{meal.protein}g</p>
                                      </div>
                                      <div className="p-2 bg-card/50 rounded-lg">
                                        <p className="text-xs text-muted-foreground">Carbs</p>
                                        <p className="text-lg font-bold">{meal.carbs}g</p>
                                      </div>
                                      <div className="p-2 bg-card/50 rounded-lg">
                                        <p className="text-xs text-muted-foreground">Fats</p>
                                        <p className="text-lg font-bold">{meal.fats}g</p>
                                      </div>
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => viewRecipe(meal.food)}
                                    disabled={loadingRecipe}
                                    title="View recipe"
                                  >
                                    {loadingRecipe ? (
                                      <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                      <ChefHat className="w-5 h-5" />
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => refreshMeal(selectedDay, idx, meal)}
                                    disabled={isRefreshing}
                                    title="Replace with alternative meal"
                                  >
                                    {isRefreshing ? (
                                      <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                      <RefreshCw className="w-5 h-5" />
                                    )}
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                        <Button
                          onClick={() => navigate("/saved-diet-plans")}
                          size="lg"
                          variant="outline"
                          className="w-full gap-2"
                        >
                          <Calendar className="w-5 h-5" />
                          View All Saved Plans
                        </Button>
                        <Button
                          onClick={() => navigate("/diet-plan-tracker")}
                          size="lg"
                          variant="hero"
                          className="w-full gap-2"
                        >
                          <TrendingUp className="w-5 h-5" />
                          Track Progress with Graph
                        </Button>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}


          </>
        )}
      </div>

      {/* Recipe Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center gap-2">
                <ChefHat className="w-6 h-6 text-primary" />
                <CardTitle className="text-2xl">{selectedRecipe.name}</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedRecipe(null)}
              >
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Recipe Info */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-card/50 rounded-lg text-center">
                  <Clock className="w-5 h-5 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Cooking Time</p>
                  <p className="text-lg font-bold">{selectedRecipe.cookingTime} min</p>
                </div>
                <div className="p-3 bg-card/50 rounded-lg text-center">
                  <Users className="w-5 h-5 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Servings</p>
                  <p className="text-lg font-bold">{selectedRecipe.servings}</p>
                </div>
                <div className="p-3 bg-card/50 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Difficulty</p>
                  <Badge
                    variant={
                      selectedRecipe.difficulty === "Easy"
                        ? "outline"
                        : selectedRecipe.difficulty === "Medium"
                        ? "secondary"
                        : "destructive"
                    }
                    className="mt-2"
                  >
                    {selectedRecipe.difficulty}
                  </Badge>
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
                <ul className="space-y-2">
                  {selectedRecipe.ingredients.map((ingredient, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-2 bg-card/50 rounded-lg">
                      <span className="text-primary font-bold mt-0.5">•</span>
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Instructions</h3>
                <ol className="space-y-3">
                  {selectedRecipe.instructions.map((instruction, idx) => (
                    <li key={idx} className="flex gap-3 p-3 bg-card/50 rounded-lg">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                        {idx + 1}
                      </span>
                      <span className="pt-0.5">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Close Button */}
              <Button
                onClick={() => setSelectedRecipe(null)}
                className="w-full"
                variant="outline"
              >
                Close Recipe
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AIDietPlanGenerator;