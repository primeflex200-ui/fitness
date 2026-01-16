import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Sparkles, TrendingUp, Calendar, Flame, Apple, Save } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface MealItem {
  meal: string;
  food: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  completed?: boolean;
}

interface DietPlan {
  [day: string]: MealItem[];
}

interface SavedDietPlan {
  id: string;
  user_id: string;
  diet_type: string;
  body_goal: string;
  plan_data: DietPlan;
  created_at: string;
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DietPlanTracker = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState(DAYS_OF_WEEK[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [completedMeals, setCompletedMeals] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [planInfo, setPlanInfo] = useState<{ dietType: string; bodyGoal: string } | null>(null);

  useEffect(() => {
    loadDietPlan();
    loadCompletedMeals();
  }, []);

  useEffect(() => {
    if (dietPlan) {
      calculateWeeklyProgress();
    }
  }, [dietPlan, completedMeals]);

  const loadDietPlan = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      // Load from diet_plans table
      const { data, error } = await supabase
        .from("diet_plans")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error("Error loading diet plan:", error);
        toast.error("No diet plan found. Generate one first!");
        return;
      }

      if (data) {
        const planData = data.plan_data as any;
        
        // Handle both old and new data structures
        if (planData.plan) {
          // New structure with metadata
          setDietPlan(planData.plan as DietPlan);
          setPlanInfo({
            dietType: planData.dietType || data.diet_type || "veg",
            bodyGoal: planData.bodyGoal || data.body_goal || "lean"
          });
        } else {
          // Old structure - plan_data is the plan itself
          setDietPlan(planData as DietPlan);
          setPlanInfo({
            dietType: data.diet_type || "veg",
            bodyGoal: data.body_goal || "lean"
          });
        }
        
        toast.success("Diet plan loaded!");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCompletedMeals = async () => {
    const today = new Date().toISOString().split("T")[0];
    
    // Load from localStorage first (instant)
    try {
      const stored = localStorage.getItem(`meal_completions_${today}`);
      if (stored) {
        setCompletedMeals(JSON.parse(stored));
      }
    } catch (error) {
      console.error("LocalStorage error:", error);
    }

    // Try to load from database in background
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      const { data } = await supabase
        .from("meal_completions")
        .select("*")
        .eq("user_id", currentUser.id)
        .eq("completion_date", today);

      if (data && data.length > 0) {
        const completed: Record<string, boolean> = {};
        data.forEach((item: any) => {
          const key = `${item.day}-${item.meal_name}`;
          completed[key] = item.completed;
        });
        setCompletedMeals(completed);
        // Update localStorage with database data
        localStorage.setItem(`meal_completions_${today}`, JSON.stringify(completed));
      }
    } catch (error) {
      // Silently fail, localStorage data is already loaded
      console.log("Database load skipped:", error);
    }
  };

  const toggleMealCompletion = async (day: string, mealName: string, mealData: MealItem, mealIndex: number) => {
    // Use index to make each meal unique (especially for multiple snacks)
    const key = `${day}-${mealName}-${mealIndex}`;
    const newStatus = !completedMeals[key];
    const today = new Date().toISOString().split("T")[0];

    // Update local state immediately
    const updatedMeals = { ...completedMeals, [key]: newStatus };
    setCompletedMeals(updatedMeals);

    // Save to localStorage immediately
    try {
      localStorage.setItem(`meal_completions_${today}`, JSON.stringify(updatedMeals));
      if (newStatus) {
        toast.success(`${mealData.food} completed! 🎉`);
      }
    } catch (error) {
      console.error("LocalStorage error:", error);
    }

    // Try to save to database in background
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        console.log("❌ No user found for meal completion save");
        return;
      }

      const mealRecord = {
        user_id: currentUser.id,
        day: day,
        meal_name: `${mealName}-${mealIndex}`,
        food_name: mealData.food,
        calories: mealData.calories,
        protein: mealData.protein,
        carbs: mealData.carbs,
        fats: mealData.fats,
        completed: newStatus,
        completion_date: today
      };

      console.log("💾 Saving meal completion:", mealRecord);

      const { data, error } = await supabase
        .from("meal_completions")
        .upsert(mealRecord, {
          onConflict: "user_id,day,meal_name,completion_date"
        });

      if (error) {
        console.error("❌ Database save error:", error);
        toast.error("Failed to save to database");
      } else {
        console.log("✅ Meal completion saved successfully:", data);
        
        // Broadcast to other tabs/pages to refresh
        try {
          const channel = new BroadcastChannel('nutrition_updates');
          channel.postMessage({ type: 'meal_updated', date: today });
          channel.close();
          console.log("📡 Broadcast sent to update Progress page");
        } catch (e) {
          console.log("Broadcast not supported, using localStorage event");
          // Fallback: trigger storage event
          localStorage.setItem('nutrition_update_trigger', Date.now().toString());
        }
      }
    } catch (error) {
      // Silently fail database save, localStorage is primary
      console.log("❌ Database save exception:", error);
      toast.error("Failed to save meal");
    }
  };

  const calculateDailyProgress = (day: string) => {
    if (!dietPlan || !dietPlan[day]) return { consumed: 0, target: 0, percentage: 0, macros: { protein: 0, carbs: 0, fats: 0 } };

    const meals = dietPlan[day];
    let consumedCalories = 0;
    let consumedProtein = 0;
    let consumedCarbs = 0;
    let consumedFats = 0;
    let targetCalories = 0;

    meals.forEach((meal) => {
      targetCalories += meal.calories;
      const key = `${day}-${meal.meal}`;
      if (completedMeals[key]) {
        consumedCalories += meal.calories;
        consumedProtein += meal.protein;
        consumedCarbs += meal.carbs;
        consumedFats += meal.fats;
      }
    });

    const percentage = targetCalories > 0 ? Math.round((consumedCalories / targetCalories) * 100) : 0;

    return {
      consumed: consumedCalories,
      target: targetCalories,
      percentage,
      macros: {
        protein: Math.round(consumedProtein),
        carbs: Math.round(consumedCarbs),
        fats: Math.round(consumedFats)
      }
    };
  };

  const calculateWeeklyProgress = () => {
    if (!dietPlan) return;

    const data = DAYS_OF_WEEK.map((day) => {
      const progress = calculateDailyProgress(day);
      return {
        day: day.substring(0, 3),
        "Consumed (cal)": progress.consumed,
        "Target (cal)": progress.target,
        "Protein (g)": progress.macros.protein,
        "Carbs (g)": progress.macros.carbs,
        "Fats (g)": progress.macros.fats
      };
    });

    setWeeklyData(data);
  };

  const getCurrentDayMeals = () => {
    if (!dietPlan || !dietPlan[selectedDay]) return [];
    return dietPlan[selectedDay];
  };

  const saveProgressToDatabase = async () => {
    const today = new Date().toISOString().split("T")[0];
    const meals = getCurrentDayMeals();
    
    if (meals.length === 0) {
      toast.error("No meals to save");
      return;
    }

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        toast.error("Please log in to save progress");
        return;
      }

      let savedCount = 0;
      let errorCount = 0;

      // Save all checked meals
      for (let index = 0; index < meals.length; index++) {
        const meal = meals[index];
        const key = `${selectedDay}-${meal.meal}-${index}`;
        const isCompleted = completedMeals[key] || false;

        if (isCompleted) {
          const mealRecord = {
            user_id: currentUser.id,
            day: selectedDay,
            meal_name: `${meal.meal}-${index}`,
            food_name: meal.food,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fats: meal.fats,
            completed: true,
            completion_date: today
          };

          console.log("💾 Saving meal to database:", mealRecord);

          const { error } = await supabase
            .from("meal_completions" as any)
            .upsert(mealRecord, {
              onConflict: "user_id,day,meal_name,completion_date"
            });

          if (error) {
            console.error("❌ Error saving meal:", error);
            errorCount++;
          } else {
            console.log("✅ Meal saved successfully");
            savedCount++;
          }
        }
      }

      if (savedCount > 0) {
        toast.success(`✅ Saved ${savedCount} meal${savedCount > 1 ? 's' : ''} to Progress Tracking!`);
      } else if (errorCount > 0) {
        toast.error(`Failed to save ${errorCount} meal${errorCount > 1 ? 's' : ''}`);
      } else {
        toast.info("No checked meals to save");
      }
    } catch (error) {
      console.error("❌ Save error:", error);
      toast.error("Failed to save progress");
    }
  };

  const todayProgress = calculateDailyProgress(selectedDay);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your diet plan...</p>
        </div>
      </div>
    );
  }

  if (!dietPlan) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Diet Plan Tracker</h1>
          </div>

          <Card className="p-8 text-center">
            <Apple className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Diet Plan Found</h2>
            <p className="text-muted-foreground mb-6">
              Generate your personalized AI diet plan first
            </p>
            <Button onClick={() => navigate("/ai-diet-plan")} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Generate Diet Plan
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-primary">Diet Plan Tracker</h1>
              <p className="text-muted-foreground">Track your daily nutrition and progress</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/saved-diet-plans")} variant="hero" className="gap-2">
              <Calendar className="h-4 w-4" />
              View Saved Plans
            </Button>
            <Button onClick={() => navigate("/ai-diet-plan")} variant="outline" className="gap-2">
              <Sparkles className="h-4 w-4" />
              New Plan
            </Button>
          </div>
        </div>

        {/* Plan Info */}
        {planInfo && (
          <Card className="mb-6 border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Badge variant="default" className="text-sm">
                  {planInfo.dietType === "veg" ? "🌱 Vegetarian" : "🍗 Non-Vegetarian"}
                </Badge>
                <Badge variant="secondary" className="text-sm">
                  Goal: {planInfo.bodyGoal.charAt(0).toUpperCase() + planInfo.bodyGoal.slice(1)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weekly Progress Graph */}
        <Card className="mb-6 border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Weekly Calorie & Nutrient Tracking
            </CardTitle>
            <p className="text-sm text-muted-foreground">Track your daily intake vs target goals</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="day" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #333",
                    borderRadius: "8px"
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Consumed (cal)"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ fill: "#f59e0b", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Target (cal)"
                  stroke="#888"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "#888", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Protein (g)"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="Carbs (g)"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="Fats (g)"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ fill: "#f97316", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Day Selector */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Select Day</h3>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <Button
                  key={day}
                  variant={selectedDay === day ? "default" : "outline"}
                  onClick={() => setSelectedDay(day)}
                  className="flex-col h-auto py-2"
                >
                  <span className="text-xs font-semibold">{day.substring(0, 3)}</span>
                  {selectedDay === day && (
                    <Badge variant="secondary" className="mt-1 text-[8px] px-1 py-0">
                      {todayProgress.percentage}%
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Progress */}
        <Card className="mb-6 border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-primary" />
              {selectedDay}'s Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              <div className="p-4 rounded-lg bg-card border border-border text-center">
                <p className="text-2xl font-bold text-primary">{todayProgress.consumed}</p>
                <p className="text-xs text-muted-foreground">Consumed</p>
              </div>
              <div className="p-4 rounded-lg bg-card border border-border text-center">
                <p className="text-2xl font-bold text-muted-foreground">{todayProgress.target}</p>
                <p className="text-xs text-muted-foreground">Target</p>
              </div>
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                <p className="text-2xl font-bold text-green-500">{todayProgress.macros.protein}g</p>
                <p className="text-xs text-muted-foreground">Protein</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
                <p className="text-2xl font-bold text-blue-500">{todayProgress.macros.carbs}g</p>
                <p className="text-xs text-muted-foreground">Carbs</p>
              </div>
              <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 text-center">
                <p className="text-2xl font-bold text-orange-500">{todayProgress.macros.fats}g</p>
                <p className="text-xs text-muted-foreground">Fats</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Daily Progress</span>
                <span className="font-bold text-primary">{todayProgress.percentage}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(todayProgress.percentage, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meals List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{selectedDay}'s Meals</h2>
          {getCurrentDayMeals().map((meal, index) => {
            const key = `${selectedDay}-${meal.meal}-${index}`;
            const isCompleted = completedMeals[key] || false;

            return (
              <Card
                key={index}
                className={`border-l-4 transition-all ${
                  isCompleted ? "border-l-green-500 bg-green-500/5" : "border-l-primary"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={isCompleted}
                      onCheckedChange={() => toggleMealCompletion(selectedDay, meal.meal, meal, index)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{meal.meal}</h3>
                          <p className="text-sm text-muted-foreground">{meal.food}</p>
                        </div>
                        <Badge variant={isCompleted ? "default" : "outline"}>
                          {meal.calories} cal
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-green-500">●</span>
                          <span>{meal.protein}g protein</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-blue-500">●</span>
                          <span>{meal.carbs}g carbs</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-orange-500">●</span>
                          <span>{meal.fats}g fats</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Save Progress Button */}
          {getCurrentDayMeals().length > 0 && (
            <Card className="border-primary/50 bg-gradient-to-r from-primary/10 to-primary/5 mt-6">
              <CardContent className="p-6">
                <Button
                  onClick={saveProgressToDatabase}
                  className="w-full"
                  size="lg"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Save Progress to Tracking
                </Button>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Click to sync your checked meals with Progress Tracking
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DietPlanTracker;
