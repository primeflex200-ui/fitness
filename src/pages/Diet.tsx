import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Apple, Sparkles, Calendar, Calculator } from "lucide-react";

const Diet = () => {
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
            <Apple className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">Diet Plans</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 animate-fade-in text-center">
          <h1 className="text-4xl font-bold mb-3">Nutrition Guidance</h1>
          <p className="text-muted-foreground text-lg">AI-powered personalized meal plans for your fitness goals</p>
        </div>

        {/* Key Features */}
        <div className="grid gap-6 mb-8">
          {/* AI Diet Plan Generator */}
          <Card className="border-primary/50 bg-gradient-to-br from-primary/10 to-transparent hover:border-primary transition-all">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/20 rounded-lg">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">Generate AI Diet Plan</h3>
                  <p className="text-muted-foreground mb-4">
                    Create personalized 7-day meal plans tailored to your diet preference and fitness goals using AI
                  </p>
                  <Link to="/ai-diet-plan">
                    <Button variant="hero" size="lg" className="w-full sm:w-auto">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Plan
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* View Saved Plans */}
          <Card className="border-border hover:border-primary transition-all">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">Saved Diet Plans</h3>
                  <p className="text-muted-foreground mb-4">
                    View, edit, and manage all your saved diet plans with meal customization options
                  </p>
                  <Link to="/saved-diet-plans">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      <Calendar className="w-5 h-5 mr-2" />
                      View Saved Plans
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Body Fat Calculator */}
          <Card className="border-border hover:border-primary transition-all">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Calculator className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">Body Fat % Calculator</h3>
                  <p className="text-muted-foreground mb-4">
                    Calculate your body fat percentage using the US Navy Method with accurate measurements
                  </p>
                  <Link to="/body-fat-calculator">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      <Calculator className="w-5 h-5 mr-2" />
                      Calculate Body Fat
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Diet;
