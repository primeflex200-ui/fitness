import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Settings as SettingsIcon, User, Moon, Sun, Info, Save, Instagram, Shield } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/components/theme-provider";
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
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [manualUser, setManualUser] = useState<any>(null);
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
  


  // Manual session check on mount
  useEffect(() => {
    const checkSession = async () => {
      console.log('Manually checking session...');
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Manual session check result:', session);
      if (session?.user) {
        console.log('✅ Manual check found user:', session.user.email);
        setManualUser(session.user);
      } else {
        console.log('❌ Manual check found no session');
      }
    };
    checkSession();
  }, []);



  const fetchProfile = useCallback(async () => {
    const currentUser = user || manualUser;
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 Loading profile for user:', currentUser.id);
      
      // ALWAYS load from localStorage first (instant, reliable)
      const localStorageKey = `profile_${currentUser.id}`;
      const cachedProfile = localStorage.getItem(localStorageKey);
      
      if (cachedProfile) {
        try {
          console.log('✅ Loading profile from localStorage');
          const parsedProfile = JSON.parse(cachedProfile);
          const profileData = {
            full_name: parsedProfile.full_name || "",
            email: parsedProfile.email || currentUser.email || "",
            age: parsedProfile.age?.toString() || "",
            gender: parsedProfile.gender || "",
            height: parsedProfile.height?.toString() || "",
            weight: parsedProfile.weight?.toString() || "",
            fitness_goal: parsedProfile.fitness_goal || "",
            diet_type: parsedProfile.diet_type || ""
          };
          setProfile(profileData);
          console.log('✅ Profile loaded from localStorage:', profileData);
        } catch (err) {
          console.error('Error parsing localStorage profile:', err);
        }
      } else {
        // No localStorage data, set defaults
        console.log('ℹ️ No localStorage profile found, using defaults');
        setProfile({
          full_name: "",
          email: currentUser.email || "",
          age: "",
          gender: "",
          height: "",
          weight: "",
          fitness_goal: "",
          diet_type: ""
        });
      }
      
      // Then try to fetch from database (backup only)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (error) {
        console.error('⚠️ Error fetching profile from database:', error);
        // Don't show error if we have localStorage data
        if (!cachedProfile) {
          console.log('ℹ️ No database profile, using localStorage or defaults');
        }
      } else if (data) {
        console.log('✅ Profile data loaded from database:', data);
        
        // Only update if database has actual data AND localStorage didn't have it
        const hasData = data.full_name || data.age || data.gender || data.height || data.weight || data.fitness_goal || data.diet_type;
        
        if (hasData && !cachedProfile) {
          console.log('✅ Using database data (no localStorage found)');
          const profileData = {
            full_name: data.full_name || "",
            email: data.email || currentUser.email || "",
            age: data.age?.toString() || "",
            gender: data.gender || "",
            height: data.height?.toString() || "",
            weight: data.weight?.toString() || "",
            fitness_goal: data.fitness_goal || "",
            diet_type: data.diet_type || ""
          };
          
          setProfile(profileData);
          
          // Save to localStorage for next time
          localStorage.setItem(localStorageKey, JSON.stringify({
            full_name: data.full_name,
            email: data.email,
            age: data.age,
            gender: data.gender,
            height: data.height,
            weight: data.weight,
            fitness_goal: data.fitness_goal,
            diet_type: data.diet_type
          }));
        } else if (cachedProfile) {
          console.log('✅ Keeping localStorage data (already loaded)');
        }
      }
    } catch (err) {
      console.error('Unexpected error loading profile:', err);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  }, [user, manualUser]);

  useEffect(() => {
    console.log('=== Settings Page Debug ===');
    console.log('authLoading:', authLoading);
    console.log('user:', user);
    console.log('manualUser:', manualUser);
    console.log('user exists:', !!(user || manualUser));
    
    if (!authLoading) {
      const currentUser = user || manualUser;
      if (currentUser) {
        console.log('✅ User authenticated, fetching profile');
        console.log('User ID:', currentUser.id);
        console.log('User email:', currentUser.email);
        fetchProfile();
      } else {
        console.log('❌ No user found - user is not authenticated');
        console.log('This should not happen if you are logged in!');
        setLoading(false);
      }
    } else {
      console.log('⏳ Still loading auth state...');
    }
  }, [user, manualUser, authLoading, fetchProfile]);

  const handleSave = async () => {
    console.log('handleSave called - user:', user);
    
    // Refresh session to ensure we have a valid user
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    console.log('Current session:', currentSession);
    
    const currentUser = currentSession?.user || user;
    
    if (!currentUser) {
      console.error('No user found after session check, cannot save');
      toast.error('You must be logged in to save changes');
      return;
    }

    console.log('Starting save with profile data:', profile);
    console.log('Using user ID:', currentUser.id);
    setSaving(true);

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
      console.error('Validation failed:', validation.error.errors);
      toast.error(validation.error.errors[0].message);
      setSaving(false);
      return;
    }

    try {
      const updateData: any = {
        full_name: profile.full_name,
        age: profile.age ? parseInt(profile.age) : null,
        gender: profile.gender || null,
        height: profile.height ? parseFloat(profile.height) : null,
        weight: profile.weight ? parseFloat(profile.weight) : null,
        fitness_goal: profile.fitness_goal || null,
        diet_type: profile.diet_type || null
      };

      console.log('Saving profile with data:', updateData);

      // Save to localStorage immediately (for instant persistence)
      const localStorageKey = `profile_${currentUser.id}`;
      localStorage.setItem(localStorageKey, JSON.stringify(updateData));
      console.log('✅ Profile saved to localStorage');

      // Use UPSERT instead of UPDATE (creates if doesn't exist, updates if exists)
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: currentUser.id,
          email: currentUser.email,
          ...updateData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })
        .select();

      if (error) {
        console.error('❌ Error saving profile to database:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        toast.success("Changes saved locally!");
        // Still saved to localStorage, so changes persist
        setEditing(false);
      } else {
        console.log('✅ Profile saved to database successfully:', data);
        toast.success("Profile updated successfully!");
        setEditing(false);
        // DON'T refresh from database - keep the current state
        // The data is already in profile state and localStorage
      }
    } catch (err) {
      console.error('Unexpected error saving profile:', err);
      toast.error('An unexpected error occurred while saving');
    } finally {
      setSaving(false);
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

  const currentUser = user || manualUser;

  if (!currentUser && !authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Not Authenticated</CardTitle>
            <CardDescription>You must be logged in to access settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Debug Info:
                <br />- useAuth user: {user ? '✅ Found' : '❌ Null'}
                <br />- Manual check user: {manualUser ? '✅ Found' : '❌ Null'}
                <br />- Auth loading: {authLoading ? 'Yes' : 'No'}
              </p>
              <Link to="/auth">
                <Button className="w-full">Go to Login</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
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

        {/* Admin Panel Access */}
        {(user?.email === 'primeflex200@gmail.com' || profile.email === 'primeflex200@gmail.com') && (
          <Card className="mb-6 border-blue-500/50 bg-gradient-to-r from-blue-500/10 to-blue-600/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                Admin Access
              </CardTitle>
              <CardDescription>Manage videos and platform content</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/admin')} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Shield className="w-4 h-4 mr-2" />
                Open Admin Panel
              </Button>
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
                  <Button 
                    onClick={handleSave} 
                    className="flex-1 gap-2"
                    disabled={saving}
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setEditing(false);
                      fetchProfile();
                    }}
                    disabled={saving}
                  >
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

        {/* Appearance */}
        <Card className="mb-6 border-border bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === "dark" ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
              Appearance
            </CardTitle>
            <CardDescription>Customize the app theme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  {theme === "dark" ? "Currently active" : "Currently inactive"}
                </p>
              </div>
              <Switch 
                id="dark-mode" 
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="border-border bg-card/50 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              About
            </CardTitle>
            <CardDescription>App information and version details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">App Version</span>
              <span className="font-semibold">2.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Build</span>
              <span className="font-semibold">2025.01.15</span>
            </div>
            <Link to="/about">
              <Button variant="outline" className="w-full">
                View Full App Guide
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Contact via Instagram */}
        <Card className="border-primary/30 bg-card/50 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Instagram className="w-5 h-5 text-pink-500" />
              Contact via Instagram
            </CardTitle>
            <CardDescription>Reach out for support and updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Need help or have feedback? Reach out directly on Instagram for support or collaboration.
            </p>
            <Button 
              onClick={() => window.open('https://instagram.com/primeflex__official', '_blank')} 
              variant="default" 
              className="w-full gap-2"
            >
              <Instagram className="w-4 h-4" />
              Open @primeflex__official
            </Button>
            <p className="text-xs text-muted-foreground text-center pt-2">
              Developed by <strong>Ruthvik Reddy</strong> & <strong>Anurag Yadav</strong>
            </p>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button 
          variant="destructive" 
          className="w-full mt-8"
          onClick={async () => {
            const { sessionManager } = await import('@/lib/sessionManager');
            await sessionManager.clearSession();
            await supabase.auth.signOut();
            navigate('/');
          }}
        >
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Settings;
