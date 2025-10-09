import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, Play, Pause, RotateCcw, Timer } from "lucide-react";
import { toast } from "sonner";

const Cardio = () => {
  const [selectedLevel, setSelectedLevel] = useState<"beginner" | "intermediate" | "pro">("beginner");
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [heartRate, setHeartRate] = useState(75);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prev => prev + 1);
        // Simulate heart rate fluctuation
        setHeartRate(prev => {
          const change = Math.random() > 0.5 ? 1 : -1;
          const newRate = prev + change;
          return Math.max(60, Math.min(180, newRate));
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const cardioPlans = {
    beginner: {
      title: "Beginner Cardio",
      duration: "20 minutes",
      intensity: "Low-Moderate",
      exercises: [
        { name: "Warm-up Walk", duration: "5 min", intensity: "Low" },
        { name: "Light Jogging", duration: "8 min", intensity: "Moderate" },
        { name: "Walking Intervals", duration: "5 min", intensity: "Low-Moderate" },
        { name: "Cool Down Stretch", duration: "2 min", intensity: "Low" }
      ]
    },
    intermediate: {
      title: "Intermediate Cardio",
      duration: "30 minutes",
      intensity: "Moderate-High",
      exercises: [
        { name: "Dynamic Warm-up", duration: "5 min", intensity: "Moderate" },
        { name: "Steady State Run", duration: "12 min", intensity: "Moderate" },
        { name: "Interval Sprints", duration: "8 min", intensity: "High" },
        { name: "Recovery Jog", duration: "3 min", intensity: "Low" },
        { name: "Cool Down", duration: "2 min", intensity: "Low" }
      ]
    },
    pro: {
      title: "Advanced Cardio",
      duration: "45 minutes",
      intensity: "High",
      exercises: [
        { name: "Warm-up Jog", duration: "5 min", intensity: "Moderate" },
        { name: "HIIT Intervals", duration: "15 min", intensity: "Very High" },
        { name: "Tempo Run", duration: "15 min", intensity: "High" },
        { name: "Sprint Finisher", duration: "5 min", intensity: "Max" },
        { name: "Cool Down Walk", duration: "5 min", intensity: "Low" }
      ]
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    if (!isRunning && time === 0) {
      toast.success("Cardio session started! Let's go! 💪");
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTime(0);
    setHeartRate(75);
    toast.info("Timer reset");
  };

  const getIntensityColor = (intensity: string) => {
    if (intensity.includes("Very High") || intensity === "Max") return "text-red-500 border-red-500";
    if (intensity.includes("High")) return "text-orange-500 border-orange-500";
    if (intensity.includes("Moderate")) return "text-yellow-500 border-yellow-500";
    return "text-green-500 border-green-500";
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
            <Heart className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">Cardio Fitness</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Cardiovascular Training</h1>
          <p className="text-muted-foreground">Build endurance and heart health</p>
        </div>

        {/* Stopwatch Card */}
        <Card className="mb-8 border-primary/50 bg-gradient-to-br from-red-500/10 to-orange-500/10">
          <CardHeader className="text-center">
            <div className="relative w-48 h-48 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-8 border-muted flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">{formatTime(time)}</div>
                  <div className="flex items-center justify-center gap-2">
                    <Heart className={`w-5 h-5 ${isRunning ? 'text-red-500 animate-pulse' : 'text-muted-foreground'}`} />
                    <span className="text-2xl font-semibold text-red-500">{heartRate}</span>
                    <span className="text-sm text-muted-foreground">bpm</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-12 h-12"
                onClick={resetTimer}
                disabled={time === 0}
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
              <Button
                variant="hero"
                size="icon"
                className="rounded-full w-16 h-16"
                onClick={toggleTimer}
              >
                {isRunning ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-12 h-12"
              >
                <Timer className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Level Selection */}
        <div className="flex gap-4 mb-8">
          <Button
            variant={selectedLevel === "beginner" ? "hero" : "outline"}
            onClick={() => setSelectedLevel("beginner")}
            className="flex-1"
          >
            Beginner
          </Button>
          <Button
            variant={selectedLevel === "intermediate" ? "hero" : "outline"}
            onClick={() => setSelectedLevel("intermediate")}
            className="flex-1"
          >
            Intermediate
          </Button>
          <Button
            variant={selectedLevel === "pro" ? "hero" : "outline"}
            onClick={() => setSelectedLevel("pro")}
            className="flex-1"
          >
            Pro
          </Button>
        </div>

        {/* Cardio Plan */}
        <Card className="border-border bg-card/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{cardioPlans[selectedLevel].title}</CardTitle>
                <CardDescription>
                  Duration: {cardioPlans[selectedLevel].duration} • Intensity: {cardioPlans[selectedLevel].intensity}
                </CardDescription>
              </div>
              <Badge variant="outline" className={getIntensityColor(cardioPlans[selectedLevel].intensity)}>
                {cardioPlans[selectedLevel].intensity}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cardioPlans[selectedLevel].exercises.map((exercise, i) => (
                <div 
                  key={i}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold">{exercise.name}</h4>
                      <p className="text-sm text-muted-foreground">{exercise.duration}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={getIntensityColor(exercise.intensity)}>
                    {exercise.intensity}
                  </Badge>
                </div>
              ))}
            </div>

            <Button variant="hero" size="lg" className="w-full mt-6">
              Start {cardioPlans[selectedLevel].title} Session
            </Button>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-8 border-primary/30 bg-primary/5">
          <CardContent className="py-6">
            <div className="flex items-start gap-3">
              <Heart className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">💡 Cardio Tips</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor your heart rate throughout the session. Stay hydrated and listen to your body. 
                  Aim for 150 minutes of moderate cardio per week for optimal heart health!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Cardio;
