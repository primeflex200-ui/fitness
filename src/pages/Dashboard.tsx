import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth.js";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import LightRays from "@/components/LightRays";
import GooeyEffect from "@/components/GooeyEffect";
import GlareHover from "@/components/GlareHover";
import LogoLoop from "@/components/LogoLoop";
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
  const [scrollOpacity, setScrollOpacity] = useState(1);
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
  
  // Text for the scrolling loop
  const scrollingText = [
    { node: <span className="text-white font-semibold text-xl tracking-wide">When guidance becomes accessible, consistency follows.</span> },
    { node: <span className="text-yellow-400 font-bold text-xl mx-12">✦</span> },
    { node: <span className="text-white font-semibold text-xl tracking-wide">Transform your fitness journey with expert guidance.</span> },
    { node: <span className="text-yellow-400 font-bold text-xl mx-12">✦</span> },
    { node: <span className="text-white font-semibold text-xl tracking-wide">Your personalized fitness companion awaits.</span> },
    { node: <span className="text-yellow-400 font-bold text-xl mx-12">✦</span> },
  ];
  
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

  // Scroll-based light rays fade effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = 300; // Fade out completely after 300px of scroll
      const opacity = Math.max(0, 1 - (scrollY / maxScroll));
      setScrollOpacity(opacity);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <div 
      className="min-h-screen relative bg-black bg-cover bg-center bg-no-repeat" 
      data-scroll-container
      style={{
        backgroundImage: "url('/main-final-bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        willChange: 'transform',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        perspective: '1000px',
        minHeight: '100vh',
        width: '100%',
        height: '100%'
      }}
    >
      {/* Fixed Background Overlay for better readability */}
      <div className="absolute inset-0 bg-black/40 z-0" style={{ willChange: 'opacity', transform: 'translateZ(0)' }}></div>
      
      {/* Gooey Click Effect */}
      {clickedElement && <GooeyEffect targetElement={clickedElement} />}
      
      {/* Light Rays Background */}
      <div 
        className="fixed inset-0 w-full h-full z-0 pointer-events-none transition-opacity duration-300 ease-out"
        style={{ opacity: scrollOpacity }}
      >
        <LightRays
          raysOrigin="top-center"
          raysColor="#ffffff"
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

      {/* Scrolling Text Loop */}
      <div className="bg-gradient-to-r from-black/30 via-black/20 to-black/30 backdrop-blur-sm border-b border-white/10 py-4 relative z-30 overflow-hidden">
        <LogoLoop
          logos={scrollingText}
          speed={60}
          direction="left"
          logoHeight={32}
          gap={0}
          fadeOut={true}
          fadeOutColor="rgba(0, 0, 0, 0.3)"
          ariaLabel="Motivational text"
          className="w-full"
        />
      </div>

      {/* Hero Section */}
      <section className="py-12 px-6 bg-gradient-to-b from-white/5 to-transparent relative z-10">
        <div className="container mx-auto">
          <GlareHover
            width="100%"
            height="auto"
            background="rgba(255, 255, 255, 0.1)"
            borderRadius="24px"
            borderColor="rgba(255, 255, 255, 0.3)"
            glareColor="#FFD700"
            glareOpacity={0.3}
            glareAngle={-45}
            glareSize={400}
            transitionDuration={1000}
            className="max-w-4xl mx-auto"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08)'
            }}
          >
            <div className="p-8 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                Welcome Back, <span className="text-gradient-gold" style={{ color: '#FFD700' }}>{userName}</span>
              </h1>
              <p className="text-xl text-white max-w-2xl mx-auto">
                Ready to crush your fitness goals today? Your personalized dashboard awaits.
              </p>
            </div>
          </GlareHover>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-6 px-4 relative z-10">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-white">Your Fitness Tools</h2>
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
                <GlareHover
                  width="100%"
                  height="180px"
                  background="rgba(255, 255, 255, 0.1)"
                  borderRadius="24px"
                  borderColor="rgba(255, 255, 255, 0.3)"
                  glareColor="#FFD700"
                  glareOpacity={0.3}
                  glareAngle={-30}
                  glareSize={200}
                  transitionDuration={600}
                  playOnce={false}
                  className="feature-card cursor-pointer h-full"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(12px)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08)'
                  }}
                >
                  <div className="p-6 flex flex-col h-full">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="premium-icon-container flex-shrink-0 group-hover:bg-yellow-500/10 group-hover:shadow-[0_0_8px_rgba(255,215,0,0.4)] transition-all duration-200 rounded-xl p-2">
                        <feature.icon className="w-8 h-8 text-yellow-700 group-hover:text-yellow-400 transition-colors duration-200" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors duration-200">
                          {feature.title}
                        </h3>
                        <p className="text-gray-200 text-sm leading-relaxed">
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                    <div className="mt-auto">
                      <div className="w-full h-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full">
                        <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full w-0 group-hover:w-full transition-all duration-300"></div>
                      </div>
                    </div>
                  </div>
                </GlareHover>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Action */}
      <section className="py-12 px-6">
        <div className="container mx-auto">
          <GlareHover
            width="100%"
            height="auto"
            background="rgba(255, 255, 255, 0.1)"
            borderRadius="24px"
            borderColor="rgba(255, 255, 255, 0.3)"
            glareColor="#FFD700"
            glareOpacity={0.4}
            glareAngle={-60}
            glareSize={350}
            transitionDuration={900}
            className="max-w-2xl mx-auto"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08)'
            }}
          >
            <div className="p-8 text-center">
              <div className="premium-icon-container mx-auto mb-6 hover:bg-yellow-500/10 hover:shadow-[0_0_8px_rgba(255,215,0,0.4)] transition-all duration-200 rounded-xl p-3">
                <Brain className="w-10 h-10 text-yellow-700 hover:text-yellow-400 transition-colors duration-200" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Ready for Today's Workout?</h3>
              <p className="text-gray-200 mb-6 text-lg">Let's crush your goals together and build the best version of yourself</p>
              <Link to="/workouts">
                <Button variant="hero" size="lg" className="text-lg px-8 py-4">
                  Start Training
                </Button>
              </Link>
            </div>
          </GlareHover>
        </div>
      </section>

      {/* Disclaimer Footer */}
      <section className="py-12 px-6 bg-white/5">
        <div className="container mx-auto">
          <GlareHover
            width="100%"
            height="auto"
            background="rgba(255, 255, 255, 0.1)"
            borderRadius="20px"
            borderColor="rgba(255, 255, 255, 0.3)"
            glareColor="#FFD700"
            glareOpacity={0.2}
            glareAngle={-20}
            glareSize={250}
            transitionDuration={700}
            className="max-w-4xl mx-auto"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)'
            }}
          >
            <div className="p-8 text-center">
              <h4 className="text-lg font-semibold text-white mb-4">Important Notice</h4>
              <p className="text-gray-200 leading-relaxed">
                Access features based on your fitness goals. 
                Consult professionals before starting any new diet or training plan. 
                Results may vary based on individual commitment and consistency.
              </p>
            </div>
          </GlareHover>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
