import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Lock, Footprints, TrendingUp, Target, Award, Activity, MapPin } from "lucide-react";

const ComingSoon = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <Footprints className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold">Step Tracker</span>
        </div>
      </header>

      {/* Coming Soon Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center text-center space-y-8 max-w-2xl mx-auto">
          {/* Lock Icon */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <Lock className="w-24 h-24 text-primary opacity-20" />
                <Footprints className="w-12 h-12 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>

            <h1 className="text-4xl font-bold">Coming Soon</h1>
            <p className="text-lg text-muted-foreground">
              This feature is currently locked and will be available soon!
            </p>
          </div>

          {/* Development Notice */}
          <Card className="border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5 w-full">
            <CardContent className="pt-6 space-y-3 text-sm text-muted-foreground">
              <p>🔒 This feature is under development</p>
              <p>⚡ We're working hard to bring you something amazing</p>
              <p>📅 Check back soon for updates!</p>
            </CardContent>
          </Card>

          {/* How Step Tracker Works */}
          <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-purple-500/5 w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-400">
                <Footprints className="w-5 h-5" />
                How Step Tracker Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-left">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Activity className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold">Daily Step Counting</h4>
                  <p className="text-sm text-muted-foreground">Automatically track your daily steps and monitor your activity levels throughout the day.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Target className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold">Set Daily Goals</h4>
                  <p className="text-sm text-muted-foreground">Set personalized step goals (5K, 10K, or custom) and get motivated to reach them every day.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold">Progress Analytics</h4>
                  <p className="text-sm text-muted-foreground">View weekly and monthly trends with beautiful charts showing your walking habits.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <MapPin className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold">Distance & Calories</h4>
                  <p className="text-sm text-muted-foreground">Calculate distance walked and calories burned based on your step count and profile.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Award className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold">Achievements & Streaks</h4>
                  <p className="text-sm text-muted-foreground">Earn badges for hitting milestones and maintain streaks for consistent daily activity.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features Preview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/30">
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-blue-500">👟</div>
                <div className="text-xs text-muted-foreground mt-2">Step Counter</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/30">
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-green-500">🎯</div>
                <div className="text-xs text-muted-foreground mt-2">Daily Goals</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/30">
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-purple-500">📊</div>
                <div className="text-xs text-muted-foreground mt-2">Weekly Stats</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/30">
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-orange-500">🔥</div>
                <div className="text-xs text-muted-foreground mt-2">Calorie Burn</div>
              </CardContent>
            </Card>
          </div>

          {/* Back Button */}
          <Link to="/dashboard" className="w-full">
            <Button variant="hero" size="lg" className="w-full">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
