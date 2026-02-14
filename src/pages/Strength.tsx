import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Dumbbell, TrendingUp, BarChart3, Target, Award, Zap, Plus, Calendar, Trophy, Flame } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StrengthEntry {
  id: string;
  exercise: string;
  weight: number;
  reps: number;
  recorded_date: string;
  created_at: string;
}

interface ExerciseStats {
  exercise: string;
  totalWeight: number;
  totalSets: number;
  averageReps: number;
  maxWeight: number;
  sessions: number;
  lastWorkout: string;
}

const Strength = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<StrengthEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [exercise, setExercise] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Popular exercises
  const popularExercises = [
    "Bench Press", "Squat", "Deadlift", "Overhead Press", "Barbell Row",
    "Pull-ups", "Dips", "Bicep Curls", "Tricep Extensions", "Lateral Raises",
    "Leg Press", "Romanian Deadlift", "Incline Bench Press", "Lat Pulldowns",
    "Shoulder Press", "Chest Flyes", "Leg Curls", "Calf Raises"
  ];

  // Fetch strength entries
  const fetchEntries = async () => {
    // Get current user directly from Supabase as fallback
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    const activeUser = user || currentUser;

    if (!activeUser) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from("strength_progress")
        .select("*")
        .eq("user_id", activeUser.id)
        .order("recorded_date", { ascending: false });

      if (error) {
        console.error("Database error:", error);
        // If table doesn't exist, just set empty entries
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          setEntries([]);
        } else {
          throw error;
        }
      } else {
        setEntries(data || []);
      }
    } catch (error) {
      console.error("Error fetching entries:", error);
      // Don't show error toast, just set empty entries
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  // Add new entry
  const addEntry = async () => {
    // Get current user directly from Supabase as fallback
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    const activeUser = user || currentUser;

    // Debug authentication state
    console.log("Authentication debug:", {
      hookUser: user,
      supabaseUser: currentUser,
      activeUser: activeUser,
      userId: activeUser?.id,
      userEmail: activeUser?.email,
      isAuthenticated: !!activeUser
    });

    // Trim whitespace and check for valid values
    const trimmedExercise = exercise.trim();
    const trimmedWeight = weight.trim();
    const trimmedReps = reps.trim();

    // Check authentication first
    if (!activeUser?.id) {
      toast.error("Authentication required. Please sign in again.");
      console.error("No user ID found. Hook user:", user, "Supabase user:", currentUser);
      return;
    }

    if (!trimmedExercise) {
      toast.error("Please select an exercise");
      return;
    }

    if (!trimmedWeight || isNaN(parseFloat(trimmedWeight)) || parseFloat(trimmedWeight) <= 0) {
      toast.error("Please enter a valid weight");
      return;
    }

    if (!trimmedReps || isNaN(parseInt(trimmedReps)) || parseInt(trimmedReps) <= 0) {
      toast.error("Please enter valid reps");
      return;
    }

    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    try {
      console.log("Attempting to insert:", {
        user_id: activeUser.id,
        exercise: trimmedExercise,
        weight: parseFloat(trimmedWeight),
        reps: parseInt(trimmedReps),
        recorded_date: selectedDate
      });

      const { data, error } = await supabase
        .from("strength_progress")
        .insert({
          user_id: activeUser.id,
          exercise: trimmedExercise,
          weight: parseFloat(trimmedWeight),
          reps: parseInt(trimmedReps),
          recorded_date: selectedDate
        })
        .select();

      if (error) {
        console.error("Insert error:", error);
        toast.error("Database error: " + error.message);
        return;
      }

      console.log("Insert successful:", data);
      toast.success("Exercise logged successfully!");
      setExercise("");
      setWeight("");
      setReps("");
      setShowAddForm(false);
      fetchEntries();
    } catch (error) {
      console.error("Error adding entry:", error);
      toast.error("Failed to log exercise");
    }
  };

  // Calculate exercise statistics
  const calculateStats = (): ExerciseStats[] => {
    const exerciseMap = new Map<string, {
      totalWeight: number;
      totalSets: number;
      totalReps: number;
      maxWeight: number;
      sessions: number;
      dates: Set<string>;
    }>();

    entries.forEach(entry => {
      const key = entry.exercise;
      const existing = exerciseMap.get(key) || {
        totalWeight: 0,
        totalSets: 0,
        totalReps: 0,
        maxWeight: 0,
        sessions: 0,
        dates: new Set()
      };

      existing.totalWeight += entry.weight * entry.reps;
      existing.totalSets += 1;
      existing.totalReps += entry.reps;
      existing.maxWeight = Math.max(existing.maxWeight, entry.weight);
      existing.dates.add(entry.recorded_date);
      existing.sessions = existing.dates.size;

      exerciseMap.set(key, existing);
    });

    return Array.from(exerciseMap.entries()).map(([exercise, stats]) => ({
      exercise,
      totalWeight: stats.totalWeight,
      totalSets: stats.totalSets,
      averageReps: Math.round(stats.totalReps / stats.totalSets),
      maxWeight: stats.maxWeight,
      sessions: stats.sessions,
      lastWorkout: entries.find(e => e.exercise === exercise)?.recorded_date || ""
    })).sort((a, b) => b.totalWeight - a.totalWeight);
  };

  // Calculate weekly progress
  const getWeeklyProgress = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeek = entries.filter(e => new Date(e.recorded_date) >= weekAgo);
    const lastWeek = entries.filter(e => 
      new Date(e.recorded_date) >= twoWeeksAgo && 
      new Date(e.recorded_date) < weekAgo
    );

    const thisWeekVolume = thisWeek.reduce((sum, e) => sum + (e.weight * e.reps), 0);
    const lastWeekVolume = lastWeek.reduce((sum, e) => sum + (e.weight * e.reps), 0);

    const improvement = lastWeekVolume > 0 
      ? ((thisWeekVolume - lastWeekVolume) / lastWeekVolume) * 100 
      : 0;

    return {
      thisWeek: thisWeekVolume,
      lastWeek: lastWeekVolume,
      improvement: Math.round(improvement),
      workouts: thisWeek.length
    };
  };

  useEffect(() => {
    fetchEntries();
    
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [user]);

  const stats = calculateStats();
  const weeklyProgress = getWeeklyProgress();
  const totalVolume = entries.reduce((sum, e) => sum + (e.weight * e.reps), 0);
  const totalWorkouts = new Set(entries.map(e => e.recorded_date)).size;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Dumbbell className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p>Loading your strength data...</p>
          <Button 
            variant="outline" 
            onClick={() => setLoading(false)}
          >
            Skip Loading
          </Button>
        </div>
      </div>
    );
  }

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
            <Dumbbell className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">Strength Tracker</span>
            {/* Debug info */}
            <span className="text-xs text-muted-foreground ml-2">
              {user ? `✅ ${user.email}` : '❌ Not logged in'}
            </span>
          </div>
          <Button 
            onClick={() => setShowAddForm(!showAddForm)} 
            className="gap-2"
            disabled={!user}
          >
            <Plus className="w-4 h-4" />
            Log Exercise
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Add Exercise Form */}
        {showAddForm && (
          <Card className="border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Log New Exercise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="exercise">Exercise</Label>
                  <Select value={exercise} onValueChange={setExercise}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select exercise" />
                    </SelectTrigger>
                    <SelectContent>
                      {popularExercises.map(ex => (
                        <SelectItem key={ex} value={ex}>{ex}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight (lbs/kg)</Label>
                  <Input
                    type="number"
                    placeholder="135"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="reps">Reps</Label>
                  <Input
                    type="number"
                    placeholder="10"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={addEntry} className="flex-1">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Exercise
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Volume</p>
                  <p className="text-2xl font-bold text-blue-500">{totalVolume.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">lbs lifted</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Workouts</p>
                  <p className="text-2xl font-bold text-green-500">{totalWorkouts}</p>
                  <p className="text-xs text-muted-foreground">sessions</p>
                </div>
                <Calendar className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold text-purple-500">{weeklyProgress.thisWeek.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">volume</p>
                </div>
                <Flame className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <p className="text-2xl font-bold text-orange-500">
                    {weeklyProgress.improvement > 0 ? '+' : ''}{weeklyProgress.improvement}%
                  </p>
                  <p className="text-xs text-muted-foreground">vs last week</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exercise Statistics */}
        {stats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Exercise Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.slice(0, 5).map((stat, index) => (
                  <div key={stat.exercise} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">#{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">{stat.exercise}</h4>
                        <p className="text-sm text-muted-foreground">
                          {stat.sessions} sessions • Max: {stat.maxWeight} lbs
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{stat.totalWeight.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">total volume</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Entries */}
        {entries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5" />
                Recent Workouts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {entries.slice(0, 10).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <h4 className="font-medium">{entry.exercise}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(entry.recorded_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{entry.weight} lbs × {entry.reps}</p>
                      <p className="text-sm text-muted-foreground">
                        {entry.weight * entry.reps} total
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {entries.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Dumbbell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Start Tracking Your Strength</h3>
              <p className="text-muted-foreground mb-6">
                Log your first workout to see your progress and statistics
              </p>
              <Button onClick={() => setShowAddForm(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Log Your First Exercise
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Strength;
