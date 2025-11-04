import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Pill, Info, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getSupplementRecommendations } from "@/utils/personalization";

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
  const [notFound, setNotFound] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    age: number | null;
    fitness_goal: string | null;
    diet_type: string | null;
  }>({ age: null, fitness_goal: null, diet_type: null });
  const [personalizedSupplements, setPersonalizedSupplements] = useState<ReturnType<typeof getSupplementRecommendations>>([]);

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

  const handleSearch = () => {
    const food = searchFood.toLowerCase().trim();
    if (foodMacros[food]) {
      setMacroResult(foodMacros[food]);
      setNotFound(false);
    } else {
      setMacroResult(null);
      setNotFound(true);
    }
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
          <Pill className="h-8 w-8 text-primary" />
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

        {/* Macro Info Search */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Food Macro Information</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Search for any food to see its nutritional breakdown
          </p>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Enter food name (e.g., Paneer, Rice, Chicken)"
              value={searchFood}
              onChange={(e) => {
                setSearchFood(e.target.value);
                setNotFound(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} className="gap-2">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>

          {macroResult && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 animate-fade-in">
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
          )}

          {notFound && (
            <div className="p-4 rounded-lg bg-destructive/10 text-center animate-fade-in">
              <p className="text-sm text-destructive">Food not found in database</p>
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

        {/* Supplements Grid */}
        <h2 className="text-2xl font-bold mb-4">
          {personalizedSupplements.length > 0 ? "Your Recommended Supplements" : "Popular Supplements"}
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {(personalizedSupplements.length > 0 ? personalizedSupplements : supplements).map((supplement) => (
            <Card key={supplement.name} className={`p-6 hover:border-primary/50 transition-colors ${
              'priority' in supplement && supplement.priority === 'high' ? 'border-primary/30' : ''
            }`}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-bold text-primary">{supplement.name}</h3>
                {'priority' in supplement && (
                  <Badge variant={supplement.priority === 'high' ? 'default' : 'outline'}>
                    {supplement.priority === 'high' ? 'Recommended' : supplement.priority}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-4">{supplement.description}</p>
              
              {supplement.warning && (
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-xs text-destructive font-medium">⚠️ {supplement.warning}</p>
                </div>
              )}

              <div className="mb-4">
                <p className="text-xs font-semibold mb-2">Benefits:</p>
                <div className="flex flex-wrap gap-2">
                  {supplement.benefits.map((benefit) => (
                    <Badge key={benefit} variant="secondary">{benefit}</Badge>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <p className="text-sm">
                  <span className="font-semibold">Dosage:</span> {supplement.dosage}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Nutrition;
