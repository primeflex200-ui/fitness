import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, TrendingUp, Plus, Trash2, Download, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface WorkoutRecord {
  id: string;
  exercise: string;
  weight: number;
  reps: number;
  date: string;
}

const Strength = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<WorkoutRecord[]>([]);
  const [exercise, setExercise] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecords();
    }
  }, [user]);

  const fetchRecords = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('strength_progress')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      const formattedRecords: WorkoutRecord[] = data.map(item => ({
        id: item.id,
        exercise: item.exercise_name,
        weight: parseFloat(item.weight.toString()),
        reps: item.reps,
        date: item.recorded_date
      }));
      setRecords(formattedRecords);
    }
    setLoading(false);
  };

  const addRecord = async () => {
    if (!user) {
      toast.error("Please log in to track progress");
      return;
    }

    if (!exercise || !weight || !reps) {
      toast.error("Please fill all fields");
      return;
    }

    const { error } = await supabase
      .from('strength_progress')
      .insert({
        user_id: user.id,
        exercise_name: exercise,
        weight: parseFloat(weight),
        reps: parseInt(reps),
        recorded_date: new Date().toISOString().split('T')[0]
      });

    if (error) {
      toast.error("Failed to save workout");
    } else {
      setExercise("");
      setWeight("");
      setReps("");
      toast.success("Workout logged successfully!");
      fetchRecords();
    }
  };

  const deleteRecord = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('strength_progress')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Failed to delete record");
    } else {
      toast.info("Record deleted");
      fetchRecords();
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      "Exercise,Weight (kg),Reps,Date",
      ...records.map(r => `${r.exercise},${r.weight},${r.reps},${r.date}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `strength-progress-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success("Progress exported!");
  };

  // Calculate stats
  const totalWeight = records.reduce((sum, r) => sum + (r.weight * r.reps), 0);
  const avgReps = records.length > 0 
    ? (records.reduce((sum, r) => sum + r.reps, 0) / records.length).toFixed(1)
    : 0;

  const exerciseStats = records.reduce((acc, r) => {
    if (!acc[r.exercise]) {
      acc[r.exercise] = { totalWeight: 0, totalReps: 0, sessions: 0 };
    }
    acc[r.exercise].totalWeight += r.weight * r.reps;
    acc[r.exercise].totalReps += r.reps;
    acc[r.exercise].sessions += 1;
    return acc;
  }, {} as Record<string, { totalWeight: number; totalReps: number; sessions: number }>);

  // Prepare graph data (last 7 records or weekly average)
  const graphData = records
    .slice(0, 14)
    .reverse()
    .map(record => ({
      date: new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: record.weight,
      totalVolume: record.weight * record.reps,
      exercise: record.exercise
    }));

  // Calculate weekly progress
  const lastWeekTotal = records
    .filter(r => {
      const daysDiff = (new Date().getTime() - new Date(r.date).getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    })
    .reduce((sum, r) => sum + (r.weight * r.reps), 0);

  const prevWeekTotal = records
    .filter(r => {
      const daysDiff = (new Date().getTime() - new Date(r.date).getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff > 7 && daysDiff <= 14;
    })
    .reduce((sum, r) => sum + (r.weight * r.reps), 0);

  const weeklyImprovement = prevWeekTotal > 0 
    ? Math.round(((lastWeekTotal - prevWeekTotal) / prevWeekTotal) * 100)
    : 0;

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
            <TrendingUp className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">Strength Tracker</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Track Your Progress</h1>
          <p className="text-muted-foreground">Log your workouts and watch yourself grow stronger</p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/30">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-500">{totalWeight.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Weight Lifted (kg)</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/30">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-500">{avgReps}</div>
              <div className="text-sm text-muted-foreground">Average Reps</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary">{records.length}</div>
              <div className="text-sm text-muted-foreground">Total Sessions</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/30">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-500">
                {weeklyImprovement > 0 ? '+' : ''}{weeklyImprovement}%
              </div>
              <div className="text-sm text-muted-foreground">Weekly Progress</div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Summary */}
        {weeklyImprovement !== 0 && (
          <Card className="mb-8 border-primary/50 bg-gradient-to-r from-primary/10 to-primary/5">
            <CardContent className="py-6 text-center">
              <p className="text-lg">
                {weeklyImprovement > 0 ? '📈' : '📉'} You {weeklyImprovement > 0 ? 'improved' : 'decreased'} by <strong>{Math.abs(weeklyImprovement)}%</strong> this week!
                {weeklyImprovement > 0 && " Keep pushing! 💪"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Progress Graph */}
        {graphData.length > 0 && (
          <Card className="mb-8 border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Progress Graph
                  </CardTitle>
                  <CardDescription>Your recent training volume over time</CardDescription>
                </div>
                <Button onClick={exportToCSV} variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={graphData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="totalVolume" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Total Volume (kg)"
                      dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="hsl(var(--chart-2))" 
                      strokeWidth={2}
                      name="Weight (kg)"
                      dot={{ fill: 'hsl(var(--chart-2))', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Record Form */}
        <Card className="mb-8 border-primary/50 bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Log New Workout
            </CardTitle>
            <CardDescription>Record your latest training session</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="exercise">Exercise</Label>
                <Input
                  id="exercise"
                  value={exercise}
                  onChange={(e) => setExercise(e.target.value)}
                  placeholder="e.g., Bench Press"
                />
              </div>
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="50"
                />
              </div>
              <div>
                <Label htmlFor="reps">Reps</Label>
                <Input
                  id="reps"
                  type="number"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  placeholder="10"
                />
              </div>
            </div>
            <Button onClick={addRecord} variant="hero" className="w-full mt-4">
              Add Record
            </Button>
          </CardContent>
        </Card>

        {/* Exercise Stats */}
        {Object.keys(exerciseStats).length > 0 && (
          <Card className="mb-8 border-border">
            <CardHeader>
              <CardTitle>Per-Exercise Stats</CardTitle>
              <CardDescription>Your performance breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(exerciseStats).map(([exercise, stats]) => (
                  <div key={exercise} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">{exercise}</h4>
                      <p className="text-sm text-muted-foreground">
                        {stats.sessions} sessions • Avg {(stats.totalReps / stats.sessions).toFixed(1)} reps
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {stats.totalWeight.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">kg total</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Workout History */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Workout History</CardTitle>
            <CardDescription>Your training log</CardDescription>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No workouts logged yet. Start tracking your progress!
              </p>
            ) : (
              <div className="space-y-3">
                {records.map((record) => (
                  <div 
                    key={record.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold">{record.exercise}</h4>
                      <p className="text-sm text-muted-foreground">
                        {record.weight} kg × {record.reps} reps = {record.weight * record.reps} kg
                      </p>
                      <p className="text-xs text-muted-foreground">{record.date}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteRecord(record.id)}
                      className="hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Strength;
