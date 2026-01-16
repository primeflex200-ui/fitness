import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2, Loader2, Save, Edit2, X, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { getFoodNutritionFromAI } from "@/services/aiFoodService";

interface MealItem {
  id: string;
  meal: string;
  food: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

const DietPlanEditor = () => {
  const { day = "Monday" } = useParams();
  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  const [currentDay, setCurrentDay] = useState(day || "Monday");
  const [meals, setMeals] = useState<MealItem[]>([]);
  const [foodInput, setFoodInput] = useState("");
  const [mealType, setMealType] = useState("Breakfast");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<MealItem>>({});
  const [macroTargets, setMacroTargets] = useState<MacroTargets>({
    calories: 1800,
    protein: 150,
    carbs: 200,
    fats: 60
  });
  const [showTargetEditor, setShowTargetEditor] = useState(false);

  // Load meals and targets from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`diet-plan-${currentDay}`);
    if (saved) {
      setMeals(JSON.parse(saved));
    } else {
      setMeals([]);
    }

    const savedTargets = localStorage.getItem("macro-targets");
    if (savedTargets) {
      setMacroTargets(JSON.parse(savedTargets));
    }
  }, [currentDay]);

  // Calculate totals
  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fats: acc.fats + meal.fats
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const addFoodWithAI = async () => {
    if (!foodInput.trim()) {
      toast.error("Please enter a food name");
      return;
    }

    setLoading(true);
    try {
      const nutrition = await getFoodNutritionFromAI(foodInput);
      
      const newMeal: MealItem = {
        id: Date.now().toString(),
        meal: mealType,
        food: nutrition.name,
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fats: nutrition.fats
      };

      const updatedMeals = [...meals, newMeal];
      setMeals(updatedMeals);
      localStorage.setItem(`diet-plan-${currentDay}`, JSON.stringify(updatedMeals));
      
      setFoodInput("");
      toast.success(`${nutrition.name} added to ${mealType}!`);
    } catch (error) {
      toast.error("Failed to get food information");
    } finally {
      setLoading(false);
    }
  };

  const removeMeal = (id: string) => {
    const updatedMeals = meals.filter(m => m.id !== id);
    setMeals(updatedMeals);
    localStorage.setItem(`diet-plan-${currentDay}`, JSON.stringify(updatedMeals));
    toast.info("Meal removed");
  };

  const startEditing = (meal: MealItem) => {
    setEditingId(meal.id);
    setEditValues(meal);
  };

  const saveEdit = () => {
    if (!editingId) return;
    
    const updatedMeals = meals.map(m =>
      m.id === editingId ? { ...m, ...editValues } : m
    );
    setMeals(updatedMeals);
    localStorage.setItem(`diet-plan-${currentDay}`, JSON.stringify(updatedMeals));
    setEditingId(null);
    setEditValues({});
    toast.success("Meal updated!");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const updateMacroTargets = () => {
    localStorage.setItem("macro-targets", JSON.stringify(macroTargets));
    setShowTargetEditor(false);
    toast.success("Macro targets updated!");
  };

  const getMacroPercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  const getCalorieStatus = () => {
    const diff = totals.calories - macroTargets.calories;
    if (Math.abs(diff) <= 50) return "on-track";
    return diff > 0 ? "over" : "under";
  };

  const savePlan = async () => {
    setSaving(true);
    try {
      toast.success("Diet plan saved successfully!");
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
            <span className="text-xl font-bold">Diet Plan Editor</span>
          </div>
          <Button onClick={savePlan} disabled={saving} variant="hero">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Plan"}
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Day Selector */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {weekDays.map((d) => (
                <Button
                  key={d}
                  variant={currentDay === d ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentDay(d)}
                  className="whitespace-nowrap"
                >
                  {d}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Food Input */}
            <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🤖 AI Food Assistant
                </CardTitle>
                <CardDescription>
                  Type a food name and AI will automatically fill nutritional details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="meal-type">Meal Type</Label>
                  <select
                    id="meal-type"
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option>Breakfast</option>
                    <option>Snack</option>
                    <option>Lunch</option>
                    <option>Snack</option>
                    <option>Dinner</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="food-input">Food Name</Label>
                  <div className="flex gap-2">
                    <Input
                      id="food-input"
                      placeholder="e.g., Grilled chicken breast, Brown rice, Apple..."
                      value={foodInput}
                      onChange={(e) => setFoodInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addFoodWithAI()}
                      disabled={loading}
                    />
                    <Button
                      onClick={addFoodWithAI}
                      disabled={loading || !foodInput.trim()}
                      variant="hero"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Meals List */}
            <div className="space-y-3">
              {meals.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <p>No meals added yet. Start by typing a food name above!</p>
                  </CardContent>
                </Card>
              ) : (
                meals.map((meal) => (
                  <Card key={meal.id} className="border-border hover:border-primary transition-all">
                    <CardContent className="p-4">
                      {editingId === meal.id ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">Calories</Label>
                              <Input
                                type="number"
                                value={editValues.calories || 0}
                                onChange={(e) => setEditValues({ ...editValues, calories: parseInt(e.target.value) })}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Protein (g)</Label>
                              <Input
                                type="number"
                                value={editValues.protein || 0}
                                onChange={(e) => setEditValues({ ...editValues, protein: parseInt(e.target.value) })}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Carbs (g)</Label>
                              <Input
                                type="number"
                                value={editValues.carbs || 0}
                                onChange={(e) => setEditValues({ ...editValues, carbs: parseInt(e.target.value) })}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Fats (g)</Label>
                              <Input
                                type="number"
                                value={editValues.fats || 0}
                                onChange={(e) => setEditValues({ ...editValues, fats: parseInt(e.target.value) })}
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={saveEdit} variant="hero">Save</Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{meal.meal}</Badge>
                              <h3 className="font-semibold">{meal.food}</h3>
                            </div>
                            <div className="grid grid-cols-4 gap-2 text-sm">
                              <div>
                                <p className="text-muted-foreground">Calories</p>
                                <p className="font-semibold text-primary">{meal.calories}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Protein</p>
                                <p className="font-semibold">{meal.protein}g</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Carbs</p>
                                <p className="font-semibold">{meal.carbs}g</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Fats</p>
                                <p className="font-semibold">{meal.fats}g</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => startEditing(meal)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeMeal(meal.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-4">
            {/* Macro Targets Card */}
            <Card className="border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Macro Targets
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowTargetEditor(!showTargetEditor)}
                  >
                    {showTargetEditor ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {showTargetEditor ? (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">Calories</Label>
                      <Input
                        type="number"
                        value={macroTargets.calories}
                        onChange={(e) => setMacroTargets({ ...macroTargets, calories: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Protein (g)</Label>
                      <Input
                        type="number"
                        value={macroTargets.protein}
                        onChange={(e) => setMacroTargets({ ...macroTargets, protein: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Carbs (g)</Label>
                      <Input
                        type="number"
                        value={macroTargets.carbs}
                        onChange={(e) => setMacroTargets({ ...macroTargets, carbs: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Fats (g)</Label>
                      <Input
                        type="number"
                        value={macroTargets.fats}
                        onChange={(e) => setMacroTargets({ ...macroTargets, fats: parseInt(e.target.value) })}
                      />
                    </div>
                    <Button size="sm" onClick={updateMacroTargets} className="w-full">Save Targets</Button>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Calories:</span>
                      <span className="font-semibold">{macroTargets.calories}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Protein:</span>
                      <span className="font-semibold">{macroTargets.protein}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Carbs:</span>
                      <span className="font-semibold">{macroTargets.carbs}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fats:</span>
                      <span className="font-semibold">{macroTargets.fats}g</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Daily Summary */}
            <Card className="border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">{currentDay}'s Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className={`p-3 bg-background rounded-lg border-2 ${
                    getCalorieStatus() === "on-track" ? "border-green-500/50" :
                    getCalorieStatus() === "over" ? "border-orange-500/50" : "border-blue-500/50"
                  }`}>
                    <p className="text-sm text-muted-foreground">Total Calories</p>
                    <p className="text-3xl font-bold text-primary">{totals.calories}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Target: {macroTargets.calories} ({totals.calories - macroTargets.calories > 0 ? "+" : ""}{totals.calories - macroTargets.calories})
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 bg-background rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">Protein</p>
                      <p className="text-xl font-bold">{totals.protein}g</p>
                      <p className="text-xs text-muted-foreground mt-1">/{macroTargets.protein}g</p>
                    </div>
                    <div className="p-3 bg-background rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">Carbs</p>
                      <p className="text-xl font-bold">{totals.carbs}g</p>
                      <p className="text-xs text-muted-foreground mt-1">/{macroTargets.carbs}g</p>
                    </div>
                    <div className="p-3 bg-background rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">Fats</p>
                      <p className="text-xl font-bold">{totals.fats}g</p>
                      <p className="text-xs text-muted-foreground mt-1">/{macroTargets.fats}g</p>
                    </div>
                  </div>

                  <div className="p-3 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Macro Breakdown</p>
                    <div className="space-y-1 text-sm">
                      <p>Protein: {totals.calories > 0 ? Math.round((totals.protein * 4 / totals.calories) * 100) : 0}%</p>
                      <p>Carbs: {totals.calories > 0 ? Math.round((totals.carbs * 4 / totals.calories) * 100) : 0}%</p>
                      <p>Fats: {totals.calories > 0 ? Math.round((totals.fats * 9 / totals.calories) * 100) : 0}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Meal Count</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">{meals.length}</p>
                <p className="text-xs text-muted-foreground">meals added</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DietPlanEditor;
