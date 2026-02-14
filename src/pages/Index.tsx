import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Shuffle from "@/components/Shuffle";
import { Dumbbell, Zap, Target, TrendingUp } from "lucide-react";

const Index = () => {
  return (
    <div 
      className="relative min-h-screen bg-black bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/dashboard-bg-new.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        willChange: 'transform',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        perspective: '1000px'
      }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40 z-0" style={{ willChange: 'opacity', transform: 'translateZ(0)' }}></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12" style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
        {/* Logo Icon */}
        <div className="mb-8 animate-fade-in">
          <Dumbbell className="w-16 h-16 text-primary animate-pulse" />
        </div>

        {/* Main Title with Shuffle Animation */}
        <div className="mb-6 animate-fade-in">
          <Shuffle
            text="PRIME FLEX"
            className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '-0.02em'
            }}
            shuffleDirection="right"
            duration={0.5}
            shuffleTimes={2}
            animationMode="evenodd"
            stagger={0.04}
            threshold={0.5}
            triggerOnce={true}
            ease="power4.out"
          />
        </div>

        {/* Subtitle */}
        <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground text-center max-w-3xl mb-12 animate-fade-in px-4">
          Transform your body, elevate your mind. Premium fitness guidance at your fingertips.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16 animate-fade-in">
          <Link to="/auth">
            <Button 
              variant="hero" 
              size="lg"
              className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-yellow-500 hover:from-yellow-500 hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Your Journey
            </Button>
          </Link>
          <Link to="/auth">
            <Button 
              variant="outline" 
              size="lg"
              className="text-lg px-8 py-6 border-2 border-primary hover:bg-primary/10 transition-all duration-300"
            >
              <Target className="w-5 h-5 mr-2" />
              Explore Features
            </Button>
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full px-4 animate-fade-in">
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6 hover:border-primary transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3 mb-3">
              <Dumbbell className="w-8 h-8 text-primary" />
              <h3 className="text-xl font-bold">Expert Workouts</h3>
            </div>
            <p className="text-muted-foreground">
              Personalized training plans designed by professionals
            </p>
          </div>

          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6 hover:border-primary transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3 mb-3">
              <Target className="w-8 h-8 text-primary" />
              <h3 className="text-xl font-bold">AI Diet Plans</h3>
            </div>
            <p className="text-muted-foreground">
              Smart nutrition guidance tailored to your goals
            </p>
          </div>

          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6 hover:border-primary transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-8 h-8 text-primary" />
              <h3 className="text-xl font-bold">Track Progress</h3>
            </div>
            <p className="text-muted-foreground">
              Monitor your journey with detailed analytics
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-16 text-center text-sm text-muted-foreground animate-fade-in">
          <p>Join thousands of athletes transforming their lives</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
