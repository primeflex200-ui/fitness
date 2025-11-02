import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Home, Clock, TrendingUp, Info } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const HomeWorkout = () => {
  const { user } = useAuth();
  const [completions, setCompletions] = useState<Record<string, boolean>>({});
  const [level, setLevel] = useState<"Beginner" | "Intermediate" | "Pro">("Beginner");

  const allExercises = [
    {
      name: "Push-ups",
      description: "Classic upper body exercise targeting chest, shoulders, and triceps",
      steps: [
        "Start in plank position with hands shoulder-width apart",
        "Keep your body in a straight line from head to heels",
        "Lower your body until chest nearly touches the floor",
        "Push back up to starting position",
        "Keep core engaged throughout the movement"
      ],
      sets: "3-4 sets",
      reps: "10-20 reps",
      benefits: "Builds upper body strength, improves core stability, burns fat effectively",
      difficulty: "Beginner to Intermediate"
    },
    {
      name: "Squats",
      description: "Fundamental lower body exercise for legs and glutes",
      steps: [
        "Stand with feet shoulder-width apart",
        "Keep chest up and core tight",
        "Lower down as if sitting in a chair",
        "Go down until thighs are parallel to ground",
        "Push through heels to return to start"
      ],
      sets: "3-4 sets",
      reps: "15-25 reps",
      benefits: "Strengthens legs and glutes, improves mobility, boosts metabolism",
      difficulty: "Beginner"
    },
    {
      name: "Planks",
      description: "Core stability exercise engaging entire body",
      steps: [
        "Start in forearm plank position",
        "Keep elbows directly under shoulders",
        "Maintain straight line from head to heels",
        "Engage core and squeeze glutes",
        "Breathe steadily, don't hold breath"
      ],
      sets: "3 sets",
      reps: "30-60 seconds hold",
      benefits: "Builds core strength, improves posture, enhances stability",
      difficulty: "Beginner to Intermediate"
    },
    {
      name: "Mountain Climbers",
      description: "Dynamic full-body cardio exercise",
      steps: [
        "Start in high plank position",
        "Quickly bring one knee toward chest",
        "Switch legs in a running motion",
        "Keep hips low and core engaged",
        "Maintain steady breathing rhythm"
      ],
      sets: "3-4 sets",
      reps: "30-45 seconds",
      benefits: "Burns calories fast, improves cardiovascular endurance, full-body workout",
      difficulty: "Intermediate"
    },
    {
      name: "Jumping Jacks",
      description: "Classic cardio warm-up exercise",
      steps: [
        "Stand with feet together, arms at sides",
        "Jump feet apart while raising arms overhead",
        "Jump back to starting position",
        "Keep movements smooth and controlled",
        "Land softly to protect joints"
      ],
      sets: "3 sets",
      reps: "30-60 seconds",
      benefits: "Excellent warm-up, improves coordination, burns calories, low equipment needs",
      difficulty: "Beginner"
    },
    {
      name: "Burpees",
      description: "High-intensity full-body exercise combining strength and cardio",
      steps: [
        "Start standing, drop into squat position",
        "Place hands on floor and jump feet back to plank",
        "Perform a push-up (optional for beginners)",
        "Jump feet back to squat position",
        "Explosively jump up with arms overhead"
      ],
      sets: "3-4 sets",
      reps: "10-15 reps",
      benefits: "Burns maximum calories, builds explosive power, full-body conditioning",
      difficulty: "Intermediate"
    },
    {
      name: "Lunges",
      description: "Single-leg exercise targeting quads, glutes, and balance",
      steps: [
        "Stand with feet hip-width apart",
        "Step forward with one leg",
        "Lower hips until both knees are at 90 degrees",
        "Push back to starting position",
        "Alternate legs"
      ],
      sets: "3 sets",
      reps: "12-16 reps per leg",
      benefits: "Improves balance, strengthens legs individually, enhances mobility",
      difficulty: "Beginner"
    },
    {
      name: "Diamond Push-ups",
      description: "Advanced push-up variation targeting triceps intensely",
      steps: [
        "Start in plank with hands together forming diamond shape",
        "Keep elbows close to body",
        "Lower chest toward hands",
        "Push back up maintaining form",
        "Keep core tight throughout"
      ],
      sets: "3-4 sets",
      reps: "8-12 reps",
      benefits: "Builds tricep strength, increases upper body power, improves pushing strength",
      difficulty: "Intermediate"
    },
    {
      name: "Pike Push-ups",
      description: "Shoulder-focused push-up variation preparing for handstands",
      steps: [
        "Start in downward dog position (inverted V)",
        "Keep hips high and legs straight",
        "Lower head toward ground between hands",
        "Push back up to starting position",
        "Keep core engaged"
      ],
      sets: "3-4 sets",
      reps: "8-15 reps",
      benefits: "Builds shoulder strength, improves overhead pressing, core stability",
      difficulty: "Intermediate"
    },
    {
      name: "Pistol Squats",
      description: "Advanced single-leg squat requiring strength and balance",
      steps: [
        "Stand on one leg, extend other leg forward",
        "Lower down on standing leg while keeping other elevated",
        "Go as low as possible maintaining balance",
        "Push through heel to return to start",
        "Use support if needed initially"
      ],
      sets: "3 sets",
      reps: "5-10 reps per leg",
      benefits: "Extreme leg strength, balance mastery, unilateral power development",
      difficulty: "Pro"
    },
    {
      name: "Handstand Push-ups",
      description: "Elite shoulder exercise performed inverted against wall",
      steps: [
        "Kick up into handstand against wall",
        "Keep core tight and body straight",
        "Lower head toward ground in controlled manner",
        "Press back up to full arm extension",
        "Maintain balance throughout"
      ],
      sets: "3-4 sets",
      reps: "5-10 reps",
      benefits: "Maximum shoulder development, core strength, body control mastery",
      difficulty: "Pro"
    },
    {
      name: "Archer Push-ups",
      description: "One-arm push-up progression with extended support arm",
      steps: [
        "Start in wide push-up position",
        "Shift weight to one side as you lower",
        "Keep opposite arm extended to side",
        "Push up through working arm",
        "Alternate sides each rep"
      ],
      sets: "3 sets",
      reps: "6-10 reps per side",
      benefits: "Unilateral pushing strength, prepares for one-arm push-ups, chest development",
      difficulty: "Pro"
    },
    {
      name: "Dragon Flags",
      description: "Advanced core exercise for maximum abdominal strength",
      steps: [
        "Lie on bench, grab behind head for support",
        "Raise entire body keeping it straight",
        "Only shoulders and upper back touch bench",
        "Lower body slowly maintaining rigid position",
        "Control is key - avoid momentum"
      ],
      sets: "3 sets",
      reps: "5-8 reps",
      benefits: "Elite core strength, full-body tension, advanced abdominal development",
      difficulty: "Pro"
    }
  ];

  const exercises = allExercises.filter(ex => ex.difficulty.includes(level));

  useEffect(() => {
    if (user) {
      fetchCompletions();
    }
  }, [user]);

  const fetchCompletions = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('workout_completions')
      .select('exercise_name, completed')
      .eq('user_id', user.id)
      .eq('workout_date', today)
      .eq('workout_type', 'home');

    if (data) {
      const completionMap: Record<string, boolean> = {};
      data.forEach(item => {
        completionMap[item.exercise_name] = item.completed;
      });
      setCompletions(completionMap);
    }
  };

  const toggleCompletion = async (exerciseName: string) => {
    if (!user) {
      toast.error("Please log in to track progress");
      return;
    }

    const newStatus = !completions[exerciseName];
    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase
      .from('workout_completions')
      .upsert({
        user_id: user.id,
        workout_date: today,
        workout_type: 'home',
        exercise_name: exerciseName,
        completed: newStatus
      }, {
        onConflict: 'user_id,workout_date,exercise_name'
      });

    if (error) {
      toast.error("Failed to update progress");
    } else {
      setCompletions({ ...completions, [exerciseName]: newStatus });
      toast.success(newStatus ? "Exercise completed! 💪" : "Marked as incomplete");
    }
  };

  const completedCount = Object.values(completions).filter(Boolean).length;
  const completionPercentage = exercises.length > 0 
    ? Math.round((completedCount / exercises.length) * 100) 
    : 0;

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
            <Home className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">Home Workouts</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">No-Equipment Training</h1>
          <p className="text-muted-foreground">Effective workouts you can do anywhere, anytime</p>
        </div>

        {/* Progress Card */}
        <Card className="mb-6 border-primary/50 bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="py-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold text-lg">Today's Progress</h3>
                <p className="text-sm text-muted-foreground">
                  {completedCount} of {exercises.length} exercises completed
                </p>
              </div>
              <div className="text-3xl font-bold text-primary">{completionPercentage}%</div>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Level Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Your Level</CardTitle>
            <CardDescription>Choose exercises that match your fitness level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap">
              <Button
                variant={level === "Beginner" ? "default" : "outline"}
                onClick={() => setLevel("Beginner")}
                className="flex-1 min-w-[120px]"
              >
                Beginner
              </Button>
              <Button
                variant={level === "Intermediate" ? "default" : "outline"}
                onClick={() => setLevel("Intermediate")}
                className="flex-1 min-w-[120px]"
              >
                Intermediate
              </Button>
              <Button
                variant={level === "Pro" ? "default" : "outline"}
                onClick={() => setLevel("Pro")}
                className="flex-1 min-w-[120px]"
              >
                Pro
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mb-6 border-primary/30 bg-card/50">
          <CardContent className="p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              {level === "Beginner" && (
                <>
                  <strong>Perfect for beginners!</strong> These exercises require zero equipment and can be done at home. 
                  Focus on proper form and gradually increase repetitions as you get stronger.
                </>
              )}
              {level === "Intermediate" && (
                <>
                  <strong>Ready for a challenge!</strong> These intermediate exercises will push your limits. 
                  Maintain good form even when fatigued and rest adequately between sets.
                </>
              )}
              {level === "Pro" && (
                <>
                  <strong>Elite level training!</strong> These advanced exercises require significant strength and skill. 
                  Perfect your technique and progress gradually to avoid injury.
                </>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Exercises */}
        <div className="space-y-6">
          {exercises.map((exercise, i) => (
            <Card 
              key={exercise.name}
              className="border-border hover:border-primary transition-all"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Checkbox
                        checked={completions[exercise.name] || false}
                        onCheckedChange={() => toggleCompletion(exercise.name)}
                        className="w-6 h-6"
                      />
                      <CardTitle className="text-xl">{exercise.name}</CardTitle>
                    </div>
                    <CardDescription>{exercise.description}</CardDescription>
                  </div>
                  <Badge variant="outline">{exercise.difficulty}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Steps */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    How to Perform:
                  </h4>
                  <ol className="space-y-2">
                    {exercise.steps.map((step, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground pl-6 relative">
                        <span className="absolute left-0 text-primary font-semibold">{idx + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Sets & Reps */}
                <div className="flex gap-4 flex-wrap">
                  <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-lg">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{exercise.sets}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{exercise.reps}</span>
                  </div>
                </div>

                {/* Benefits */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-1 text-primary">Benefits:</h4>
                  <p className="text-sm text-muted-foreground">{exercise.benefits}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Completion Message */}
        {completionPercentage === 100 && (
          <Card className="mt-6 border-primary bg-gradient-to-r from-primary/20 to-secondary/20 animate-fade-in">
            <CardContent className="py-6 text-center">
              <h3 className="text-2xl font-bold mb-2">🔥 You crushed today's workout!</h3>
              <p className="text-muted-foreground">Amazing work! Come back tomorrow for another session.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default HomeWorkout;