import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Dumbbell, Clock, Repeat, Save, Calendar, TrendingDown, Flame, Info, Zap, CheckCircle2, Circle, TrendingUp, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Checkbox } from "@/components/ui/checkbox";
import { getAgeBasedWorkoutSplit, getWorkoutLevel } from "@/utils/personalization";

const Workouts = () => {
  const { user } = useAuth();
  const [savedWorkouts, setSavedWorkouts] = useState<string[]>([]);
  const [level, setLevel] = useState<"beginner" | "intermediate" | "pro">("intermediate");
  const [selectedDay, setSelectedDay] = useState<string>("Monday");
  const [completions, setCompletions] = useState<Record<string, boolean>>({});
  const [weeklyProgress, setWeeklyProgress] = useState<Array<{ day: string; percentage: number }>>([]);
  const [userAge, setUserAge] = useState<number | null>(null);
  const [ageSplit, setAgeSplit] = useState<ReturnType<typeof getAgeBasedWorkoutSplit> | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchCompletions();
      fetchWeeklyProgress();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("profiles")
      .select("age")
      .eq("id", user.id)
      .single();

    if (data?.age) {
      setUserAge(data.age);
      const split = getAgeBasedWorkoutSplit(data.age);
      setAgeSplit(split);
      const autoLevel = getWorkoutLevel(data.age);
      setLevel(autoLevel);
    }
  };

  const fetchCompletions = async () => {
    if (!user) return;
    
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("workout_completions")
      .select("*")
      .eq("user_id", user.id)
      .eq("workout_date", today)
      .eq("workout_type", "strength");

    if (data) {
      const completionMap: Record<string, boolean> = {};
      data.forEach((item) => {
        completionMap[item.exercise_name] = item.completed;
      });
      setCompletions(completionMap);
    }
  };

  const fetchWeeklyProgress = async () => {
    if (!user) return;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data } = await supabase
      .from("workout_completions")
      .select("workout_date, completed")
      .eq("user_id", user.id)
      .eq("workout_type", "strength")
      .gte("workout_date", sevenDaysAgo.toISOString().split("T")[0])
      .order("workout_date");

    if (data) {
      const progressByDate = data.reduce((acc: Record<string, { total: number; completed: number }>, curr) => {
        if (!acc[curr.workout_date]) {
          acc[curr.workout_date] = { total: 0, completed: 0 };
        }
        acc[curr.workout_date].total += 1;
        if (curr.completed) {
          acc[curr.workout_date].completed += 1;
        }
        return acc;
      }, {});

      const progressData = Object.entries(progressByDate).map(([date, data]) => ({
        day: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
        percentage: Math.round((data.completed / data.total) * 100),
      }));

      setWeeklyProgress(progressData);
    }
  };

  const toggleCompletion = async (exerciseName: string) => {
    if (!user) {
      toast.error("Please login to track progress");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const isCompleted = !completions[exerciseName];

    const { error } = await supabase.from("workout_completions").upsert({
      user_id: user.id,
      exercise_name: exerciseName,
      workout_date: today,
      workout_type: "strength",
      completed: isCompleted,
    });

    if (!error) {
      setCompletions({ ...completions, [exerciseName]: isCompleted });
      fetchWeeklyProgress();
      
      if (isCompleted) {
        toast.success("Exercise completed! 💪");
      }
    }
  };

  const getCurrentExercises = (day: string) => {
    return workoutPlans[level][day as keyof typeof workoutPlans.beginner] || [];
  };

  const calculateDailyProgress = (day: string) => {
    const exercises = getCurrentExercises(day);
    if (exercises.length === 0) return { completed: 0, total: 0, percentage: 0 };
    
    const completed = exercises.filter(ex => completions[ex.name]).length;
    const total = exercises.length;
    const percentage = Math.round((completed / total) * 100);
    
    return { completed, total, percentage };
  };

  const weeklySchedule = [
    { day: "Monday", focus: "Lower Chest + Triceps", intensity: "High", color: "from-red-500/20 to-red-500/5" },
    { day: "Tuesday", focus: "Back + Biceps + Shoulders", intensity: "High", color: "from-blue-500/20 to-blue-500/5" },
    { day: "Wednesday", focus: "Upper Chest + Triceps", intensity: "Medium", color: "from-green-500/20 to-green-500/5" },
    { day: "Thursday", focus: "Back + Biceps + Shoulders", intensity: "High", color: "from-purple-500/20 to-purple-500/5" },
    { day: "Friday", focus: "Lower Chest + Triceps", intensity: "Medium", color: "from-orange-500/20 to-orange-500/5" },
    { day: "Saturday", focus: "Back + Biceps + Shoulders", intensity: "High", color: "from-cyan-500/20 to-cyan-500/5" },
    { day: "Sunday", focus: "Legs + Core (Intense)", intensity: "Very High", color: "from-pink-500/20 to-pink-500/5" }
  ];

  const fatLossWorkouts = {
    cardio: [
      { name: "Treadmill Running", duration: "30 min", intensity: "Moderate", calories: "300-400" },
      { name: "Cycling", duration: "40 min", intensity: "Moderate", calories: "350-450" },
      { name: "Rowing Machine", duration: "25 min", intensity: "High", calories: "250-350" },
      { name: "Jump Rope", duration: "20 min", intensity: "High", calories: "200-300" },
      { name: "Swimming", duration: "30 min", intensity: "Moderate", calories: "300-400" },
      { name: "Stair Climber", duration: "25 min", intensity: "High", calories: "250-350" }
    ],
    hiit: [
      { name: "Burpees", sets: 4, reps: "30 sec on / 30 sec off", calories: "200-300 per session" },
      { name: "Mountain Climbers", sets: 4, reps: "45 sec on / 15 sec off", calories: "150-250 per session" },
      { name: "High Knees", sets: 4, reps: "40 sec on / 20 sec off", calories: "180-280 per session" },
      { name: "Box Jumps", sets: 4, reps: 15, calories: "150-200 per session" },
      { name: "Battle Ropes", sets: 4, reps: "30 sec on / 30 sec off", calories: "200-300 per session" },
      { name: "Kettlebell Swings", sets: 4, reps: 20, calories: "180-250 per session" },
      { name: "Sprint Intervals", sets: 6, reps: "30 sec sprint / 60 sec walk", calories: "250-350 per session" }
    ]
  };

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
          <h1 className="text-3xl font-bold mb-2">Workout Programs</h1>
          <p className="text-muted-foreground">Structured training plans for strength and fat loss</p>
        </div>

        {/* Personalized Info */}
        {ageSplit && userAge && (
          <Card className="mb-6 border-primary/50 bg-gradient-to-r from-primary/10 to-primary/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold mb-2">
                    🎯 Your Personalized Workout Plan (Age: {userAge})
                  </p>
                  <p className="text-sm mb-1">
                    <strong>{ageSplit.name}</strong> - {ageSplit.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Training {ageSplit.daysPerWeek} days/week • {ageSplit.intensity} intensity
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {ageSplit.focus.map((focus) => (
                      <Badge key={focus} variant="secondary" className="text-xs">{focus}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Disclaimer */}
        <Card className="mb-6 border-primary/50 bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              <strong>Note:</strong> Workouts are automatically customized based on your age and fitness level.
              Always warm up before exercising and maintain proper form to prevent injuries.
            </p>
          </CardContent>
        </Card>

        {/* Age-Based Weekly Schedule */}
        {ageSplit && (
          <Card className="mb-6 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-primary" />
                Your Weekly Training Schedule
              </CardTitle>
              <CardDescription>Personalized for your age group</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {ageSplit.schedule.map((schedule, idx) => (
                  <Card key={schedule.day} className={`border-border hover:border-primary transition-all hover-scale`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold">{schedule.day}</h4>
                        <Badge variant={schedule.focus.includes("Rest") ? "outline" : "default"}>
                          {schedule.focus.includes("Rest") ? "Rest" : "Active"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{schedule.focus}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weekly Schedule Overview */}
        <Card className="mb-6 border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" />
              Weekly Training Schedule
            </CardTitle>
            <CardDescription>Your complete week at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {weeklySchedule.map((schedule) => (
                <Card key={schedule.day} className={`border-border hover:border-primary transition-all hover-scale bg-gradient-to-br ${schedule.color}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{schedule.day}</h3>
                      <Badge variant={schedule.intensity === "Very High" ? "default" : "outline"} className="text-xs">
                        {schedule.intensity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{schedule.focus}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

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

        <Tabs defaultValue="fatloss" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="fatloss">
              <TrendingDown className="w-4 h-4 mr-2" />
              Fat Loss
            </TabsTrigger>
            <TabsTrigger value="push">Push Day</TabsTrigger>
            <TabsTrigger value="pull">Pull Day</TabsTrigger>
            <TabsTrigger value="legs">Leg Day</TabsTrigger>
          </TabsList>

          {/* Fat Loss Tab */}
          <TabsContent value="fatloss" className="space-y-4 animate-fade-in">
            <Card className="border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="w-6 h-6" />
                  Fat Loss Training Program
                </CardTitle>
                <CardDescription>
                  Combine cardio and HIIT for maximum calorie burn and fat loss
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><strong>Workout Frequency:</strong> 5-6 days per week for optimal fat loss</p>
                <p><strong>Cardio:</strong> 3-4 sessions per week (morning on empty stomach is most effective)</p>
                <p><strong>HIIT:</strong> 2-3 sessions per week (alternate days with cardio)</p>
                <p><strong>Rest:</strong> 1-2 days for recovery and muscle repair</p>
                <p><strong>Tip:</strong> Combine with a calorie deficit diet for best results</p>
              </CardContent>
            </Card>

            {/* Cardio Section */}
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Steady-State Cardio
                </CardTitle>
                <CardDescription>Moderate intensity, longer duration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {fatLossWorkouts.cardio.map((exercise, i) => (
                    <Card key={i} className="border-border hover:border-primary transition-all hover-scale">
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{exercise.name}</h3>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{exercise.duration}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Flame className="w-4 h-4" />
                                <span>{exercise.calories} cal</span>
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {exercise.intensity}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* HIIT Section */}
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-primary" />
                  High-Intensity Interval Training (HIIT)
                </CardTitle>
                <CardDescription>Short bursts of intense exercise with rest periods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {fatLossWorkouts.hiit.map((exercise, i) => (
                    <Card key={i} className="border-border hover:border-primary transition-all hover-scale">
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{exercise.name}</h3>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Repeat className="w-4 h-4" />
                                <span>{exercise.sets} sets × {exercise.reps}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Flame className="w-4 h-4" />
                                <span>{exercise.calories}</span>
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
              </CardContent>
            </Card>

            <Button 
              variant="hero" 
              size="lg" 
              className="w-full"
              onClick={() => toast.success("Fat Loss program saved!")}
            >
              <Save className="w-5 h-5 mr-2" />
              Save Fat Loss Program
            </Button>
          </TabsContent>

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
                      <div className="flex items-center gap-4">
                        <Checkbox
                          checked={completions[exercise.name] || false}
                          onCheckedChange={() => toggleCompletion(exercise.name)}
                          className="mt-1"
                        />
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

              {/* Progress Tracking Section */}
              <Card className="mt-6 border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Today's Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Completion Rate</span>
                      <span className="text-2xl font-bold text-primary">
                        {calculateDailyProgress(day).percentage}%
                      </span>
                    </div>
                    <ProgressBar value={calculateDailyProgress(day).percentage} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {calculateDailyProgress(day).completed} of {calculateDailyProgress(day).total} exercises completed
                    </p>
                  </div>

                  {calculateDailyProgress(day).percentage === 100 ? (
                    <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <p className="text-sm font-medium text-green-500">
                        🔥 You crushed today's workout!
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                      <Dumbbell className="w-5 h-5 text-primary" />
                      <p className="text-sm font-medium">
                        💪 Keep going! You're doing great!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Weekly Progress Graph */}
              {weeklyProgress.length > 0 && (
                <Card className="mt-6 border-primary/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Weekly Progress
                    </CardTitle>
                    <CardDescription>Your completion rate over the last 7 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={weeklyProgress}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="day" className="text-xs" />
                        <YAxis className="text-xs" domain={[0, 100]} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))' 
                          }}
                          formatter={(value: number) => [`${value}%`, 'Completion']}
                        />
                        <Bar dataKey="percentage" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Workouts;
