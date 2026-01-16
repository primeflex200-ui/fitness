import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Dumbbell, Clock, Repeat, Save, Calendar, Flame, Info, Zap, CheckCircle2, Circle, TrendingUp, User, Settings, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Checkbox } from "@/components/ui/checkbox";
import { getAgeBasedWorkoutSplit, getWorkoutLevel } from "@/utils/personalization";
import ExerciseVideoPlayer from "@/components/ExerciseVideoPlayer";
import { ProgressTrackingService } from "@/services/progressTrackingService";
import { getTodayDayName, getTodayWorkoutFocus, mapFocusToWorkoutType, loadWeeklySchedule } from "@/utils/workoutMapping";

const Workouts = () => {
  const { user } = useAuth();
  const [savedWorkouts, setSavedWorkouts] = useState<string[]>([]);
  const [level, setLevel] = useState<"beginner" | "intermediate" | "pro">("intermediate");
  const [selectedDay, setSelectedDay] = useState<string>(getTodayDayName());
  const [completions, setCompletions] = useState<Record<string, boolean>>({});
  const [weeklyProgress, setWeeklyProgress] = useState<Array<{ day: string; percentage: number }>>([]);
  const [userAge, setUserAge] = useState<number | null>(null);
  const [ageSplit, setAgeSplit] = useState<ReturnType<typeof getAgeBasedWorkoutSplit> | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Record<string, number>>({});
  const [todayFocus, setTodayFocus] = useState<string | null>(null);
  const [weeklySchedule, setWeeklySchedule] = useState<any[]>([]);
  const [isVariationModalOpen, setIsVariationModalOpen] = useState(false);
  const [customWorkoutFocus, setCustomWorkoutFocus] = useState<Record<string, string>>({});
  const [replacedExercises, setReplacedExercises] = useState<Record<string, any>>({});

  // Workout combination options
  const workoutCombinations = [
    'Full Chest',
    'Chest + Triceps',
    'Back + Shoulders',
    'Back + Biceps + Shoulders',
    'Legs + Core',
    'Legs + Shoulders',
    'Legs + Shoulders + Core'
  ];

  useEffect(() => {
    // Load weekly schedule
    const schedule = loadWeeklySchedule();
    if (schedule) {
      setWeeklySchedule(schedule);
      const focus = getTodayWorkoutFocus();
      setTodayFocus(focus);
      
      // Initialize variants for all workout types from schedule
      const initialVariants: Record<string, number> = {};
      schedule.forEach((daySchedule: any) => {
        const { type, variant } = mapFocusToWorkoutType(daySchedule.focus);
        if (!initialVariants[type]) {
          initialVariants[type] = variant;
        }
      });
      setSelectedVariant(initialVariants);
    }
    
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
    const isCompleted = !completions[exerciseName];
    
    // Update local state immediately for UI feedback
    setCompletions({ ...completions, [exerciseName]: isCompleted });
    
    if (isCompleted) {
      toast.success("Exercise completed! 💪");
    }

    // Try to save to database if user is logged in
    if (user) {
      const today = new Date().toISOString().split("T")[0];

      // Save to workout_completions
      const { error } = await supabase.from("workout_completions").upsert({
        user_id: user.id,
        exercise_name: exerciseName,
        workout_date: today,
        workout_type: "strength",
        completed: isCompleted,
      });

      if (!error) {
        // Update progress tracking with AI
        await ProgressTrackingService.updateExerciseCompletion(
          user.id,
          exerciseName,
          isCompleted
        );
        
        fetchWeeklyProgress();
      } else {
        toast.error("Failed to save progress");
      }
    }
  };

  const getCurrentExercises = (workoutType: string, variantNum?: number) => {
    const variant = variantNum || selectedVariant[workoutType] || 1;
    const dayPlans = workoutPlans[level][workoutType as keyof typeof workoutPlans.beginner];
    return (dayPlans && dayPlans[variant as keyof typeof dayPlans]) || [];
  };

  const getFilteredExercises = (workoutType: string, variantNum: number, focusText: string) => {
    const allExercises = getCurrentExercises(workoutType, variantNum);
    const lowerFocus = focusText.toLowerCase();
    
    // Helper function to get exercises by muscle group
    const getByMuscle = (keywords: string[], limit: number) => {
      return allExercises
        .filter(ex => keywords.some(kw => ex.muscle.toLowerCase().includes(kw) || ex.name.toLowerCase().includes(kw)))
        .slice(0, limit);
    };
    
    // Helper to ensure minimum 6 exercises
    const ensureMinimum = (exercises: any[], excludeMuscles: string[] = []) => {
      if (exercises.length >= 6) return exercises.slice(0, 6);
      // If we don't have enough, add more from allExercises but exclude certain muscles
      const remaining = allExercises.filter(ex => 
        !exercises.includes(ex) &&
        !excludeMuscles.some(muscle => ex.muscle.toLowerCase().includes(muscle))
      );
      return [...exercises, ...remaining].slice(0, 6);
    };
    
    // Full Chest (6 chest exercises ONLY - NO shoulders, NO triceps)
    if (lowerFocus === 'full chest') {
      const chest = allExercises.filter(ex => 
        ex.muscle.toLowerCase().includes('chest') && 
        !ex.muscle.toLowerCase().includes('shoulder') &&
        !ex.muscle.toLowerCase().includes('delt') &&
        !ex.muscle.toLowerCase().includes('tricep')
      );
      return ensureMinimum(chest, ['shoulder', 'delt', 'tricep']);
    }
    
    // Chest + Triceps (3 chest + 3 triceps, NO shoulders)
    if (lowerFocus.includes('chest') && lowerFocus.includes('tricep')) {
      const chest = allExercises.filter(ex => 
        ex.muscle.toLowerCase().includes('chest') && 
        !ex.muscle.toLowerCase().includes('shoulder') &&
        !ex.muscle.toLowerCase().includes('delt')
      ).slice(0, 3);
      const triceps = getByMuscle(['tricep'], 3);
      return ensureMinimum([...chest, ...triceps], ['shoulder', 'delt']);
    }
    
    // Back + Shoulders (3 back + 3 shoulders, NO biceps unless specified)
    if (lowerFocus.includes('back') && lowerFocus.includes('shoulder') && !lowerFocus.includes('bicep')) {
      const back = allExercises.filter(ex => 
        (ex.muscle.toLowerCase().includes('back') || ex.muscle.toLowerCase().includes('lat')) &&
        !ex.muscle.toLowerCase().includes('bicep')
      ).slice(0, 3);
      const shoulders = getByMuscle(['shoulder', 'delt'], 3);
      return ensureMinimum([...back, ...shoulders]);
    }
    
    // Back + Biceps + Shoulders (2 + 2 + 2 = 6)
    if (lowerFocus.includes('back') && lowerFocus.includes('bicep') && lowerFocus.includes('shoulder')) {
      const back = getByMuscle(['back', 'lat'], 2);
      const biceps = getByMuscle(['bicep'], 2);
      const shoulders = getByMuscle(['shoulder', 'delt'], 2);
      return ensureMinimum([...back, ...biceps, ...shoulders]);
    }
    
    // Legs + Core (4 legs + 2 core = 6, NO shoulders)
    if (lowerFocus.includes('leg') && lowerFocus.includes('core') && !lowerFocus.includes('shoulder')) {
      const legs = allExercises.filter(ex => 
        !ex.muscle.toLowerCase().includes('shoulder') &&
        !ex.muscle.toLowerCase().includes('delt') &&
        (ex.muscle.toLowerCase().includes('quad') ||
         ex.muscle.toLowerCase().includes('hamstring') ||
         ex.muscle.toLowerCase().includes('glute') ||
         ex.muscle.toLowerCase().includes('calve'))
      ).slice(0, 4);
      const core = getByMuscle(['core', 'abs'], 2);
      return ensureMinimum([...legs, ...core], ['shoulder', 'delt']);
    }
    
    // Legs + Shoulders (4 + 2 = 6)
    if (lowerFocus.includes('leg') && lowerFocus.includes('shoulder') && !lowerFocus.includes('core')) {
      const legs = getByMuscle(['quad', 'hamstring', 'glute'], 4);
      const shoulders = getByMuscle(['shoulder', 'delt'], 2);
      return ensureMinimum([...legs, ...shoulders]);
    }
    
    // Legs + Shoulders + Core (3 + 2 + 2 = 7)
    if (lowerFocus.includes('leg') && lowerFocus.includes('shoulder') && lowerFocus.includes('core')) {
      const legs = getByMuscle(['quad', 'hamstring', 'glute'], 3);
      const shoulders = getByMuscle(['shoulder', 'delt'], 2);
      const core = getByMuscle(['core', 'abs'], 2);
      return ensureMinimum([...legs, ...shoulders, ...core]);
    }
    
    // Return all exercises for other combinations (minimum 6)
    return ensureMinimum(allExercises);
  };

  const handleVariationChange = (workoutType: string, variantNum: number) => {
    setSelectedVariant({ ...selectedVariant, [workoutType]: variantNum });
    toast.success(`Switched to Variation ${variantNum}`);
  };

  const handleWorkoutCombinationSelect = (combination: string, dayName: string) => {
    setCustomWorkoutFocus({ ...customWorkoutFocus, [dayName]: combination });
    setIsVariationModalOpen(false);
    toast.success(`Workout updated to: ${combination}`);
  };

  const refreshExercise = (exerciseIndex: number, currentExercise: any, allExercises: any[]) => {
    // Get the current exercise (either replaced or original)
    const currentDisplayedExercise = replacedExercises[exerciseIndex] || currentExercise;
    
    // Find alternative exercises with the same muscle group (excluding current one)
    let alternatives = allExercises.filter(ex => 
      ex.muscle === currentDisplayedExercise.muscle && 
      ex.name !== currentDisplayedExercise.name
    );
    
    // If no alternatives found (shouldn't happen), just return
    if (alternatives.length === 0) {
      return;
    }
    
    // Pick a random alternative
    const randomIndex = Math.floor(Math.random() * alternatives.length);
    const newExercise = alternatives[randomIndex];
    
    setReplacedExercises({
      ...replacedExercises,
      [exerciseIndex]: newExercise
    });
  };

  const calculateDailyProgress = (workoutType: string) => {
    const exercises = getCurrentExercises(workoutType);
    if (exercises.length === 0) return { completed: 0, total: 0, percentage: 0 };
    
    const completed = exercises.filter(ex => completions[ex.name]).length;
    const total = exercises.length;
    const percentage = Math.round((completed / total) * 100);
    
    return { completed, total, percentage };
  };

  // weeklySchedule is now loaded from localStorage in useEffect

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

  const workoutPlans: Record<string, Record<string, Record<number, Array<{name: string; sets: number; reps: number; rest: string; muscle: string}>>>> = {
    beginner: {
      push: {
        1: [
          { name: "Push-ups", sets: 3, reps: 10, rest: "60s", muscle: "Chest" },
          { name: "Dumbbell Bench Press", sets: 3, reps: 10, rest: "75s", muscle: "Chest" },
          { name: "Incline Dumbbell Press", sets: 3, reps: 10, rest: "75s", muscle: "Upper Chest" },
          { name: "Dumbbell Shoulder Press", sets: 3, reps: 10, rest: "75s", muscle: "Shoulders" },
          { name: "Lateral Raises", sets: 3, reps: 12, rest: "60s", muscle: "Side Delts" },
          { name: "Front Raises", sets: 3, reps: 12, rest: "60s", muscle: "Front Delts" },
          { name: "Tricep Pushdowns", sets: 3, reps: 12, rest: "60s", muscle: "Triceps" },
          { name: "Overhead Tricep Extension", sets: 3, reps: 12, rest: "60s", muscle: "Triceps" },
          { name: "Cable Flyes", sets: 3, reps: 12, rest: "60s", muscle: "Chest" }
        ],
        2: [
          { name: "Incline Push-ups", sets: 3, reps: 12, rest: "60s", muscle: "Upper Chest" },
          { name: "Machine Chest Press", sets: 3, reps: 10, rest: "75s", muscle: "Chest" },
          { name: "Decline Push-ups", sets: 3, reps: 10, rest: "75s", muscle: "Lower Chest" },
          { name: "Pike Push-ups", sets: 3, reps: 8, rest: "75s", muscle: "Shoulders" },
          { name: "Arnold Press", sets: 3, reps: 10, rest: "75s", muscle: "Shoulders" },
          { name: "Reverse Pec Deck", sets: 3, reps: 12, rest: "60s", muscle: "Rear Delts" },
          { name: "Rope Tricep Pushdowns", sets: 3, reps: 12, rest: "60s", muscle: "Triceps" },
          { name: "Tricep Dips (Assisted)", sets: 3, reps: 10, rest: "75s", muscle: "Triceps" },
          { name: "Pec Deck", sets: 3, reps: 12, rest: "60s", muscle: "Chest" }
        ],
        3: [
          { name: "Decline Push-ups", sets: 3, reps: 8, rest: "75s", muscle: "Lower Chest" },
          { name: "Resistance Band Chest Press", sets: 3, reps: 12, rest: "60s", muscle: "Chest" },
          { name: "Dumbbell Flyes", sets: 3, reps: 12, rest: "60s", muscle: "Chest" },
          { name: "Plate Raises", sets: 3, reps: 10, rest: "75s", muscle: "Shoulders" },
          { name: "Machine Shoulder Press", sets: 3, reps: 10, rest: "75s", muscle: "Shoulders" },
          { name: "Cable Lateral Raises", sets: 3, reps: 12, rest: "60s", muscle: "Side Delts" },
          { name: "Overhead Tricep Extension", sets: 3, reps: 12, rest: "60s", muscle: "Triceps" },
          { name: "Tricep Kickbacks", sets: 3, reps: 12, rest: "60s", muscle: "Triceps" },
          { name: "Close Grip Push-ups", sets: 3, reps: 10, rest: "60s", muscle: "Triceps" }
        ]
      },
      pull: {
        1: [
          { name: "Lat Pulldowns", sets: 3, reps: 10, rest: "75s", muscle: "Lats" },
          { name: "Seated Cable Rows", sets: 3, reps: 10, rest: "75s", muscle: "Mid Back" },
          { name: "Dumbbell Rows", sets: 3, reps: 10, rest: "75s", muscle: "Mid Back" },
          { name: "Face Pulls", sets: 3, reps: 15, rest: "60s", muscle: "Rear Delts" },
          { name: "Reverse Flyes", sets: 3, reps: 12, rest: "60s", muscle: "Rear Delts" },
          { name: "Dumbbell Curls", sets: 3, reps: 12, rest: "60s", muscle: "Biceps" },
          { name: "Hammer Curls", sets: 3, reps: 12, rest: "60s", muscle: "Biceps" },
          { name: "Cable Curls", sets: 3, reps: 12, rest: "60s", muscle: "Biceps" },
          { name: "Shrugs", sets: 3, reps: 15, rest: "60s", muscle: "Traps" }
        ],
        2: [
          { name: "Assisted Pull-ups", sets: 3, reps: 8, rest: "90s", muscle: "Lats" },
          { name: "Machine Rows", sets: 3, reps: 10, rest: "75s", muscle: "Mid Back" },
          { name: "T-Bar Rows", sets: 3, reps: 10, rest: "75s", muscle: "Mid Back" },
          { name: "Reverse Flyes", sets: 3, reps: 12, rest: "60s", muscle: "Rear Delts" },
          { name: "Band Pull-aparts", sets: 3, reps: 15, rest: "60s", muscle: "Rear Delts" },
          { name: "Cable Curls", sets: 3, reps: 12, rest: "60s", muscle: "Biceps" },
          { name: "Preacher Curls", sets: 3, reps: 10, rest: "60s", muscle: "Biceps" },
          { name: "Concentration Curls", sets: 3, reps: 12, rest: "60s", muscle: "Biceps" },
          { name: "Dumbbell Shrugs", sets: 3, reps: 15, rest: "60s", muscle: "Traps" }
        ],
        3: [
          { name: "Resistance Band Pulldowns", sets: 3, reps: 12, rest: "60s", muscle: "Lats" },
          { name: "Dumbbell Rows", sets: 3, reps: 10, rest: "75s", muscle: "Mid Back" },
          { name: "Inverted Rows", sets: 3, reps: 10, rest: "75s", muscle: "Mid Back" },
          { name: "Band Pull-aparts", sets: 3, reps: 15, rest: "60s", muscle: "Rear Delts" },
          { name: "Reverse Pec Deck", sets: 3, reps: 12, rest: "60s", muscle: "Rear Delts" },
          { name: "Barbell Curls", sets: 3, reps: 10, rest: "75s", muscle: "Biceps" },
          { name: "Concentration Curls", sets: 3, reps: 12, rest: "60s", muscle: "Biceps" },
          { name: "Zottman Curls", sets: 3, reps: 10, rest: "60s", muscle: "Biceps" },
          { name: "Machine Shrugs", sets: 3, reps: 15, rest: "60s", muscle: "Traps" }
        ]
      },
      legs: {
        1: [
          { name: "Goblet Squats", sets: 3, reps: 12, rest: "75s", muscle: "Quads" },
          { name: "Leg Press", sets: 3, reps: 12, rest: "75s", muscle: "Quads" },
          { name: "Leg Extensions", sets: 3, reps: 12, rest: "60s", muscle: "Quads" },
          { name: "Leg Curls", sets: 3, reps: 12, rest: "60s", muscle: "Hamstrings" },
          { name: "Romanian Deadlifts", sets: 3, reps: 10, rest: "75s", muscle: "Hamstrings" },
          { name: "Lunges", sets: 3, reps: 10, rest: "60s", muscle: "Quads/Glutes" },
          { name: "Leg Press Calf Raises", sets: 3, reps: 15, rest: "60s", muscle: "Calves" },
          { name: "Seated Calf Raises", sets: 3, reps: 15, rest: "60s", muscle: "Calves" },
          { name: "Glute Bridges", sets: 3, reps: 15, rest: "60s", muscle: "Glutes" }
        ],
        2: [
          { name: "Bodyweight Squats", sets: 3, reps: 15, rest: "60s", muscle: "Quads" },
          { name: "Smith Machine Squats", sets: 3, reps: 12, rest: "75s", muscle: "Quads" },
          { name: "Hack Squats", sets: 3, reps: 10, rest: "75s", muscle: "Quads" },
          { name: "Romanian Deadlifts", sets: 3, reps: 10, rest: "75s", muscle: "Hamstrings" },
          { name: "Lying Leg Curls", sets: 3, reps: 12, rest: "60s", muscle: "Hamstrings" },
          { name: "Step-ups", sets: 3, reps: 10, rest: "60s", muscle: "Quads/Glutes" },
          { name: "Walking Lunges", sets: 3, reps: 12, rest: "60s", muscle: "Quads/Glutes" },
          { name: "Seated Calf Raises", sets: 3, reps: 15, rest: "60s", muscle: "Calves" },
          { name: "Hip Thrusts", sets: 3, reps: 12, rest: "75s", muscle: "Glutes" }
        ],
        3: [
          { name: "Sumo Squats", sets: 3, reps: 12, rest: "75s", muscle: "Glutes/Quads" },
          { name: "Hack Squats", sets: 3, reps: 10, rest: "75s", muscle: "Quads" },
          { name: "Sissy Squats", sets: 3, reps: 10, rest: "60s", muscle: "Quads" },
          { name: "Leg Press Hamstring Focus", sets: 3, reps: 12, rest: "60s", muscle: "Hamstrings" },
          { name: "Good Mornings", sets: 3, reps: 10, rest: "75s", muscle: "Hamstrings" },
          { name: "Bulgarian Split Squats", sets: 3, reps: 10, rest: "60s", muscle: "Quads/Glutes" },
          { name: "Reverse Lunges", sets: 3, reps: 12, rest: "60s", muscle: "Quads/Glutes" },
          { name: "Donkey Calf Raises", sets: 3, reps: 12, rest: "60s", muscle: "Calves" },
          { name: "Cable Pull-throughs", sets: 3, reps: 12, rest: "60s", muscle: "Glutes" }
        ]
      },
      fullbody: {
        1: [
          { name: "Goblet Squats", sets: 3, reps: 12, rest: "75s", muscle: "Legs" },
          { name: "Push-ups", sets: 3, reps: 12, rest: "60s", muscle: "Chest" },
          { name: "Dumbbell Rows", sets: 3, reps: 10, rest: "75s", muscle: "Back" },
          { name: "Dumbbell Shoulder Press", sets: 3, reps: 10, rest: "75s", muscle: "Shoulders" },
          { name: "Lunges", sets: 3, reps: 10, rest: "60s", muscle: "Legs" },
          { name: "Dumbbell Curls", sets: 3, reps: 12, rest: "60s", muscle: "Biceps" },
          { name: "Tricep Pushdowns", sets: 3, reps: 12, rest: "60s", muscle: "Triceps" },
          { name: "Plank", sets: 3, reps: 30, rest: "60s", muscle: "Core" }
        ],
        2: [
          { name: "Leg Press", sets: 3, reps: 12, rest: "75s", muscle: "Legs" },
          { name: "Dumbbell Bench Press", sets: 3, reps: 10, rest: "75s", muscle: "Chest" },
          { name: "Lat Pulldowns", sets: 3, reps: 10, rest: "75s", muscle: "Back" },
          { name: "Lateral Raises", sets: 3, reps: 12, rest: "60s", muscle: "Shoulders" },
          { name: "Leg Curls", sets: 3, reps: 12, rest: "60s", muscle: "Hamstrings" },
          { name: "Hammer Curls", sets: 3, reps: 12, rest: "60s", muscle: "Biceps" },
          { name: "Overhead Tricep Extension", sets: 3, reps: 12, rest: "60s", muscle: "Triceps" },
          { name: "Russian Twists", sets: 3, reps: 20, rest: "60s", muscle: "Core" }
        ],
        3: [
          { name: "Romanian Deadlifts", sets: 3, reps: 10, rest: "75s", muscle: "Hamstrings" },
          { name: "Incline Push-ups", sets: 3, reps: 12, rest: "60s", muscle: "Upper Chest" },
          { name: "Seated Cable Rows", sets: 3, reps: 10, rest: "75s", muscle: "Mid Back" },
          { name: "Front Raises", sets: 3, reps: 12, rest: "60s", muscle: "Front Delts" },
          { name: "Step-ups", sets: 3, reps: 10, rest: "60s", muscle: "Quads/Glutes" },
          { name: "Cable Curls", sets: 3, reps: 12, rest: "60s", muscle: "Biceps" },
          { name: "Rope Tricep Pushdowns", sets: 3, reps: 12, rest: "60s", muscle: "Triceps" },
          { name: "Bicycle Crunches", sets: 3, reps: 20, rest: "60s", muscle: "Core" }
        ]
      },
      cardio: {
        1: [
          { name: "Treadmill Running", sets: 1, reps: 30, rest: "0s", muscle: "Cardio" },
          { name: "Jump Rope", sets: 3, reps: 60, rest: "60s", muscle: "Cardio" },
          { name: "Mountain Climbers", sets: 3, reps: 20, rest: "60s", muscle: "Core/Cardio" },
          { name: "Burpees", sets: 3, reps: 10, rest: "60s", muscle: "Full Body" },
          { name: "Plank", sets: 3, reps: 30, rest: "60s", muscle: "Core" }
        ],
        2: [
          { name: "Cycling", sets: 1, reps: 30, rest: "0s", muscle: "Cardio" },
          { name: "High Knees", sets: 3, reps: 30, rest: "60s", muscle: "Cardio" },
          { name: "Russian Twists", sets: 3, reps: 20, rest: "60s", muscle: "Core" },
          { name: "Box Jumps", sets: 3, reps: 10, rest: "75s", muscle: "Legs/Cardio" },
          { name: "Leg Raises", sets: 3, reps: 15, rest: "60s", muscle: "Core" }
        ],
        3: [
          { name: "Rowing Machine", sets: 1, reps: 20, rest: "0s", muscle: "Cardio" },
          { name: "Battle Ropes", sets: 3, reps: 30, rest: "60s", muscle: "Full Body" },
          { name: "Bicycle Crunches", sets: 3, reps: 20, rest: "60s", muscle: "Core" },
          { name: "Kettlebell Swings", sets: 3, reps: 15, rest: "75s", muscle: "Full Body" },
          { name: "Side Plank", sets: 3, reps: 30, rest: "60s", muscle: "Core" }
        ]
      },
      rest: {
        1: [
          { name: "Light Stretching", sets: 1, reps: 10, rest: "30s", muscle: "Recovery" },
          { name: "Foam Rolling", sets: 1, reps: 10, rest: "30s", muscle: "Recovery" },
          { name: "Walking", sets: 1, reps: 20, rest: "0s", muscle: "Active Recovery" }
        ],
        2: [
          { name: "Yoga Flow", sets: 1, reps: 15, rest: "0s", muscle: "Flexibility" },
          { name: "Mobility Work", sets: 1, reps: 10, rest: "30s", muscle: "Recovery" },
          { name: "Light Swimming", sets: 1, reps: 20, rest: "0s", muscle: "Active Recovery" }
        ],
        3: [
          { name: "Dynamic Stretching", sets: 1, reps: 10, rest: "30s", muscle: "Flexibility" },
          { name: "Massage/Self-Myofascial Release", sets: 1, reps: 15, rest: "0s", muscle: "Recovery" },
          { name: "Light Cycling", sets: 1, reps: 15, rest: "0s", muscle: "Active Recovery" }
        ]
      },
      chest: {
        1: [
          { name: "Push-ups", sets: 3, reps: 12, rest: "60s", muscle: "Chest" },
          { name: "Dumbbell Bench Press", sets: 3, reps: 10, rest: "75s", muscle: "Chest" },
          { name: "Incline Dumbbell Press", sets: 3, reps: 10, rest: "75s", muscle: "Upper Chest" },
          { name: "Decline Dumbbell Press", sets: 3, reps: 10, rest: "75s", muscle: "Lower Chest" },
          { name: "Cable Flyes", sets: 3, reps: 12, rest: "60s", muscle: "Chest" },
          { name: "Dumbbell Flyes", sets: 3, reps: 12, rest: "60s", muscle: "Chest" },
          { name: "Tricep Pushdowns", sets: 3, reps: 12, rest: "60s", muscle: "Triceps" },
          { name: "Overhead Tricep Extension", sets: 3, reps: 12, rest: "60s", muscle: "Triceps" },
          { name: "Tricep Dips (Assisted)", sets: 3, reps: 10, rest: "75s", muscle: "Triceps" }
        ],
        2: [
          { name: "Incline Push-ups", sets: 3, reps: 12, rest: "60s", muscle: "Upper Chest" },
          { name: "Machine Chest Press", sets: 3, reps: 10, rest: "75s", muscle: "Chest" },
          { name: "Decline Push-ups", sets: 3, reps: 10, rest: "75s", muscle: "Lower Chest" },
          { name: "Incline Machine Press", sets: 3, reps: 10, rest: "75s", muscle: "Upper Chest" },
          { name: "Pec Deck", sets: 3, reps: 12, rest: "60s", muscle: "Chest" },
          { name: "Cable Crossovers", sets: 3, reps: 12, rest: "60s", muscle: "Chest" },
          { name: "Rope Tricep Pushdowns", sets: 3, reps: 12, rest: "60s", muscle: "Triceps" },
          { name: "Tricep Dips", sets: 3, reps: 10, rest: "75s", muscle: "Triceps" },
          { name: "Skull Crushers", sets: 3, reps: 10, rest: "75s", muscle: "Triceps" }
        ],
        3: [
          { name: "Dumbbell Bench Press", sets: 3, reps: 10, rest: "75s", muscle: "Chest" },
          { name: "Incline Machine Press", sets: 3, reps: 10, rest: "75s", muscle: "Upper Chest" },
          { name: "Resistance Band Chest Press", sets: 3, reps: 12, rest: "60s", muscle: "Chest" },
          { name: "Decline Machine Press", sets: 3, reps: 10, rest: "75s", muscle: "Lower Chest" },
          { name: "Machine Flyes", sets: 3, reps: 15, rest: "60s", muscle: "Chest" },
          { name: "Plate Press", sets: 3, reps: 12, rest: "60s", muscle: "Chest" },
          { name: "Close Grip Push-ups", sets: 3, reps: 12, rest: "60s", muscle: "Triceps" },
          { name: "Tricep Kickbacks", sets: 3, reps: 12, rest: "60s", muscle: "Triceps" },
          { name: "Diamond Push-ups", sets: 3, reps: 10, rest: "60s", muscle: "Triceps" }
        ]
      },
      back: {
        1: [
          { name: "Lat Pulldowns", sets: 3, reps: 10, rest: "75s", muscle: "Lats" },
          { name: "Seated Cable Rows", sets: 3, reps: 10, rest: "75s", muscle: "Mid Back" },
          { name: "Dumbbell Rows", sets: 3, reps: 10, rest: "75s", muscle: "Mid Back" },
          { name: "Wide Grip Pulldowns", sets: 3, reps: 10, rest: "75s", muscle: "Lats" },
          { name: "Face Pulls", sets: 3, reps: 15, rest: "60s", muscle: "Rear Delts" },
          { name: "Reverse Flyes", sets: 3, reps: 12, rest: "60s", muscle: "Rear Delts" },
          { name: "Dumbbell Curls", sets: 3, reps: 12, rest: "60s", muscle: "Biceps" },
          { name: "Hammer Curls", sets: 3, reps: 12, rest: "60s", muscle: "Biceps" },
          { name: "Shrugs", sets: 3, reps: 15, rest: "60s", muscle: "Traps" }
        ],
        2: [
          { name: "Assisted Pull-ups", sets: 3, reps: 8, rest: "90s", muscle: "Lats" },
          { name: "Machine Rows", sets: 3, reps: 10, rest: "75s", muscle: "Mid Back" },
          { name: "T-Bar Rows", sets: 3, reps: 10, rest: "75s", muscle: "Mid Back" },
          { name: "Close Grip Pulldowns", sets: 3, reps: 10, rest: "75s", muscle: "Lats" },
          { name: "Reverse Flyes", sets: 3, reps: 12, rest: "60s", muscle: "Rear Delts" },
          { name: "Band Pull-aparts", sets: 3, reps: 15, rest: "60s", muscle: "Rear Delts" },
          { name: "Cable Curls", sets: 3, reps: 12, rest: "60s", muscle: "Biceps" },
          { name: "Preacher Curls", sets: 3, reps: 10, rest: "60s", muscle: "Biceps" },
          { name: "Dumbbell Shrugs", sets: 3, reps: 15, rest: "60s", muscle: "Traps" }
        ],
        3: [
          { name: "Resistance Band Pulldowns", sets: 3, reps: 12, rest: "60s", muscle: "Lats" },
          { name: "Single Arm Dumbbell Rows", sets: 3, reps: 10, rest: "75s", muscle: "Mid Back" },
          { name: "Inverted Rows", sets: 3, reps: 10, rest: "75s", muscle: "Mid Back" },
          { name: "Straight Arm Pulldowns", sets: 3, reps: 12, rest: "60s", muscle: "Lats" },
          { name: "Band Pull-aparts", sets: 3, reps: 15, rest: "60s", muscle: "Rear Delts" },
          { name: "Reverse Pec Deck", sets: 3, reps: 12, rest: "60s", muscle: "Rear Delts" },
          { name: "Barbell Curls", sets: 3, reps: 10, rest: "75s", muscle: "Biceps" },
          { name: "Concentration Curls", sets: 3, reps: 12, rest: "60s", muscle: "Biceps" },
          { name: "Machine Shrugs", sets: 3, reps: 15, rest: "60s", muscle: "Traps" }
        ]
      },
      shoulders: {
        1: [
          { name: "Dumbbell Shoulder Press", sets: 3, reps: 10, rest: "75s", muscle: "Shoulders" },
          { name: "Lateral Raises", sets: 3, reps: 12, rest: "60s", muscle: "Side Delts" },
          { name: "Front Raises", sets: 3, reps: 12, rest: "60s", muscle: "Front Delts" },
          { name: "Reverse Pec Deck", sets: 3, reps: 12, rest: "60s", muscle: "Rear Delts" },
          { name: "Face Pulls", sets: 3, reps: 15, rest: "60s", muscle: "Rear Delts" },
          { name: "Shrugs", sets: 3, reps: 15, rest: "60s", muscle: "Traps" },
          { name: "Upright Rows", sets: 3, reps: 12, rest: "60s", muscle: "Shoulders" },
          { name: "Cable Lateral Raises", sets: 3, reps: 12, rest: "60s", muscle: "Side Delts" },
          { name: "Arnold Press", sets: 3, reps: 10, rest: "75s", muscle: "Shoulders" }
        ],
        2: [
          { name: "Machine Shoulder Press", sets: 3, reps: 10, rest: "75s", muscle: "Shoulders" },
          { name: "Cable Lateral Raises", sets: 3, reps: 12, rest: "60s", muscle: "Side Delts" },
          { name: "Plate Raises", sets: 3, reps: 12, rest: "60s", muscle: "Front Delts" },
          { name: "Face Pulls", sets: 3, reps: 15, rest: "60s", muscle: "Rear Delts" },
          { name: "Bent Over Reverse Flyes", sets: 3, reps: 12, rest: "60s", muscle: "Rear Delts" },
          { name: "Dumbbell Shrugs", sets: 3, reps: 15, rest: "60s", muscle: "Traps" },
          { name: "Arnold Press", sets: 3, reps: 10, rest: "75s", muscle: "Shoulders" },
          { name: "Dumbbell Lateral Raises", sets: 3, reps: 12, rest: "60s", muscle: "Side Delts" },
          { name: "Seated Overhead Press", sets: 3, reps: 10, rest: "75s", muscle: "Shoulders" }
        ],
        3: [
          { name: "Pike Push-ups", sets: 3, reps: 10, rest: "75s", muscle: "Shoulders" },
          { name: "Dumbbell Lateral Raises", sets: 3, reps: 12, rest: "60s", muscle: "Side Delts" },
          { name: "Cable Front Raises", sets: 3, reps: 12, rest: "60s", muscle: "Front Delts" },
          { name: "Bent Over Reverse Flyes", sets: 3, reps: 12, rest: "60s", muscle: "Rear Delts" },
          { name: "Band Pull-aparts", sets: 3, reps: 15, rest: "60s", muscle: "Rear Delts" },
          { name: "Barbell Shrugs", sets: 3, reps: 15, rest: "60s", muscle: "Traps" },
          { name: "Overhead Press", sets: 3, reps: 10, rest: "75s", muscle: "Shoulders" },
          { name: "Machine Lateral Raises", sets: 3, reps: 12, rest: "60s", muscle: "Side Delts" },
          { name: "Handstand Push-ups (Assisted)", sets: 3, reps: 8, rest: "90s", muscle: "Shoulders" }
        ]
      }
    },
    intermediate: {
      push: {
        1: [
          { name: "Barbell Bench Press", sets: 4, reps: 8, rest: "90s", muscle: "Chest" },
          { name: "Incline Dumbbell Press", sets: 3, reps: 10, rest: "75s", muscle: "Upper Chest" },
          { name: "Decline Barbell Press", sets: 3, reps: 8, rest: "90s", muscle: "Lower Chest" },
          { name: "Shoulder Press", sets: 4, reps: 8, rest: "90s", muscle: "Shoulders" },
          { name: "Lateral Raises", sets: 3, reps: 12, rest: "60s", muscle: "Side Delts" },
          { name: "Front Raises", sets: 3, reps: 12, rest: "60s", muscle: "Front Delts" },
          { name: "Tricep Dips", sets: 3, reps: 10, rest: "75s", muscle: "Triceps" },
          { name: "Overhead Tricep Extension", sets: 3, reps: 12, rest: "60s", muscle: "Triceps" },
          { name: "Cable Flyes", sets: 3, reps: 15, rest: "60s", muscle: "Chest" }
        ],
        2: [
          { name: "Dumbbell Bench Press", sets: 4, reps: 10, rest: "75s", muscle: "Chest" },
          { name: "Incline Barbell Press", sets: 3, reps: 8, rest: "90s", muscle: "Upper Chest" },
          { name: "Cable Crossovers", sets: 3, reps: 15, rest: "60s", muscle: "Chest" },
          { name: "Machine Shoulder Press", sets: 4, reps: 10, rest: "75s", muscle: "Shoulders" },
          { name: "Machine Lateral Raises", sets: 3, reps: 12, rest: "60s", muscle: "Side Delts" },
          { name: "Reverse Pec Deck", sets: 3, reps: 12, rest: "60s", muscle: "Rear Delts" },
          { name: "Rope Tricep Pushdowns", sets: 3, reps: 12, rest: "60s", muscle: "Triceps" },
          { name: "Skull Crushers", sets: 3, reps: 10, rest: "75s", muscle: "Triceps" },
          { name: "Pec Deck", sets: 3, reps: 12, rest: "60s", muscle: "Chest" }
        ],
        3: [
          { name: "Smith Machine Bench Press", sets: 4, reps: 10, rest: "75s", muscle: "Chest" },
          { name: "Decline Dumbbell Press", sets: 3, reps: 10, rest: "75s", muscle: "Lower Chest" },
          { name: "Incline Machine Press", sets: 3, reps: 10, rest: "75s", muscle: "Upper Chest" },
          { name: "Dumbbell Shoulder Press", sets: 4, reps: 10, rest: "75s", muscle: "Shoulders" },
          { name: "Plate Raises", sets: 3, reps: 12, rest: "60s", muscle: "Front Delts" },
          { name: "Cable Lateral Raises", sets: 3, reps: 12, rest: "60s", muscle: "Side Delts" },
          { name: "V-Bar Tricep Pushdowns", sets: 3, reps: 12, rest: "60s", muscle: "Triceps" },
          { name: "Tricep Kickbacks", sets: 3, reps: 12, rest: "60s", muscle: "Triceps" },
          { name: "Machine Chest Flyes", sets: 3, reps: 15, rest: "60s", muscle: "Chest" }
        ]
      },
      pull: {
        1: [
          { name: "Deadlifts", sets: 4, reps: 6, rest: "120s", muscle: "Back/Hamstrings" },
          { name: "Pull-ups", sets: 4, reps: 8, rest: "90s", muscle: "Lats" },
          { name: "Barbell Rows", sets: 4, reps: 8, rest: "90s", muscle: "Mid Back" },
          { name: "T-Bar Rows", sets: 4, reps: 8, rest: "90s", muscle: "Mid Back" },
          { name: "Face Pulls", sets: 3, reps: 15, rest: "60s", muscle: "Rear Delts" },
          { name: "Reverse Flyes", sets: 3, reps: 12, rest: "60s", muscle: "Rear Delts" },
          { name: "Barbell Curls", sets: 3, reps: 10, rest: "75s", muscle: "Biceps" },
          { name: "Hammer Curls", sets: 3, reps: 12, rest: "60s", muscle: "Biceps" },
          { name: "Shrugs", sets: 3, reps: 15, rest: "60s", muscle: "Traps" }
        ],
        2: [
          { name: "Sumo Deadlifts", sets: 4, reps: 8, rest: "120s", muscle: "Back/Glutes" },
          { name: "Assisted Pull-ups", sets: 4, reps: 10, rest: "75s", muscle: "Lats" },
          { name: "Dumbbell Rows", sets: 4, reps: 10, rest: "75s", muscle: "Mid Back" },
          { name: "Seated Cable Rows", sets: 4, reps: 10, rest: "75s", muscle: "Mid Back" },
          { name: "Reverse Pec Deck", sets: 3, reps: 12, rest: "60s", muscle: "Rear Delts" },
          { name: "Band Pull-aparts", sets: 3, reps: 15, rest: "60s", muscle: "Rear Delts" },
          { name: "Dumbbell Curls", sets: 3, reps: 12, rest: "60s", muscle: "Biceps" },
          { name: "Cable Curls", sets: 3, reps: 12, rest: "60s", muscle: "Biceps" },
          { name: "Dumbbell Shrugs", sets: 3, reps: 12, rest: "60s", muscle: "Traps" }
        ],
        3: [
          { name: "Trap Bar Deadlifts", sets: 4, reps: 8, rest: "120s", muscle: "Back/Hamstrings" },
          { name: "Lat Pulldowns", sets: 4, reps: 10, rest: "75s", muscle: "Lats" },
          { name: "T-Bar Rows", sets: 4, reps: 8, rest: "90s", muscle: "Mid Back" },
          { name: "Band Pull-aparts", sets: 3, reps: 15, rest: "60s", muscle: "Rear Delts" },
          { name: "Preacher Curls", sets: 3, reps: 10, rest: "75s", muscle: "Biceps" },
          { name: "Machine Curls", sets: 3, reps: 12, rest: "60s", muscle: "Biceps" },
          { name: "Machine Shrugs", sets: 3, reps: 15, rest: "60s", muscle: "Traps" }
        ]
      },
      legs: {
        1: [
          { name: "Barbell Squats", sets: 4, reps: 8, rest: "120s", muscle: "Quads" },
          { name: "Romanian Deadlifts", sets: 4, reps: 10, rest: "90s", muscle: "Hamstrings" },
          { name: "Leg Press", sets: 4, reps: 12, rest: "90s", muscle: "Quads" },
          { name: "Walking Lunges", sets: 3, reps: 12, rest: "75s", muscle: "Quads/Glutes" },
          { name: "Leg Curls", sets: 3, reps: 12, rest: "60s", muscle: "Hamstrings" },
          { name: "Calf Raises", sets: 4, reps: 15, rest: "60s", muscle: "Calves" },
          { name: "Bulgarian Split Squats", sets: 3, reps: 10, rest: "75s", muscle: "Quads/Glutes" }
        ],
        2: [
          { name: "Front Squats", sets: 4, reps: 8, rest: "120s", muscle: "Quads" },
          { name: "Deadlifts", sets: 4, reps: 6, rest: "120s", muscle: "Hamstrings/Back" },
          { name: "Smith Machine Squats", sets: 4, reps: 10, rest: "90s", muscle: "Quads" },
          { name: "Step-ups", sets: 3, reps: 12, rest: "75s", muscle: "Quads/Glutes" },
          { name: "Lying Leg Curls", sets: 3, reps: 12, rest: "60s", muscle: "Hamstrings" },
          { name: "Seated Calf Raises", sets: 4, reps: 15, rest: "60s", muscle: "Calves" },
          { name: "Leg Extensions", sets: 3, reps: 12, rest: "60s", muscle: "Quads" }
        ],
        3: [
          { name: "Hack Squats", sets: 4, reps: 10, rest: "90s", muscle: "Quads" },
          { name: "Sumo Deadlifts", sets: 4, reps: 8, rest: "120s", muscle: "Hamstrings/Glutes" },
          { name: "V-Squat Machine", sets: 4, reps: 12, rest: "75s", muscle: "Quads" },
          { name: "Reverse Lunges", sets: 3, reps: 12, rest: "75s", muscle: "Quads/Glutes" },
          { name: "Leg Press Hamstring Focus", sets: 3, reps: 12, rest: "60s", muscle: "Hamstrings" },
          { name: "Donkey Calf Raises", sets: 4, reps: 12, rest: "60s", muscle: "Calves" },
          { name: "Sissy Squats", sets: 3, reps: 12, rest: "60s", muscle: "Quads" }
        ]
      },
      fullbody: {
        1: [
          { name: "Barbell Squats", sets: 4, reps: 8, rest: "120s", muscle: "Legs" },
          { name: "Barbell Bench Press", sets: 4, reps: 8, rest: "90s", muscle: "Chest" },
          { name: "Barbell Rows", sets: 4, reps: 8, rest: "90s", muscle: "Back" },
          { name: "Shoulder Press", sets: 4, reps: 8, rest: "90s", muscle: "Shoulders" },
          { name: "Romanian Deadlifts", sets: 3, reps: 10, rest: "75s", muscle: "Hamstrings" },
          { name: "Barbell Curls", sets: 3, reps: 10, rest: "75s", muscle: "Biceps" },
          { name: "Tricep Dips", sets: 3, reps: 10, rest: "75s", muscle: "Triceps" },
          { name: "Hanging Leg Raises", sets: 3, reps: 12, rest: "60s", muscle: "Core" }
        ],
        2: [
          { name: "Front Squats", sets: 4, reps: 8, rest: "120s", muscle: "Legs" },
          { name: "Incline Dumbbell Press", sets: 4, reps: 10, rest: "75s", muscle: "Chest" },
          { name: "Pull-ups", sets: 4, reps: 8, rest: "90s", muscle: "Back" },
          { name: "Lateral Raises", sets: 3, reps: 12, rest: "60s", muscle: "Shoulders" },
          { name: "Leg Press", sets: 4, reps: 12, rest: "90s", muscle: "Quads" },
          { name: "Hammer Curls", sets: 3, reps: 12, rest: "60s", muscle: "Biceps" },
          { name: "Skull Crushers", sets: 3, reps: 10, rest: "75s", muscle: "Triceps" },
          { name: "Cable Crunches", sets: 3, reps: 15, rest: "60s", muscle: "Core" }
        ],
        3: [
          { name: "Deadlifts", sets: 4, reps: 6, rest: "120s", muscle: "Back/Hamstrings" },
          { name: "Dumbbell Bench Press", sets: 4, reps: 10, rest: "75s", muscle: "Chest" },
          { name: "Lat Pulldowns", sets: 4, reps: 10, rest: "75s", muscle: "Lats" },
          { name: "Machine Shoulder Press", sets: 4, reps: 10, rest: "75s", muscle: "Shoulders" },
          { name: "Walking Lunges", sets: 3, reps: 12, rest: "75s", muscle: "Quads/Glutes" },
          { name: "Preacher Curls", sets: 3, reps: 10, rest: "75s", muscle: "Biceps" },
          { name: "Rope Tricep Pushdowns", sets: 3, reps: 12, rest: "60s", muscle: "Triceps" },
          { name: "Plank", sets: 3, reps: 60, rest: "60s", muscle: "Core" }
        ]
      },
      cardio: {
        1: [
          { name: "Treadmill Running", sets: 1, reps: 30, rest: "0s", muscle: "Cardio" },
          { name: "Burpees", sets: 4, reps: 15, rest: "60s", muscle: "Full Body" },
          { name: "Mountain Climbers", sets: 4, reps: 30, rest: "60s", muscle: "Core/Cardio" },
          { name: "Jump Rope", sets: 4, reps: 60, rest: "60s", muscle: "Cardio" },
          { name: "Hanging Leg Raises", sets: 3, reps: 12, rest: "60s", muscle: "Core" }
        ],
        2: [
          { name: "Rowing Machine", sets: 1, reps: 25, rest: "0s", muscle: "Cardio" },
          { name: "Box Jumps", sets: 4, reps: 12, rest: "75s", muscle: "Legs/Cardio" },
          { name: "Battle Ropes", sets: 4, reps: 30, rest: "60s", muscle: "Full Body" },
          { name: "High Knees", sets: 4, reps: 40, rest: "60s", muscle: "Cardio" },
          { name: "Cable Crunches", sets: 3, reps: 15, rest: "60s", muscle: "Core" }
        ],
        3: [
          { name: "Cycling", sets: 1, reps: 35, rest: "0s", muscle: "Cardio" },
          { name: "Kettlebell Swings", sets: 4, reps: 20, rest: "75s", muscle: "Full Body" },
          { name: "Sprint Intervals", sets: 6, reps: 30, rest: "90s", muscle: "Cardio" },
          { name: "Burpee Box Jumps", sets: 4, reps: 10, rest: "75s", muscle: "Full Body" },
          { name: "Russian Twists", sets: 3, reps: 30, rest: "60s", muscle: "Core" }
        ]
      },
      rest: {
        1: [
          { name: "Yoga Flow", sets: 1, reps: 20, rest: "0s", muscle: "Flexibility" },
          { name: "Foam Rolling", sets: 1, reps: 15, rest: "30s", muscle: "Recovery" },
          { name: "Light Walking", sets: 1, reps: 30, rest: "0s", muscle: "Active Recovery" }
        ],
        2: [
          { name: "Dynamic Stretching", sets: 1, reps: 15, rest: "30s", muscle: "Flexibility" },
          { name: "Mobility Drills", sets: 1, reps: 15, rest: "30s", muscle: "Recovery" },
          { name: "Swimming", sets: 1, reps: 20, rest: "0s", muscle: "Active Recovery" }
        ],
        3: [
          { name: "Pilates", sets: 1, reps: 30, rest: "0s", muscle: "Core/Flexibility" },
          { name: "Self-Myofascial Release", sets: 1, reps: 20, rest: "0s", muscle: "Recovery" },
          { name: "Light Cycling", sets: 1, reps: 20, rest: "0s", muscle: "Active Recovery" }
        ]
      },
      chest: {
        1: [
          { name: "Barbell Bench Press", sets: 4, reps: 8, rest: "90s", muscle: "Chest" },
          { name: "Incline Dumbbell Press", sets: 3, reps: 10, rest: "75s", muscle: "Upper Chest" },
          { name: "Decline Dumbbell Press", sets: 3, reps: 10, rest: "75s", muscle: "Lower Chest" },
          { name: "Cable Flyes", sets: 3, reps: 15, rest: "60s", muscle: "Chest" },
          { name: "Tricep Dips", sets: 3, reps: 10, rest: "75s", muscle: "Triceps" },
          { name: "Overhead Tricep Extension", sets: 3, reps: 12, rest: "60s", muscle: "Triceps" }
        ],
        2: [
          { name: "Dumbbell Bench Press", sets: 4, reps: 10, rest: "75s", muscle: "Chest" },
          { name: "Incline Barbell Press", sets: 3, reps: 8, rest: "90s", muscle: "Upper Chest" },
          { name: "Machine Chest Press", sets: 3, reps: 10, rest: "75s", muscle: "Chest" },
          { name: "Pec Deck", sets: 3, reps: 12, rest: "60s", muscle: "Chest" },
          { name: "Rope Tricep Pushdowns", sets: 3, reps: 12, rest: "60s", muscle: "Triceps" },
          { name: "Skull Crushers", sets: 3, reps: 10, rest: "75s", muscle: "Triceps" }
        ],
        3: [
          { name: "Smith Machine Bench Press", sets: 4, reps: 10, rest: "75s", muscle: "Chest" },
          { name: "Incline Machine Press", sets: 3, reps: 10, rest: "75s", muscle: "Upper Chest" },
          { name: "Cable Crossovers", sets: 3, reps: 15, rest: "60s", muscle: "Chest" },
          { name: "Machine Flyes", sets: 3, reps: 15, rest: "60s", muscle: "Chest" },
          { name: "V-Bar Tricep Pushdowns", sets: 3, reps: 12, rest: "60s", muscle: "Triceps" },
          { name: "Tricep Kickbacks", sets: 3, reps: 12, rest: "60s", muscle: "Triceps" }
        ]
      },
      back: {
        1: [
          { name: "Deadlifts", sets: 4, reps: 6, rest: "120s", muscle: "Back/Hamstrings" },
          { name: "Pull-ups", sets: 4, reps: 8, rest: "90s", muscle: "Lats" },
          { name: "Barbell Rows", sets: 4, reps: 8, rest: "90s", muscle: "Mid Back" },
          { name: "Face Pulls", sets: 3, reps: 15, rest: "60s", muscle: "Rear Delts" },
          { name: "Barbell Curls", sets: 3, reps: 10, rest: "75s", muscle: "Biceps" },
          { name: "Hammer Curls", sets: 3, reps: 12, rest: "60s", muscle: "Biceps" }
        ],
        2: [
          { name: "Sumo Deadlifts", sets: 4, reps: 8, rest: "120s", muscle: "Back/Glutes" },
          { name: "Assisted Pull-ups", sets: 4, reps: 10, rest: "75s", muscle: "Lats" },
          { name: "Dumbbell Rows", sets: 4, reps: 10, rest: "75s", muscle: "Mid Back" },
          { name: "Reverse Pec Deck", sets: 3, reps: 12, rest: "60s", muscle: "Rear Delts" },
          { name: "Dumbbell Curls", sets: 3, reps: 12, rest: "60s", muscle: "Biceps" },
          { name: "Cable Curls", sets: 3, reps: 12, rest: "60s", muscle: "Biceps" }
        ],
        3: [
          { name: "Trap Bar Deadlifts", sets: 4, reps: 8, rest: "120s", muscle: "Back/Hamstrings" },
          { name: "Lat Pulldowns", sets: 4, reps: 10, rest: "75s", muscle: "Lats" },
          { name: "T-Bar Rows", sets: 4, reps: 8, rest: "90s", muscle: "Mid Back" },
          { name: "Band Pull-aparts", sets: 3, reps: 15, rest: "60s", muscle: "Rear Delts" },
          { name: "Preacher Curls", sets: 3, reps: 10, rest: "75s", muscle: "Biceps" },
          { name: "Machine Curls", sets: 3, reps: 12, rest: "60s", muscle: "Biceps" }
        ]
      },
      shoulders: {
        1: [
          { name: "Shoulder Press", sets: 4, reps: 8, rest: "90s", muscle: "Shoulders" },
          { name: "Lateral Raises", sets: 3, reps: 12, rest: "60s", muscle: "Side Delts" },
          { name: "Front Raises", sets: 3, reps: 12, rest: "60s", muscle: "Front Delts" },
          { name: "Face Pulls", sets: 3, reps: 15, rest: "60s", muscle: "Rear Delts" },
          { name: "Shrugs", sets: 3, reps: 15, rest: "60s", muscle: "Traps" },
          { name: "Upright Rows", sets: 3, reps: 12, rest: "60s", muscle: "Shoulders" }
        ],
        2: [
          { name: "Machine Shoulder Press", sets: 4, reps: 10, rest: "75s", muscle: "Shoulders" },
          { name: "Cable Lateral Raises", sets: 3, reps: 12, rest: "60s", muscle: "Side Delts" },
          { name: "Plate Raises", sets: 3, reps: 12, rest: "60s", muscle: "Front Delts" },
          { name: "Reverse Pec Deck", sets: 3, reps: 12, rest: "60s", muscle: "Rear Delts" },
          { name: "Dumbbell Shrugs", sets: 3, reps: 12, rest: "60s", muscle: "Traps" },
          { name: "Arnold Press", sets: 3, reps: 10, rest: "75s", muscle: "Shoulders" }
        ],
        3: [
          { name: "Dumbbell Shoulder Press", sets: 4, reps: 10, rest: "75s", muscle: "Shoulders" },
          { name: "Machine Lateral Raises", sets: 3, reps: 12, rest: "60s", muscle: "Side Delts" },
          { name: "Cable Front Raises", sets: 3, reps: 12, rest: "60s", muscle: "Front Delts" },
          { name: "Bent Over Reverse Flyes", sets: 3, reps: 12, rest: "60s", muscle: "Rear Delts" },
          { name: "Machine Shrugs", sets: 3, reps: 15, rest: "60s", muscle: "Traps" },
          { name: "Overhead Press", sets: 4, reps: 8, rest: "90s", muscle: "Shoulders" }
        ]
      }
    },
    pro: {
      push: {
        1: [
          { name: "Barbell Bench Press", sets: 5, reps: 5, rest: "120s", muscle: "Chest" },
          { name: "Incline Barbell Press", sets: 4, reps: 6, rest: "120s", muscle: "Upper Chest" },
          { name: "Weighted Dips", sets: 4, reps: 8, rest: "90s", muscle: "Chest/Triceps" },
          { name: "Overhead Press", sets: 4, reps: 6, rest: "120s", muscle: "Shoulders" },
          { name: "Lateral Raises", sets: 4, reps: 12, rest: "60s", muscle: "Side Delts" },
          { name: "Close Grip Bench Press", sets: 4, reps: 8, rest: "90s", muscle: "Triceps" },
          { name: "Overhead Tricep Extension", sets: 3, reps: 12, rest: "60s", muscle: "Triceps" },
          { name: "Cable Flyes", sets: 3, reps: 15, rest: "60s", muscle: "Chest" }
        ],
        2: [
          { name: "Dumbbell Bench Press", sets: 5, reps: 6, rest: "120s", muscle: "Chest" },
          { name: "Decline Barbell Press", sets: 4, reps: 6, rest: "120s", muscle: "Lower Chest" },
          { name: "Machine Chest Press", sets: 4, reps: 8, rest: "90s", muscle: "Chest" },
          { name: "Dumbbell Shoulder Press", sets: 4, reps: 8, rest: "90s", muscle: "Shoulders" },
          { name: "Machine Lateral Raises", sets: 4, reps: 12, rest: "60s", muscle: "Side Delts" },
          { name: "Skull Crushers", sets: 4, reps: 8, rest: "90s", muscle: "Triceps" },
          { name: "Rope Tricep Pushdowns", sets: 3, reps: 12, rest: "60s", muscle: "Triceps" },
          { name: "Pec Deck", sets: 3, reps: 15, rest: "60s", muscle: "Chest" }
        ],
        3: [
          { name: "Smith Machine Bench Press", sets: 5, reps: 6, rest: "120s", muscle: "Chest" },
          { name: "Hammer Strength Chest Press", sets: 4, reps: 8, rest: "90s", muscle: "Chest" },
          { name: "Plate-Loaded Chest Press", sets: 4, reps: 8, rest: "90s", muscle: "Chest" },
          { name: "Machine Shoulder Press", sets: 4, reps: 8, rest: "90s", muscle: "Shoulders" },
          { name: "Plate Raises", sets: 4, reps: 12, rest: "60s", muscle: "Front Delts" },
          { name: "V-Bar Tricep Pushdowns", sets: 4, reps: 10, rest: "75s", muscle: "Triceps" },
          { name: "Tricep Kickbacks", sets: 3, reps: 12, rest: "60s", muscle: "Triceps" },
          { name: "Machine Chest Flyes", sets: 3, reps: 15, rest: "60s", muscle: "Chest" }
        ]
      },
      pull: {
        1: [
          { name: "Deadlifts", sets: 5, reps: 5, rest: "180s", muscle: "Back/Hamstrings" },
          { name: "Weighted Pull-ups", sets: 4, reps: 6, rest: "120s", muscle: "Lats" },
          { name: "Barbell Rows", sets: 4, reps: 6, rest: "120s", muscle: "Mid Back" },
          { name: "T-Bar Rows", sets: 4, reps: 8, rest: "90s", muscle: "Mid Back" },
          { name: "Face Pulls", sets: 4, reps: 15, rest: "60s", muscle: "Rear Delts" },
          { name: "Barbell Curls", sets: 4, reps: 8, rest: "75s", muscle: "Biceps" },
          { name: "Hammer Curls", sets: 3, reps: 10, rest: "60s", muscle: "Biceps" },
          { name: "Shrugs", sets: 4, reps: 12, rest: "60s", muscle: "Traps" }
        ],
        2: [
          { name: "Sumo Deadlifts", sets: 5, reps: 5, rest: "180s", muscle: "Back/Glutes" },
          { name: "Assisted Weighted Pull-ups", sets: 4, reps: 8, rest: "120s", muscle: "Lats" },
          { name: "Dumbbell Rows", sets: 4, reps: 8, rest: "90s", muscle: "Mid Back" },
          { name: "Seal Rows", sets: 4, reps: 8, rest: "90s", muscle: "Mid Back" },
          { name: "Reverse Pec Deck", sets: 4, reps: 12, rest: "60s", muscle: "Rear Delts" },
          { name: "Dumbbell Curls", sets: 4, reps: 10, rest: "75s", muscle: "Biceps" },
          { name: "Cable Curls", sets: 3, reps: 12, rest: "60s", muscle: "Biceps" },
          { name: "Dumbbell Shrugs", sets: 4, reps: 12, rest: "60s", muscle: "Traps" }
        ],
        3: [
          { name: "Trap Bar Deadlifts", sets: 5, reps: 5, rest: "180s", muscle: "Back/Hamstrings" },
          { name: "Lat Pulldowns", sets: 4, reps: 8, rest: "90s", muscle: "Lats" },
          { name: "Machine Rows", sets: 4, reps: 8, rest: "90s", muscle: "Mid Back" },
          { name: "Plate-Loaded Rows", sets: 4, reps: 8, rest: "90s", muscle: "Mid Back" },
          { name: "Band Pull-aparts", sets: 4, reps: 15, rest: "60s", muscle: "Rear Delts" },
          { name: "Preacher Curls", sets: 4, reps: 8, rest: "75s", muscle: "Biceps" },
          { name: "Machine Curls", sets: 3, reps: 12, rest: "60s", muscle: "Biceps" },
          { name: "Machine Shrugs", sets: 4, reps: 15, rest: "60s", muscle: "Traps" }
        ]
      },
      legs: {
        1: [
          { name: "Barbell Squats", sets: 5, reps: 5, rest: "180s", muscle: "Quads" },
          { name: "Front Squats", sets: 4, reps: 6, rest: "120s", muscle: "Quads" },
          { name: "Romanian Deadlifts", sets: 4, reps: 8, rest: "120s", muscle: "Hamstrings" },
          { name: "Leg Press", sets: 4, reps: 10, rest: "90s", muscle: "Quads" },
          { name: "Walking Lunges", sets: 4, reps: 12, rest: "75s", muscle: "Quads/Glutes" },
          { name: "Leg Curls", sets: 4, reps: 12, rest: "60s", muscle: "Hamstrings" },
          { name: "Bulgarian Split Squats", sets: 4, reps: 10, rest: "75s", muscle: "Quads/Glutes" },
          { name: "Calf Raises", sets: 5, reps: 15, rest: "60s", muscle: "Calves" }
        ],
        2: [
          { name: "Hack Squats", sets: 5, reps: 6, rest: "120s", muscle: "Quads" },
          { name: "Leg Press", sets: 4, reps: 8, rest: "120s", muscle: "Quads" },
          { name: "Deadlifts", sets: 4, reps: 6, rest: "120s", muscle: "Hamstrings/Back" },
          { name: "V-Squat Machine", sets: 4, reps: 10, rest: "90s", muscle: "Quads" },
          { name: "Reverse Lunges", sets: 4, reps: 12, rest: "75s", muscle: "Quads/Glutes" },
          { name: "Lying Leg Curls", sets: 4, reps: 12, rest: "60s", muscle: "Hamstrings" },
          { name: "Leg Extensions", sets: 4, reps: 12, rest: "60s", muscle: "Quads" },
          { name: "Seated Calf Raises", sets: 5, reps: 15, rest: "60s", muscle: "Calves" }
        ],
        3: [
          { name: "Smith Machine Squats", sets: 5, reps: 6, rest: "120s", muscle: "Quads" },
          { name: "Pendulum Squat", sets: 4, reps: 8, rest: "120s", muscle: "Quads" },
          { name: "Sumo Deadlifts", sets: 4, reps: 6, rest: "120s", muscle: "Hamstrings/Glutes" },
          { name: "Plate-Loaded Leg Press", sets: 4, reps: 10, rest: "90s", muscle: "Quads" },
          { name: "Step-ups", sets: 4, reps: 12, rest: "75s", muscle: "Quads/Glutes" },
          { name: "Leg Press Hamstring Focus", sets: 4, reps: 12, rest: "60s", muscle: "Hamstrings" },
          { name: "Sissy Squats", sets: 4, reps: 12, rest: "60s", muscle: "Quads" },
          { name: "Donkey Calf Raises", sets: 5, reps: 12, rest: "60s", muscle: "Calves" }
        ]
      },
      fullbody: {
        1: [
          { name: "Barbell Squats", sets: 5, reps: 5, rest: "180s", muscle: "Legs" },
          { name: "Barbell Bench Press", sets: 5, reps: 5, rest: "120s", muscle: "Chest" },
          { name: "Deadlifts", sets: 5, reps: 5, rest: "180s", muscle: "Back/Hamstrings" },
          { name: "Overhead Press", sets: 4, reps: 6, rest: "120s", muscle: "Shoulders" },
          { name: "Weighted Pull-ups", sets: 4, reps: 6, rest: "120s", muscle: "Lats" },
          { name: "Barbell Curls", sets: 4, reps: 8, rest: "75s", muscle: "Biceps" },
          { name: "Close Grip Bench Press", sets: 4, reps: 8, rest: "90s", muscle: "Triceps" },
          { name: "Hanging Leg Raises", sets: 4, reps: 15, rest: "60s", muscle: "Core" }
        ],
        2: [
          { name: "Front Squats", sets: 5, reps: 6, rest: "120s", muscle: "Legs" },
          { name: "Incline Barbell Press", sets: 4, reps: 6, rest: "120s", muscle: "Upper Chest" },
          { name: "Barbell Rows", sets: 4, reps: 6, rest: "120s", muscle: "Mid Back" },
          { name: "Dumbbell Shoulder Press", sets: 4, reps: 8, rest: "90s", muscle: "Shoulders" },
          { name: "Romanian Deadlifts", sets: 4, reps: 8, rest: "120s", muscle: "Hamstrings" },
          { name: "Hammer Curls", sets: 4, reps: 10, rest: "75s", muscle: "Biceps" },
          { name: "Skull Crushers", sets: 4, reps: 8, rest: "90s", muscle: "Triceps" },
          { name: "Cable Crunches", sets: 4, reps: 20, rest: "60s", muscle: "Core" }
        ],
        3: [
          { name: "Hack Squats", sets: 5, reps: 6, rest: "120s", muscle: "Quads" },
          { name: "Weighted Dips", sets: 4, reps: 8, rest: "90s", muscle: "Chest/Triceps" },
          { name: "T-Bar Rows", sets: 4, reps: 8, rest: "90s", muscle: "Mid Back" },
          { name: "Machine Shoulder Press", sets: 4, reps: 8, rest: "90s", muscle: "Shoulders" },
          { name: "Leg Press", sets: 4, reps: 10, rest: "90s", muscle: "Quads" },
          { name: "Preacher Curls", sets: 4, reps: 8, rest: "75s", muscle: "Biceps" },
          { name: "V-Bar Tricep Pushdowns", sets: 4, reps: 10, rest: "75s", muscle: "Triceps" },
          { name: "Weighted Plank", sets: 4, reps: 60, rest: "60s", muscle: "Core" }
        ]
      },
      cardio: {
        1: [
          { name: "HIIT Treadmill", sets: 1, reps: 30, rest: "0s", muscle: "Cardio" },
          { name: "Burpees", sets: 5, reps: 20, rest: "60s", muscle: "Full Body" },
          { name: "Box Jumps", sets: 5, reps: 15, rest: "75s", muscle: "Legs/Cardio" },
          { name: "Battle Ropes", sets: 5, reps: 45, rest: "60s", muscle: "Full Body" },
          { name: "Hanging Leg Raises", sets: 4, reps: 15, rest: "60s", muscle: "Core" }
        ],
        2: [
          { name: "Rowing Machine Intervals", sets: 1, reps: 30, rest: "0s", muscle: "Cardio" },
          { name: "Kettlebell Swings", sets: 5, reps: 25, rest: "75s", muscle: "Full Body" },
          { name: "Sprint Intervals", sets: 8, reps: 30, rest: "90s", muscle: "Cardio" },
          { name: "Burpee Box Jumps", sets: 5, reps: 12, rest: "75s", muscle: "Full Body" },
          { name: "Cable Crunches", sets: 4, reps: 20, rest: "60s", muscle: "Core" }
        ],
        3: [
          { name: "Assault Bike", sets: 1, reps: 25, rest: "0s", muscle: "Cardio" },
          { name: "Sled Push", sets: 5, reps: 30, rest: "90s", muscle: "Full Body" },
          { name: "Jump Rope Double Unders", sets: 5, reps: 50, rest: "60s", muscle: "Cardio" },
          { name: "Medicine Ball Slams", sets: 5, reps: 15, rest: "60s", muscle: "Full Body" },
          { name: "Weighted Russian Twists", sets: 4, reps: 40, rest: "60s", muscle: "Core" }
        ]
      },
      rest: {
        1: [
          { name: "Advanced Yoga", sets: 1, reps: 30, rest: "0s", muscle: "Flexibility" },
          { name: "Deep Tissue Massage", sets: 1, reps: 30, rest: "0s", muscle: "Recovery" },
          { name: "Light Swimming", sets: 1, reps: 30, rest: "0s", muscle: "Active Recovery" }
        ],
        2: [
          { name: "Mobility Flow", sets: 1, reps: 20, rest: "0s", muscle: "Flexibility" },
          { name: "Foam Rolling Session", sets: 1, reps: 20, rest: "0s", muscle: "Recovery" },
          { name: "Sauna/Steam Room", sets: 1, reps: 20, rest: "0s", muscle: "Recovery" }
        ],
        3: [
          { name: "Stretching Routine", sets: 1, reps: 25, rest: "0s", muscle: "Flexibility" },
          { name: "Contrast Therapy", sets: 1, reps: 15, rest: "0s", muscle: "Recovery" },
          { name: "Light Cycling", sets: 1, reps: 30, rest: "0s", muscle: "Active Recovery" }
        ]
      },
      chest: {
        1: [
          { name: "Barbell Bench Press", sets: 5, reps: 5, rest: "120s", muscle: "Chest" },
          { name: "Incline Barbell Press", sets: 4, reps: 6, rest: "120s", muscle: "Upper Chest" },
          { name: "Decline Barbell Press", sets: 4, reps: 6, rest: "120s", muscle: "Lower Chest" },
          { name: "Cable Flyes", sets: 3, reps: 15, rest: "60s", muscle: "Chest" },
          { name: "Weighted Dips", sets: 4, reps: 8, rest: "90s", muscle: "Chest/Triceps" },
          { name: "Close Grip Bench Press", sets: 4, reps: 8, rest: "90s", muscle: "Triceps" }
        ],
        2: [
          { name: "Dumbbell Bench Press", sets: 5, reps: 6, rest: "120s", muscle: "Chest" },
          { name: "Incline Dumbbell Press", sets: 4, reps: 8, rest: "90s", muscle: "Upper Chest" },
          { name: "Machine Chest Press", sets: 4, reps: 8, rest: "90s", muscle: "Chest" },
          { name: "Pec Deck", sets: 3, reps: 15, rest: "60s", muscle: "Chest" },
          { name: "Skull Crushers", sets: 4, reps: 8, rest: "90s", muscle: "Triceps" },
          { name: "Rope Tricep Pushdowns", sets: 3, reps: 12, rest: "60s", muscle: "Triceps" }
        ],
        3: [
          { name: "Smith Machine Bench Press", sets: 5, reps: 6, rest: "120s", muscle: "Chest" },
          { name: "Hammer Strength Chest Press", sets: 4, reps: 8, rest: "90s", muscle: "Chest" },
          { name: "Cable Crossovers", sets: 4, reps: 15, rest: "60s", muscle: "Chest" },
          { name: "Machine Flyes", sets: 3, reps: 15, rest: "60s", muscle: "Chest" },
          { name: "V-Bar Tricep Pushdowns", sets: 4, reps: 10, rest: "75s", muscle: "Triceps" },
          { name: "Overhead Tricep Extension", sets: 3, reps: 12, rest: "60s", muscle: "Triceps" }
        ]
      },
      back: {
        1: [
          { name: "Deadlifts", sets: 5, reps: 5, rest: "180s", muscle: "Back/Hamstrings" },
          { name: "Weighted Pull-ups", sets: 4, reps: 6, rest: "120s", muscle: "Lats" },
          { name: "Barbell Rows", sets: 4, reps: 6, rest: "120s", muscle: "Mid Back" },
          { name: "T-Bar Rows", sets: 4, reps: 8, rest: "90s", muscle: "Mid Back" },
          { name: "Face Pulls", sets: 4, reps: 15, rest: "60s", muscle: "Rear Delts" },
          { name: "Barbell Curls", sets: 4, reps: 8, rest: "75s", muscle: "Biceps" },
          { name: "Hammer Curls", sets: 3, reps: 10, rest: "60s", muscle: "Biceps" }
        ],
        2: [
          { name: "Sumo Deadlifts", sets: 5, reps: 5, rest: "180s", muscle: "Back/Glutes" },
          { name: "Assisted Weighted Pull-ups", sets: 4, reps: 8, rest: "120s", muscle: "Lats" },
          { name: "Dumbbell Rows", sets: 4, reps: 8, rest: "90s", muscle: "Mid Back" },
          { name: "Seal Rows", sets: 4, reps: 8, rest: "90s", muscle: "Mid Back" },
          { name: "Reverse Pec Deck", sets: 4, reps: 12, rest: "60s", muscle: "Rear Delts" },
          { name: "Dumbbell Curls", sets: 4, reps: 10, rest: "75s", muscle: "Biceps" },
          { name: "Cable Curls", sets: 3, reps: 12, rest: "60s", muscle: "Biceps" }
        ],
        3: [
          { name: "Trap Bar Deadlifts", sets: 5, reps: 5, rest: "180s", muscle: "Back/Hamstrings" },
          { name: "Lat Pulldowns", sets: 4, reps: 8, rest: "90s", muscle: "Lats" },
          { name: "Machine Rows", sets: 4, reps: 8, rest: "90s", muscle: "Mid Back" },
          { name: "Plate-Loaded Rows", sets: 4, reps: 8, rest: "90s", muscle: "Mid Back" },
          { name: "Band Pull-aparts", sets: 4, reps: 15, rest: "60s", muscle: "Rear Delts" },
          { name: "Preacher Curls", sets: 4, reps: 8, rest: "75s", muscle: "Biceps" },
          { name: "Machine Curls", sets: 3, reps: 12, rest: "60s", muscle: "Biceps" }
        ]
      },
      shoulders: {
        1: [
          { name: "Overhead Press", sets: 4, reps: 6, rest: "120s", muscle: "Shoulders" },
          { name: "Lateral Raises", sets: 4, reps: 12, rest: "60s", muscle: "Side Delts" },
          { name: "Front Raises", sets: 4, reps: 12, rest: "60s", muscle: "Front Delts" },
          { name: "Face Pulls", sets: 4, reps: 15, rest: "60s", muscle: "Rear Delts" },
          { name: "Shrugs", sets: 4, reps: 12, rest: "60s", muscle: "Traps" },
          { name: "Upright Rows", sets: 4, reps: 10, rest: "75s", muscle: "Shoulders" }
        ],
        2: [
          { name: "Machine Shoulder Press", sets: 4, reps: 8, rest: "90s", muscle: "Shoulders" },
          { name: "Cable Lateral Raises", sets: 4, reps: 12, rest: "60s", muscle: "Side Delts" },
          { name: "Plate Raises", sets: 4, reps: 12, rest: "60s", muscle: "Front Delts" },
          { name: "Reverse Pec Deck", sets: 4, reps: 12, rest: "60s", muscle: "Rear Delts" },
          { name: "Dumbbell Shrugs", sets: 4, reps: 12, rest: "60s", muscle: "Traps" },
          { name: "Arnold Press", sets: 4, reps: 8, rest: "90s", muscle: "Shoulders" }
        ],
        3: [
          { name: "Dumbbell Shoulder Press", sets: 4, reps: 8, rest: "90s", muscle: "Shoulders" },
          { name: "Machine Lateral Raises", sets: 4, reps: 12, rest: "60s", muscle: "Side Delts" },
          { name: "Cable Front Raises", sets: 4, reps: 12, rest: "60s", muscle: "Front Delts" },
          { name: "Bent Over Reverse Flyes", sets: 4, reps: 12, rest: "60s", muscle: "Rear Delts" },
          { name: "Machine Shrugs", sets: 4, reps: 15, rest: "60s", muscle: "Traps" },
          { name: "Seated Overhead Press", sets: 4, reps: 8, rest: "90s", muscle: "Shoulders" }
        ]
      }
    }
  };

  const saveWorkout = async (workoutType: string) => {
    if (!savedWorkouts.includes(workoutType)) {
      setSavedWorkouts([...savedWorkouts, workoutType]);
      
      // Get current exercises for this workout type
      const currentExercises = getCurrentExercises(workoutType);
      
      // Try to update user_stats and progress tracking if user is logged in
      if (user) {
        try {
          // Save to progress tracking with AI
          console.log("Saving workout with exercises:", currentExercises);
          const progressResult = await ProgressTrackingService.saveWorkoutPlanWithProgress(
            user.id,
            currentExercises
          );

          console.log("Progress tracking result:", progressResult);

          if (progressResult.success) {
            toast.success(`${workoutType.charAt(0).toUpperCase() + workoutType.slice(1)} workout saved! Progress tracking initialized.`);
          } else {
            toast.success(`${workoutType.charAt(0).toUpperCase() + workoutType.slice(1)} workout saved!`);
            console.error("Progress tracking error:", progressResult.error);
          }

          // Update user_stats
          const { data: existingStats } = await supabase
            .from("user_stats")
            .select("*")
            .eq("user_id", user.id)
            .single();

          let newCount = 1;
          
          if (existingStats) {
            newCount = (existingStats.workouts_completed || 0) + 1;
          }

          await supabase
            .from("user_stats")
            .upsert(
              {
                user_id: user.id,
                workouts_completed: newCount,
                current_streak: existingStats?.current_streak || 0,
                calories_burned: existingStats?.calories_burned || 0,
                steps_today: existingStats?.steps_today || 0,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "user_id" }
            );
        } catch (error) {
          console.error("Error saving workout:", error);
          toast.error("Failed to save workout progress");
        }
      } else {
        toast.success(`${workoutType.charAt(0).toUpperCase() + workoutType.slice(1)} workout saved!`);
      }
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

        {/* Today's Scheduled Workout */}
        {todayFocus && (
          <Card className="mb-6 border-primary bg-gradient-to-r from-primary/20 to-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-bold">Today's Workout: {getTodayDayName()}</h3>
              </div>
              <p className="text-lg mb-2">{todayFocus}</p>
              <p className="text-sm text-muted-foreground">
                Exercises below are automatically selected based on your schedule
              </p>
              <Link to="/weekly-schedule">
                <Button variant="outline" size="sm" className="mt-3">
                  <Calendar className="w-4 h-4 mr-2" />
                  Edit Schedule
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Weekly Schedule Overview */}
        {weeklySchedule.length > 0 && (
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
                  <Card 
                    key={schedule.day} 
                    className={`border-border hover:border-primary transition-all hover-scale bg-gradient-to-br ${schedule.color} ${schedule.day === getTodayDayName() ? 'ring-2 ring-primary' : ''}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">
                          {schedule.day}
                          {schedule.day === getTodayDayName() && (
                            <Badge variant="default" className="ml-2 text-xs">Today</Badge>
                          )}
                        </h3>
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
        )}

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

        <Tabs 
          defaultValue={getTodayDayName()} 
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-7 mb-8 h-auto">
            {weeklySchedule.length > 0 ? weeklySchedule.map((dayData) => (
              <TabsTrigger key={dayData.day} value={dayData.day} className="flex-col py-2 px-1">
                <span className="text-xs font-semibold">{dayData.day.substring(0, 3)}</span>
                <span className="text-[10px] text-muted-foreground truncate w-full">{dayData.focus.split(' ')[0]}</span>
                {dayData.day === getTodayDayName() && (
                  <Badge variant="default" className="mt-1 text-[8px] px-1 py-0">Today</Badge>
                )}
              </TabsTrigger>
            )) : (
              // Default days if no schedule
              ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                <TabsTrigger key={day} value={day} className="flex-col py-2 px-1">
                  <span className="text-xs font-semibold">{day.substring(0, 3)}</span>
                  {day === getTodayDayName() && (
                    <Badge variant="default" className="mt-1 text-[8px] px-1 py-0">Today</Badge>
                  )}
                </TabsTrigger>
              ))
            )}
          </TabsList>



          {(weeklySchedule.length > 0 ? weeklySchedule : [
            { day: "Monday", focus: "Lower Chest + Triceps" },
            { day: "Tuesday", focus: "Back + Biceps + Shoulders" },
            { day: "Wednesday", focus: "Upper Chest + Triceps" },
            { day: "Thursday", focus: "Back + Biceps + Shoulders" },
            { day: "Friday", focus: "Lower Chest + Triceps" },
            { day: "Saturday", focus: "Back + Biceps + Shoulders" },
            { day: "Sunday", focus: "Legs + Core (Intense)" }
          ]).map((daySchedule) => {
            // Use custom focus if selected, otherwise use schedule focus
            const activeFocus = customWorkoutFocus[daySchedule.day] || daySchedule.focus;
            const { type: workoutType, variant: defaultVariant } = mapFocusToWorkoutType(activeFocus);
            const activeVariant = selectedVariant[workoutType] || defaultVariant;
            const currentExercises = getFilteredExercises(workoutType, activeVariant, activeFocus);
            
            return (
            <TabsContent key={daySchedule.day} value={daySchedule.day} className="space-y-4 animate-fade-in">
              <Card className="border-primary/50 bg-card/50">
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex-1">
                      <CardTitle className="text-2xl">{daySchedule.day} - {customWorkoutFocus[daySchedule.day] || daySchedule.focus}</CardTitle>
                      <CardDescription>
                        {workoutType === 'push' && 'Chest, Shoulders & Triceps training'}
                        {workoutType === 'pull' && 'Back, Traps & Biceps training'}
                        {workoutType === 'legs' && 'Quads, Hamstrings, Glutes & Calves training'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dialog open={isVariationModalOpen} onOpenChange={setIsVariationModalOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Settings className="w-4 h-4" />
                            Edit Variation
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Select Workout Combination</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-2 mt-4">
                            {workoutCombinations.map((combination) => (
                              <Button
                                key={combination}
                                variant={(customWorkoutFocus[daySchedule.day] || daySchedule.focus) === combination ? "default" : "outline"}
                                className="justify-start h-auto p-3 text-left"
                                onClick={() => handleWorkoutCombinationSelect(combination, daySchedule.day)}
                              >
                                <div className="w-full">
                                  <div className="font-medium">{combination}</div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {combination.includes('Chest') ? 'Push exercises - Chest focus' : 
                                     combination.includes('Back') ? 'Pull exercises - Back focus' :
                                     combination.includes('Legs') || combination.includes('Leg') ? 'Leg exercises' :
                                     combination.includes('Shoulders') && combination.includes('Arms') ? 'Upper body focus' :
                                     combination.includes('Full Body') ? 'All muscle groups' :
                                     combination.includes('Push') ? 'Chest, shoulders, triceps' :
                                     combination.includes('Pull') ? 'Back, biceps' :
                                     combination.includes('Cardio') ? 'Cardio & core' :
                                     'Mixed exercises'}
                                  </div>
                                </div>
                              </Button>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Badge variant="outline" className="text-primary border-primary">
                        {currentExercises.length} Exercises
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <div className="grid gap-4">
                {currentExercises.map((exercise, i) => {
                  const displayExercise = replacedExercises[`${daySchedule.day}-${i}`] || exercise;
                  return (
                  <Card 
                    key={i} 
                    className="border-border hover:border-primary transition-all hover-scale"
                  >
                    <CardContent className="py-4">
                      <div className="flex items-center gap-4">
                        <Checkbox
                          checked={completions[displayExercise.name] || false}
                          onCheckedChange={() => toggleCompletion(displayExercise.name)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{displayExercise.name}</h3>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => refreshExercise(`${daySchedule.day}-${i}`, exercise, currentExercises)}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <ExerciseVideoPlayer
                              title={displayExercise.name}
                              buttonClassName="h-8 w-8"
                            />
                          </div>
                          <Badge variant="outline" className="mb-2 text-xs">{displayExercise.muscle}</Badge>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Repeat className="w-4 h-4" />
                              <span>{displayExercise.sets} sets × {displayExercise.reps} reps</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>Rest: {displayExercise.rest}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-primary/20 text-primary border-0">
                          #{i + 1}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
                })}
              </div>

              <Button 
                variant="hero" 
                size="lg" 
                className="w-full"
                onClick={() => {
                  console.log("BUTTON CLICKED! Day:", daySchedule.day);
                  saveWorkout(workoutType);
                }}
              >
                <Save className="w-5 h-5 mr-2" />
                Save {daySchedule.day} Workout Plan
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
                        {calculateDailyProgress(workoutType).percentage}%
                      </span>
                    </div>
                    <ProgressBar value={calculateDailyProgress(workoutType).percentage} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {calculateDailyProgress(workoutType).completed} of {calculateDailyProgress(workoutType).total} exercises completed
                    </p>
                  </div>

                  {calculateDailyProgress(workoutType).percentage === 100 ? (
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
            );
          })}
        </Tabs>
      </div>
    </div>
  );
};

export default Workouts;
