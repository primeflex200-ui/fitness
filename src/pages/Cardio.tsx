import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, Play, Pause, RotateCcw, Square, PlayCircle, Bell, BellOff, X } from "lucide-react";
import { toast } from "sonner";
import { useCardioTimer } from "@/contexts/CardioTimerContext";

const Cardio = () => {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState<"beginner" | "intermediate" | "pro">("beginner");
  const [showTimerBar, setShowTimerBar] = useState(false);
  const [notificationBar, setNotificationBar] = useState<{ message: string; emoji: string; visible: boolean }>({
    message: "",
    emoji: "",
    visible: false
  });

  // Use the background timer context
  const {
    isRunning,
    time,
    notificationsEnabled,
    startTimer,
    pauseTimer,
    resetTimer,
    stopTimer,
    toggleNotifications,
    formatTime: formatTimerTime
  } = useCardioTimer();

  // Show timer bar if timer is running
  useEffect(() => {
    if (isRunning || time > 0) {
      setShowTimerBar(true);
    }
  }, [isRunning, time]);

  // Show in-app notification bar
  const showNotificationBar = (emoji: string, message: string) => {
    setNotificationBar({ emoji, message, visible: true });
    // Auto-hide after 4 seconds
    setTimeout(() => {
      setNotificationBar(prev => ({ ...prev, visible: false }));
    }, 4000);
  };

  const handlePlayVideo = (exerciseName: string) => {
    // Navigate to workout videos page with search query
    navigate(`/videos?search=${encodeURIComponent(exerciseName)}`);
  };

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

  const handleToggleTimer = () => {
    if (!isRunning && time === 0) {
      toast.success("Cardio session started! Let's go! 💪");
      showNotificationBar("🚀", "Workout Started! Timer runs in background!");
      setShowTimerBar(true);
      startTimer();
    } else if (!isRunning && time > 0) {
      showNotificationBar("▶️", "Timer resumed! Keep pushing!");
      startTimer();
    } else if (isRunning) {
      showNotificationBar("⏸️", "Timer paused - Take a breather!");
      pauseTimer();
    }
  };

  const handleResetTimer = () => {
    resetTimer();
    toast.info("Timer reset");
  };

  const handleStopWorkout = () => {
    setShowTimerBar(false);
    if (time > 0) {
      const mins = Math.floor(time / 60);
      const secs = time % 60;
      toast.success(`Workout complete! Total time: ${mins}:${secs.toString().padStart(2, '0')} 🎉`);
    }
    stopTimer();
  };

  const handleToggleNotifications = () => {
    toggleNotifications();
    toast.info(notificationsEnabled ? "🔕 Notifications disabled" : "🔔 Notifications enabled");
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

      {/* Persistent Timer Bar - Shows when timer is active */}
      {showTimerBar && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary via-orange-500 to-red-500 shadow-lg safe-area-top">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Timer Display */}
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-white animate-pulse' : 'bg-white/50'}`} />
              <span className="text-white font-bold text-xl">{formatTimerTime(time)}</span>
              <span className="text-white/80 text-sm">
                {isRunning ? 'Running' : 'Paused'}
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Play/Pause Button */}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-10 h-10 bg-white/20 hover:bg-white/30 text-white"
                onClick={handleToggleTimer}
              >
                {isRunning ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </Button>

              {/* Stop Button */}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-10 h-10 bg-white/20 hover:bg-red-600 text-white"
                onClick={handleStopWorkout}
                title="Stop Workout"
              >
                <Square className="w-4 h-4 fill-current" />
              </Button>

              {/* Close/Minimize Button */}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-8 h-8 bg-white/10 hover:bg-white/20 text-white"
                onClick={() => setShowTimerBar(false)}
                title="Minimize"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Milestone Notification Bar */}
      <div
        className={`fixed ${showTimerBar ? 'top-14' : 'top-16'} left-0 right-0 z-40 transition-all duration-500 ease-out ${
          notificationBar.visible 
            ? 'translate-y-0 opacity-100' 
            : '-translate-y-full opacity-0'
        }`}
      >
        <div className="container mx-auto px-4 pt-1">
          <div className="bg-gradient-to-r from-green-500/90 via-emerald-500/90 to-teal-500/90 backdrop-blur-md rounded-lg mx-auto max-w-md shadow-lg border border-green-400/30">
            <div className="flex items-center justify-center gap-3 py-2 px-4">
              <span className="text-xl animate-bounce">{notificationBar.emoji}</span>
              <span className="text-white font-semibold text-sm text-center">{notificationBar.message}</span>
              <span className="text-xl animate-bounce">{notificationBar.emoji}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Cardiovascular Training</h1>
          <p className="text-muted-foreground">Build endurance and heart health</p>
        </div>

        {/* Stopwatch Card */}
        <Card className={`mb-8 border-primary/50 bg-gradient-to-br from-red-500/10 to-orange-500/10 ${showTimerBar ? 'mt-14' : ''}`}>
          <CardHeader className="text-center">
            <div className="relative w-48 h-48 mx-auto mb-4">
              <div className={`absolute inset-0 rounded-full border-8 ${isRunning ? 'border-primary animate-pulse' : 'border-muted'} flex items-center justify-center transition-colors`}>
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">{formatTimerTime(time)}</div>
                  <div className="flex items-center justify-center gap-2">
                    <Heart className={`w-5 h-5 ${isRunning ? 'text-red-500 animate-pulse' : 'text-muted-foreground'}`} />
                    <span className={`text-sm ${isRunning ? 'text-primary' : 'text-muted-foreground'}`}>
                      {isRunning ? 'Active' : 'Ready'}
                    </span>
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
                onClick={handleResetTimer}
                disabled={time === 0}
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
              <Button
                variant="hero"
                size="icon"
                className="rounded-full w-16 h-16"
                onClick={handleToggleTimer}
              >
                {isRunning ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8" />
                )}
              </Button>
              <Button
                variant={notificationsEnabled ? "default" : "outline"}
                size="icon"
                className={`rounded-full w-12 h-12 ${notificationsEnabled ? 'bg-primary/20 border-primary' : ''}`}
                onClick={handleToggleNotifications}
                title={notificationsEnabled ? "Notifications On" : "Enable Notifications"}
              >
                {notificationsEnabled ? (
                  <Bell className="w-5 h-5 text-primary" />
                ) : (
                  <BellOff className="w-5 h-5" />
                )}
              </Button>
            </div>
            
            {/* Notification Status */}
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                {notificationsEnabled ? (
                  <span className="flex items-center justify-center gap-2">
                    <Bell className="w-4 h-4 text-primary" />
                    Notifications enabled - You'll be notified at milestones
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <BellOff className="w-4 h-4" />
                    Click the bell to enable workout notifications
                  </span>
                )}
              </p>
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
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{exercise.name}</h4>
                      <p className="text-sm text-muted-foreground">{exercise.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-primary hover:text-primary/80"
                      onClick={() => handlePlayVideo(exercise.name)}
                      title="Watch video tutorial"
                    >
                      <PlayCircle className="w-5 h-5" />
                    </Button>
                    <Badge variant="outline" className={getIntensityColor(exercise.intensity)}>
                      {exercise.intensity}
                    </Badge>
                  </div>
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
