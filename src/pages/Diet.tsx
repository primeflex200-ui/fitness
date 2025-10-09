import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Apple, Leaf, Drumstick, Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const Diet = () => {
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState("");
  const [dietType, setDietType] = useState<"veg" | "nonveg">("veg");

  const mealPlans = {
    lean: {
      veg: [
        { meal: "Breakfast", food: "Oats with berries", calories: 350 },
        { meal: "Snack", food: "Greek yogurt with almonds", calories: 200 },
        { meal: "Lunch", food: "Quinoa salad with chickpeas", calories: 450 },
        { meal: "Snack", food: "Apple with peanut butter", calories: 180 },
        { meal: "Dinner", food: "Grilled paneer with veggies", calories: 400 }
      ],
      nonveg: [
        { meal: "Breakfast", food: "Egg whites with toast", calories: 300 },
        { meal: "Snack", food: "Protein shake", calories: 150 },
        { meal: "Lunch", food: "Grilled chicken salad", calories: 400 },
        { meal: "Snack", food: "Tuna with crackers", calories: 200 },
        { meal: "Dinner", food: "Baked fish with broccoli", calories: 380 }
      ]
    },
    bulk: {
      veg: [
        { meal: "Breakfast", food: "Smoothie bowl with nuts", calories: 550 },
        { meal: "Snack", food: "Cheese sandwich", calories: 350 },
        { meal: "Lunch", food: "Dal with rice and paneer", calories: 700 },
        { meal: "Snack", food: "Protein bar with milk", calories: 300 },
        { meal: "Dinner", food: "Pasta with tofu", calories: 600 }
      ],
      nonveg: [
        { meal: "Breakfast", food: "Eggs with bacon and toast", calories: 600 },
        { meal: "Snack", food: "Protein shake with banana", calories: 350 },
        { meal: "Lunch", food: "Chicken rice bowl", calories: 750 },
        { meal: "Snack", food: "Beef jerky", calories: 200 },
        { meal: "Dinner", food: "Steak with sweet potato", calories: 700 }
      ]
    },
    athletic: {
      veg: [
        { meal: "Breakfast", food: "Whole grain toast with avocado", calories: 400 },
        { meal: "Snack", food: "Mixed nuts", calories: 250 },
        { meal: "Lunch", food: "Lentil curry with brown rice", calories: 550 },
        { meal: "Snack", food: "Protein smoothie", calories: 300 },
        { meal: "Dinner", food: "Vegetable stir-fry with tofu", calories: 500 }
      ],
      nonveg: [
        { meal: "Breakfast", food: "Scrambled eggs with salmon", calories: 450 },
        { meal: "Snack", food: "Greek yogurt", calories: 200 },
        { meal: "Lunch", food: "Turkey wrap with veggies", calories: 500 },
        { meal: "Snack", food: "Cottage cheese with fruit", calories: 250 },
        { meal: "Dinner", food: "Grilled chicken with quinoa", calories: 550 }
      ]
    }
  };

  const filterAllergies = (meals: typeof mealPlans.lean.veg) => {
    return meals.filter(meal => 
      !allergies.some(allergy => 
        meal.food.toLowerCase().includes(allergy.toLowerCase())
      )
    );
  };

  const addAllergy = () => {
    if (allergyInput.trim()) {
      setAllergies([...allergies, allergyInput.trim()]);
      setAllergyInput("");
      toast.success(`"${allergyInput}" added to allergy list`);
    }
  };

  const removeAllergy = (allergy: string) => {
    setAllergies(allergies.filter(a => a !== allergy));
    toast.info(`"${allergy}" removed from allergy list`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <Apple className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">Diet Plans</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Nutrition Guidance</h1>
          <p className="text-muted-foreground">Personalized meal plans for your fitness goals</p>
        </div>

        {/* Allergy Filter */}
        <Card className="mb-6 border-primary/30 bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Allergy & Food Preferences
            </CardTitle>
            <CardDescription>
              Tell us what to avoid in your meal plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <div className="flex-1">
                <Label htmlFor="allergy">Food to Avoid</Label>
                <Input
                  id="allergy"
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  placeholder="e.g., milk, peanuts, gluten..."
                  onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
                />
              </div>
              <Button onClick={addAllergy} variant="hero" className="mt-6">
                Add
              </Button>
            </div>
            {allergies.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {allergies.map((allergy, i) => (
                  <Badge 
                    key={i} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeAllergy(allergy)}
                  >
                    {allergy} ✕
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Diet Type Toggle */}
        <div className="flex gap-4 mb-6">
          <Button
            variant={dietType === "veg" ? "hero" : "outline"}
            onClick={() => setDietType("veg")}
            className="flex-1"
          >
            <Leaf className="w-4 h-4 mr-2" />
            Vegetarian
          </Button>
          <Button
            variant={dietType === "nonveg" ? "hero" : "outline"}
            onClick={() => setDietType("nonveg")}
            className="flex-1"
          >
            <Drumstick className="w-4 h-4 mr-2" />
            Non-Vegetarian
          </Button>
        </div>

        {/* Meal Plans */}
        <Tabs defaultValue="lean" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="lean">Lean Body</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Body</TabsTrigger>
            <TabsTrigger value="athletic">Athletic</TabsTrigger>
          </TabsList>

          {Object.entries(mealPlans).map(([plan, meals]) => {
            const planMeals = meals[dietType];
            const filteredMeals = filterAllergies(planMeals);
            const totalCalories = filteredMeals.reduce((sum, meal) => sum + meal.calories, 0);

            return (
              <TabsContent key={plan} value={plan} className="space-y-4 animate-fade-in">
                <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
                  <CardHeader>
                    <CardTitle className="text-2xl capitalize">{plan} Body Plan</CardTitle>
                    <CardDescription>
                      {dietType === "veg" ? "🌱 Vegetarian" : "🍖 Non-Vegetarian"} • Total: {totalCalories} cal/day
                    </CardDescription>
                  </CardHeader>
                </Card>

                <div className="grid gap-4">
                  {filteredMeals.map((meal, i) => (
                    <Card key={i} className="border-border hover:border-primary transition-all hover-scale">
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Badge variant="outline" className="mb-2">{meal.meal}</Badge>
                            <h3 className="font-semibold text-lg">{meal.food}</h3>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">{meal.calories}</div>
                            <div className="text-xs text-muted-foreground">calories</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button variant="hero" size="lg" className="w-full">
                  <Save className="w-5 h-5 mr-2" />
                  Save Meal Plan
                </Button>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
};

export default Diet;
