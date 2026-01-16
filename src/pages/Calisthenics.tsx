import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Zap, TrendingUp, AlertCircle, Info, Target } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import ExerciseVideoPlayer from "@/components/ExerciseVideoPlayer";

const Calisthenics = () => {
  const { user } = useAuth();
  const [manualUser, setManualUser] = useState<any>(null);
  const [completions, setCompletions] = useState<Record<string, boolean>>({});

  // Manual session check on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setManualUser(session.user);
      }
    };
    checkSession();
  }, []);

  const exercises = [
    {
      name: "Pull-ups",
      description: "The king of upper body exercises",
      difficulty: "Intermediate to Advanced",
      targetMuscles: ["Lats", "Biceps", "Upper Back", "Core"],
      steps: [
        "Hang from bar with hands shoulder-width apart, palms facing away",
        "Engage your core and pull shoulder blades down and back",
        "Pull yourself up until chin is over the bar",
        "Lower yourself with control to starting position",
        "Avoid swinging or using momentum"
      ],
      progressionTips: "Start with assisted pull-ups or negatives. Focus on proper form over quantity.",
      safetyTips: "Warm up shoulders thoroughly. Don't drop suddenly from the bar.",
      benefits: "Builds incredible back width and strength, improves grip strength, engages entire upper body"
    },
    {
      name: "Dips",
      description: "Essential pushing exercise for chest and triceps",
      difficulty: "Intermediate",
      targetMuscles: ["Chest", "Triceps", "Front Deltoids", "Core"],
      steps: [
        "Grip parallel bars and lift yourself to starting position",
        "Keep chest up and shoulders back",
        "Lower body by bending elbows until upper arms are parallel to ground",
        "Push back up to starting position",
        "Keep core tight throughout movement"
      ],
      progressionTips: "Master bench dips first. Gradually increase depth as you get stronger.",
      safetyTips: "Don't go too deep if you feel shoulder pain. Keep shoulders packed and stable.",
      benefits: "Develops powerful chest and triceps, improves shoulder stability, translates to real-world pushing strength"
    },
    {
      name: "Muscle-ups",
      description: "The ultimate upper body skill move",
      difficulty: "Advanced",
      targetMuscles: ["Lats", "Chest", "Triceps", "Core", "Explosive Power"],
      steps: [
        "Start with explosive pull-up to get chest to bar",
        "Lean forward and transition chest over the bar",
        "Press down and extend arms to lock out position",
        "Lower yourself with control",
        "Master pull-ups and dips before attempting"
      ],
      progressionTips: "Build strength with chest-to-bar pull-ups and deep dips. Practice transition separately.",
      safetyTips: "Requires significant strength. Don't attempt without mastering prerequisites. Use false grip initially.",
      benefits: "Ultimate test of upper body power, combines pull and push, impressive strength display"
    },
    {
      name: "Handstands",
      description: "Fundamental skill for upper body and balance",
      difficulty: "Intermediate to Advanced",
      targetMuscles: ["Shoulders", "Core", "Wrists", "Balance"],
      steps: [
        "Start against a wall for support",
        "Kick up with control, not aggressively",
        "Keep body in straight line, shoulders stacked over wrists",
        "Engage core and point toes",
        "Look slightly forward at hands, not down"
      ],
      progressionTips: "Master wall handstands before freestanding. Work on shoulder mobility and wrist strength.",
      safetyTips: "Have enough space. Learn to bail safely. Don't practice when fatigued.",
      benefits: "Develops shoulder strength and endurance, improves balance and body awareness, builds confidence"
    },
    {
      name: "L-sits",
      description: "Static hold for core and hip flexor strength",
      difficulty: "Intermediate",
      targetMuscles: ["Core", "Hip Flexors", "Shoulders", "Triceps"],
      steps: [
        "Sit with legs extended, hands beside hips",
        "Press down into ground and lift entire body",
        "Keep legs straight and parallel to ground",
        "Hold shoulders down and chest up",
        "Breathe steadily while holding"
      ],
      progressionTips: "Start with one leg, then tuck, then straddle before full L-sit. Build up hold time gradually.",
      safetyTips: "Warm up wrists and shoulders. Don't force it if you feel sharp pain.",
      benefits: "Incredible core strength developer, improves hip flexibility, builds shoulder endurance"
    },
    {
      name: "Front Levers",
      description: "Advanced static hold showcasing back strength",
      difficulty: "Advanced",
      targetMuscles: ["Lats", "Core", "Lower Back", "Grip"],
      steps: [
        "Hang from bar with overhand grip",
        "Engage lats and pull shoulder blades down",
        "Raise body to horizontal position, perfectly straight",
        "Keep arms straight, body rigid like a plank",
        "Hold position while breathing"
      ],
      progressionTips: "Start with tuck front lever, then advanced tuck, straddle, and finally full. Takes months to years.",
      safetyTips: "Requires exceptional strength. Build pulling strength first. Don't attempt without proper progression.",
      benefits: "Elite level back strength, impressive bodyweight feat, develops rock-solid core control"
    }
  ];

  useEffect(() => {
    const currentUser = user || manualUser;
    if (currentUser) {
      fetchCompletions();
    }
  }, [user, manualUser]);

  const fetchCompletions = async () => {
    const currentUser = user || manualUser;
    if (!currentUser) return;

    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('workout_completions')
      .select('exercise_name, completed')
      .eq('user_id', currentUser.id)
      .eq('workout_date', today)
      .eq('workout_type', 'calisthenics');

    if (data) {
      const completionMap: Record<string, boolean> = {};
      data.forEach(item => {
        completionMap[item.exercise_name] = item.completed;
      });
      setCompletions(completionMap);
    }
  };

  const toggleCompletion = async (exerciseName: string) => {
    const currentUser = user || manualUser;
    if (!currentUser) {
      toast.error("Please log in to track progress");
      return;
    }

    const newStatus = !completions[exerciseName];
    const today = new Date().toISOString().split('T')[0];

    const { error} = await supabase
      .from('workout_completions')
      .upsert({
        user_id: currentUser.id,
        workout_date: today,
        workout_type: 'calisthenics',
        exercise_name: exerciseName,
        completed: newStatus
      }, {
        onConflict: 'user_id,workout_date,exercise_name'
      });

    if (error) {
      toast.error("Failed to update progress");
    } else {
      setCompletions({ ...completions, [exerciseName]: newStatus });
      toast.success(newStatus ? "Skill progression tracked! 💪" : "Marked as incomplete");
    }
  };

  const completedCount = Object.values(completions).filter(Boolean).length;
  const completionPercentage = exercises.length > 0 
    ? Math.round((completedCount / exercises.length) * 100) 
    : 0;

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty.includes("Beginner")) return "text-green-500 border-green-500";
    if (difficulty.includes("Intermediate")) return "text-yellow-500 border-yellow-500";
    if (difficulty.includes("Advanced")) return "text-red-500 border-red-500";
    return "text-primary border-primary";
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
            <Zap className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">Calisthenics</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Advanced Bodyweight Mastery</h1>
          <p className="text-muted-foreground">Progressive calisthenics skills for ultimate strength</p>
        </div>

        {/* Progress Card */}
        <Card className="mb-6 border-primary/50 bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="py-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold text-lg">Today's Training Progress</h3>
                <p className="text-sm text-muted-foreground">
                  {completedCount} of {exercises.length} skills practiced
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

        {/* Warning Card */}
        <Card className="mb-6 border-destructive/50 bg-destructive/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-destructive mb-1">Advanced Training - Important Safety Notes:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Master prerequisites before attempting advanced moves</li>
                <li>• Focus on mobility and flexibility alongside strength</li>
                <li>• Progress slowly - rushing leads to injury</li>
                <li>• Listen to your body and rest when needed</li>
              </ul>
            </div>
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
                        id={`calisthenics-${i}`}
                        checked={completions[exercise.name] || false}
                        onCheckedChange={(checked) => toggleCompletion(exercise.name)}
                        className="w-6 h-6 cursor-pointer"
                      />
                      <CardTitle className="text-xl">{exercise.name}</CardTitle>
                      <ExerciseVideoPlayer
                        title={exercise.name}
                        buttonClassName="h-8 w-8"
                      />
                    </div>
                    <CardDescription>{exercise.description}</CardDescription>
                  </div>
                  <Badge variant="outline" className={getDifficultyColor(exercise.difficulty)}>
                    {exercise.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Target Muscles */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    Target Muscles:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {exercise.targetMuscles.map((muscle) => (
                      <Badge key={muscle} variant="secondary">{muscle}</Badge>
                    ))}
                  </div>
                </div>

                {/* Steps */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Technique:
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

                {/* Progression */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-1 text-primary">Progression Notes:</h4>
                  <p className="text-sm text-muted-foreground">{exercise.progressionTips}</p>
                </div>

                {/* Safety */}
                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-1 text-destructive">Safety Tips:</h4>
                  <p className="text-sm text-muted-foreground">{exercise.safetyTips}</p>
                </div>

                {/* Benefits */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-1">Benefits:</h4>
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
              <h3 className="text-2xl font-bold mb-2">🔥 Exceptional training session!</h3>
              <p className="text-muted-foreground">You're mastering advanced calisthenics. Keep pushing your limits!</p>
            </CardContent>
          </Card>
        )}

        {/* Info Footer */}
        <Card className="mt-6 border-primary/30 bg-card/50">
          <CardContent className="p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              <strong>Remember:</strong> Calisthenics mastery is a journey, not a destination. 
              Progress takes time - celebrate small improvements and stay consistent. 
              Film yourself to check form and track visual progress over months.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Calisthenics;