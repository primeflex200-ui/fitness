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
  const [level, setLevel] = useState<"beginner" | "intermediate" | "pro">("intermediate");

  const workoutPlans: Record<string, Record<string, Array<{name: string; sets: number; reps: number; rest: string; muscle: string}>>> = {
    beginner: {
      push: [
        { name: "Push-ups", sets: 3, reps: 10, rest: "60s", muscle: "Chest" },
        { name: "Dumbbell Bench Press", sets: 3, reps: 10, rest: "75s", muscle: "Chest" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: 10, rest: "75s", muscle: "Shoulders" },
        { name: "Lateral Raises", sets: 3, reps: 12, rest: "60s", muscle: "Side Delts" },
        { name: "Tricep Pushdowns", sets: 3, reps: 12, rest: "60s", muscle: "Triceps" }
      ],
      pull: [
        { name: "Lat Pulldowns", sets: 3, reps: 10, rest: "75s", muscle: "Lats" },
        { name: "Seated Cable Rows", sets: 3, reps: 10, rest: "75s", muscle: "Mid Back" },
        { name: "Face Pulls", sets: 3, reps: 15, rest: "60s", muscle: "Rear Delts" },
        { name: "Dumbbell Curls", sets: 3, reps: 12, rest: "60s", muscle: "Biceps" },
        { name: "Hammer Curls", sets: 3, reps: 12, rest: "60s", muscle: "Biceps" }
      ],
      legs: [
        { name: "Goblet Squats", sets: 3, reps: 12, rest: "75s", muscle: "Quads" },
        { name: "Leg Press", sets: 3, reps: 12, rest: "75s", muscle: "Quads" },
        { name: "Leg Curls", sets: 3, reps: 12, rest: "60s", muscle: "Hamstrings" },
        { name: "Lunges", sets: 3, reps: 10, rest: "60s", muscle: "Quads/Glutes" },
        { name: "Calf Raises", sets: 3, reps: 15, rest: "60s", muscle: "Calves" }
      ]
    },
    intermediate: {
    push: [
      { name: "Barbell Bench Press", sets: 4, reps: 8, rest: "90s", muscle: "Chest" },
      { name: "Incline Dumbbell Press", sets: 3, reps: 10, rest: "75s", muscle: "Upper Chest" },
      { name: "Shoulder Press", sets: 4, reps: 8, rest: "90s", muscle: "Shoulders" },
      { name: "Lateral Raises", sets: 3, reps: 12, rest: "60s", muscle: "Side Delts" },
      { name: "Tricep Dips", sets: 3, reps: 10, rest: "75s", muscle: "Triceps" },
      { name: "Overhead Tricep Extension", sets: 3, reps: 12, rest: "60s", muscle: "Triceps" },
      { name: "Cable Flyes", sets: 3, reps: 15, rest: "60s", muscle: "Chest" }
    ],
    pull: [
      { name: "Deadlifts", sets: 4, reps: 6, rest: "120s", muscle: "Back/Hamstrings" },
      { name: "Pull-ups", sets: 4, reps: 8, rest: "90s", muscle: "Lats" },
      { name: "Barbell Rows", sets: 4, reps: 8, rest: "90s", muscle: "Mid Back" },
      { name: "Face Pulls", sets: 3, reps: 15, rest: "60s", muscle: "Rear Delts" },
      { name: "Barbell Curls", sets: 3, reps: 10, rest: "75s", muscle: "Biceps" },
      { name: "Hammer Curls", sets: 3, reps: 12, rest: "60s", muscle: "Biceps" },
      { name: "Shrugs", sets: 3, reps: 15, rest: "60s", muscle: "Traps" }
    ],
      legs: [
        { name: "Barbell Squats", sets: 4, reps: 8, rest: "120s", muscle: "Quads" },
        { name: "Romanian Deadlifts", sets: 4, reps: 10, rest: "90s", muscle: "Hamstrings" },
        { name: "Leg Press", sets: 4, reps: 12, rest: "90s", muscle: "Quads" },
        { name: "Walking Lunges", sets: 3, reps: 12, rest: "75s", muscle: "Quads/Glutes" },
        { name: "Leg Curls", sets: 3, reps: 12, rest: "60s", muscle: "Hamstrings" },
        { name: "Calf Raises", sets: 4, reps: 15, rest: "60s", muscle: "Calves" },
        { name: "Bulgarian Split Squats", sets: 3, reps: 10, rest: "75s", muscle: "Quads/Glutes" }
      ]
    },
    pro: {
      push: [
        { name: "Barbell Bench Press", sets: 5, reps: 5, rest: "120s", muscle: "Chest" },
        { name: "Incline Barbell Press", sets: 4, reps: 6, rest: "120s", muscle: "Upper Chest" },
        { name: "Weighted Dips", sets: 4, reps: 8, rest: "90s", muscle: "Chest/Triceps" },
        { name: "Overhead Press", sets: 4, reps: 6, rest: "120s", muscle: "Shoulders" },
        { name: "Lateral Raises", sets: 4, reps: 12, rest: "60s", muscle: "Side Delts" },
        { name: "Close Grip Bench Press", sets: 4, reps: 8, rest: "90s", muscle: "Triceps" },
        { name: "Overhead Tricep Extension", sets: 3, reps: 12, rest: "60s", muscle: "Triceps" },
        { name: "Cable Flyes", sets: 3, reps: 15, rest: "60s", muscle: "Chest" }
      ],
      pull: [
        { name: "Deadlifts", sets: 5, reps: 5, rest: "180s", muscle: "Back/Hamstrings" },
        { name: "Weighted Pull-ups", sets: 4, reps: 6, rest: "120s", muscle: "Lats" },
        { name: "Barbell Rows", sets: 4, reps: 6, rest: "120s", muscle: "Mid Back" },
        { name: "T-Bar Rows", sets: 4, reps: 8, rest: "90s", muscle: "Mid Back" },
        { name: "Face Pulls", sets: 4, reps: 15, rest: "60s", muscle: "Rear Delts" },
        { name: "Barbell Curls", sets: 4, reps: 8, rest: "75s", muscle: "Biceps" },
        { name: "Hammer Curls", sets: 3, reps: 10, rest: "60s", muscle: "Biceps" },
        { name: "Shrugs", sets: 4, reps: 12, rest: "60s", muscle: "Traps" }
      ],
      legs: [
        { name: "Barbell Squats", sets: 5, reps: 5, rest: "180s", muscle: "Quads" },
        { name: "Front Squats", sets: 4, reps: 6, rest: "120s", muscle: "Quads" },
        { name: "Romanian Deadlifts", sets: 4, reps: 8, rest: "120s", muscle: "Hamstrings" },
        { name: "Leg Press", sets: 4, reps: 10, rest: "90s", muscle: "Quads" },
        { name: "Walking Lunges", sets: 4, reps: 12, rest: "75s", muscle: "Quads/Glutes" },
        { name: "Leg Curls", sets: 4, reps: 12, rest: "60s", muscle: "Hamstrings" },
        { name: "Bulgarian Split Squats", sets: 4, reps: 10, rest: "75s", muscle: "Quads/Glutes" },
        { name: "Calf Raises", sets: 5, reps: 15, rest: "60s", muscle: "Calves" }
      ]
    }
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
          <h1 className="text-3xl font-bold mb-2">Push / Pull / Legs Split</h1>
          <p className="text-muted-foreground">Optimize your training with the classic PPL program</p>
        </div>

        {/* Level Selector */}
        <Card className="mb-6 border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 justify-between flex-wrap">
              <span className="text-sm font-medium">Training Level:</span>
              <div className="flex gap-2">
                <Button
                  variant={level === "beginner" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLevel("beginner")}
                >
                  Beginner
                </Button>
                <Button
                  variant={level === "intermediate" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLevel("intermediate")}
                >
                  Intermediate
                </Button>
                <Button
                  variant={level === "pro" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLevel("pro")}
                >
                  Pro
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="push" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="push">Push Day</TabsTrigger>
            <TabsTrigger value="pull">Pull Day</TabsTrigger>
            <TabsTrigger value="legs">Leg Day</TabsTrigger>
          </TabsList>

          {Object.entries(workoutPlans[level]).map(([day, exercises]) => (
            <TabsContent key={day} value={day} className="space-y-4 animate-fade-in">
              <Card className="border-primary/50 bg-card/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl capitalize">{day} Day Program</CardTitle>
                      <CardDescription>
                        {day === 'push' && 'Chest, Shoulders & Triceps training'}
                        {day === 'pull' && 'Back, Traps & Biceps training'}
                        {day === 'legs' && 'Quads, Hamstrings, Glutes & Calves training'}
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
                          <h3 className="font-semibold text-lg mb-1">{exercise.name}</h3>
                          <Badge variant="outline" className="mb-2 text-xs">{exercise.muscle}</Badge>
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
                onClick={() => saveWorkout(day)}
              >
                <Save className="w-5 h-5 mr-2" />
                Save {day.charAt(0).toUpperCase() + day.slice(1)} Day Plan
              </Button>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Workouts;
