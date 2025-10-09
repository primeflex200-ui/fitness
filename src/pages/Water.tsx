import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Droplet, Plus, Minus } from "lucide-react";
import { toast } from "sonner";

const Water = () => {
  const [dailyGoal, setDailyGoal] = useState(2500); // ml
  const [consumed, setConsumed] = useState(1200); // ml

  const addWater = (amount: number) => {
    const newAmount = Math.min(consumed + amount, dailyGoal + 1000);
    setConsumed(newAmount);
    toast.success(`Added ${amount}ml of water`);
  };

  const removeWater = (amount: number) => {
    const newAmount = Math.max(consumed - amount, 0);
    setConsumed(newAmount);
    toast.info(`Removed ${amount}ml`);
  };

  const percentage = Math.min((consumed / dailyGoal) * 100, 100);
  const glassesConsumed = Math.floor(consumed / 250);
  const glassesGoal = Math.ceil(dailyGoal / 250);

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
            <Droplet className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">Water Reminder</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Stay Hydrated</h1>
          <p className="text-muted-foreground">Track your daily water intake</p>
        </div>

        {/* Main Tracker */}
        <Card className="mb-8 border-primary/50 bg-gradient-to-br from-cyan-500/10 to-transparent">
          <CardHeader className="text-center">
            <div className="relative w-40 h-40 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-8 border-muted"></div>
              <div 
                className="absolute inset-0 rounded-full border-8 border-cyan-500 transition-all duration-500"
                style={{
                  clipPath: `inset(${100 - percentage}% 0 0 0)`,
                }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Droplet className="w-16 h-16 text-cyan-500" />
              </div>
            </div>
            <CardTitle className="text-4xl font-bold text-cyan-500">
              {consumed}ml
            </CardTitle>
            <CardDescription className="text-lg">
              of {dailyGoal}ml daily goal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={percentage} className="h-3 mb-4" />
            <div className="text-center text-sm text-muted-foreground">
              {glassesConsumed} / {glassesGoal} glasses (250ml each)
            </div>
          </CardContent>
        </Card>

        {/* Quick Add */}
        <Card className="mb-8 border-border bg-card/50">
          <CardHeader>
            <CardTitle>Quick Add</CardTitle>
            <CardDescription>Log your water intake</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[250, 500, 750].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  className="h-20 hover:border-cyan-500 hover:text-cyan-500"
                  onClick={() => addWater(amount)}
                >
                  <div>
                    <Plus className="w-5 h-5 mx-auto mb-1" />
                    <div className="font-bold">{amount}ml</div>
                  </div>
                </Button>
              ))}
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => removeWater(250)}
              >
                <Minus className="w-4 h-4 mr-2" />
                Undo 250ml
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setConsumed(0)}
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Goal Settings */}
        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle>Daily Goal</CardTitle>
            <CardDescription>
              Adjust your target water intake
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {dailyGoal}ml
                </div>
                <div className="text-sm text-muted-foreground">
                  {Math.ceil(dailyGoal / 250)} glasses per day
                </div>
              </div>
              <Slider
                value={[dailyGoal]}
                onValueChange={(value) => setDailyGoal(value[0])}
                min={1000}
                max={5000}
                step={250}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1L</span>
                <span>5L</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Suggestion Card */}
        <Card className="mt-8 border-primary/30 bg-primary/5">
          <CardContent className="py-6">
            <div className="flex items-start gap-3">
              <Droplet className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">💡 Hydration Tip</h3>
                <p className="text-sm text-muted-foreground">
                  Based on your activity level, aim to drink water consistently throughout the day. 
                  Smart reminders coming soon to help you stay on track!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Water;
