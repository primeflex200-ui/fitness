import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Calendar, Trash2, Eye, Loader2, RefreshCw, ChefHat } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { generateAlternativeMeal, generateRecipe, Recipe } from "@/services/aiDietPlanGenerator";

interface MealItem {
  meal: string;
  food: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface DietPlan {
  [day: string]: MealItem[];
}

interface SavedPlan {
  id: string;
  created_at: string;
  plan_data: any;
}

const SavedDietPlans = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<SavedPlan | null>(null);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [refreshingMeal, setRefreshingMeal] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [loadingRecipe, setLoadingRecipe] = useState(false);

  // Load plans on mount and whenever we navigate to this page
  useEffect(() => {
    // Reset selected plan when navigating to the page
    setSelectedPlan(null);
    loadSavedPlans();
  }, [location.pathname, location.key]); // location.key changes on every navigation

  const loadSavedPlans = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login first");
        setSavedPlans([]);
        return;
      }

      console.log("Loading plans for user:", user.id);

      // Force fresh data by adding a timestamp to prevent caching
      const { data, error } = await supabase
        .from("diet_plans")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading plans:", error);
        toast.error("Failed to load saved plans");
        setSavedPlans([]);
        return;
      }

      console.log("Loaded plans count:", data?.length || 0);
      setSavedPlans((data as any) || []);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load saved plans");
      setSavedPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const deletePlan = async (planId: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;

    try {
      console.log("=== DELETE OPERATION START ===");
      console.log("Plan ID to delete:", planId);

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error("Auth error:", authError);
        toast.error("Please login first");
        return;
      }

      console.log("User ID:", user.id);

      // Use direct delete with explicit user_id check
      const { error: deleteError, count } = await supabase
        .from("diet_plans")
        .delete({ count: 'exact' })
        .eq("id", planId)
        .eq("user_id", user.id);

      if (deleteError) {
        console.error("Delete error:", deleteError);
        toast.error(`Failed to delete: ${deleteError.message}`);
        return;
      }

      console.log("Rows deleted:", count);

      console.log("Delete operation completed");

      // Clear selected plan if it was deleted
      if (selectedPlan?.id === planId) {
        setSelectedPlan(null);
      }

      // Force reload from database
      console.log("Reloading plans from database...");
      await loadSavedPlans();
      
      console.log("=== DELETE OPERATION END ===");
      toast.success("Plan deleted successfully!");
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Failed to delete plan");
    }
  };

  const refreshMeal = async (day: string, mealIndex: number) => {
    if (!selectedPlan) return;

    const mealKey = `${day}-${mealIndex}`;
    setRefreshingMeal(mealKey);

    try {
      const currentMeal = selectedPlan.plan_data.plan[day][mealIndex];
      const alternativeMeal = await generateAlternativeMeal(
        currentMeal,
        selectedPlan.plan_data.dietType as "veg" | "nonveg",
        selectedPlan.plan_data.bodyGoal
      );

      // Update the plan
      const updatedPlan = { ...selectedPlan };
      updatedPlan.plan_data.plan[day][mealIndex] = alternativeMeal;

      // Save to database
      const { error } = await supabase
        .from("diet_plans")
        .update({ plan_data: updatedPlan.plan_data as any })
        .eq("id", selectedPlan.id);

      if (error) {
        toast.error("Failed to update meal");
        return;
      }

      setSelectedPlan(updatedPlan);
      toast.success("Meal refreshed successfully!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to refresh meal");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  if (selectedPlan) {
    const meals = selectedPlan.plan_data.plan[selectedDay] || [];
    const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
    const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);
    const totalCarbs = meals.reduce((sum, m) => sum + m.carbs, 0);
    const totalFats = meals.reduce((sum, m) => sum + m.fats, 0);

    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setSelectedPlan(null)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold">View Diet Plan</span>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Plan Info */}
          <Card className="mb-6 border-primary/50 bg-gradient-to-br from-primary/10 to-transparent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Your Diet Plan</h2>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      {selectedPlan.plan_data.dietType === "veg" ? "🌱 Vegetarian" : "🍖 Non-Vegetarian"}
                    </Badge>
                    <Badge variant="outline">
                      {selectedPlan.plan_data.bodyGoal === "fatloss"
                        ? "💪 Fat Loss"
                        : selectedPlan.plan_data.bodyGoal === "lean"
                        ? "🏋️ Lean Body"
                        : selectedPlan.plan_data.bodyGoal === "bulk"
                        ? "📈 Bulk Body"
                        : "⚡ Athletic"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Day Selector */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">Select Day:</span>
                {Object.keys(selectedPlan.plan_data.plan).map((day) => (
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

          {/* Day Summary */}
          <Card className="mb-6 border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader>
              <CardTitle className="text-2xl">{selectedDay}'s Meal Plan</CardTitle>
              <p className="text-sm text-muted-foreground">
                Total: {totalCalories} cal • P: {totalProtein}g • C: {totalCarbs}g • F: {totalFats}g
              </p>
            </CardHeader>
          </Card>

          {/* Meals */}
          <div className="space-y-4">
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
                      <div className="flex gap-2">
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
                          onClick={() => refreshMeal(selectedDay, idx)}
                          disabled={isRefreshing}
                          title="Replace with alternative"
                        >
                          {isRefreshing ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <RefreshCw className="w-5 h-5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recipe Modal */}
        {selectedRecipe && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ChefHat className="w-6 h-6 text-primary" />
                    <CardTitle className="text-2xl">{selectedRecipe.name}</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedRecipe(null)}>
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-card/50 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="text-lg font-bold">{selectedRecipe.cookingTime} min</p>
                  </div>
                  <div className="p-3 bg-card/50 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Servings</p>
                    <p className="text-lg font-bold">{selectedRecipe.servings}</p>
                  </div>
                  <div className="p-3 bg-card/50 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Difficulty</p>
                    <Badge variant="outline" className="mt-1">{selectedRecipe.difficulty}</Badge>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
                  <ul className="space-y-2">
                    {selectedRecipe.ingredients.map((ingredient, idx) => (
                      <li key={idx} className="flex items-start gap-3 p-2 bg-card/50 rounded-lg">
                        <span className="text-primary font-bold">•</span>
                        <span>{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                </div>

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
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/diet">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <Calendar className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">Saved Diet Plans</span>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => loadSavedPlans()} 
              variant="outline"
              size="icon"
              disabled={loading}
              title="Refresh plans"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </Button>
            <Button onClick={() => navigate("/ai-diet-plan")} variant="hero">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate New
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {savedPlans.length === 0 ? (
          <Card className="p-8 text-center">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Saved Plans</h2>
            <p className="text-muted-foreground mb-6">
              Generate your first AI diet plan to get started
            </p>
            <Button onClick={() => navigate("/ai-diet-plan")} variant="hero">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Diet Plan
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedPlans.map((plan) => (
              <Card key={plan.id} className="hover:border-primary transition-all cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">Diet Plan</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePlan(plan.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline">
                        {plan.plan_data.dietType === "veg" ? "🌱 Veg" : "🍖 Non-Veg"}
                      </Badge>
                      <Badge variant="secondary">
                        {plan.plan_data.bodyGoal}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(plan.created_at).toLocaleDateString()}
                    </p>
                    <Button
                      onClick={() => setSelectedPlan(plan)}
                      className="w-full"
                      variant="hero"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedDietPlans;
