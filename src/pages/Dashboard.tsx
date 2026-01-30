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
    <div className="min-h-screen bg-background relative">
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
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-40 relative">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PrimeFlexLogo showText size="md" />
            {isAdminUser && (
              <Badge variant="secondary" className="ml-2 premium-button">
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isAdminUser && (
              <Link to="/admin">
                <Button variant="outline" size="sm" className="premium-button">
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Panel
                </Button>
              </Link>
            )}
            <Link to="/settings">
              <Button variant="ghost" size="icon" className="premium-button">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="premium-button">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-6 bg-gradient-to-b from-white/5 to-transparent relative z-10">
        <div className="container mx-auto">
          <div className="premium-card-large max-w-4xl mx-auto text-center">
            <div className="p-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 premium-text-primary">
                Welcome Back, <span className="text-gradient-gold">{userName}</span>
              </h1>
              <p className="text-xl premium-text-secondary max-w-2xl mx-auto">
                Ready to crush your fitness goals today? Your personalized dashboard awaits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-6 px-4 relative z-10">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 premium-text-primary">Your Fitness Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                className="group"
              >
                <div className="feature-card premium-card-large cursor-pointer h-full">
                  <div className="p-6 flex flex-col h-full">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="premium-icon-container flex-shrink-0">
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold premium-text-primary mb-2 group-hover:text-primary transition-colors">
                          {feature.title}
                        </h3>
                        <p className="premium-text-secondary text-sm leading-relaxed">
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                    <div className="mt-auto">
                      <div className="w-full h-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full">
                        <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full w-0 group-hover:w-full transition-all duration-500"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Action */}
      <section className="py-12 px-6">
        <div className="container mx-auto">
          <div className="premium-card-large max-w-2xl mx-auto">
            <div className="p-8 text-center">
              <div className="premium-icon-container mx-auto mb-6">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 premium-text-primary">Ready for Today's Workout?</h3>
              <p className="premium-text-secondary mb-6 text-lg">Let's crush your goals together and build the best version of yourself</p>
              <Link to="/workouts">
                <Button variant="hero" size="lg" className="text-lg px-8 py-4">
                  Start Training
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer Footer */}
      <section className="py-12 px-6 bg-white/5">
        <div className="container mx-auto">
          <div className="premium-card max-w-4xl mx-auto">
            <div className="p-8 text-center">
              <h4 className="text-lg font-semibold premium-text-primary mb-4">Important Notice</h4>
              <p className="premium-text-secondary leading-relaxed">
                Access features based on your fitness goals. 
                Consult professionals before starting any new diet or training plan. 
                Results may vary based on individual commitment and consistency.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
