import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Footprints, TrendingUp, Award, Calendar } from "lucide-react";
import { toast } from "sonner";

const Steps = () => {
  const [dailyGoal, setDailyGoal] = useState(10000);
  const [currentSteps, setCurrentSteps] = useState(6234);
  const [isSimulating, setIsSimulating] = useState(false);

  // Simulate step counting
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSimulating) {
      interval = setInterval(() => {
        setCurrentSteps(prev => {
          const newSteps = prev + Math.floor(Math.random() * 15) + 5;
          if (newSteps >= dailyGoal && prev < dailyGoal) {
            toast.success("🎉 Daily goal reached! Great job!");
            setIsSimulating(false);
          }
          return Math.min(newSteps, dailyGoal + 2000);
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSimulating, dailyGoal]);

  const weeklyData = [
    { day: "Mon", steps: 8234, calories: 412 },
    { day: "Tue", steps: 10123, calories: 506 },
    { day: "Wed", steps: 7456, calories: 373 },
    { day: "Thu", steps: 12089, calories: 604 },
    { day: "Fri", steps: 9012, calories: 451 },
    { day: "Sat", steps: 11234, calories: 562 },
    { day: "Today", steps: currentSteps, calories: Math.floor(currentSteps * 0.05) }
  ];

  const percentage = Math.min((currentSteps / dailyGoal) * 100, 100);
  const caloriesBurned = Math.floor(currentSteps * 0.05);
  const distanceKm = (currentSteps * 0.0008).toFixed(2);
  const weeklyTotal = weeklyData.reduce((sum, day) => sum + day.steps, 0);
  const weeklyAverage = Math.floor(weeklyTotal / 7);

  const maxSteps = Math.max(...weeklyData.map(d => d.steps));

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
            <Footprints className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">Step Tracker</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Daily Steps</h1>
          <p className="text-muted-foreground">Track your daily activity and reach your goals</p>
        </div>

        {/* Main Progress Card */}
        <Card className="mb-8 border-primary/50 bg-gradient-to-br from-purple-500/10 to-blue-500/10">
          <CardHeader className="text-center">
            <div className="relative w-48 h-48 mx-auto mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="hsl(var(--muted))"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="hsl(var(--primary))"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - percentage / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Footprints className="w-8 h-8 text-primary mb-2" />
                <div className="text-4xl font-bold">{currentSteps.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">steps</div>
              </div>
            </div>
            <CardTitle className="text-2xl">
              {percentage >= 100 ? "Goal Achieved! 🎉" : `${percentage.toFixed(0)}% Complete`}
            </CardTitle>
            <CardDescription>
              {dailyGoal - currentSteps > 0 
                ? `${(dailyGoal - currentSteps).toLocaleString()} steps to go`
                : `${(currentSteps - dailyGoal).toLocaleString()} steps over goal!`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-purple-500">{distanceKm}</div>
                <div className="text-xs text-muted-foreground">km traveled</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-orange-500">{caloriesBurned}</div>
                <div className="text-xs text-muted-foreground">calories</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-blue-500">{Math.floor(currentSteps / 60)}</div>
                <div className="text-xs text-muted-foreground">active mins</div>
              </div>
            </div>

            <Button 
              variant={isSimulating ? "outline" : "hero"} 
              size="lg" 
              className="w-full"
              onClick={() => setIsSimulating(!isSimulating)}
            >
              {isSimulating ? "Pause Tracking" : "Start Walking Simulation"}
            </Button>
          </CardContent>
        </Card>

        {/* Weekly Stats */}
        <Card className="mb-8 border-border bg-card/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Weekly Progress
                </CardTitle>
                <CardDescription>Your activity over the last 7 days</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{weeklyAverage.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">avg steps/day</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyData.map((day, i) => {
                const dayPercentage = (day.steps / maxSteps) * 100;
                const isToday = day.day === "Today";
                
                return (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className={`font-semibold ${isToday ? 'text-primary' : ''}`}>
                        {day.day}
                      </span>
                      <span className="text-muted-foreground">
                        {day.steps.toLocaleString()} steps • {day.calories} cal
                      </span>
                    </div>
                    <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                          isToday ? 'bg-primary' : 'bg-muted-foreground'
                        }`}
                        style={{ width: `${dayPercentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Goal Settings */}
        <Card className="mb-8 border-border bg-card/50">
          <CardHeader>
            <CardTitle>Daily Step Goal</CardTitle>
            <CardDescription>Adjust your target activity level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {dailyGoal.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  steps per day
                </div>
              </div>
              <Slider
                value={[dailyGoal]}
                onValueChange={(value) => setDailyGoal(value[0])}
                min={5000}
                max={20000}
                step={500}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5,000</span>
                <span>20,000</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/30 rounded-lg text-center">
                <div className="text-3xl mb-2">🏆</div>
                <div className="font-semibold">Week Warrior</div>
                <div className="text-xs text-muted-foreground">7-day streak</div>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg text-center">
                <div className="text-3xl mb-2">🔥</div>
                <div className="font-semibold">10K Club</div>
                <div className="text-xs text-muted-foreground">Hit daily goal</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-8 border-primary/30 bg-primary/5">
          <CardContent className="py-6">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">📱 Step Tracking Simulation</h3>
                <p className="text-sm text-muted-foreground">
                  This is a simulation mode. In a real mobile app, step tracking would use device sensors 
                  and GPS to accurately count your steps throughout the day.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Steps;
