import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth.js";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import LightRays from "@/components/LightRays";
import GooeyEffect from "@/components/GooeyEffect";
import { 
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
import PrimeFlexLogo from "@/components/PrimeFlexLogo";

const Dashboard = () => {
  const [clickedElement, setClickedElement] = useState<HTMLElement | null>(null);
  const navigate = useNavigate();
  const { isAdmin, signOut, user } = useAuth();
  const [stats, setStats] = useState({
    workouts_completed: 0,
    current_streak: 0,
    calories_burned: 0,
    steps_today: 0,
  });
  const [loading, setLoading] = useState(true);
  
  // Check if user is admin by email
  const isAdminUser = user?.email === 'primeflex200@gmail.com' || isAdmin;
  
  // Load user name from localStorage
  const [userName, setUserName] = useState(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        return profile.full_name || "Athlete";
      } catch {
        return "Athlete";
      }
    }
    return "Athlete";
  });

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

  // Fetch user profile name from database
  const fetchUserName = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    if (data?.full_name) {
      setUserName(data.full_name);
      // Update localStorage
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        try {
          const profile = JSON.parse(savedProfile);
          profile.full_name = data.full_name;
          localStorage.setItem('userProfile', JSON.stringify(profile));
        } catch {}
      } else {
        localStorage.setItem('userProfile', JSON.stringify({ full_name: data.full_name }));
      }
    }
  };

  useEffect(() => {
    fetchStats();
    fetchUserName();
  }, [user]);

  useEffect(() => {
    // Refetch stats and userName when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Add small delay to ensure data is synced
        setTimeout(() => {
          fetchStats();
          fetchUserName();
        }, 500);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  // Also refetch stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats();
    }, 5000); // Refetch every 5 seconds

    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
      // Optionally show an error message to the user
    }
  };
  const baseFeatures = [
    { icon: Zap, title: "Workout Plans", desc: "Beginner to Pro programs", link: "/workouts", color: "text-blue-500" },
    { icon: Apple, title: "Diet Plans", desc: "Personalized nutrition", link: "/diet", color: "text-green-500" },
    { icon: Shield, title: "Strength Tracker", desc: "Monitor your progress", link: "/strength", color: "text-violet-500" },
    { icon: Heart, title: "Cardio Fitness", desc: "Heart health tracking", link: "/cardio", color: "text-red-500" },
    { icon: Droplet, title: "Water Reminder", desc: "Stay hydrated", link: "/water", color: "text-cyan-500" },
    { icon: Footprints, title: "Step Tracker", desc: "Daily activity monitor", link: "/coming-soon", color: "text-purple-500" },
    { icon: Music, title: "Mind-Muscle Mode", desc: "Focus with music", link: "/mindmuscle", color: "text-primary" },
    { icon: Video, title: "Workout Videos", desc: "Expert guidance", link: "/videos", color: "text-orange-500" },
    { icon: Pill, title: "Nutrition Guide", desc: "Supplements & macros", link: "/nutrition", color: "text-yellow-500" },
    { icon: Move, title: "Height Growth", desc: "Growth tips & exercises", link: "/height-growth", color: "text-emerald-500" },
    { icon: Zap, title: "Home Workouts", desc: "No equipment needed", link: "/home-workout", color: "text-amber-500" },
    { icon: Brain, title: "Calisthenics", desc: "Bodyweight mastery", link: "/calisthenics", color: "text-violet-500" },
    { icon: Camera, title: "Form Detector", desc: "AI form analysis (Soon)", link: "/form-detector", color: "text-pink-500" },
    { icon: MessageSquare, title: "Community", desc: "Chat with members", link: "/community", color: "text-indigo-500" },
    { icon: Send, title: "Feedback", desc: "Share your thoughts", link: "/feedback", color: "text-teal-500" },
  ];

  // Add Admin Panel for admin users
  const features = isAdminUser 
    ? [{ icon: Shield, title: "Admin Panel", desc: "Upload & manage videos", link: "/admin", color: "text-blue-600" }, ...baseFeatures]
    : baseFeatures;

  return (
    <div className="min-h-screen bg-background relative" style={{ scrollBehavior: 'smooth' }}>
      {/* Gooey Click Effect */}
      {clickedElement && <GooeyEffect targetElement={clickedElement} />}
      
      {/* Light Rays Background */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none" style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
        <LightRays
          raysOrigin="top-center"
          raysColor="#00ffff"
          raysSpeed={1.5}
          lightSpread={0.8}
          rayLength={1.2}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0.1}
          distortion={0.05}
        />
      </div>
      
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40 relative">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PrimeFlexLogo showText size="md" />
            {isAdminUser && (
              <Badge variant="secondary" className="ml-2">
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isAdminUser && (
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

      {/* Hero Section */}
      <section className="py-8 px-4 bg-gradient-to-b from-card/30 to-transparent relative z-10">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-6">Welcome Back, {userName}</h1>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-6 px-4 relative z-10">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold mb-6">Your Fitness Tools</h2>
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {features.map((feature, i) => (
              <Link 
                to={feature.link} 
                key={i}
                onClick={(e) => {
                  const card = e.currentTarget.querySelector('.feature-card');
                  if (card) {
                    setClickedElement(card as HTMLElement);
                    setTimeout(() => setClickedElement(null), 1500);
                  }
                }}
              >
                <Card className="feature-card bg-card border-border hover:border-primary transition-all hover-scale cursor-pointer h-full">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                    <feature.icon className={`w-8 h-8 ${feature.color}`} />
                    <h3 className="text-sm font-semibold">{feature.title}</h3>
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
