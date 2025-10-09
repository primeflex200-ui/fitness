import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dumbbell, Trophy, Target, TrendingUp, User, Menu } from "lucide-react";
import heroGym from "@/assets/hero-gym.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-gradient-gold">PRIME FLEX</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/auth" className="text-muted-foreground hover:text-primary transition-colors">
              Sign In
            </Link>
            <Link to="/auth">
              <Button variant="hero" size="sm">Get Started</Button>
            </Link>
          </div>
          <button className="md:hidden">
            <Menu className="w-6 h-6 text-foreground" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${heroGym})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
        
        <div className="relative z-10 container mx-auto px-4 py-20 text-center animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient-gold leading-tight tracking-tight">
            PRIME FLEX
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Transform your body, elevate your mind. Premium fitness guidance at your fingertips.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/auth">
              <Button variant="hero" size="lg" className="w-full sm:w-auto">
                Start Your Journey
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="premium" size="lg" className="w-full sm:w-auto">
                Explore Features
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gradient-gold">
            Everything You Need to Excel
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Target, title: "Custom Workouts", desc: "Tailored plans for every fitness level" },
              { icon: Trophy, title: "Diet Guidance", desc: "Nutrition plans that fuel your goals" },
              { icon: TrendingUp, title: "Track Progress", desc: "Monitor strength & body metrics" },
              { icon: User, title: "Expert Trainers", desc: "Learn from certified professionals" }
            ].map((feature, i) => (
              <div 
                key={i}
                className="bg-card border border-border rounded-lg p-6 hover-scale hover:border-primary transition-all animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <feature.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-card/50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform?</h2>
          <p className="text-muted-foreground mb-8 text-lg max-w-xl mx-auto">
            Join thousands achieving their fitness goals with PRIME FLEX
          </p>
          <Link to="/auth">
            <Button variant="hero" size="lg">
              Start Free Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 PRIME FLEX. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
