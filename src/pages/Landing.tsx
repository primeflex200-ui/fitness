import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import PrimeFlexLogo from "@/components/PrimeFlexLogo";
import { useAuth } from "@/hooks/useAuth";

const Landing = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user && !loading) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen relative" 
      data-scroll-container
      style={{
        backgroundImage: 'url(/landing-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40 z-0"></div>

      {/* Navigation */}
      <nav className="relative z-50 bg-transparent">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <PrimeFlexLogo showText size="md" />
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-white hover:text-yellow-500 hover:bg-transparent"
              >
                Sign In
              </Button>
            </Link>
            <Link to="/auth">
              <Button 
                size="sm"
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Title */}
          <h1 
            className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
          >
            PRIME FLEX
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Transform your body, elevate your mind. Premium fitness guidance at your fingertips.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/auth">
              <Button 
                size="lg"
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-6 text-lg w-full sm:w-auto"
              >
                Start Your Journey
              </Button>
            </Link>
            <Link to="/auth">
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black font-bold px-8 py-6 text-lg w-full sm:w-auto"
              >
                Explore Features
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
