import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, Edit, Save, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface DaySchedule {
  day: string;
  focus: string;
  intensity: "Low" | "Medium" | "High" | "Very High";
  color: string;
}

const WeeklySchedule = () => {
  const [schedule, setSchedule] = useState<DaySchedule[]>([
    { day: "Monday", focus: "Lower Chest + Triceps", intensity: "High", color: "from-red-500/20 to-red-500/5" },
    { day: "Tuesday", focus: "Back + Biceps + Shoulders", intensity: "High", color: "from-blue-500/20 to-blue-500/5" },
    { day: "Wednesday", focus: "Upper Chest + Triceps", intensity: "Medium", color: "from-green-500/20 to-green-500/5" },
    { day: "Thursday", focus: "Back + Biceps + Shoulders", intensity: "High", color: "from-purple-500/20 to-purple-500/5" },
    { day: "Friday", focus: "Lower Chest + Triceps", intensity: "Medium", color: "from-orange-500/20 to-orange-500/5" },
    { day: "Saturday", focus: "Back + Biceps + Shoulders", intensity: "High", color: "from-cyan-500/20 to-cyan-500/5" },
    { day: "Sunday", focus: "Legs + Core (Intense)", intensity: "Very High", color: "from-pink-500/20 to-pink-500/5" }
  ]);

  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [tempFocus, setTempFocus] = useState("");
  const [tempIntensity, setTempIntensity] = useState<"Low" | "Medium" | "High" | "Very High">("Medium");

  const workoutOptions = [
    "Chest + Triceps",
    "Lower Chest + Triceps",
    "Upper Chest + Triceps",
    "Back + Biceps",
    "Back + Biceps + Shoulders",
    "Shoulders + Arms",
    "Legs + Core",
    "Legs + Core (Intense)",
    "Full Body",
    "Push Day",
    "Pull Day",
    "Leg Day",
    "Cardio + Abs",
    "Rest Day",
    "Active Recovery"
  ];

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = () => {
    const saved = localStorage.getItem('weeklySchedule');
    if (saved) {
      try {
        setSchedule(JSON.parse(saved));
      } catch (error) {
        console.error("Error loading schedule:", error);
      }
    }
  };

  const saveSchedule = () => {
    try {
      localStorage.setItem('weeklySchedule', JSON.stringify(schedule));
      toast.success("Schedule saved successfully!");
    } catch (error) {
      toast.error("Failed to save schedule");
      console.error("Error saving schedule:", error);
    }
  };

  const handleEdit = (day: string) => {
    const dayData = schedule.find(d => d.day === day);
    if (dayData) {
      setEditingDay(day);
      setTempFocus(dayData.focus);
      setTempIntensity(dayData.intensity);
    }
  };

  const handleSaveEdit = () => {
    if (!editingDay) return;

    setSchedule(schedule.map(d => 
      d.day === editingDay 
        ? { ...d, focus: tempFocus, intensity: tempIntensity }
        : d
    ));

    setEditingDay(null);
    toast.success(`${editingDay} updated!`);
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "Low": return "bg-green-500/20 text-green-500";
      case "Medium": return "bg-yellow-500/20 text-yellow-500";
      case "High": return "bg-orange-500/20 text-orange-500";
      case "Very High": return "bg-red-500/20 text-red-500";
      default: return "bg-gray-500/20 text-gray-500";
    }
  };

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
            <Calendar className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">Weekly Training Schedule</span>
          </div>
          <Button onClick={saveSchedule} size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save Schedule
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Your Complete Week at a Glance</h1>
          <p className="text-muted-foreground">Customize your training split for each day</p>
        </div>

        {/* Weekly Schedule Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedule.map((dayData) => (
            <Card 
              key={dayData.day}
              className={`bg-gradient-to-br ${dayData.color} border-border hover:border-primary transition-all`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{dayData.day}</CardTitle>
                  <Badge className={getIntensityColor(dayData.intensity)}>
                    {dayData.intensity}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{dayData.focus}</p>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleEdit(dayData.day)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Schedule
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit {dayData.day} Workout</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div>
                        <label className="text-sm font-semibold mb-2 block">Workout Focus</label>
                        <Select value={tempFocus} onValueChange={setTempFocus}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select workout type" />
                          </SelectTrigger>
                          <SelectContent>
                            {workoutOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-semibold mb-2 block">Intensity Level</label>
                        <Select value={tempIntensity} onValueChange={(value: any) => setTempIntensity(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Very High">Very High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleSaveEdit} className="flex-1">
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => setEditingDay(null)} className="flex-1">
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="mt-8 border-primary/50 bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">💡 Pro Tips:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Click "Edit Schedule" on any day to customize your workout</li>
              <li>• Choose from 15+ workout types including Push/Pull/Legs splits</li>
              <li>• Set intensity levels to match your energy and recovery</li>
              <li>• Don't forget to save your schedule after making changes!</li>
              <li>• Rest days are important - schedule at least 1-2 per week</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WeeklySchedule;
