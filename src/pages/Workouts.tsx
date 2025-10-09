import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Dumbbell, Clock, Repeat, Save } from "lucide-react";
import { toast } from "sonner";

const Workouts = () => {
  const [savedWorkouts, setSavedWorkouts] = useState<string[]>([]);

  const workoutPlans = {
    beginner: [
      { name: "Push-ups", sets: 3, reps: 10, rest: "60s" },
      { name: "Bodyweight Squats", sets: 3, reps: 15, rest: "60s" },
      { name: "Plank", sets: 3, reps: "30s", rest: "45s" },
      { name: "Lunges", sets: 3, reps: 12, rest: "60s" },
      { name: "Mountain Climbers", sets: 3, reps: 20, rest: "60s" }
    ],
    intermediate: [
      { name: "Bench Press", sets: 4, reps: 8, rest: "90s" },
      { name: "Barbell Squats", sets: 4, reps: 10, rest: "90s" },
      { name: "Pull-ups", sets: 3, reps: 8, rest: "90s" },
      { name: "Deadlifts", sets: 4, reps: 6, rest: "120s" },
      { name: "Shoulder Press", sets: 3, reps: 10, rest: "75s" },
      { name: "Bent-over Rows", sets: 4, reps: 10, rest: "75s" }
    ],
    pro: [
      { name: "Heavy Squats", sets: 5, reps: 5, rest: "180s" },
      { name: "Heavy Deadlifts", sets: 5, reps: 5, rest: "180s" },
      { name: "Weighted Pull-ups", sets: 4, reps: 6, rest: "120s" },
      { name: "Incline Bench Press", sets: 4, reps: 8, rest: "120s" },
      { name: "Front Squats", sets: 4, reps: 6, rest: "120s" },
      { name: "Romanian Deadlifts", sets: 4, reps: 8, rest: "90s" },
      { name: "Weighted Dips", sets: 4, reps: 8, rest: "90s" }
    ]
  };

  const saveWorkout = (level: string) => {
    if (!savedWorkouts.includes(level)) {
      setSavedWorkouts([...savedWorkouts, level]);
      toast.success(`${level.charAt(0).toUpperCase() + level.slice(1)} workout saved!`);
    } else {
      toast.info("Workout already saved");
    }
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
            <Dumbbell className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">Workout Plans</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Choose Your Level</h1>
          <p className="text-muted-foreground">Select a workout plan tailored to your fitness level</p>
        </div>

        <Tabs defaultValue="beginner" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="beginner">Beginner</TabsTrigger>
            <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
            <TabsTrigger value="pro">Pro</TabsTrigger>
          </TabsList>

          {Object.entries(workoutPlans).map(([level, exercises]) => (
            <TabsContent key={level} value={level} className="space-y-4 animate-fade-in">
              <Card className="border-primary/50 bg-card/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl capitalize">{level} Program</CardTitle>
                      <CardDescription>
                        {level === 'beginner' && 'Perfect for starting your fitness journey'}
                        {level === 'intermediate' && 'Build strength and endurance'}
                        {level === 'pro' && 'Advanced training for peak performance'}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-primary border-primary">
                      {exercises.length} Exercises
                    </Badge>
                  </div>
                </CardHeader>
              </Card>

              <div className="grid gap-4">
                {exercises.map((exercise, i) => (
                  <Card 
                    key={i} 
                    className="border-border hover:border-primary transition-all hover-scale"
                  >
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{exercise.name}</h3>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Repeat className="w-4 h-4" />
                              <span>{exercise.sets} sets × {exercise.reps} reps</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>Rest: {exercise.rest}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-primary/20 text-primary border-0">
                          #{i + 1}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button 
                variant="hero" 
                size="lg" 
                className="w-full"
                onClick={() => saveWorkout(level)}
              >
                <Save className="w-5 h-5 mr-2" />
                Save Workout Plan
              </Button>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Workouts;
