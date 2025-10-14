import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Apple, Leaf, Drumstick, Save, AlertCircle, TrendingDown, Info, Flame, Utensils } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Diet = () => {
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState("");
  const [dietType, setDietType] = useState<"veg" | "nonveg">("veg");
  const [selectedDay, setSelectedDay] = useState<string>("Monday");

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Weekly calorie tracking data
  const calorieData = [
    { day: 'Mon', consumed: 1650, target: 1800, protein: 120, carbs: 180, fats: 55 },
    { day: 'Tue', consumed: 1700, target: 1800, protein: 125, carbs: 175, fats: 58 },
    { day: 'Wed', consumed: 1750, target: 1800, protein: 130, carbs: 170, fats: 60 },
    { day: 'Thu', consumed: 1680, target: 1800, protein: 122, carbs: 178, fats: 56 },
    { day: 'Fri', consumed: 1820, target: 1800, protein: 135, carbs: 185, fats: 62 },
    { day: 'Sat', consumed: 1780, target: 1800, protein: 128, carbs: 182, fats: 59 },
    { day: 'Sun', consumed: 1650, target: 1800, protein: 120, carbs: 175, fats: 55 }
  ];

  const mealPlans = {
    fatloss: {
      veg: {
        Monday: [
          { meal: "Breakfast", food: "Oats with berries & chia seeds", calories: 320, protein: 12, carbs: 48, fats: 8 },
          { meal: "Snack", food: "Green apple with almonds", calories: 150, protein: 4, carbs: 20, fats: 6 },
          { meal: "Lunch", food: "Quinoa salad with chickpeas & veggies", calories: 380, protein: 16, carbs: 52, fats: 10 },
          { meal: "Snack", food: "Low-fat Greek yogurt", calories: 120, protein: 15, carbs: 12, fats: 2 },
          { meal: "Dinner", food: "Grilled paneer with steamed broccoli", calories: 350, protein: 28, carbs: 18, fats: 16 }
        ],
        Tuesday: [
          { meal: "Breakfast", food: "Smoothie bowl with banana & spinach", calories: 300, protein: 10, carbs: 50, fats: 6 },
          { meal: "Snack", food: "Cucumber sticks with hummus", calories: 100, protein: 4, carbs: 12, fats: 4 },
          { meal: "Lunch", food: "Brown rice with lentil curry", calories: 400, protein: 18, carbs: 60, fats: 8 },
          { meal: "Snack", food: "Mixed berries", calories: 80, protein: 1, carbs: 18, fats: 0 },
          { meal: "Dinner", food: "Tofu stir-fry with vegetables", calories: 320, protein: 22, carbs: 28, fats: 12 }
        ],
        Wednesday: [
          { meal: "Breakfast", food: "Whole grain toast with avocado", calories: 340, protein: 12, carbs: 42, fats: 14 },
          { meal: "Snack", food: "Carrot sticks with peanut butter", calories: 140, protein: 6, carbs: 14, fats: 8 },
          { meal: "Lunch", food: "Chickpea salad with olive oil", calories: 380, protein: 16, carbs: 48, fats: 12 },
          { meal: "Snack", food: "Protein shake", calories: 150, protein: 20, carbs: 10, fats: 3 },
          { meal: "Dinner", food: "Grilled vegetables with cottage cheese", calories: 310, protein: 24, carbs: 20, fats: 14 }
        ],
        Thursday: [
          { meal: "Breakfast", food: "Vegetable upma with nuts", calories: 330, protein: 11, carbs: 46, fats: 10 },
          { meal: "Snack", food: "Orange & walnuts", calories: 160, protein: 4, carbs: 18, fats: 8 },
          { meal: "Lunch", food: "Mixed vegetable curry with roti", calories: 390, protein: 14, carbs: 58, fats: 10 },
          { meal: "Snack", food: "Low-fat yogurt with berries", calories: 130, protein: 12, carbs: 16, fats: 2 },
          { meal: "Dinner", food: "Mushroom & spinach soup with tofu", calories: 300, protein: 20, carbs: 24, fats: 12 }
        ],
        Friday: [
          { meal: "Breakfast", food: "Chia pudding with mango", calories: 310, protein: 10, carbs: 44, fats: 10 },
          { meal: "Snack", food: "Roasted chickpeas", calories: 120, protein: 6, carbs: 18, fats: 3 },
          { meal: "Lunch", food: "Vegetable pulao with raita", calories: 400, protein: 12, carbs: 62, fats: 10 },
          { meal: "Snack", food: "Green tea with almonds", calories: 100, protein: 4, carbs: 6, fats: 7 },
          { meal: "Dinner", food: "Palak paneer with salad", calories: 340, protein: 26, carbs: 20, fats: 16 }
        ],
        Saturday: [
          { meal: "Breakfast", food: "Moong dal chilla with chutney", calories: 320, protein: 16, carbs: 42, fats: 8 },
          { meal: "Snack", food: "Apple with peanut butter", calories: 150, protein: 5, carbs: 18, fats: 7 },
          { meal: "Lunch", food: "Rajma with brown rice", calories: 410, protein: 18, carbs: 64, fats: 8 },
          { meal: "Snack", food: "Fruit salad", calories: 90, protein: 2, carbs: 22, fats: 0 },
          { meal: "Dinner", food: "Grilled paneer tikka with veggies", calories: 330, protein: 28, carbs: 16, fats: 16 }
        ],
        Sunday: [
          { meal: "Breakfast", food: "Vegetable poha with peanuts", calories: 310, protein: 10, carbs: 48, fats: 8 },
          { meal: "Snack", food: "Buttermilk with nuts", calories: 110, protein: 6, carbs: 10, fats: 5 },
          { meal: "Lunch", food: "Mix veg curry with roti", calories: 380, protein: 14, carbs: 56, fats: 10 },
          { meal: "Snack", food: "Roasted makhana", calories: 100, protein: 4, carbs: 16, fats: 2 },
          { meal: "Dinner", food: "Dal tadka with salad", calories: 320, protein: 18, carbs: 42, fats: 8 }
        ]
      },
      nonveg: {
        Monday: [
          { meal: "Breakfast", food: "Egg white omelette with toast", calories: 300, protein: 24, carbs: 32, fats: 8 },
          { meal: "Snack", food: "Protein shake", calories: 150, protein: 20, carbs: 10, fats: 3 },
          { meal: "Lunch", food: "Grilled chicken breast with quinoa", calories: 420, protein: 38, carbs: 40, fats: 10 },
          { meal: "Snack", food: "Tuna with whole grain crackers", calories: 180, protein: 18, carbs: 16, fats: 5 },
          { meal: "Dinner", food: "Baked fish with steamed vegetables", calories: 350, protein: 32, carbs: 20, fats: 14 }
        ],
        Tuesday: [
          { meal: "Breakfast", food: "Scrambled eggs with avocado", calories: 340, protein: 22, carbs: 24, fats: 16 },
          { meal: "Snack", food: "Greek yogurt with berries", calories: 140, protein: 15, carbs: 14, fats: 3 },
          { meal: "Lunch", food: "Turkey breast wrap with veggies", calories: 400, protein: 36, carbs: 38, fats: 10 },
          { meal: "Snack", food: "Boiled egg whites", calories: 80, protein: 14, carbs: 2, fats: 0 },
          { meal: "Dinner", food: "Grilled chicken with broccoli", calories: 380, protein: 40, carbs: 18, fats: 14 }
        ],
        Wednesday: [
          { meal: "Breakfast", food: "Protein pancakes with berries", calories: 320, protein: 26, carbs: 36, fats: 8 },
          { meal: "Snack", food: "Cottage cheese with cucumber", calories: 120, protein: 16, carbs: 8, fats: 3 },
          { meal: "Lunch", food: "Grilled salmon with sweet potato", calories: 440, protein: 38, carbs: 42, fats: 12 },
          { meal: "Snack", food: "Turkey slices with apple", calories: 160, protein: 16, carbs: 18, fats: 3 },
          { meal: "Dinner", food: "Chicken stir-fry with vegetables", calories: 360, protein: 36, carbs: 24, fats: 12 }
        ],
        Thursday: [
          { meal: "Breakfast", food: "Egg muffins with spinach", calories: 310, protein: 24, carbs: 20, fats: 14 },
          { meal: "Snack", food: "Protein bar", calories: 150, protein: 15, carbs: 16, fats: 5 },
          { meal: "Lunch", food: "Grilled chicken salad", calories: 380, protein: 38, carbs: 28, fats: 12 },
          { meal: "Snack", food: "Tuna salad", calories: 140, protein: 20, carbs: 8, fats: 4 },
          { meal: "Dinner", food: "Baked cod with asparagus", calories: 340, protein: 36, carbs: 18, fats: 12 }
        ],
        Friday: [
          { meal: "Breakfast", food: "Turkey bacon with eggs", calories: 330, protein: 28, carbs: 16, fats: 16 },
          { meal: "Snack", food: "Protein smoothie", calories: 160, protein: 18, carbs: 14, fats: 4 },
          { meal: "Lunch", food: "Grilled chicken breast with rice", calories: 420, protein: 40, carbs: 44, fats: 8 },
          { meal: "Snack", food: "Boiled eggs", calories: 140, protein: 12, carbs: 2, fats: 10 },
          { meal: "Dinner", food: "Shrimp with zucchini noodles", calories: 330, protein: 34, carbs: 20, fats: 12 }
        ],
        Saturday: [
          { meal: "Breakfast", food: "Egg white frittata with veggies", calories: 300, protein: 26, carbs: 24, fats: 10 },
          { meal: "Snack", food: "Greek yogurt with nuts", calories: 170, protein: 16, carbs: 12, fats: 8 },
          { meal: "Lunch", food: "Turkey meatballs with marinara", calories: 400, protein: 38, carbs: 32, fats: 12 },
          { meal: "Snack", food: "Tuna with rice cakes", calories: 150, protein: 18, carbs: 14, fats: 3 },
          { meal: "Dinner", food: "Grilled chicken with roasted veggies", calories: 380, protein: 40, carbs: 22, fats: 14 }
        ],
        Sunday: [
          { meal: "Breakfast", food: "Scrambled eggs with salmon", calories: 350, protein: 30, carbs: 18, fats: 16 },
          { meal: "Snack", food: "Protein shake", calories: 150, protein: 20, carbs: 10, fats: 3 },
          { meal: "Lunch", food: "Grilled chicken wrap", calories: 400, protein: 36, carbs: 38, fats: 10 },
          { meal: "Snack", food: "Cottage cheese", calories: 110, protein: 14, carbs: 8, fats: 2 },
          { meal: "Dinner", food: "Baked fish with green beans", calories: 330, protein: 34, carbs: 20, fats: 12 }
        ]
      }
    },
    lean: {
      veg: {
        Monday: [
          { meal: "Breakfast", food: "Oats with berries", calories: 350, protein: 12, carbs: 52, fats: 10 },
          { meal: "Snack", food: "Greek yogurt with almonds", calories: 200, protein: 16, carbs: 18, fats: 8 },
          { meal: "Lunch", food: "Quinoa salad with chickpeas", calories: 450, protein: 18, carbs: 62, fats: 12 },
          { meal: "Snack", food: "Apple with peanut butter", calories: 180, protein: 6, carbs: 22, fats: 8 },
          { meal: "Dinner", food: "Grilled paneer with veggies", calories: 400, protein: 28, carbs: 24, fats: 18 }
        ]
      },
      nonveg: {
        Monday: [
          { meal: "Breakfast", food: "Egg whites with toast", calories: 300, protein: 26, carbs: 34, fats: 6 },
          { meal: "Snack", food: "Protein shake", calories: 150, protein: 20, carbs: 10, fats: 3 },
          { meal: "Lunch", food: "Grilled chicken salad", calories: 400, protein: 38, carbs: 28, fats: 12 },
          { meal: "Snack", food: "Tuna with crackers", calories: 200, protein: 22, carbs: 18, fats: 5 },
          { meal: "Dinner", food: "Baked fish with broccoli", calories: 380, protein: 36, carbs: 22, fats: 14 }
        ]
      }
    },
    bulk: {
      veg: {
        Monday: [
          { meal: "Breakfast", food: "Smoothie bowl with nuts", calories: 550, protein: 18, carbs: 72, fats: 20 },
          { meal: "Snack", food: "Cheese sandwich", calories: 350, protein: 16, carbs: 42, fats: 14 },
          { meal: "Lunch", food: "Dal with rice and paneer", calories: 700, protein: 32, carbs: 88, fats: 22 },
          { meal: "Snack", food: "Protein bar with milk", calories: 300, protein: 18, carbs: 36, fats: 10 },
          { meal: "Dinner", food: "Pasta with tofu", calories: 600, protein: 28, carbs: 78, fats: 18 }
        ]
      },
      nonveg: {
        Monday: [
          { meal: "Breakfast", food: "Eggs with bacon and toast", calories: 600, protein: 36, carbs: 48, fats: 26 },
          { meal: "Snack", food: "Protein shake with banana", calories: 350, protein: 28, carbs: 42, fats: 8 },
          { meal: "Lunch", food: "Chicken rice bowl", calories: 750, protein: 48, carbs: 88, fats: 20 },
          { meal: "Snack", food: "Beef jerky", calories: 200, protein: 22, carbs: 8, fats: 8 },
          { meal: "Dinner", food: "Steak with sweet potato", calories: 700, protein: 52, carbs: 62, fats: 24 }
        ]
      }
    },
    athletic: {
      veg: {
        Monday: [
          { meal: "Breakfast", food: "Whole grain toast with avocado", calories: 400, protein: 14, carbs: 48, fats: 18 },
          { meal: "Snack", food: "Mixed nuts", calories: 250, protein: 8, carbs: 18, fats: 18 },
          { meal: "Lunch", food: "Lentil curry with brown rice", calories: 550, protein: 22, carbs: 76, fats: 14 },
          { meal: "Snack", food: "Protein smoothie", calories: 300, protein: 20, carbs: 32, fats: 10 },
          { meal: "Dinner", food: "Vegetable stir-fry with tofu", calories: 500, protein: 26, carbs: 54, fats: 18 }
        ]
      },
      nonveg: {
        Monday: [
          { meal: "Breakfast", food: "Scrambled eggs with salmon", calories: 450, protein: 32, carbs: 28, fats: 22 },
          { meal: "Snack", food: "Greek yogurt", calories: 200, protein: 18, carbs: 16, fats: 6 },
          { meal: "Lunch", food: "Turkey wrap with veggies", calories: 500, protein: 38, carbs: 48, fats: 14 },
          { meal: "Snack", food: "Cottage cheese with fruit", calories: 250, protein: 20, carbs: 28, fats: 6 },
          { meal: "Dinner", food: "Grilled chicken with quinoa", calories: 550, protein: 42, carbs: 58, fats: 14 }
        ]
      }
    }
  };

  const filterAllergies = (meals: any[]) => {
    return meals.filter(meal => 
      !allergies.some(allergy => 
        meal.food.toLowerCase().includes(allergy.toLowerCase())
      )
    );
  };

  const getAlternativeFood = (originalFood: string) => {
    const alternatives: Record<string, string> = {
      "milk": "almond milk",
      "peanuts": "sunflower seeds",
      "gluten": "gluten-free grains",
      "eggs": "tofu scramble",
      "fish": "tempeh",
      "chicken": "mushrooms",
      "paneer": "tofu"
    };
    
    for (const [allergen, alternative] of Object.entries(alternatives)) {
      if (originalFood.toLowerCase().includes(allergen)) {
        return originalFood.replace(new RegExp(allergen, 'gi'), alternative);
      }
    }
    return originalFood;
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

        {/* Disclaimer */}
        <Card className="mb-6 border-primary/50 bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              <strong>Note:</strong> You can access any feature based on your need — choose what suits your fitness goal. 
              These meal plans are guidelines; adjust portions based on your body's response and consult a nutritionist for personalized advice.
            </p>
          </CardContent>
        </Card>

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

        {/* Weekly Calorie Tracking Graph */}
        <Card className="mb-6 border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-primary" />
              Weekly Calorie & Nutrient Tracking
            </CardTitle>
            <CardDescription>Track your daily intake vs target goals</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={calorieData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="consumed" stroke="hsl(var(--primary))" strokeWidth={2} name="Consumed (cal)" />
                <Line type="monotone" dataKey="target" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" name="Target (cal)" />
                <Line type="monotone" dataKey="protein" stroke="#22c55e" strokeWidth={2} name="Protein (g)" />
                <Line type="monotone" dataKey="carbs" stroke="#3b82f6" strokeWidth={2} name="Carbs (g)" />
                <Line type="monotone" dataKey="fats" stroke="#f59e0b" strokeWidth={2} name="Fats (g)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Meal Plans */}
        <Tabs defaultValue="fatloss" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="fatloss">
              <TrendingDown className="w-4 h-4 mr-2" />
              Fat Loss
            </TabsTrigger>
            <TabsTrigger value="lean">Lean Body</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Body</TabsTrigger>
            <TabsTrigger value="athletic">Athletic</TabsTrigger>
          </TabsList>

          {Object.entries(mealPlans).map(([plan, meals]) => {
            const planMeals = meals[dietType]?.[selectedDay] || [];
            const filteredMeals = filterAllergies(planMeals);
            const totalCalories = filteredMeals.reduce((sum, meal) => sum + meal.calories, 0);
            const totalProtein = filteredMeals.reduce((sum, meal) => sum + meal.protein, 0);
            const totalCarbs = filteredMeals.reduce((sum, meal) => sum + meal.carbs, 0);
            const totalFats = filteredMeals.reduce((sum, meal) => sum + meal.fats, 0);

            return (
              <TabsContent key={plan} value={plan} className="space-y-4 animate-fade-in">
                {plan === 'fatloss' && (
                  <Card className="border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingDown className="w-6 h-6" />
                        Fat Loss Explained
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p><strong>Calorie Deficit:</strong> Consume 300-500 calories below your maintenance to lose fat gradually.</p>
                      <p><strong>Meal Timing:</strong> Space meals 3-4 hours apart to maintain metabolism and avoid energy crashes.</p>
                      <p><strong>Healthy Fats:</strong> Include sources like nuts, seeds, and avocados for hormone balance.</p>
                      <p><strong>Portion Control:</strong> Use smaller plates, track portions, and avoid processed foods.</p>
                      <p><strong>Hydration:</strong> Drink 3-4 liters of water daily to support fat metabolism.</p>
                    </CardContent>
                  </Card>
                )}

                {/* Week Day Selector */}
                <Card className="border-primary/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                      <Utensils className="w-5 h-5 text-primary flex-shrink-0" />
                      {weekDays.map((day) => (
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

                <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
                  <CardHeader>
                    <CardTitle className="text-2xl capitalize">{plan === 'fatloss' ? 'Fat Loss' : plan} - {selectedDay}</CardTitle>
                    <CardDescription>
                      {dietType === "veg" ? "🌱 Vegetarian" : "🍖 Non-Vegetarian"} • 
                      {totalCalories} cal • {totalProtein}g protein • {totalCarbs}g carbs • {totalFats}g fats
                    </CardDescription>
                  </CardHeader>
                </Card>

                <div className="grid gap-4">
                  {filteredMeals.map((meal, i) => (
                    <Card key={i} className="border-border hover:border-primary transition-all hover-scale">
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <Badge variant="outline" className="mb-2">{meal.meal}</Badge>
                            <h3 className="font-semibold text-lg">{meal.food}</h3>
                            <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                              <span>P: {meal.protein}g</span>
                              <span>C: {meal.carbs}g</span>
                              <span>F: {meal.fats}g</span>
                            </div>
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

                {filteredMeals.length === 0 && (
                  <Card className="border-dashed">
                    <CardContent className="py-8 text-center text-muted-foreground">
                      <p>Select a day to view the meal plan</p>
                    </CardContent>
                  </Card>
                )}

                <Button variant="hero" size="lg" className="w-full" onClick={() => toast.success(`${selectedDay}'s ${plan} plan saved!`)}>
                  <Save className="w-5 h-5 mr-2" />
                  Save {selectedDay}'s Meal Plan
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
