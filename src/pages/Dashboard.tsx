import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { 
  Dumbbell, 
  Apple, 
  TrendingUp, 
  Heart, 
  Droplet, 
  Footprints,
  Music,
  Brain,
  Video,
  Pill,
  Settings,
  LogOut,
  Move,
  Camera,
  Shield,
  MessageSquare,
  Send,
  Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, signOut, user } = useAuth();
  const [stats, setStats] = useState({
    workouts_completed: 0,
    current_streak: 0,
    calories_burned: 0,
    steps_today: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setStats({
          workouts_completed: data.workouts_completed,
          current_streak: data.current_streak,
          calories_burned: data.calories_burned,
          steps_today: data.steps_today,
        });
      }
      setLoading(false);
    };

    fetchStats();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };
  const features = [
    { icon: Dumbbell, title: "Workout Plans", desc: "Beginner to Pro programs", link: "/workouts", color: "text-primary" },
    { icon: Apple, title: "Diet Plans", desc: "Personalized nutrition", link: "/diet", color: "text-green-500" },
    { icon: TrendingUp, title: "Strength Tracker", desc: "Monitor your progress", link: "/strength", color: "text-blue-500" },
    { icon: Heart, title: "Cardio Fitness", desc: "Heart health tracking", link: "/cardio", color: "text-red-500" },
    { icon: Droplet, title: "Water Reminder", desc: "Stay hydrated", link: "/water", color: "text-cyan-500" },
    { icon: Footprints, title: "Step Tracker", desc: "Daily activity monitor", link: "/steps", color: "text-purple-500" },
    { icon: Music, title: "Mind-Muscle Mode", desc: "Focus with music", link: "/mindmuscle", color: "text-primary" },
    { icon: Video, title: "Trainer Videos", desc: "Expert guidance", link: "/videos", color: "text-orange-500" },
    { icon: Pill, title: "Nutrition Guide", desc: "Supplements & macros", link: "/nutrition", color: "text-yellow-500" },
    { icon: Move, title: "Height Growth", desc: "Growth tips & exercises", link: "/height-growth", color: "text-emerald-500" },
    { icon: Zap, title: "Home Workouts", desc: "No equipment needed", link: "/home-workout", color: "text-amber-500" },
    { icon: Brain, title: "Calisthenics", desc: "Bodyweight mastery", link: "/calisthenics", color: "text-violet-500" },
    { icon: Camera, title: "Form Detector", desc: "AI form analysis (Soon)", link: "/form-detector", color: "text-pink-500" },
    { icon: MessageSquare, title: "Community", desc: "Chat with members", link: "/community", color: "text-indigo-500" },
    { icon: Send, title: "Feedback", desc: "Share your thoughts", link: "/feedback", color: "text-teal-500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Dumbbell className="w-7 h-7 text-primary" />
            <span className="text-xl font-bold text-gradient-gold">PRIME FLEX</span>
            {isAdmin && (
              <Badge variant="secondary" className="ml-2">
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link to="/admin">
                <Button variant="outline" size="sm">
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Panel
                </Button>
              </Link>
            )}
            <Link to="/settings">
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Stats */}
      <section className="py-8 px-4 bg-gradient-to-b from-card/30 to-transparent">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-6">Welcome Back, Athlete</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-card border-border hover-scale">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">
                  {loading ? "..." : stats.workouts_completed}
                </div>
                <div className="text-sm text-muted-foreground">Workouts Done</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border hover-scale">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-500">
                  {loading ? "..." : stats.current_streak}
                </div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border hover-scale">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-500">
                  {loading ? "..." : stats.calories_burned.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Calories Burned</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border hover-scale">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-purple-500">
                  {loading ? "..." : stats.steps_today.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Steps Today</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold mb-6">Your Fitness Tools</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, i) => (
              <Link to={feature.link} key={i}>
                <Card className="bg-card border-border hover:border-primary transition-all hover-scale cursor-pointer h-full">
                  <CardHeader>
                    <feature.icon className={`w-10 h-10 ${feature.color} mb-2`} />
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Action */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <Card className="bg-gradient-to-r from-primary/20 to-secondary/20 border-primary/50">
            <CardContent className="py-8 text-center">
              <Brain className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Ready for Today's Workout?</h3>
              <p className="text-muted-foreground mb-4">Let's crush your goals together</p>
              <Link to="/workouts">
                <Button variant="hero" size="lg">
                  Start Training
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Disclaimer Footer */}
      <section className="py-8 px-4 bg-muted/30">
        <div className="container mx-auto">
          <Card className="border-primary/30 bg-card/50">
            <CardContent className="py-6 text-center">
              <p className="text-sm text-muted-foreground">
                <strong>Important:</strong> Access features based on your fitness goals. 
                Consult professionals before starting any new diet or training plan. 
                Results may vary based on individual commitment and consistency.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
