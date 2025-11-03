import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, TrendingUp, Activity, Flame, Footprints, Calendar, Dumbbell } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from "recharts";
import { Progress as ProgressBar } from "@/components/ui/progress";

interface WorkoutData {
  date: string;
  count: number;
}

interface StrengthData {
  date: string;
  totalWeight: number;
  avgReps: number;
}

interface StatsHistory {
  date: string;
  calories: number;
  steps: number;
  workouts: number;
}

const Progress = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [workoutTrend, setWorkoutTrend] = useState<WorkoutData[]>([]);
  const [strengthTrend, setStrengthTrend] = useState<StrengthData[]>([]);
  const [statsHistory, setStatsHistory] = useState<StatsHistory[]>([]);
  const [currentStats, setCurrentStats] = useState({
    workouts_completed: 0,
    current_streak: 0,
    calories_burned: 0,
    steps_today: 0,
  });

  useEffect(() => {
    if (!user) return;
    fetchAllData();
  }, [user]);

  const fetchAllData = async () => {
    if (!user) return;
    
    // Fetch current stats
    const { data: stats } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (stats) {
      setCurrentStats({
        workouts_completed: stats.workouts_completed,
        current_streak: stats.current_streak,
        calories_burned: stats.calories_burned,
        steps_today: stats.steps_today,
      });
    }

    // Fetch workout completions trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: workouts } = await supabase
      .from("workout_completions")
      .select("workout_date, completed")
      .eq("user_id", user.id)
      .eq("completed", true)
      .gte("workout_date", thirtyDaysAgo.toISOString().split("T")[0])
      .order("workout_date");

    if (workouts) {
      const workoutsByDate = workouts.reduce((acc: Record<string, number>, curr) => {
        acc[curr.workout_date] = (acc[curr.workout_date] || 0) + 1;
        return acc;
      }, {});

      const workoutData = Object.entries(workoutsByDate).map(([date, count]) => ({
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        count,
      }));
      setWorkoutTrend(workoutData);
    }

    // Fetch strength progress trend (last 30 days)
    const { data: strength } = await supabase
      .from("strength_progress")
      .select("recorded_date, weight, reps")
      .eq("user_id", user.id)
      .gte("recorded_date", thirtyDaysAgo.toISOString().split("T")[0])
      .order("recorded_date");

    if (strength) {
      const strengthByDate = strength.reduce((acc: Record<string, { totalWeight: number; reps: number[]; }>, curr) => {
        if (!acc[curr.recorded_date]) {
          acc[curr.recorded_date] = { totalWeight: 0, reps: [] };
        }
        acc[curr.recorded_date].totalWeight += Number(curr.weight) * curr.reps;
        acc[curr.recorded_date].reps.push(curr.reps);
        return acc;
      }, {});

      const strengthData = Object.entries(strengthByDate).map(([date, data]) => ({
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        totalWeight: data.totalWeight,
        avgReps: Math.round(data.reps.reduce((a, b) => a + b, 0) / data.reps.length),
      }));
      setStrengthTrend(strengthData);
    }

    // Generate mock stats history for visualization (in production, you'd track this in DB)
    const mockStatsHistory: StatsHistory[] = [];
    for (let i = 14; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      mockStatsHistory.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        calories: Math.floor(Math.random() * 500) + 200,
        steps: Math.floor(Math.random() * 5000) + 3000,
        workouts: Math.floor(Math.random() * 3),
      });
    }
    setStatsHistory(mockStatsHistory);

    setLoading(false);
  };

  const totalWorkouts = workoutTrend.reduce((sum, day) => sum + day.count, 0);
  const avgWorkoutsPerWeek = totalWorkouts > 0 ? (totalWorkouts / 4.3).toFixed(1) : "0";
  const streakGoal = 30;
  const streakProgress = (currentStats.current_streak / streakGoal) * 100;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Progress Tracking</h1>
              <p className="text-sm text-muted-foreground">Monitor your fitness journey</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Current Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <Dumbbell className="w-8 h-8 text-primary mb-2" />
              <div className="text-2xl font-bold">{currentStats.workouts_completed}</div>
              <div className="text-xs text-muted-foreground">Total Workouts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Calendar className="w-8 h-8 text-green-500 mb-2" />
              <div className="text-2xl font-bold">{currentStats.current_streak}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Flame className="w-8 h-8 text-orange-500 mb-2" />
              <div className="text-2xl font-bold">{currentStats.calories_burned.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Calories Burned</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Footprints className="w-8 h-8 text-purple-500 mb-2" />
              <div className="text-2xl font-bold">{currentStats.steps_today.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Steps Today</div>
            </CardContent>
          </Card>
        </div>

        {/* Streak Progress */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Streak Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{currentStats.current_streak} days</span>
                <span className="text-muted-foreground">Goal: {streakGoal} days</span>
              </div>
              <ProgressBar value={streakProgress} className="h-3" />
              <p className="text-xs text-muted-foreground">
                Keep going! You're {streakGoal - currentStats.current_streak} days away from your goal
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Charts */}
        <Tabs defaultValue="workouts" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="workouts">Workouts</TabsTrigger>
            <TabsTrigger value="strength">Strength</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="workouts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Workout Frequency (Last 30 Days)</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Average: {avgWorkoutsPerWeek} workouts/week
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={workoutTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))' 
                      }} 
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Workouts</span>
                  <span className="text-2xl font-bold text-primary">{totalWorkouts}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Average per Week</span>
                  <span className="text-2xl font-bold text-green-500">{avgWorkoutsPerWeek}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Current Streak</span>
                  <span className="text-2xl font-bold text-orange-500">{currentStats.current_streak}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="strength" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Volume (Weight × Reps)</CardTitle>
                <p className="text-sm text-muted-foreground">Track your strength gains over time</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={strengthTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))' 
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="totalWeight" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Reps per Session</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={strengthTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))' 
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avgReps" 
                      stroke="hsl(var(--chart-2))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--chart-2))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Daily Activity Overview (Last 15 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={statsHistory}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis yAxisId="left" className="text-xs" />
                    <YAxis yAxisId="right" orientation="right" className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))' 
                      }} 
                    />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="steps" 
                      stroke="hsl(var(--chart-1))" 
                      name="Steps"
                      strokeWidth={2}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="calories" 
                      stroke="hsl(var(--chart-3))" 
                      name="Calories"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Calories Burned Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={statsHistory}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))' 
                      }} 
                    />
                    <Bar dataKey="calories" fill="hsl(var(--chart-3))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Insights */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Quick Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Consistency is Key</p>
                <p className="text-sm text-muted-foreground">
                  You've completed {totalWorkouts} workouts in the last 30 days. Keep it up!
                </p>
              </div>
            </div>
            {currentStats.current_streak >= 7 && (
              <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg">
                <Calendar className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Streak Master!</p>
                  <p className="text-sm text-muted-foreground">
                    Amazing {currentStats.current_streak}-day streak! You're building a strong habit.
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3 p-3 bg-orange-500/10 rounded-lg">
              <Flame className="w-5 h-5 text-orange-500 mt-0.5" />
              <div>
                <p className="font-medium">Calorie Burn</p>
                <p className="text-sm text-muted-foreground">
                  You've burned {currentStats.calories_burned.toLocaleString()} calories total. Great job!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Progress;