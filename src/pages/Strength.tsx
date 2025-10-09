import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, TrendingUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface WorkoutRecord {
  id: string;
  exercise: string;
  weight: number;
  reps: number;
  date: string;
}

const Strength = () => {
  const [records, setRecords] = useState<WorkoutRecord[]>([
    { id: "1", exercise: "Bench Press", weight: 60, reps: 10, date: "2025-01-15" },
    { id: "2", exercise: "Squat", weight: 80, reps: 8, date: "2025-01-15" },
    { id: "3", exercise: "Deadlift", weight: 100, reps: 6, date: "2025-01-14" }
  ]);

  const [exercise, setExercise] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");

  const addRecord = () => {
    if (!exercise || !weight || !reps) {
      toast.error("Please fill all fields");
      return;
    }

    const newRecord: WorkoutRecord = {
      id: Date.now().toString(),
      exercise,
      weight: parseFloat(weight),
      reps: parseInt(reps),
      date: new Date().toISOString().split('T')[0]
    };

    setRecords([newRecord, ...records]);
    setExercise("");
    setWeight("");
    setReps("");
    toast.success("Workout logged successfully!");
  };

  const deleteRecord = (id: string) => {
    setRecords(records.filter(r => r.id !== id));
    toast.info("Record deleted");
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
        <div className="grid md:grid-cols-3 gap-4 mb-8">
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
        </div>

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
