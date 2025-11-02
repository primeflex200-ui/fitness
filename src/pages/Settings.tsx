import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Settings as SettingsIcon, User, Bell, Moon, Info, Save } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const profileSchema = z.object({
  full_name: z.string().trim().min(1, "Name cannot be empty").max(100, "Name must be less than 100 characters"),
  age: z.string().refine((val) => val === "" || (!isNaN(parseInt(val)) && parseInt(val) >= 13 && parseInt(val) <= 120), {
    message: "Age must be between 13 and 120"
  }).optional(),
  height: z.string().refine((val) => val === "" || (!isNaN(parseFloat(val)) && parseFloat(val) >= 50 && parseFloat(val) <= 300), {
    message: "Height must be between 50-300 cm"
  }).optional(),
  weight: z.string().refine((val) => val === "" || (!isNaN(parseFloat(val)) && parseFloat(val) >= 20 && parseFloat(val) <= 500), {
    message: "Weight must be between 20-500 kg"
  }).optional(),
  gender: z.enum(["male", "female", "other", ""]).optional(),
  fitness_goal: z.enum(["fat_loss", "muscle_gain", "maintain", "athletic", ""]).optional(),
  diet_type: z.enum(["veg", "non_veg", ""]).optional()
});

const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    fitness_goal: "",
    diet_type: ""
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setProfile({
        full_name: data.full_name || "",
        email: data.email || "",
        age: data.age?.toString() || "",
        gender: data.gender || "",
        height: data.height?.toString() || "",
        weight: data.weight?.toString() || "",
        fitness_goal: data.fitness_goal || "",
        diet_type: data.diet_type || ""
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;

    // Validate input
    const validation = profileSchema.safeParse({
      full_name: profile.full_name,
      age: profile.age,
      height: profile.height,
      weight: profile.weight,
      gender: profile.gender,
      fitness_goal: profile.fitness_goal,
      diet_type: profile.diet_type
    });

    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    const updateData: any = {
      full_name: profile.full_name,
      age: profile.age ? parseInt(profile.age) : null,
      gender: profile.gender || null,
      height: profile.height ? parseFloat(profile.height) : null,
      weight: profile.weight ? parseFloat(profile.weight) : null,
      fitness_goal: profile.fitness_goal || null,
      diet_type: profile.diet_type || null
    };

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id);

    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated successfully!");
      setEditing(false);
      fetchProfile();
    }
  };

  const getFitnessGoalDisplay = (goal: string) => {
    const goals: Record<string, string> = {
      'fat_loss': 'Fat Loss',
      'muscle_gain': 'Muscle Gain',
      'maintain': 'Maintain Fitness',
      'athletic': 'Athletic Performance'
    };
    return goals[goal] || 'Not Set';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
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
            <SettingsIcon className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">Settings</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">App Settings</h1>
          <p className="text-muted-foreground">Manage your preferences</p>
        </div>

        {/* Profile Summary Card */}
        {profile.full_name && profile.fitness_goal && (
          <Card className="mb-6 border-primary/50 bg-gradient-to-r from-primary/10 to-primary/5">
            <CardContent className="py-6">
              <p className="text-lg">
                <strong>Hey, {profile.full_name}!</strong> You're working toward {getFitnessGoalDisplay(profile.fitness_goal)}. 
                Stay consistent 💪
              </p>
            </CardContent>
          </Card>
        )}

        {/* Profile */}
        <Card className="mb-6 border-border bg-card/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Profile Information
                </CardTitle>
                <CardDescription>Your personal details</CardDescription>
              </div>
              {!editing && (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {editing ? (
              <>
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-muted-foreground">Email (cannot be changed)</Label>
                  <Input
                    id="email"
                    value={profile.email}
                    disabled
                    className="opacity-60"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={profile.age}
                      onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                      placeholder="25"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={profile.gender} onValueChange={(value) => setProfile({ ...profile, gender: value })}>
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={profile.height}
                      onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                      placeholder="170"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={profile.weight}
                      onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                      placeholder="70"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="fitness_goal">Fitness Goal</Label>
                  <Select value={profile.fitness_goal} onValueChange={(value) => setProfile({ ...profile, fitness_goal: value })}>
                    <SelectTrigger id="fitness_goal">
                      <SelectValue placeholder="Select your goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fat_loss">Fat Loss</SelectItem>
                      <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                      <SelectItem value="maintain">Maintain Fitness</SelectItem>
                      <SelectItem value="athletic">Athletic Performance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="diet_type">Diet Type</Label>
                  <Select value={profile.diet_type} onValueChange={(value) => setProfile({ ...profile, diet_type: value })}>
                    <SelectTrigger id="diet_type">
                      <SelectValue placeholder="Select diet preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="veg">Vegetarian</SelectItem>
                      <SelectItem value="non_veg">Non-Vegetarian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} className="flex-1 gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setEditing(false);
                    fetchProfile();
                  }}>
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="text-lg font-semibold">{profile.full_name || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="text-lg font-semibold">{profile.email}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Age</Label>
                    <p className="text-lg font-semibold">{profile.age ? `${profile.age} years` : "Not set"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Gender</Label>
                    <p className="text-lg font-semibold capitalize">{profile.gender || "Not set"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Height</Label>
                    <p className="text-lg font-semibold">{profile.height ? `${profile.height} cm` : "Not set"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Weight</Label>
                    <p className="text-lg font-semibold">{profile.weight ? `${profile.weight} kg` : "Not set"}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Fitness Goal</Label>
                  <p className="text-lg font-semibold">{profile.fitness_goal ? getFitnessGoalDisplay(profile.fitness_goal) : "Not set"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Diet Type</Label>
                  <p className="text-lg font-semibold capitalize">{profile.diet_type ? (profile.diet_type === "veg" ? "Vegetarian" : "Non-Vegetarian") : "Not set"}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="mb-6 border-border bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription>Manage your alerts and reminders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="workout-reminder">Workout Reminders</Label>
                <p className="text-sm text-muted-foreground">Daily training notifications</p>
              </div>
              <Switch id="workout-reminder" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="water-reminder">Water Reminders</Label>
                <p className="text-sm text-muted-foreground">Hydration alerts</p>
              </div>
              <Switch id="water-reminder" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="meal-reminder">Meal Reminders</Label>
                <p className="text-sm text-muted-foreground">Diet plan notifications</p>
              </div>
              <Switch id="meal-reminder" />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="mb-6 border-border bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-primary" />
              Appearance
            </CardTitle>
            <CardDescription>Customize the app theme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Currently active</p>
              </div>
              <Switch id="dark-mode" defaultChecked disabled />
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              About
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">App Version</span>
              <span className="font-semibold">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Build</span>
              <span className="font-semibold">2025.01.15</span>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Link to="/">
          <Button variant="destructive" className="w-full mt-8">
            Logout
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Settings;
